# Multi-Tenant Quick Reference Guide

## 🎯 Quick Checklist

Before deploying any feature in the multi-tenant system, verify:

- [ ] All models have `school` reference field
- [ ] All routes use `tenantMiddleware`
- [ ] All queries include school filter
- [ ] Resource ownership is validated for updates/deletes
- [ ] School limits are checked where applicable
- [ ] Never trust client-provided school IDs
- [ ] Compound indexes include school field
- [ ] Tests verify data isolation

## 🚀 Common Patterns

### 1. Protected Route Setup

```javascript
const { protect } = require('../middleware/authMiddleware');
const { tenantMiddleware, validateResourceOwnership, checkStudentLimit } = require('../middleware/tenantMiddleware');

// List/Get All
router.get('/students', protect, tenantMiddleware, getStudents);

// Create (with limit check for students)
router.post('/students', protect, tenantMiddleware, checkStudentLimit, createStudent);

// Update/Delete (with ownership validation)
router.put('/students/:id', protect, tenantMiddleware, validateResourceOwnership(Student), updateStudent);
router.delete('/students/:id', protect, tenantMiddleware, validateResourceOwnership(Student), deleteStudent);
```

### 2. Query Pattern

```javascript
const { addSchoolFilter } = require('../middleware/tenantMiddleware');

// Simple query
const students = await Student.find(
  addSchoolFilter(req, { status: 'Active' })
);

// Complex query with multiple conditions
const filter = addSchoolFilter(req, {
  classLevel: 'Grade 10',
  status: 'Active',
  currentBalance: { $gt: 0 }
});
const students = await Student.find(filter);
```

### 3. Create Pattern

```javascript
exports.createResource = async (req, res) => {
  try {
    const resource = await Model.create({
      ...req.body,
      school: req.school._id  // ALWAYS ADD THIS
    });
    
    res.status(201).json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### 4. Update Pattern

```javascript
exports.updateResource = async (req, res) => {
  try {
    // validateResourceOwnership middleware already verified ownership
    
    // Prevent changing school
    delete req.body.school;
    
    const resource = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      data: resource
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

### 5. Aggregation Pattern

```javascript
exports.getStats = async (req, res) => {
  try {
    const stats = await Model.aggregate([
      // FIRST STAGE: Filter by school
      { $match: { school: req.school._id } },
      
      // Other aggregation stages
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      school: req.school.name,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

## 🔐 Role-Based Access

### User Roles

| Role | Access Level | School Required |
|------|--------------|-----------------|
| `super_admin` | All schools | No |
| `admin` | Own school - Full | Yes |
| `bursar` | Own school - Financial | Yes |
| `principal` | Own school - Oversight | Yes |
| `teacher` | Own school - Limited | Yes |

### Role Check Pattern

```javascript
// In controller
if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
  return res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.'
  });
}
```

## 📊 Model Reference

### School Fields
```javascript
{
  name: String,
  code: String,              // Unique identifier
  paybillNumber: String,
  isActive: Boolean,
  subscriptionStatus: Enum,  // TRIAL, ACTIVE, SUSPENDED, EXPIRED
  maxStudents: Number
}
```

### Student Fields (Multi-Tenant)
```javascript
{
  school: ObjectId,          // REQUIRED
  admissionNumber: String,   // Unique per school
  name: String,
  classLevel: String,
  status: Enum
}
```

### Transaction Fields (Multi-Tenant)
```javascript
{
  school: ObjectId,          // REQUIRED
  transactionId: String,     // Unique per school
  student: ObjectId,
  amount: Number,
  source: Enum,
  status: Enum
}
```

### Fee Fields (Multi-Tenant)
```javascript
{
  school: ObjectId,          // REQUIRED
  name: String,
  amount: Number,
  type: Enum,
  term: Enum,
  academicYear: String
}
```

## 🔍 Common Queries

### Find student by admission number (in school)
```javascript
const student = await Student.findOne({
  school: req.school._id,
  admissionNumber: admNo.toUpperCase()
});
```

### Check duplicate (in school)
```javascript
const exists = await Student.findOne({
  school: req.school._id,
  admissionNumber: newAdmNo,
  _id: { $ne: currentId }  // Exclude current record if updating
});
```

### Get active students (in school)
```javascript
const students = await Student.find({
  school: req.school._id,
  status: 'Active'
}).sort({ admissionNumber: 1 });
```

### Get transactions with student details
```javascript
const transactions = await Transaction.find({
  school: req.school._id
})
.populate('student', 'admissionNumber name')
.sort({ createdAt: -1 });
```

### Count records (in school)
```javascript
const count = await Student.countDocuments({
  school: req.school._id,
  status: 'Active'
});
```

## ⚠️ Common Mistakes to Avoid

### ❌ WRONG: No school filter
```javascript
const students = await Student.find({ status: 'Active' });
```

### ✅ CORRECT: With school filter
```javascript
const students = await Student.find({
  school: req.school._id,
  status: 'Active'
});
```

---

### ❌ WRONG: Client-provided school ID
```javascript
const student = await Student.create({
  school: req.body.schoolId,  // NEVER DO THIS
  ...req.body
});
```

### ✅ CORRECT: Server-side school ID
```javascript
const student = await Student.create({
  school: req.school._id,  // From authenticated user
  ...req.body
});
```

---

### ❌ WRONG: No ownership validation
```javascript
router.put('/students/:id', protect, updateStudent);
```

### ✅ CORRECT: With ownership validation
```javascript
router.put('/students/:id', 
  protect, 
  tenantMiddleware,
  validateResourceOwnership(Student),
  updateStudent
);
```

---

### ❌ WRONG: Forgetting school in aggregation
```javascript
const stats = await Transaction.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

