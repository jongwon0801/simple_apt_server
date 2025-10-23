const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { ensureAuthorized } = require("../../common/jwt");

router.get("/", ensureAuthorized, (req, res) => {
  pool.query('SELECT COUNT(*) AS cnt FROM locker WHERE status IN ("D","E")', [], (err, results) => {
    if (err) return res.status(500).json({ type:"error", message:err });
    res.json({ success:true, data:results[0].cnt, detail:{ D:results[0].cnt } });
  });
});

module.exports = router;
