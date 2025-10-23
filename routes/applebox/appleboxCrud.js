const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// Applebox CRUD (yid 직접 입력 기준)
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
      const result = await dbUpdate(connection, "applebox", param, { yid: req.params.yid });
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
    connection.query("SELECT * FROM applebox WHERE yid=?", [req.params.yid], (err, rows) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });
      if (!rows.length) return res.status(404).json({ message: "Not found" });
      res.json(rows[0]);
    });
  });
});

// 리스트 조회
router.get("/", ensureAuthorized, (req, res) => {
  const start = (parseInt(req.query.page || "1") - 1) * parseInt(req.query.display || "10");
  const length = parseInt(req.query.display || "10");

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    const sql = `
      SELECT COUNT(*) as cnt FROM applebox;
      SELECT * FROM applebox ORDER BY yid DESC LIMIT ?, ?
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


// -----------------------------
// Applebox + Locker 한번에 등록 (yid 직접 입력, async/await)
// -----------------------------
router.post("/detail", ensureAuthorized, async (req, res) => {
  const { applebox, cabinet } = req.body;

  if (!applebox.yid || !applebox.name) {
    return res.status(400).json({ success: false, message: "yid와 name은 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    const conn = connection.promise();

    try {
      await conn.beginTransaction();

      // 1️⃣ Applebox insert
      await conn.query(
        `INSERT INTO applebox (yid, location, addr, ip, hp, boardCnt, installDate)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          applebox.yid,
          applebox.name,
          JSON.stringify(applebox.addr || {}),
          applebox.ip || "",
          applebox.hp || "",
          cabinet.length,
          applebox.regDate || null,
        ]
      );

      // 2️⃣ Locker insert 준비
      const lockerValues = [];
      cabinet.forEach((c) => {
        c.box.forEach((b) => {
          lockerValues.push([
            applebox.yid,           // yid
            b.label || "",
            b.col ?? 0,
            b.row ?? 0,
            b.jumper ?? 0,
            b.serial ?? 0,
            b.width ?? 0,
            b.height ?? 0,
            b.status || "B",
            b.senderHp || null,
            b.receiverHp || null,
            b.authNum || null,
          ]);
        });
      });

      if (lockerValues.length > 0) {
        await conn.query(
          `INSERT INTO locker
           (yid, label, col, row, jumper, serial, width, height, status, senderHp, receiverHp, authNum)
           VALUES ?`,
          [lockerValues]
        );
      }

      await conn.commit();
      res.json({ success: true, yid: applebox.yid, lockers: lockerValues.length });

    } catch (err) {
      await conn.rollback();
      res.status(500).json({ success: false, error: err.message });
    } finally {
      connection.release();
    }
  });
});



module.exports = router;
