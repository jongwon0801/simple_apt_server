const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// DeliveryStaff CRUD
// -----------------------------

// 등록 (CREATE)
router.post("/", ensureAuthorized, (req, res) => {
  const { hp } = req.body;

  if (!hp) {
    return res.status(400).json({ message: "hp는 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const sql = `INSERT INTO deliveryStaff (hp) VALUES (?)`;
      const [result] = await connection.promise().query(sql, [hp]);
      res.json({ insertId: result.insertId });
    } catch (err) {
      // 중복 hp 처리
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ message: "이미 등록된 휴대폰 번호입니다." });
      }
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 수정 (UPDATE)
router.put("/:staffSq", ensureAuthorized, (req, res) => {
  const { hp } = req.body;

  if (!hp) {
    return res.status(400).json({ message: "hp는 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const result = await dbUpdate(
        connection,
        "deliveryStaff",
        { hp },
        { staffSq: req.params.staffSq }
      );
      res.json({ changedRows: result.changedRows });
    } catch (err) {
      // 중복 hp 처리
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ message: "이미 등록된 휴대폰 번호입니다." });
      }
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 단일 조회 (READ ONE)
router.get("/:staffSq", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      "SELECT * FROM deliveryStaff WHERE staffSq=?",
      [req.params.staffSq],
      (err, rows) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (!rows.length)
          return res
            .status(404)
            .json({ message: "택배기사를 찾을 수 없습니다." });
        res.json(rows[0]);
      }
    );
  });
});

// 리스트 조회 (READ LIST)
router.get("/", ensureAuthorized, (req, res) => {
  const start =
    (parseInt(req.query.page || "1") - 1) * parseInt(req.query.display || "10");
  const length = parseInt(req.query.display || "10");

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    const sql = `
      SELECT COUNT(*) as cnt FROM deliveryStaff;
      SELECT * FROM deliveryStaff ORDER BY staffSq DESC LIMIT ?, ?
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
router.delete("/:staffSq", ensureAuthorized, (req, res) => {
  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const [result] = await connection
        .promise()
        .query("DELETE FROM deliveryStaff WHERE staffSq=?", [
          req.params.staffSq,
        ]);
      res.json({ affectedRows: result.affectedRows });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

module.exports = router;
