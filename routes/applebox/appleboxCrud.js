const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbInsert, dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// Applebox CRUD
// -----------------------------

// 등록
router.post("/", ensureAuthorized, (req, res) => {
  const param = {
    yid: req.body.yid, // 수동으로 yid 값을 받도록 추가
    location: req.body.location,
    addr: JSON.stringify(req.body.addr),
    ip: req.body.ip,
    hp: req.body.hp,
    boardCnt: req.body.boardCnt,
    installDate: req.body.installDate,
  };

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    try {
      const result = await dbInsert(connection, "applebox", param);
      res.json({ success: true, yid: param.yid });
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
    addr: JSON.stringify(req.body.addr),
    ip: req.body.ip,
    hp: req.body.hp,
    boardCnt: req.body.boardCnt,
    installDate: req.body.installDate,
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
        try {
          rows[0].addr = JSON.parse(rows[0].addr);
        } catch {}
        res.json(rows[0]);
      }
    );
  });
});

// 리스트 조회
router.get("/", ensureAuthorized, (req, res) => {
  const start = parseInt(req.query.page || "1") - 1;
  const length = parseInt(req.query.display || "10");

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      "SELECT COUNT(*) cnt FROM applebox; SELECT * FROM applebox ORDER BY yid DESC LIMIT ?, ?",
      [start * length, length],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });

        const rs = results[1].map((r) => {
          try {
            r.addr = JSON.parse(r.addr);
          } catch {}
          return r;
        });
        res.json({
          draw: parseInt(req.query.draw || "1"),
          recordsTotal: results[0][0].cnt,
          recordsFiltered: results[0][0].cnt,
          data: rs,
        });
      }
    );
  });
});

module.exports = router;
