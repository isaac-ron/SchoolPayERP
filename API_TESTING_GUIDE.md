# API Testing Guide for Multi-Tenant System

## Postman Collection Setup

### Environment Variables

Create a Postman environment with these variables:

```
BASE_URL: http://localhost:5000
SUPER_ADMIN_TOKEN: (set after login)
SCHOOL_ADMIN_TOKEN: (set after login)
BURSAR_TOKEN: (set after login)
SCHOOL_ID: (Demo school ID)
STUDENT_ID: (Test student ID)
```

## Authentication Tests

### 1. Login as Super Admin

**POST** `{{BASE_URL}}/api/auth/login`

Body:
```json
{
  "email": "superadmin@schoolpay.com",
  "password": "SuperAdmin@123"
}
```

Save the `token` from response to `SUPER_ADMIN_TOKEN`

### 2. Login as School Admin

**POST** `{{BASE_URL}}/api/auth/login`

Body:
```json
{
  "email": "admin@demoschool.ac.ke",
  "password": "Admin@123"
}
```

Save the `token` to `SCHOOL_ADMIN_TOKEN`

### 3. Login as Bursar

**POST** `{{BASE_URL}}/api/auth/login`

Body:
```json
{
  "email": "bursar@demoschool.ac.ke",
  "password": "Bursar@123"
}
```

Save the `token` to `BURSAR_TOKEN`

## School Management Tests (Super Admin)

### 4. Get All Schools

**GET** `{{BASE_URL}}/api/schools`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

### 5. Get Platform Statistics

**GET** `{{BASE_URL}}/api/schools/stats/platform`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

### 6. Create New School

**POST** `{{BASE_URL}}/api/schools`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

Body:
```json
{
  "name": "Test Secondary School",
  "code": "TEST001",
  "paybillNumber": "654321",
  "accountNumber": "TEST",
  "contactEmail": "info@testschool.ac.ke",
  "contactPhone": "254722222222",
  "address": {
    "street": "Test Street",
    "city": "Nairobi",
    "county": "Nairobi",
    "postalCode": "00200"
  },
  "isActive": true,
  "subscriptionStatus": "TRIAL",
  "maxStudents": 100
}
```

Save the `_id` from response to `SCHOOL_ID`

### 7. Update School Subscription

**PUT** `{{BASE_URL}}/api/schools/{{SCHOOL_ID}}/subscription`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

Body:
```json
{
  "subscriptionStatus": "ACTIVE",
  "maxStudents": 500,
  "subscriptionExpiry": "2027-12-31"
}
```

## Student Management Tests (School Admin/Bursar)

### 8. Create Student (Demo School)

**POST** `{{BASE_URL}}/api/students`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

Body:
```json
{
  "admissionNumber": "ADM001",
  "name": "John Doe",
  "classLevel": "Grade 10",
  "stream": "A",
  "guardianName": "Jane Doe",
  "guardianPhone": "254711111111",
  "guardianEmail": "jane.doe@email.com"
}
```

Save `_id` to `STUDENT_ID`

### 9. Get All Students (Demo School)

**GET** `{{BASE_URL}}/api/students`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

Query Parameters (optional):
- `status`: Active
- `classLevel`: Grade 10
- `search`: John

### 10. Get Single Student

**GET** `{{BASE_URL}}/api/students/{{STUDENT_ID}}`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

### 11. Update Student

**PUT** `{{BASE_URL}}/api/students/{{STUDENT_ID}}`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

Body:
```json
{
  "guardianPhone": "254722222222",
  "stream": "B"
}
```

## Multi-Tenancy Tests

### 12. Test Data Isolation (Should FAIL)

Create a student as School Admin, then try to access with a different school's token.

**Step 1:** Create student with School Admin token
**Step 2:** Try to get that student with a different school's admin token

**GET** `{{BASE_URL}}/api/students/{{STUDENT_ID}}`

Headers:
```
Authorization: Bearer {{OTHER_SCHOOL_ADMIN_TOKEN}}
```

Expected: **403 Forbidden**

### 13. Test Duplicate Admission Numbers

**Test A:** Create student in School 1 with ADM001
**Test B:** Create student in School 2 with ADM001 (Should SUCCEED - different schools)
**Test C:** Try to create another student in School 1 with ADM001 (Should FAIL)

### 14. Test Super Admin Access

Super admin should be able to access any school's data when school ID is provided.

**GET** `{{BASE_URL}}/api/students?schoolId={{SCHOOL_ID}}`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

