import { ApiResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema) => (req, res, next) => {
  try {
    if (schema.params) req.params = schema.params.parse(req.params);
    if (schema.query) req.query = schema.query.parse(req.query);
    if (schema.body) req.body = schema.body.parse(req.body);
    next();
  } catch (error) {
    const errorDetails = error.errors ? error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) : error.message;
    return ApiResponse.error(res, 'Validation failed for request parameters', 400, errorDetails);
  }
};

