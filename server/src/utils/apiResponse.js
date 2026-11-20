export class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null, code = null) {
    const errorCode = code || (statusCode === 400 ? 'BAD_REQUEST' : statusCode === 404 ? 'NOT_FOUND' : statusCode === 401 ? 'UNAUTHORIZED' : statusCode === 403 ? 'FORBIDDEN' : 'SERVER_ERROR');
    return res.status(statusCode).json({
      success: false,
      message,
      error: { code: errorCode, message },
      errors,
      timestamp: new Date().toISOString()
    });
  }
}

