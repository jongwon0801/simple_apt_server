const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// 단일 조회
// -----------------------------
router.get("/:yid", ensureAuthorized, async (req, res) => {
  const { yid } = req.params;
  if (!yid) return res.status(400).json({ message: "yid required" });

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [results] = await connection.query(
      "SELECT * FROM locker WHERE yid=? ORDER BY col ASC, row ASC",
      [yid]
    );
    res.json(results);
  } catch (err) {
    console.error("Locker single query error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 전체 조회 (간단 필터 + 정렬)
// -----------------------------
router.get("/", ensureAuthorized, async (req, res) => {
  const { status, yid } = req.query;

  const where = [];
  const params = [];

  if (status !== undefined && status !== "") {
    where.push("status = ?");
    params.push(status);
  }
  if (yid) {
    where.push("yid = ?");
    params.push(yid);
  }

  const whereSql = where.length ? " WHERE " + where.join(" AND ") : "";
  const sql = `SELECT * FROM locker${whereSql} ORDER BY yid ASC, col ASC, row ASC`;

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [results] = await connection.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error("Locker list query error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 등록
// -----------------------------
router.post("/:yid", ensureAuthorized, async (req, res) => {
  const { yid } = req.params;
  if (!yid) return res.status(400).json({ message: "yid required" });

  const param = { ...req.body, yid };
  const columns = Object.keys(param);
  const placeholders = columns.map(() => "?").join(",");
  const sql = `INSERT INTO locker (${columns.join(",")}) VALUES (${placeholders})`;

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [result] = await connection.query(sql, Object.values(param));
    res.json({ insertId: result.insertId });
  } catch (err) {
    console.error("Locker insert error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 수정
// -----------------------------
router.put("/", ensureAuthorized, async (req, res) => {
  const { yid, lockerId, ...updateFields } = req.body;
  if (!yid || !lockerId)
    return res.status(400).json({ message: "yid and lockerId required" });

  const setSql = Object.keys(updateFields)
    .map((key) => `${key} = ?`)
    .join(", ");
  const params = [...Object.values(updateFields), lockerId, yid];
  const sql = `UPDATE locker SET ${setSql} WHERE lockerId = ? AND yid = ?`;

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [result] = await connection.query(sql, params);
    res.json({ changedRows: result.changedRows });
  } catch (err) {
    console.error("Locker update error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
