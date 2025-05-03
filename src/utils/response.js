class ResponseUtils {
  static success(res, data = {}, message = 'Success', statusCode = 200) {
    const response = {
      success: true,
      message,
      ...data
    };
    
    console.log(`Sending success response (${statusCode}):`, JSON.stringify(response, (key, value) => {
      // Mask sensitive data in logs
      if (key === 'accessToken' || key === 'refreshToken' || key === 'otp') {
        return value ? '***MASKED***' : 'none';
      }
      return value;
    }));
    
    return res.status(statusCode).json(response);
  }

  static error(res, message = 'Error occurred', statusCode = 400, errors = []) {
    const response = {
      success: false,
      message,
      errors: errors.length ? errors : [{ msg: message }]
    };
    
    console.log(`Sending error response (${statusCode}):`, JSON.stringify(response));
    
    return res.status(statusCode).json(response);
  }

  static serverError(res, error, message = 'Internal Server Error') {
    console.error(error);
    return res.status(500).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message
    });
  }

  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      success: false,
      message
    });
  }

  static forbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      success: false,
      message
    });
  }
}

module.exports = ResponseUtils;