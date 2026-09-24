function validateRequest(schemas = {}) {
  return (req, res, next) => {
    const validated = {};
    for (const key of ['params', 'query', 'body']) {
      if (!schemas[key]) continue;
      const { value, error } = schemas[key].validate(req[key], {
        abortEarly: false,
        convert: true,
        allowUnknown: true,
        stripUnknown: true
      });
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details.map(detail => detail.message).join('; '),
          timestamp: new Date().toISOString()
        });
      }
      validated[key] = value;
    }
    req.validated = validated;
    next();
  };
}

module.exports = { validateRequest };
