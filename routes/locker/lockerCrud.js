"use strict";

const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");


// -----------------------------
// 단일 조회 (yid + label)
// -----------------------------
router.get("/:yid/:label", ensureAuthorized, async (req, res) => {
  const { yid, label } = req.params;
  if (!yid || label == null)
    return res.status(400).json({ message: "yid and label required" });

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [results] = await connection.query(
      "SELECT * FROM locker WHERE yid=? AND label=?",
      [yid, label]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "Locker not found" });
    }

    res.json(results[0]); // 단일 객체 반환
  } catch (err) {
    console.error("Locker single by label query error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});


// -----------------------------
// 전체 캐비넷 조회 (특정 yid의 모든 락커)
// -----------------------------
router.get("/:yid", ensureAuthorized, async (req, res) => {
  const { yid } = req.params;
  if (!yid) return res.status(400).json({ message: "yid required" });

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [results] = await connection.query(
      "SELECT * FROM locker WHERE yid=? ORDER BY col ASC, `row` ASC",
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
// 전체 조회 (필터 + 정렬)
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
  const sql = `SELECT * FROM locker${whereSql} ORDER BY yid ASC, col ASC, \`row\` ASC`;

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
// 단일/배치 등록 (label 자동 증가, 중복 방지)
// -----------------------------

router.post("/:yid", ensureAuthorized, async (req, res) => {
  const { yid } = req.params;
  const lockers = Array.isArray(req.body) ? req.body : [req.body];

  if (!yid) return res.status(400).json({ message: "yid required" });

  let connection;
  try {
    connection = await pool.promise().getConnection();

    // yid별 현재 최대 label 조회 (정수로 캐스팅)
    const [rows] = await connection.query(
      "SELECT MAX(CAST(label AS UNSIGNED)) as maxLabel FROM locker WHERE yid=?",
      [yid]
    );
    let nextLabel = (rows[0].maxLabel || 0) + 1;

    const results = [];

    for (const locker of lockers) {
      // label이 없으면 자동 부여
      if (locker.label == null) {
        locker.label = nextLabel++;
      } else {
        // 이미 존재하는 label이면 에러
        const [exist] = await connection.query(
          "SELECT COUNT(*) as cnt FROM locker WHERE yid=? AND label=?",
          [yid, locker.label]
        );
        if (exist[0].cnt > 0) {
          throw new Error(`Label ${locker.label} already exists for yid ${yid}`);
        }
      }

      // 컬럼 매핑 (row는 백틱 처리)
      const param = { ...locker, yid };
      const columns = Object.keys(param).map(col => (col === "row" ? "`row`" : col));
      const placeholders = columns.map(() => "?").join(",");
      const sql = `INSERT INTO locker (${columns.join(",")}) VALUES (${placeholders})`;

      const [result] = await connection.query(sql, Object.values(param));
      results.push({ label: locker.label, affectedRows: result.affectedRows });
    }

    res.json({ inserted: results });
  } catch (err) {
    console.error("Locker insert error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});


// -----------------------------
// 수정 (yid + label 기준)
// -----------------------------
router.put("/", ensureAuthorized, async (req, res) => {
  const { yid, label, ...updateFields } = req.body;
  if (!yid || label == null)
    return res.status(400).json({ message: "yid and label required" });

  const setSql = Object.keys(updateFields)
    .map((key) => (key === "row" ? "`row` = ?" : `${key} = ?`))
    .join(", ");
  const params = [...Object.values(updateFields), yid, label];
  const sql = `UPDATE locker SET ${setSql} WHERE yid = ? AND label = ?`;

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

// -----------------------------
// 삭제 (yid + label 기준)
// -----------------------------
router.delete("/", ensureAuthorized, async (req, res) => {
  const { yid, label } = req.body;
  if (!yid || label == null)
    return res.status(400).json({ message: "yid and label required" });

  const sql = "DELETE FROM locker WHERE yid = ? AND label = ?";
  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [result] = await connection.query(sql, [yid, label]);
    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Locker delete error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// -----------------------------
// 특정 yid의 모든 락커 삭제
// -----------------------------
router.delete("/all/:yid", ensureAuthorized, async (req, res) => {
  const { yid } = req.params;
  if (!yid) return res.status(400).json({ message: "yid required" });

  let connection;
  try {
    connection = await pool.promise().getConnection();
    const [result] = await connection.query(
      "DELETE FROM locker WHERE yid = ?",
      [yid]
    );

    res.json({ affectedRows: result.affectedRows });
  } catch (err) {
    console.error("Locker delete all error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});


module.exports = router;
