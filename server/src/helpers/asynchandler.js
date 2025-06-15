"use strict";

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Alternative name for compatibility
const catchAsync = asyncHandler;

module.exports = {
  asyncHandler,
  catchAsync,
};
