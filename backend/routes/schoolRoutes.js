const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAllSchools,
  getSchool,
  createSchool,
  updateSchool,
  deleteSchool,
  getPlatformStats,
  updateSubscription,
  getSchoolUsers
} = require('../controllers/schoolController');

// All routes require authentication
router.use(protect);

// Platform statistics (super admin only)
router.get('/stats/platform', getPlatformStats);

// School CRUD operations
router.route('/')
  .get(getAllSchools)
  .post(createSchool);

router.route('/:id')
  .get(getSchool)
  .put(updateSchool)
  .delete(deleteSchool);

// Subscription management
router.put('/:id/subscription', updateSubscription);

// School users
router.get('/:id/users', getSchoolUsers);

module.exports = router;
