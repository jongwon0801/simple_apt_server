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

// -----------------------------
// 수령 로그 전체 조회
// -----------------------------
router.get("/", ensureAuthorized, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM takeLog ORDER BY takeSq DESC");
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 수령 로그 단일 조회
// -----------------------------
router.get("/:takeSq", ensureAuthorized, async (req, res) => {
  const { takeSq } = req.params;
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM takeLog WHERE takeSq = ?", [takeSq]);
    if (!rows.length)
      return res.status(404).json({ type: "error", message: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 수령 로그 생성
// -----------------------------
router.post("/", ensureAuthorized, async (req, res) => {
  const { yid, lockerLabel, col, row, jumper, serial, receiverHp } = req.body;
  let connection;
  try {
    connection = await getConnection();
    const sql = `INSERT INTO takeLog
      (yid, lockerLabel, col, row, jumper, serial, receiverHp)
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await connection
      .promise()
      .query(sql, [yid, lockerLabel, col, row, jumper, serial, receiverHp]);
    res.json({ success: true, takeSq: result.insertId });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 수령 로그 수정
// -----------------------------
router.put("/:takeSq", ensureAuthorized, async (req, res) => {
  const { takeSq } = req.params;
  const { yid, lockerLabel, col, row, jumper, serial, receiverHp } = req.body;
  let connection;
  try {
    connection = await getConnection();
    const sql = `UPDATE takeLog SET
      yid = ?, lockerLabel = ?, col = ?, row = ?, jumper = ?, serial = ?, receiverHp = ?
      WHERE takeSq = ?`;
    await connection
      .promise()
      .query(sql, [
        yid,
        lockerLabel,
        col,
        row,
        jumper,
        serial,
        receiverHp,
        takeSq,
      ]);
    res.json({ success: true, takeSq });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 수령 로그 삭제
// -----------------------------
router.delete("/:takeSq", ensureAuthorized, async (req, res) => {
  const { takeSq } = req.params;
  let connection;
  try {
    connection = await getConnection();
    await connection
      .promise()
      .query("DELETE FROM takeLog WHERE takeSq = ?", [takeSq]);
    res.json({ success: true, takeSq });
  } catch (err) {
    res.status(500).json({ type: "error", message: err.message || err });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
