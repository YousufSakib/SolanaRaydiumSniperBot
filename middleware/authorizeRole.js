const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.sendResponse(
        403,
        "Access forbidden: insufficient permissions"
      );
    }
    next();
  };
};

module.exports = authorizeRole;
