const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = rateLimit;

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,

  keyGenerator: (req) => {
    const ipKey = ipKeyGenerator(req);
    const email = req.body?.email || "global";
    return `${ipKey}_${email}`;
  },

  handler: (req, res) => {
    return res.status(429).json({
      status: false,
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    });
  },

  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiRateLimiter,
};
