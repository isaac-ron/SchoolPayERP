# Multi-Tenant Architecture Documentation

## Overview

The SchoolPayERP system has been implemented with a robust multi-tenant architecture to support multiple schools within a single application instance. This ensures complete data isolation between schools while maintaining efficient resource utilization.

## Key Concepts

### 1. School-Based Tenancy
Each school is a separate tenant with its own:
- Students
- Users (Admins, Bursars, Teachers)
- Fee structures
- Transactions
- Settings and configuration

### 2. Data Isolation
All models include a `school` reference field that ensures:
- Students from School A cannot be accessed by School B users
- Transactions are scoped to specific schools
- Fee structures are school-specific
- Complete data privacy and security

## Architecture Components

### Models

#### School Model
The central tenant entity with the following key features:

```javascript
{
  name: String,              // School name
  code: String,              // Unique school identifier (e.g., "DEMO001")
  paybillNumber: String,     // M-PESA paybill for payments
  contactEmail: String,      // Primary contact
  contactPhone: String,      // Primary phone
  isActive: Boolean,         // School status
  subscriptionStatus: Enum,  // TRIAL, ACTIVE, SUSPENDED, EXPIRED
  maxStudents: Number,       // Student limit based on subscription
  settings: Object           // School-specific settings
}
```

**Key Methods:**
- `canAddStudent()`: Checks if school can add more students based on limit
- `isSubscriptionValid()`: Validates subscription status and expiry

#### Student Model
```javascript
{
  school: ObjectId,          // Required reference to School
  admissionNumber: String,   // Unique per school (not globally unique)
  name: String,
  classLevel: String,
  guardianPhone: String,
  currentBalance: Number,
  status: Enum
}
```

**Unique Indexes:**
- `{ school: 1, admissionNumber: 1 }` - Ensures admission numbers are unique per school

#### User Model
```javascript
{
  name: String,
  email: String,             // Globally unique
  password: String,
  role: Enum,                // super_admin, admin, bursar, principal, teacher
  school: ObjectId,          // Required except for super_admin
  isActive: Boolean
}
```

**Roles:**
- `super_admin`: Platform administrator, can access all schools
- `admin`: School administrator, full access to their school
- `bursar`: Financial officer, manages fees and payments
- `principal`: School principal, oversight access
- `teacher`: Teaching staff, limited access

#### Fee Model
```javascript
{
  school: ObjectId,          // Required reference to School
  name: String,
  amount: Number,
  type: Enum,
  term: Enum,
  academicYear: String,
  classLevel: String,
  isActive: Boolean
}
```

#### Transaction Model
```javascript
{
  school: ObjectId,          // Required reference to School
  transactionId: String,     // Unique per school
  student: ObjectId,
  amount: Number,
  source: Enum,
  status: Enum
}
```

**Unique Indexes:**
- `{ school: 1, transactionId: 1 }` - Ensures transaction IDs are unique per school

### Middleware

#### Tenant Middleware (`tenantMiddleware.js`)

**1. tenantMiddleware**
- Validates user's school access
- Checks school subscription status
- Attaches school object to request
- Creates `req.schoolFilter` for automatic query scoping

```javascript
// Usage in routes
router.get('/students', protect, tenantMiddleware, getStudents);
```

**2. validateResourceOwnership**
- Ensures resources belong to user's school
- Prevents cross-tenant data access
- Use for update/delete operations

```javascript
// Usage in routes
router.put('/students/:id', 
  protect, 
  tenantMiddleware, 
  validateResourceOwnership(Student), 
  updateStudent
);
```

**3. checkStudentLimit**
- Validates school hasn't exceeded student limit
- Use before creating new students

```javascript
// Usage in routes
router.post('/students', 
  protect, 
  tenantMiddleware, 
  checkStudentLimit, 
  createStudent
);
```

**4. addSchoolFilter**
- Helper function to add school filter to queries
- Use in controllers

