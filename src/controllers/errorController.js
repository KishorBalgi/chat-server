// Production error handlers:
const handleDuplicateKeyErr = (err) => {
  err.message = `Field already taken: ${err.keyValue.email}`;
  return err;
};
// Dev Error:
const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stackTrace: err.stack,
  });
};
// Prod Error:
const sendErrProd = (err, res) => {
  if (err.isOperational) {
    // Operational error:
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Internal server error:
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};
exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.code === 11000) err = handleDuplicateKeyErr(err);
    sendErrProd(err, res);
  }
};
