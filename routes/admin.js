const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");

// -----------------------------
// MySQL 커넥션 풀
// -----------------------------
const pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 5000,
  host: "localhost",
  user: "yellowbox",
  database: "yellowbox",
  password: "dpfshdnqkrtm",
  multipleStatements: true,
});

const JWT_SECRET = "wikibox";

// -----------------------------
// JWT 인증 미들웨어
// -----------------------------
function ensureAuthorized(req, res, next) {
  const authHeader =
    req.headers["authorization"] || req.body.token || req.query.token;
  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(401).json({ message: "Failed to authenticate token" });
    req.decoded = decoded;
    next();
  });
}

// 정적 파일 제공
router.use(express.static(path.join(__dirname, "../public/admin")));

// SPA 진입점
router.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/index.html"));
});

// -----------------------------
// 로그인 API
// -----------------------------
router.post("/authenticate", async (req, res) => {
  const { uid, passwd } = req.body;
  if (!uid || !passwd)
    return res.status(400).json({ message: "아이디와 비밀번호 필요" });

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      "SELECT * FROM member WHERE uid=?",
      [uid],
      async (err, rows) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (!rows.length)
          return res
            .status(404)
            .json({ message: "아이디가 존재하지 않습니다." });

        const user = rows[0];
        const match = await bcrypt.compare(passwd, user.passwd);
        if (!match)
          return res.status(401).json({ message: "비밀번호가 틀립니다." });

        const token = jwt.sign(
          { memberSq: user.memberSq, uid: user.uid, name: user.name },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        res.json({ message: "로그인 성공", token });
      }
    );
  });
});

// -----------------------------
// Applebox & Locker API
// (기존 코드 그대로 사용)
// -----------------------------

// Applebox CRUD
router.post("/Applebox", ensureAuthorized, (req, res) => {
  const param = {
    location: req.body.location,
    addr: JSON.stringify(req.body.addr),
    ip: req.body.ip,
    hp: req.body.hp,
    boardCnt: req.body.boardCnt,
    installDate: req.body.installDate,
  };
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query("INSERT INTO applebox SET ?", param, (err, results) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });
      res.json({ insertId: results.insertId });
    });
  });
});

router.put("/Applebox/:yid", ensureAuthorized, (req, res) => {
  const param = {
    location: req.body.location,
    addr: JSON.stringify(req.body.addr),
    ip: req.body.ip,
    hp: req.body.hp,
    boardCnt: req.body.boardCnt,
    installDate: req.body.installDate,
  };
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query(
      "UPDATE applebox SET ? WHERE yid=?",
      [param, req.params.yid],
      (err, result) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        res.json({ changedRows: result.changedRows });
      }
    );
  });
});

router.get("/Applebox/:yid", ensureAuthorized, (req, res) => {
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

router.get("/Applebox", ensureAuthorized, (req, res) => {
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

// Locker CRUD
router.post("/Locker/:yid", ensureAuthorized, (req, res) => {
  const param = { ...req.body, yid: req.params.yid };
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query("INSERT INTO locker SET ?", param, (err, results) => {
      connection.release();
      if (err) return res.status(500).json({ message: err.message });
      res.json({ insertId: results.insertId });
    });
  });
});

router.get("/Locker/:yid", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query(
      "SELECT * FROM locker WHERE yid=? ORDER BY col ASC, row ASC",
      [req.params.yid],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
      }
    );
  });
});

router.get("/Locker", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    connection.query(
      "SELECT * FROM locker ORDER BY yid ASC, col ASC, row ASC",
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        res.json(results);
      }
    );
  });
});

router.put("/Locker", ensureAuthorized, (req, res) => {
  const { yid, jumper, serial, saveName, saveHp, toName, toHp, status } =
    req.body;
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });
    const param = { saveName, saveHp, toName, toHp, status };
    connection.query(
      "UPDATE locker SET ? WHERE yid=? AND jumper=? AND serial=?",
      [param, yid, jumper, serial],
      (err, result) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (result.changedRows === 0)
          return res.status(404).json({ message: "No rows updated" });
        res.json({ changedRows: result.changedRows });
      }
    );
  });
});

module.exports = router;
