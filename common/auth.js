// common/auth.js
const jwt = require("jsonwebtoken");
const secretKey = "wikibox"; // 실제 배포 시 환경변수로 관리 권장

module.exports = {
  ensureAuthorized: (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.decoded = decoded;
      next();
    });
  },

  checkAuthorized: (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(401).json({ message: "Invalid token" });
      req.decoded = decoded;
      next();
    });
  },
};
