const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbUpdate, dbInsert } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");
const { withTransaction } = require("../../common/transaction");

const LOCKER_STATUS = { A:"보관중", B:"사용가능", C:"사용불가" };

// ----------------------------
// 보관 API
// ----------------------------
router.post("/save", ensureAuthorized, (req, res) => {
  const lockerParam = { status: "A" }; // 보관중
  const saveLogParam = {
    yid: req.body.yid,
    lockerLabel: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    serial: req.body.serial,
    senderHp: req.body.saveHp,
    receiverHp: req.body.toHp,
    regDate: new Date()
  };

  withTransaction(
    pool,
    (conn) => [
      // yid + jumper + serial로만 식별
      dbUpdate(conn, "locker", lockerParam, { 
        yid: req.body.yid, 
        jumper: req.body.jumper, 
        serial: req.body.serial 
      }),
      dbInsert(conn, "saveLog", saveLogParam)
    ],
    res,
    () => res.json({ yid: req.body.yid, status: "A", statusLabel: LOCKER_STATUS["A"] })
  );
});

// ----------------------------
// 수거 API
// ----------------------------
router.post("/take", ensureAuthorized, (req, res) => {
  const lockerParam = { status: "B" }; // 사용가능
  const takeLogParam = {
    yid: req.body.yid,
    lockerLabel: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    serial: req.body.serial,
    receiverHp: req.body.toHp,
    takeDate: new Date()
  };

  withTransaction(
    pool,
    (conn) => [
      // yid + jumper + serial로만 식별
      dbUpdate(conn, "locker", lockerParam, { 
        yid: req.body.yid, 
        jumper: req.body.jumper, 
        serial: req.body.serial 
      }),
      dbInsert(conn, "takeLog", takeLogParam)
    ],
    res,
    () => res.json({ yid: req.body.yid, status: "B", statusLabel: LOCKER_STATUS["B"] })
  );
});

module.exports = router;
