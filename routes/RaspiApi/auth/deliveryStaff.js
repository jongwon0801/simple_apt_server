const express = require("express");
const router = express.Router();
const pool = require("../../../common/db");
const randomString = require("../../../common/randomString");

// 배달기사 인증번호 생성
router.get("/authSmsDeliverer/:hp", (req, res) => {
  const hp = req.params.hp;
  const authNum = randomString(4, "N");
  const smsMsg = `위키박스 인증번호[${authNum}]`;

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    connection.query(
      "INSERT INTO auth_delivery (hp, authNum, regDate) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE authNum=?, regDate=NOW()",
      [hp, authNum, authNum],
      (err) => {
        if (err) {
          connection.release();
          return res.status(500).json({ type: "error", message: err });
        }

        const smsQuery = `INSERT INTO BIZ_MSG (msg_type, cmid, request_time, send_time, dest_phone, send_phone, msg_body)
                          VALUES (0, DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'), NOW(), NOW(), ?, ?, ?)`;

        connection.query(smsQuery, [hp, "15774594", smsMsg], (err2) => {
          connection.release();
          if (err2)
            return res.status(500).json({ type: "error", message: err2 });
          res.json({ success: true, authNum });
        });
      }
    );
  });
});

// 기사 등록
router.post("/registerDeliverer", (req, res) => {
  const { hp, authNum } = req.body;
  if (!hp || !authNum)
    return res.status(400).json({ type: "error", message: "hp/authNum 필수" });

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    connection.query(
      "SELECT * FROM auth_delivery WHERE hp=? AND authNum=?",
      [hp, authNum],
      (err, results) => {
        if (err) {
          connection.release();
          return res.status(500).json({ type: "error", message: err });
        }
        if (!results.length) {
          connection.release();
          return res
            .status(401)
            .json({ type: "error", message: "인증번호 불일치" });
        }

        connection.query(
          "INSERT INTO deliveryStaff (hp) VALUES (?) ON DUPLICATE KEY UPDATE regDate=NOW()",
          [hp],
          (err2, result) => {
            connection.release();
            if (err2)
              return res.status(500).json({ type: "error", message: err2 });
            res.json({ success: true, staffSq: result.insertId });
          }
        );
      }
    );
  });
});

// 배달기사 존재 여부 확인
router.get("/checkDeliverer/:hp", (req, res) => {
  const { hp } = req.params;
  if (!hp) return res.status(400).json({ message: "휴대폰 번호 필요" });

  pool.query(
    "SELECT staffSq, hp, regDate FROM deliveryStaff WHERE hp = ?",
    [hp],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length)
        return res.json({
          exists: false,
          message: "등록되지 않은 번호입니다.",
        });
      res.json({ exists: true, staff: results[0] });
    }
  );
});

module.exports = router;
