const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// 수령 로그 조회 (GET) - 검색어 + 날짜 범위
// -----------------------------
router.get("/", ensureAuthorized, (req, res) => {
  const { searchText, startDate, endDate } = req.query;
  let wsql = " WHERE receiverHp = ?";
  const params = [req.decoded.hp];

  // 검색어 필터 (수취인, 사물함 라벨)
  if (searchText) {
    wsql += " AND (receiverHp LIKE ? OR lockerLabel LIKE ?)";
    params.push(`%${searchText}%`, `%${searchText}%`);
  }

  // 날짜 범위 필터
  if (startDate) {
    wsql += " AND takeDate >= STR_TO_DATE(?, '%Y-%m-%d')";
    params.push(startDate);
  }
  if (endDate) {
    wsql += " AND takeDate <= STR_TO_DATE(?, '%Y-%m-%d 23:59:59')";
    params.push(endDate);
  }

  const sql = "SELECT * FROM takeLog" + wsql + " ORDER BY takeSq DESC";

  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, data: results });
  });
});

// -----------------------------
// 수령 로그 생성 (POST)
// -----------------------------
router.post("/", ensureAuthorized, (req, res) => {
  const { yid, lockerLabel, col, row, jumper, serial, receiverHp } = req.body;

  const sql = `INSERT INTO takeLog
    (yid, lockerLabel, col, row, jumper, serial, receiverHp)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [yid, lockerLabel, col, row, jumper, serial, receiverHp], (err, result) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, takeSq: result.insertId });
  });
});

// -----------------------------
// 수령 로그 수정 (PUT)
// -----------------------------
router.put("/:takeSq", ensureAuthorized, (req, res) => {
  const { takeSq } = req.params;
  const { yid, lockerLabel, col, row, jumper, serial, receiverHp } = req.body;

  const sql = `UPDATE takeLog SET
    yid = ?, lockerLabel = ?, col = ?, row = ?, jumper = ?, serial = ?, receiverHp = ?
    WHERE takeSq = ?`;

  pool.query(sql, [yid, lockerLabel, col, row, jumper, serial, receiverHp, takeSq], (err) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, takeSq });
  });
});

// -----------------------------
// 수령 로그 삭제 (DELETE)
// -----------------------------
router.delete("/:takeSq", ensureAuthorized, (req, res) => {
  const { takeSq } = req.params;

  pool.query("DELETE FROM takeLog WHERE takeSq = ?", [takeSq], (err) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, takeSq });
  });
});

module.exports = router;
