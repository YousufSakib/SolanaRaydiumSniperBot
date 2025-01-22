module.exports = (req, res, next) => {
  console.log("url: ", req.originalUrl);
  console.log("body: ", req.body);
  console.log("queries: ", req.query);
  console.log("params: ", req.params);
  next();
};