```javascript
// In controller
const students = await Student.find(
  addSchoolFilter(req, { status: 'Active' })
);
```

## Implementation Guide

### Creating School-Scoped Resources

When creating any resource (student, fee, transaction), always include the school reference:

```javascript
// ✅ CORRECT
const student = await Student.create({
  school: req.school._id,  // From tenantMiddleware
  admissionNumber: 'ADM001',
  name: 'John Doe',
  // ... other fields
});

// ❌ WRONG - Missing school reference
const student = await Student.create({
  admissionNumber: 'ADM001',
  name: 'John Doe',
  // ... other fields
});
```

### Querying School-Scoped Data

Always filter queries by school:

```javascript
// ✅ CORRECT
const students = await Student.find({ 
  school: req.school._id,
  status: 'Active' 
});

// Or using helper
const students = await Student.find(
  addSchoolFilter(req, { status: 'Active' })
);

// ❌ WRONG - No school filter
const students = await Student.find({ status: 'Active' });
```

### Controller Example

```javascript
// studentController.js
const { addSchoolFilter } = require('../middleware/tenantMiddleware');
const Student = require('../models/Student');

// @desc    Get all students for the user's school
// @route   GET /api/students
// @access  Private
exports.getStudents = async (req, res) => {
  try {
    const { classLevel, status } = req.query;
    
    // Build filter with school scope
    const filter = addSchoolFilter(req, {
      ...(classLevel && { classLevel }),
      ...(status && { status })
    });

    const students = await Student.find(filter)
      .sort({ admissionNumber: 1 })
      .select('-__v');

    res.json({
      success: true,
      count: students.length,
      school: req.school.name,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private
exports.createStudent = async (req, res) => {
  try {
    // Add school reference
    const studentData = {
      ...req.body,
      school: req.school._id
    };

    // Check for duplicate admission number within school
    const existingStudent = await Student.findOne({
      school: req.school._id,
      admissionNumber: studentData.admissionNumber
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Admission number already exists in your school'
      });
    }

    const student = await Student.create(studentData);

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### Route Protection Example

```javascript
// studentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  tenantMiddleware, 
  validateResourceOwnership,
  checkStudentLimit 
} = require('../middleware/tenantMiddleware');
const Student = require('../models/Student');
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// All routes require authentication and tenant validation
router.use(protect, tenantMiddleware);

// List and create
router.route('/')
  .get(getStudents)
  .post(checkStudentLimit, createStudent);

// Single student operations
router.route('/:id')
  .get(validateResourceOwnership(Student), getStudent)
  .put(validateResourceOwnership(Student), updateStudent)
  .delete(validateResourceOwnership(Student), deleteStudent);

module.exports = router;
```

## Database Indexes

Critical indexes for multi-tenant performance:

```javascript
// Student
{ school: 1, admissionNumber: 1 }  // Unique compound
{ school: 1, status: 1 }
{ school: 1, classLevel: 1 }

// Transaction
{ school: 1, transactionId: 1 }    // Unique compound
{ school: 1, status: 1 }
{ school: 1, student: 1 }
{ school: 1, createdAt: -1 }

// Fee
{ school: 1, academicYear: 1, term: 1 }
{ school: 1, isActive: 1 }

// User
{ school: 1, role: 1 }
{ school: 1, isActive: 1 }
```

## Security Considerations

### 1. Never Trust Client Input
Always use the school from `req.school`, never from request body:

```javascript
// ✅ CORRECT
const student = await Student.create({
  school: req.school._id,  // From authenticated user
  ...req.body
});

