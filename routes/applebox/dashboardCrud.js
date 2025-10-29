const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// 1️⃣ 보관/수령 비율
// -----------------------------
router.get("/ratio", ensureAuthorized, async (req, res) => {
  try {
    const conn = await pool.promise().getConnection();
    const [[save]] = await conn.query("SELECT COUNT(*) AS cnt FROM saveLog");
    const [[take]] = await conn.query("SELECT COUNT(*) AS cnt FROM takeLog");
    conn.release();

    res.json({ save: save.cnt, take: take.cnt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// 2️⃣ 단말기별 사용량 TOP 5
// -----------------------------
router.get("/topYid", ensureAuthorized, async (req, res) => {
  try {
    const conn = await pool.promise().getConnection();
    const [rows] = await conn.query(`
      SELECT s.yid, a.location, COUNT(*) AS count
      FROM saveLog s
      LEFT JOIN applebox a ON a.yid = s.yid
      GROUP BY s.yid
      ORDER BY count DESC
      LIMIT 5
    `);
    conn.release();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// 3️⃣ 직원별 이용횟수 TOP 5
// -----------------------------
router.get("/topStaff", ensureAuthorized, async (req, res) => {
  try {
    const conn = await pool.promise().getConnection();
    const [rows] = await conn.query(`
      SELECT ds.hp, COUNT(*) AS count
      FROM deliveryStaff ds
      LEFT JOIN saveLog s ON ds.hp = s.senderHp
      GROUP BY ds.hp
      ORDER BY count DESC
      LIMIT 5
    `);
    conn.release();

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// 4️⃣ 종합 데이터 (ratio + topYid + topStaff)
// -----------------------------
router.get("/summary", ensureAuthorized, async (req, res) => {
  try {
    const conn = await pool.promise().getConnection();

    const [[save]] = await conn.query("SELECT COUNT(*) AS cnt FROM saveLog");
    const [[take]] = await conn.query("SELECT COUNT(*) AS cnt FROM takeLog");

    const [topYid] = await conn.query(`
      SELECT s.yid, a.location, COUNT(*) AS count
      FROM saveLog s
      LEFT JOIN applebox a ON a.yid = s.yid
      GROUP BY s.yid
      ORDER BY count DESC
      LIMIT 5
    `);

    const [topStaff] = await conn.query(`
      SELECT ds.hp, COUNT(*) AS count
      FROM deliveryStaff ds
      LEFT JOIN saveLog s ON ds.hp = s.senderHp
      GROUP BY ds.hp
      ORDER BY count DESC
      LIMIT 5
    `);

    conn.release();

    res.json({
      ratio: { save: save.cnt, take: take.cnt },
      topYid,
      topStaff,
    });
  } catch (err) {
    console.error("SUMMARY ROUTE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// -----------------------------
// 5️⃣ 종합 통계 (박스/락커/이번달 보관/수령)
// -----------------------------
router.get("/summaryStats", ensureAuthorized, async (req, res) => {
  try {
    const conn = await pool.promise().getConnection();

    // 총 단말기 수
    const [[boxCount]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM applebox"
    );

    // 총 사물함 수
    const [[lockerCount]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM locker"
    );

    // 이번 달 보관 횟수
    const [[saveThisMonth]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM saveLog WHERE MONTH(regDate) = MONTH(CURDATE()) AND YEAR(regDate) = YEAR(CURDATE())"
    );

    // 이번 달 수령 횟수
    const [[takeThisMonth]] = await conn.query(
      "SELECT COUNT(*) AS cnt FROM takeLog WHERE MONTH(takeDate) = MONTH(CURDATE()) AND YEAR(takeDate) = YEAR(CURDATE())"
    );

    conn.release();

    res.json({
      boxCount: boxCount.cnt,
      lockerCount: lockerCount.cnt,
      saveThisMonth: saveThisMonth.cnt,
      takeThisMonth: takeThisMonth.cnt,
    });
  } catch (err) {
    console.error("SUMMARY STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
