const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// 보관 로그 조회 (GET) - 검색어 + 날짜 범위
// -----------------------------
router.get("/", ensureAuthorized, (req, res) => {
  const { searchText, startDate, endDate } = req.query;
  let wsql = " WHERE 1=1";
  const params = [];

  // 검색어 필터 (보관자, 수취인, 사물함 라벨)
  if (searchText) {
    wsql += " AND (senderHp LIKE ? OR receiverHp LIKE ? OR lockerLabel LIKE ?)";
    params.push(`%${searchText}%`, `%${searchText}%`, `%${searchText}%`);
  }

  // 날짜 범위 필터
  if (startDate) {
    wsql += " AND regDate >= STR_TO_DATE(?, '%Y-%m-%d')";
    params.push(startDate);
  }
  if (endDate) {
    wsql += " AND regDate <= STR_TO_DATE(?, '%Y-%m-%d 23:59:59')";
    params.push(endDate);
  }

  const sql = "SELECT * FROM saveLog" + wsql + " ORDER BY saveSq DESC";

  pool.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, data: results });
  });
});

// -----------------------------
// 보관 로그 생성 (POST)
// -----------------------------
router.post("/", ensureAuthorized, (req, res) => {
  const { yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp } = req.body;

  const sql = `INSERT INTO saveLog 
    (yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  pool.query(sql, [yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp], (err, result) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, saveSq: result.insertId });
  });
});

// -----------------------------
// 보관 로그 수정 (PUT)
// -----------------------------
router.put("/:saveSq", ensureAuthorized, (req, res) => {
  const { saveSq } = req.params;
  const { yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp } = req.body;

  const sql = `UPDATE saveLog SET 
    yid = ?, lockerLabel = ?, col = ?, row = ?, jumper = ?, serial = ?, senderHp = ?, receiverHp = ?
    WHERE saveSq = ?`;

  pool.query(sql, [yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp, saveSq], (err) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, saveSq });
  });
});

// -----------------------------
// 보관 로그 삭제 (DELETE)
// -----------------------------
router.delete("/:saveSq", ensureAuthorized, (req, res) => {
  const { saveSq } = req.params;

  pool.query("DELETE FROM saveLog WHERE saveSq = ?", [saveSq], (err) => {
    if (err) return res.status(500).json({ type: "error", message: err });
    res.json({ success: true, saveSq });
  });
});

module.exports = router;
