// routes/applebox/vpn_Crud.js
const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// VPN 서버 CRUD
// -----------------------------

// 등록 (CREATE)
router.post("/", ensureAuthorized, (req, res) => {
  const { ip, location, publicKey, privateKey, address, status } = req.body;

  if (!ip) {
    return res.status(400).json({ message: "ip는 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const sql = `
        INSERT INTO vpn (ip, location, publicKey, privateKey, address, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection
        .promise()
        .query(sql, [ip, location, publicKey, privateKey, address, status || "inactive"]);
      res.json({ insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 수정 (UPDATE)
router.put("/:ip", ensureAuthorized, (req, res) => {
  const { location, publicKey, privateKey, address, status } = req.body;

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const result = await dbUpdate(
        connection,
        "vpn",
        { location, publicKey, privateKey, address, status },
        { ip: req.params.ip }
      );
      res.json({ changedRows: result.changedRows });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 단일 조회 (READ ONE)
router.get("/:ip", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query("SELECT * FROM vpn WHERE ip=?", [req.params.ip], (err, rows) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });
      if (!rows.length) return res.status(404).json({ message: "VPN 서버를 찾을 수 없습니다." });
      res.json(rows[0]);
    });
  });
});

// 리스트 조회 (READ LIST)
router.get("/", ensureAuthorized, (req, res) => {
  const start = (parseInt(req.query.page || "1") - 1) * parseInt(req.query.display || "10");
  const length = parseInt(req.query.display || "10");

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    const sql = `
      SELECT COUNT(*) as cnt FROM vpn;
      SELECT * FROM vpn ORDER BY regDate DESC LIMIT ?, ?
    `;

    connection.query(sql, [start, length], (err, results) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });

      res.json({
        draw: parseInt(req.query.draw || "1"),
        recordsTotal: results[0][0].cnt,
        recordsFiltered: results[0][0].cnt,
        data: results[1],
      });
    });
  });
});

// 삭제 (DELETE)
router.delete("/:ip", ensureAuthorized, (req, res) => {
  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const [result] = await connection.promise().query("DELETE FROM vpn WHERE ip=?", [req.params.ip]);
      res.json({ affectedRows: result.affectedRows });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

module.exports = router;
