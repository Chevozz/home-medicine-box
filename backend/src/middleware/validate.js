const { ZodError } = require("zod");

function validate(schema) {
  return (req, _res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const messages = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return next({ status: 400, isOperational: true, message: "Validation failed", details: messages });
      }
      next(err);
    }
  };
}

module.exports = { validate };
