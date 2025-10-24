const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

// Helper: pool.getConnection() Promise 래퍼
function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) =>
      err ? reject(err) : resolve(connection)
    );
  });
}

// 전체 조회
router.get("/", ensureAuthorized, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM saveLog ORDER BY saveSq DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// 단일 조회
router.get("/:saveSq", ensureAuthorized, async (req, res) => {
  const { saveSq } = req.params;
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM saveLog WHERE saveSq = ?", [saveSq]);
    if (!rows.length)
      return res.status(404).json({ type: "error", message: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// 생성
router.post("/", ensureAuthorized, async (req, res) => {
  const { yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp } =
    req.body;
  let connection;
  try {
    connection = await getConnection();
    const sql = `INSERT INTO saveLog 
      (yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection
      .promise()
      .query(sql, [
        yid,
        lockerLabel,
        col,
        row,
        jumper,
        serial,
        senderHp,
        receiverHp,
      ]);
    res.json({ success: true, saveSq: result.insertId });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// 수정
router.put("/:saveSq", ensureAuthorized, async (req, res) => {
  const { saveSq } = req.params;
  const { yid, lockerLabel, col, row, jumper, serial, senderHp, receiverHp } =
    req.body;
  let connection;
  try {
    connection = await getConnection();
    const sql = `UPDATE saveLog SET 
      yid = ?, lockerLabel = ?, col = ?, row = ?, jumper = ?, serial = ?, senderHp = ?, receiverHp = ?
      WHERE saveSq = ?`;
    await connection
      .promise()
      .query(sql, [
        yid,
        lockerLabel,
        col,
        row,
        jumper,
        serial,
        senderHp,
        receiverHp,
        saveSq,
      ]);
    res.json({ success: true, saveSq });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// 삭제
router.delete("/:saveSq", ensureAuthorized, async (req, res) => {
  const { saveSq } = req.params;
  let connection;
  try {
    connection = await getConnection();
    await connection
      .promise()
      .query("DELETE FROM saveLog WHERE saveSq = ?", [saveSq]);
    res.json({ success: true, saveSq });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
