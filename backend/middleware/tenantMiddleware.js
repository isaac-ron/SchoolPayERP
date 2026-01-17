const School = require('../models/School');

/**
 * Multi-tenant middleware to ensure data isolation between schools
 * Extracts school from authenticated user and validates access
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    // Super admin can access all schools
    if (req.user.role === 'super_admin') {
      // If schoolId is provided in params/body/query, validate it
      const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
      
      if (schoolId) {
        const school = await School.findById(schoolId);
        if (!school) {
          return res.status(404).json({
            success: false,
            message: 'School not found'
          });
        }
        req.school = school;
      }
      return next();
    }

    // For non-super admins, school must be set from user
    if (!req.user.school) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any school'
      });
    }

    // Fetch school details and validate
    const school = await School.findById(req.user.school);
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    if (!school.isActive) {
      return res.status(403).json({
        success: false,
        message: 'School account is inactive. Please contact support.'
      });
    }

    if (!school.isSubscriptionValid()) {
      return res.status(403).json({
        success: false,
        message: 'School subscription has expired. Please renew to continue.'
      });
    }

    // Attach school to request for use in controllers
    req.school = school;
    
    // Automatically add school filter to query operations
    req.schoolFilter = { school: school._id };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating school access'
    });
  }
};

/**
 * Middleware to ensure the resource being accessed belongs to the user's school
 * Use this for operations on specific resources (update, delete)
 */
const validateResourceOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: 'Resource ID is required'
        });
      }

      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        });
      }

      // Super admin can access all resources
      if (req.user.role === 'super_admin') {
        return next();
      }

      // Check if resource belongs to user's school
      if (resource.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This resource belongs to a different school.'
        });
      }

      next();
    } catch (error) {
      console.error('Resource ownership validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error validating resource ownership'
      });
    }
  };
};

/**
 * Helper function to add school filter to queries
 * Use in controllers to ensure queries are scoped to the user's school
 */
const addSchoolFilter = (req, baseFilter = {}) => {
  // Super admin with no specific school selected sees all
  if (req.user.role === 'super_admin' && !req.school) {
    return baseFilter;
  }

  return {
    ...baseFilter,
    school: req.school._id
  };
};

/**
 * Middleware to check if school can add more students
 */
const checkStudentLimit = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      return next();
    }

    const canAdd = await req.school.canAddStudent();
    
    if (!canAdd) {
      return res.status(403).json({
        success: false,
        message: 'Student limit reached. Please upgrade your subscription to add more students.'
      });
    }

    next();
  } catch (error) {
    console.error('Student limit check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking student limit'
    });
  }
};

module.exports = {
  tenantMiddleware,
  validateResourceOwnership,
  addSchoolFilter,
  checkStudentLimit
};
