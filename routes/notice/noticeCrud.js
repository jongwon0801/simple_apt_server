const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// Notice CRUD
// -----------------------------

// 등록 (CREATE)
router.post("/", ensureAuthorized, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "title과 content는 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const sql = `INSERT INTO notice (title, content) VALUES (?, ?)`;
      const [result] = await connection.promise().query(sql, [title, content]);
      res.json({ insertId: result.insertId });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

// 수정 (UPDATE)
router.put("/:noticeSq", ensureAuthorized, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "title과 content는 필수입니다." });
  }

  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const result = await dbUpdate(
        connection,
        "notice",
        { title, content },
        { noticeSq: req.params.noticeSq }
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
router.get("/:noticeSq", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      "SELECT * FROM notice WHERE noticeSq=?",
      [req.params.noticeSq],
      (err, rows) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (!rows.length)
          return res
            .status(404)
            .json({ message: "공지사항을 찾을 수 없습니다." });
        res.json(rows[0]);
      }
    );
  });
});

// 리스트 조회 (READ LIST, 전체 데이터 반환)
router.get("/", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    const sql = `SELECT * FROM notice ORDER BY noticeSq DESC`;
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

// 삭제 (DELETE)
router.delete("/:noticeSq", ensureAuthorized, (req, res) => {
  pool.getConnection(async (err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const [result] = await connection
        .promise()
        .query("DELETE FROM notice WHERE noticeSq=?", [req.params.noticeSq]);
      res.json({ affectedRows: result.affectedRows });
    } catch (err) {
      res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  });
});

module.exports = router;
