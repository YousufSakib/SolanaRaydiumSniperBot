module.exports = (req, res, next) => {
  res.sendResponse = (status, message, data) => {
    res.status(status).json({
      success: status < 400 ? true : false,
      message: message,
      data: data || null,
    });
  };
  next();
};
