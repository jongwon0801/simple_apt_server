const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate, dbInsert } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");
const { withTransaction } = require("../../common/transaction");

const LOCKER_STATUS = { A:"보관중", B:"사용가능", C:"사용불가", D:"보관하는중", E:"찾으려는중" };

// open_to_save
router.post("/open_to_save", ensureAuthorized, (req, res) => {
  const lockerParam = { status:"D", pwd:req.body.pwd };
  const saveLogParam = {
    yid: req.body.yid, lockerLabel: req.body.label,
    col: req.body.col, row: req.body.row, jumper: req.body.jumper, serial: req.body.serial,
    senderHp: req.body.saveHp, receiverHp: req.body.toHp, pwd:req.body.pwd, regDate:new Date()
  };

  withTransaction(pool, (conn) => [
    dbUpdate(conn, "locker", lockerParam, { yid:req.body.yid, col:req.body.col, row:req.body.row }),
    dbInsert(conn, "saveLog", saveLogParam)
  ], res, () => res.json({ yid:req.body.yid, status:"D", statusLabel:LOCKER_STATUS["D"] }));
});

// open_to_take
router.post("/open_to_take", ensureAuthorized, (req, res) => {
  const lockerParam = { status:"E" };
  const takeLogParam = {
    yid:req.body.yid, lockerLabel:req.body.label, col:req.body.col, row:req.body.row,
    jumper:req.body.jumper, receiverHp:req.body.toHp, pwd:req.body.pwd, takeDate:new Date()
  };
  withTransaction(pool, (conn) => [
    dbUpdate(conn, "locker", lockerParam, { yid:req.body.yid, col:req.body.col, row:req.body.row }),
    dbInsert(conn, "takeLog", takeLogParam)
  ], res, () => res.json({ yid:req.body.yid, status:"E", statusLabel:LOCKER_STATUS["E"] }));
});

// close
router.post("/close", ensureAuthorized, (req, res) => {
  const newStatus = "B";
  const lockerParam = { status:newStatus };
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type:"error", message:err });
    dbUpdate(connection, "locker", lockerParam, {
      yid:req.body.yid, col:req.body.col, row:req.body.row, jumper:req.body.jumper, serial:req.body.serial
    }).then(() => { connection.release(); res.json({ success:true, yid:req.body.yid, col:req.body.col, row:req.body.row, status:newStatus, statusLabel:LOCKER_STATUS[newStatus] }); })
    .catch((err) => { connection.release(); res.status(500).json({ type:"error", message:err }); });
  });
});

module.exports = router;
