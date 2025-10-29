const jwt = require("jsonwebtoken");

const JWT_SECRET = "wikibox"; // 테스트용 하드코딩

// -----------------------------
// JWT 토큰 생성
// -----------------------------
function signToken(payload, expiresIn = "24h") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

// -----------------------------
// JWT 토큰 검증
// -----------------------------
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// -----------------------------
// JWT 인증 미들웨어
// -----------------------------
function ensureAuthorized(req, res, next) {
  // Authorization 헤더, body, query 순으로 토큰 검색
  const authHeader =
    req.headers["authorization"] || req.body.token || req.query.token;

  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  // Authorization: Bearer <token> 형태일 때 분리
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  // JWT 검증
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Failed to authenticate token" });
    }
    req.decoded = decoded; // 디코딩된 사용자 정보 저장
    next();
  });
}

module.exports = { JWT_SECRET, signToken, verifyToken, ensureAuthorized };
