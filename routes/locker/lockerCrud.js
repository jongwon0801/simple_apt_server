const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbInsert, dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// Promise 기반 getConnection
function getConnection() {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) return reject(err);
      resolve(connection);
    });
  });
}

// ----------------------------
// 등록
// ----------------------------
router.post("/:yid", ensureAuthorized, async (req, res) => {
  const yid = req.params.yid;
  const param = { ...req.body, yid };

  if (!yid) return res.status(400).json({ message: "yid is required" });

  let connection;
  try {
    connection = await getConnection();
    const result = await dbInsert(connection, "locker", param);
    res.json({ insertId: result.insertId });
  } catch (err) {
    console.error("Locker insert error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------
// 수정
// ----------------------------
router.put("/", ensureAuthorized, async (req, res) => {
  const { yid, jumper, serial, saveName, saveHp, toName, toHp, status } =
    req.body;
  const param = { saveName, saveHp, toName, toHp, status };

  let connection;
  try {
    connection = await getConnection();
    const result = await dbUpdate(connection, "locker", param, {
      yid,
      jumper,
      serial,
    });
    if (!result.changedRows)
      return res.status(404).json({ message: "No rows updated" });
    res.json({ changedRows: result.changedRows });
  } catch (err) {
    console.error("Locker update error:", err);
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------
// 단일 조회
// ----------------------------
router.get("/:yid", ensureAuthorized, async (req, res) => {
  const yid = req.params.yid;
  let connection;
  try {
    connection = await getConnection();
    connection.query(
      "SELECT * FROM locker WHERE yid=? ORDER BY col ASC, row ASC",
      [yid],
      (err, results) => {
        if (err) {
          console.error("Locker fetch error:", err);
          return res.status(500).json({ message: err.message });
        }
        res.json(results);
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ----------------------------
// 전체 조회
// ----------------------------
router.get("/", ensureAuthorized, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    connection.query(
      "SELECT * FROM locker ORDER BY yid ASC, col ASC, row ASC",
      (err, results) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
