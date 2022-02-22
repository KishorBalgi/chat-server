// Production error handlers:
const handleDuplicateKeyErr = (err) => {
  err.message = 'E-mail already taken.';
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
    console.log(err);
    console.log(err.message.startsWith('E11000'));
    if (err.message.startsWith('E11000')) err = handleDuplicateKeyErr(err);
    sendErrProd(err, res);
  }
};
