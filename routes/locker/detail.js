const express = require("express");
const router = express.Router();
const pool = require("../../common/db");
const { dbInsert } = require("../../common/dbUtils");
const { ensureAuthorized } = require("../../common/jwt");

// -----------------------------
// Locker 상세 등록
// -----------------------------
router.post("/lockerdetail", ensureAuthorized, async (req, res) => {
  console.log("req.body:", req.body); // <- 추가
  const lockers = req.body.lockers || [];

  if (!lockers.length) {
    return res
      .status(400)
      .json({ success: false, message: "등록할 locker 데이터가 없습니다." });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    for (const locker of lockers) {
      const param = {
        yid: locker.yid,
        label: locker.label,
        col: locker.col,
        row: locker.row,
        jumper: locker.jumper ?? null,
        serial: locker.serial ?? null,
        status: locker.status ?? null,
        width: locker.width ?? null,
        height: locker.height ?? null,
        senderHp: locker.senderHp ?? null,
        receiverHp: locker.receiverHp ?? null,
        authNum: locker.authNum ?? null,
      };

      await dbInsert(connection, "locker", param);
    }

    await connection.commit();
    res.json({ success: true, lockers: lockers.length });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
