const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// Applebox CRUD
// -----------------------------

// 등록
router.post("/", ensureAuthorized, (req, res) => {
  const param = {
    yid: req.body.yid, // 필수
    location: req.body.location,
    addr: req.body.addr || "",
    ip: req.body.ip || "",
    hp: req.body.hp || "",
    boardCnt: req.body.boardCnt || 0,
    installDate: req.body.installDate || null,
  };

  if (!param.yid || !param.location) {
    return res.status(400).json({ message: "yid와 location은 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    try {
      const sql = `INSERT INTO applebox (yid, location, addr, ip, hp, boardCnt, installDate)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        param.yid,
        param.location,
        param.addr,
        param.ip,
        param.hp,
        param.boardCnt,
        param.installDate,
      ];

      await connection.promise().query(sql, values);
      res.json({ insertId: param.yid });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 수정
router.put("/:yid", ensureAuthorized, (req, res) => {
  const param = {
    location: req.body.location,
    addr: req.body.addr || "",
    ip: req.body.ip || "",
    hp: req.body.hp || "",
    boardCnt: req.body.boardCnt || 0,
    installDate: req.body.installDate || null,
  };

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    try {
      const result = await dbUpdate(connection, "applebox", param, {
        yid: req.params.yid,
      });
      res.json({ changedRows: result.changedRows });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 단일 조회
router.get("/:yid", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query(
      "SELECT * FROM applebox WHERE yid=?",
      [req.params.yid],
      (err, rows) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (!rows.length) return res.status(404).json({ message: "Not found" });
        res.json(rows[0]);
      }
    );
  });
});

// 리스트 조회 (전체 데이터 반환)
router.get("/", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    const sql = `SELECT * FROM applebox ORDER BY yid DESC`;
    connection.query(sql, (err, rows) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });

      res.json({
        draw: parseInt(req.query.draw || "1"),
        recordsTotal: rows.length,
        recordsFiltered: rows.length,
        data: rows,
      });
    });
  });
});

module.exports = router;
