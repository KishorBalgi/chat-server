exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status;

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};
