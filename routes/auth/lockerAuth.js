const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const randomString = require("../../common/randomString");

// 인증번호 발급
router.get("/authSmsLocker/:yid/:col/:row/:jumper/:serial/:senderHp/:receiverHp", (req, res) => {
  const { yid, col, row, jumper, serial, senderHp, receiverHp } = req.params;
  if (!senderHp || !receiverHp) return res.status(400).json({ message: "송신/수신자 번호 필요" });

  const authNum = randomString(5, "N");
  const smsMsg = `위키박스 인증번호[${authNum}]`;

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      `UPDATE locker 
         SET authNum = ?, senderHp = ?, receiverHp = ? 
       WHERE yid = ? AND col = ? AND row = ?`,
      [authNum, senderHp, receiverHp, yid, col, row],
      (err, result) => {
        if (err) { connection.release(); return res.status(500).json({ message: err.message }); }
        if (!result.affectedRows) { connection.release(); return res.status(404).json({ message: "Locker not found" }); }

        const smsQuery = `INSERT INTO BIZ_MSG 
                          (msg_type, cmid, request_time, send_time, dest_phone, send_phone, msg_body)
                          VALUES (0, DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'), NOW(), NOW(), ?, ?, ?)`;

        connection.query(smsQuery, [receiverHp, senderHp, smsMsg], (err2) => {
          connection.release();
          if (err2) return res.status(500).json({ message: err2.message });
          res.json({ message: "인증번호 발급 완료", authNum, yid, col, row, senderHp, receiverHp });
        });
      }
    );
  });
});

// 인증번호 확인
router.get("/verifyLockerAuth/:authNum", (req, res) => {
  const { authNum } = req.params;
  if (!authNum) return res.status(400).json({ message: "인증번호 필요" });

  pool.query(
    `SELECT yid, col, row, jumper, serial, label, senderHp, receiverHp 
       FROM locker 
       WHERE authNum=?`,
    [authNum],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      if (!results.length) return res.status(404).json({ message: "인증번호가 존재하지 않거나 잘못되었습니다." });
      res.json(results[0]);
    }
  );
});

module.exports = router;
