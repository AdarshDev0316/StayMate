const ApiError = require('../utils/ApiError');

// ─── Role-Based Access Control ────────────────────────────────────────────────
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  if (!roles.includes(req.user.role)) {
    throw new ApiError(
      403,
      `Access denied. Required role: ${roles.join(' or ')}`
    );
  }

  next();
};

const isOwner = requireRole('owner');
const isTenant = requireRole('tenant');
const isAdmin = requireRole('admin');
const isOwnerOrAdmin = requireRole('owner', 'admin');

module.exports = { requireRole, isOwner, isTenant, isAdmin, isOwnerOrAdmin };
