const jwt = require("jsonwebtoken");
class JwtService {
  static async sign(payload, expiry = "5y", secret ) {
     secret = process.env.JWT_SECRET;
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }
  static async verify(token, secret) {
     secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  }
}

module.exports = JwtService;
