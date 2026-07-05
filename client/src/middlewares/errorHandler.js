exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
};
  


// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err); // You can replace this with a logger

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};