## Fee Management Tests

### 15. Create Fee

**POST** `{{BASE_URL}}/api/fees`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

Body:
```json
{
  "name": "Tuition Fee - Term 1",
  "amount": 15000,
  "type": "TUITION",
  "term": "TERM_1",
  "academicYear": "2026",
  "classLevel": "Grade 10",
  "dueDate": "2026-03-31",
  "isActive": true
}
```

### 16. Get All Fees

**GET** `{{BASE_URL}}/api/fees?academicYear=2026&term=TERM_1`

Headers:
```
Authorization: Bearer {{BURSAR_TOKEN}}
```

## Transaction Tests

### 17. Record Transaction

**POST** `{{BASE_URL}}/api/transactions`

Headers:
```
Authorization: Bearer {{BURSAR_TOKEN}}
```

Body:
```json
{
  "transactionId": "MPX123456789",
  "reference": "ADM001",
  "amount": 5000,
  "source": "MPESA",
  "paidBy": "Jane Doe",
  "phoneNumber": "254711111111",
  "status": "COMPLETED"
}
```

### 18. Get All Transactions

**GET** `{{BASE_URL}}/api/transactions`

Headers:
```
Authorization: Bearer {{BURSAR_TOKEN}}
```

Query Parameters (optional):
- `status`: COMPLETED
- `source`: MPESA
- `startDate`: 2026-01-01
- `endDate`: 2026-12-31

### 19. Get Student Transactions

**GET** `{{BASE_URL}}/api/transactions?studentId={{STUDENT_ID}}`

Headers:
```
Authorization: Bearer {{BURSAR_TOKEN}}
```

## Dashboard Tests

### 20. Get Dashboard Statistics

**GET** `{{BASE_URL}}/api/dashboard/stats`

Headers:
```
Authorization: Bearer {{SCHOOL_ADMIN_TOKEN}}
```

## Subscription Limit Tests

### 21. Test Student Limit

1. Set school maxStudents to 5 (using super admin)
2. Create 5 students (should succeed)
3. Try to create 6th student (should fail with 403)

**PUT** `{{BASE_URL}}/api/schools/{{SCHOOL_ID}}/subscription`

Headers:
```
Authorization: Bearer {{SUPER_ADMIN_TOKEN}}
```

Body:
```json
{
  "maxStudents": 5
}
```

Then try creating more than 5 students.

## Expected Results

### ✅ Should Succeed:

- Super admin can access all schools
- School admin can access their school's data
- Creating students with same admission number in different schools
- All CRUD operations within user's school
- Enforcing student limits
- Data filtering by school

### ❌ Should Fail:

- School admin accessing another school's data
- Creating duplicate admission numbers within same school
- Accessing resources without authentication
- Exceeding student limits
- Creating students without school reference
- Bursar performing admin-only operations

## Automated Test Script

Create a Postman collection with these tests and add test scripts:

```javascript
// Test 1: Check response status
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Test 2: Verify response structure
pm.test("Response has success field", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Test 3: Verify school context in response
pm.test("Response includes school information", function () {
    var jsonData = pm.response.json();
    if (jsonData.school) {
        pm.expect(jsonData.school).to.be.a('string');
    }
});

// Test 4: Save tokens for subsequent requests
if (pm.response.json().token) {
    pm.environment.set("AUTH_TOKEN", pm.response.json().token);
}

// Test 5: Verify data isolation
pm.test("Data belongs to correct school", function () {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.school) {
        pm.expect(jsonData.data.school).to.equal(pm.environment.get("SCHOOL_ID"));
    }
});
```

## cURL Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@demoschool.ac.ke","password":"Admin@123"}'
```

### Get Students
```bash
curl -X GET http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"admissionNumber":"ADM001","name":"John Doe","classLevel":"Grade 10","guardianName":"Jane Doe","guardianPhone":"254711111111"}'
```

## Troubleshooting

### 403 Forbidden
- Check if user's school matches resource's school
- Verify authentication token is valid
- Check user's role permissions

### 400 Bad Request
- Verify all required fields are provided
- Check data format (especially phone numbers, emails)
- Ensure admission number is unique within school

### 500 Internal Server Error
- Check server logs
- Verify database connection
- Ensure models have school references

## Next Steps

1. Export this as a Postman collection
2. Create environment for dev/staging/production
3. Set up automated tests in CI/CD
4. Document any custom endpoints
5. Add performance tests for large datasets
