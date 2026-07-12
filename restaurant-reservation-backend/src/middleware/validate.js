const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator's check(...) middlewares.
// Collects any validation errors into a single, consistent 400 response.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    throw new ApiError(400, messages.join(', '));
  }
  next();
};

module.exports = validate;