### ✅ CORRECT: School filter first
```javascript
const stats = await Transaction.aggregate([
  { $match: { school: req.school._id } },  // FIRST!
  { $group: { _id: '$status', count: { $sum: 1 } } }
]);
```

## 🧪 Testing Checklist

For each feature, test:

1. **Data Isolation**
   - [ ] School A cannot see School B data
   - [ ] School B cannot see School A data

2. **CRUD Operations**
   - [ ] Create adds school reference
   - [ ] Read filters by school
   - [ ] Update prevents school change
   - [ ] Delete validates ownership

3. **Uniqueness Constraints**
   - [ ] Admission numbers unique per school
   - [ ] Transaction IDs unique per school

4. **Role-Based Access**
   - [ ] Super admin can access all
   - [ ] School admin limited to their school
   - [ ] Unauthorized access blocked

5. **Subscription Limits**
   - [ ] Student creation blocked at limit
   - [ ] Subscription expiry checked

## 📝 Response Format

### Success Response
```javascript
res.json({
  success: true,
  school: req.school.name,  // Include school context
  count: results.length,     // For lists
  data: results
});
```

### Error Response
```javascript
res.status(errorCode).json({
  success: false,
  message: 'Human-readable error message'
});
```

## 🔧 Debugging Tips

### Check user's school
```javascript
console.log('User:', req.user.email);
console.log('School:', req.school?.name);
console.log('Role:', req.user.role);
```

### Log query filter
```javascript
const filter = addSchoolFilter(req, { status: 'Active' });
console.log('Query filter:', JSON.stringify(filter));
```

### Verify resource ownership
```javascript
console.log('Resource school:', resource.school.toString());
console.log('User school:', req.user.school.toString());
console.log('Match:', resource.school.toString() === req.user.school.toString());
```

## 📚 File References

- Models: `backend/models/`
- Middleware: `backend/middleware/tenantMiddleware.js`
- Examples: `backend/CONTROLLER_EXAMPLES.js`
- Full Docs: `MULTI_TENANT_ARCHITECTURE.md`
- Seed Data: `backend/seedUser.js`

## 🆘 Getting Help

1. Check `MULTI_TENANT_ARCHITECTURE.md` for detailed explanations
2. Review `CONTROLLER_EXAMPLES.js` for working code samples
3. Test in Postman with different school users
4. Check MongoDB indexes: `db.collection.getIndexes()`
5. Verify data: `db.students.find({ school: ObjectId("...") })`

---

**Remember:** When in doubt, always filter by `school`!
