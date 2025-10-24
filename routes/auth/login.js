// routes/auth/login.js
const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { signToken } = require("../../common/jwt"); // 통합 JWT 모듈

// -----------------------------
// 로그인
// -----------------------------
router.post("/authenticate", (req, res) => {
  const { uid, passwd } = req.body;
  if (!uid || !passwd) {
    return res.status(400).json({ message: "아이디와 비밀번호 필요" });
  }

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query("SELECT * FROM member WHERE uid=?", [uid], (err, rows) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });
      if (!rows.length)
        return res.status(404).json({ message: "아이디가 존재하지 않습니다." });

      const user = rows[0];

      // TODO: 실제 배포 시 bcrypt 등으로 비밀번호 비교
      if (passwd !== user.passwd) {
        return res.status(401).json({ message: "비밀번호가 틀립니다." });
      }

      // JWT 발급
      const token = signToken({
        memberSq: user.memberSq,
        uid: user.uid,
        name: user.name,
      });

      res.json({ message: "로그인 성공", token });
    });
  });
});

module.exports = router;
