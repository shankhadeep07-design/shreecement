module.exports.validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,   // 👈 IMPORTANT
    });

    if (error) {
      return res.status(422).json({
        status: false,
        message: "Validation error",
        errors: error.details.map(d => d.message),
      });
    }

    next();
  };
};