// ❌ DANGEROUS - Client could send different school ID
const student = await Student.create({
  school: req.body.schoolId,
  ...req.body
});
```

### 2. Validate Resource Ownership
Always use `validateResourceOwnership` for updates/deletes:

```javascript
router.put('/students/:id', 
  protect, 
  tenantMiddleware,
  validateResourceOwnership(Student),  // Critical!
  updateStudent
);
```

### 3. Super Admin Access
Super admins can access all schools but should specify school:

```javascript
// In controller
if (req.user.role === 'super_admin' && !req.school) {
  return res.status(400).json({
    message: 'Please specify a school ID'
  });
}
```

## Subscription Management

Schools have subscription limits that must be enforced:

```javascript
// Check before creating students
router.post('/students', 
  protect, 
  tenantMiddleware,
  checkStudentLimit,  // Enforces maxStudents limit
  createStudent
);

// Manually check in controller
const canAdd = await req.school.canAddStudent();
if (!canAdd) {
  return res.status(403).json({
    message: 'Student limit reached. Please upgrade subscription.'
  });
}
```

## Seeding Data

Use the updated `seedUser.js` to create:
- Super Admin (platform-wide access)
- Demo School
- School Admin for Demo School
- School Bursar for Demo School

```bash
node seedUser.js
```

## Testing Multi-Tenancy

### Test Cases

1. **Data Isolation**
   - Create students in School A
   - Login as School B user
   - Verify School B cannot see School A students

2. **Admission Number Uniqueness**
   - Create student with ADM001 in School A (Success)
   - Create student with ADM001 in School B (Success)
   - Create another student with ADM001 in School A (Fail)

3. **Cross-Tenant Access Prevention**
   - Get student ID from School A
   - Login as School B user
   - Try to update School A student (Should fail with 403)

4. **Super Admin Access**
   - Login as super admin
   - Specify school ID in requests
   - Verify access to all schools

5. **Subscription Limits**
   - Set school maxStudents to 5
   - Create 5 students (Success)
   - Try to create 6th student (Fail with 403)

## Migration from Single-Tenant

If migrating existing data:

1. Create School records
2. Update existing records to add school references
3. Rebuild indexes with compound keys
4. Update all queries to include school filter
5. Test data isolation thoroughly

```javascript
// Migration script example
const migrateToMultiTenant = async () => {
  // Create default school
  const school = await School.create({
    name: 'Legacy School',
    code: 'LEGACY001',
    // ... other fields
  });

  // Update all students
  await Student.updateMany(
    { school: { $exists: false } },
    { $set: { school: school._id } }
  );

  // Rebuild indexes
  await Student.collection.dropIndex('admissionNumber_1');
  await Student.collection.createIndex(
    { school: 1, admissionNumber: 1 }, 
    { unique: true }
  );
};
```

## Best Practices

1. ✅ Always use `tenantMiddleware` on protected routes
2. ✅ Use `addSchoolFilter` helper in queries
3. ✅ Validate resource ownership before updates/deletes
4. ✅ Never trust client-provided school IDs
5. ✅ Check subscription limits before creating resources
6. ✅ Include school name in API responses for clarity
7. ✅ Log school context in error messages for debugging
8. ✅ Use compound indexes for performance
9. ✅ Test cross-tenant access prevention thoroughly
10. ✅ Document which endpoints require school context

## Troubleshooting

### "User is not associated with any school"
- Ensure user has school field set (except super_admin)
- Check user record in database

### "Access denied. This resource belongs to a different school"
- User trying to access resource from different school
- Verify resource ownership in database

### "Student limit reached"
- School has reached maxStudents subscription limit
- Upgrade school subscription or increase limit

### Duplicate key error on admissionNumber
- Admission number already exists in that school
- Use school-specific admission number lookup before creating

## Summary

The multi-tenant architecture ensures:
- ✅ Complete data isolation between schools
- ✅ Scalable to thousands of schools
- ✅ Subscription-based limits enforcement
- ✅ Role-based access control
- ✅ Super admin oversight capability
- ✅ Performance through proper indexing
- ✅ Security through middleware validation

This architecture allows the SchoolPayERP system to serve multiple schools efficiently while maintaining strict data privacy and security boundaries.
