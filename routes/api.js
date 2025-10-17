var express = require("express");
var router = express.Router();
var mysql = require("mysql");
var { dbUpdate, dbInsert } = require("../common/dbUtils");
var { ensureAuthorized, checkAuthorized } = require("../common/auth");
var randomString = require("../common/randomString");
var dateFormat = require("dateformat");

var pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 5000,
  host: "localhost",
  user: "yellowbox",
  database: "yellowbox",
  password: "dpfshdnqkrtm",
  multipleStatements: true,
});

// ----------------------------
// CORS 설정
// ----------------------------
router.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,Content-Type, Authorization"
  );
  next();
});

// ----------------------------
// 인증번호 생성 & SMS 발송 (배달기사용)
// ----------------------------

router.get("/authSmsDeliverer/:hp", (req, res) => {
  const hp = req.params.hp;
  const authNum = randomString(4, "N"); // 4자리 숫자

  const smsMsg = `위키박스 인증번호[${authNum}]`;

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    // 인증번호 임시 저장 (예: auth_delivery 테이블)
    connection.query(
      "INSERT INTO auth_delivery (hp, authNum, regDate) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE authNum=?, regDate=NOW()",
      [hp, authNum, authNum],
      (err) => {
        if (err) {
          connection.release();
          return res.status(500).json({ type: "error", message: err });
        }

        // SMS 메시지 테이블
        const smsQuery = `
          INSERT INTO BIZ_MSG (msg_type, cmid, request_time, send_time, dest_phone, send_phone, msg_body)
          VALUES (0, DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'), NOW(), NOW(), ?, ?, ?)
        `;
        connection.query(smsQuery, [hp, "15774594", smsMsg], (err) => {
          connection.release();
          if (err) return res.status(500).json({ type: "error", message: err });
          res.json({ success: true, authNum }); // 디버깅용
        });
      }
    );
  });
});

// 키오스크에서 입력받은 인증번호 확인 후 등록
router.post("/registerDeliverer", (req, res) => {
  const { hp, authNum } = req.body;
  if (!hp || !authNum)
    return res.status(400).json({ type: "error", message: "hp/authNum 필수" });

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    // 인증번호 확인
    connection.query(
      "SELECT * FROM auth_delivery WHERE hp=? AND authNum=?",
      [hp, authNum],
      (err, results) => {
        if (err) {
          connection.release();
          return res.status(500).json({ type: "error", message: err });
        }

        if (results.length === 0) {
          connection.release();
          return res
            .status(401)
            .json({ type: "error", message: "인증번호 불일치" });
        }

        // 인증 성공 → deliveryStaff 등록
        connection.query(
          "INSERT INTO deliveryStaff (hp) VALUES (?) ON DUPLICATE KEY UPDATE regDate=NOW()",
          [hp],
          (err, result) => {
            connection.release();
            if (err)
              return res.status(500).json({ type: "error", message: err });

            res.json({ success: true, staffSq: result.insertId });
          }
        );
      }
    );
  });
});

// ----------------------------
// 기사번호 존재 여부 확인
// ----------------------------

router.get("/checkDeliverer/:hp", (req, res) => {
  const { hp } = req.params;
  if (!hp) return res.status(400).json({ message: "휴대폰 번호 필요" });

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      "SELECT staffSq, hp, regDate FROM deliveryStaff WHERE hp = ?",
      [hp],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });

        if (results.length === 0) {
          return res.json({
            exists: false,
            message: "등록되지 않은 번호입니다.",
          });
        }

        res.json({ exists: true, staff: results[0] });
      }
    );
  });
});

// ----------------------------
// 보관함 인증번호 발급 (SMS)
// ----------------------------

router.get(
  "/authSmsLocker/:yid/:col/:row/:jumper/:serial/:senderHp/:receiverHp",
  (req, res) => {
    const { yid, col, row, jumper, serial, senderHp, receiverHp } = req.params;

    if (!senderHp || !receiverHp)
      return res.status(400).json({ message: "송신/수신자 번호 필요" });

    const authNum = randomString(5, "N"); // 5자리 숫자
    const smsMsg = `위키박스 인증번호[${authNum}]`;

    pool.getConnection((err, connection) => {
      if (err) return res.status(500).json({ message: err.message });

      // locker 테이블 업데이트
      connection.query(
        `UPDATE locker 
           SET authNum = ?, senderHp = ?, receiverHp = ? 
         WHERE yid = ? AND col = ? AND row = ?`,
        [authNum, senderHp, receiverHp, yid, col, row],
        (err, result) => {
          if (err) {
            connection.release();
            return res.status(500).json({ message: err.message });
          }
          if (result.affectedRows === 0) {
            connection.release();
            return res.status(404).json({ message: "Locker not found" });
          }

          // SMS 메시지 테이블에 저장
          const smsQuery = `
            INSERT INTO BIZ_MSG 
            (msg_type, cmid, request_time, send_time, dest_phone, send_phone, msg_body)
            VALUES 
            (0, DATE_FORMAT(NOW(),'%Y%m%d%H%i%S%i%f'), NOW(), NOW(), ?, ?, ?)
          `;
          connection.query(smsQuery, [receiverHp, senderHp, smsMsg], (err2) => {
            connection.release();
            if (err2) return res.status(500).json({ message: err2.message });

            res.json({
              message: "인증번호 발급 완료",
              authNum,
              yid,
              col,
              row,
              senderHp,
              receiverHp,
            });
          });
        }
      );
    });
  }
);

// ----------------------------
// 인증번호 확인 + 라벨 정보 반환
// ----------------------------
router.get("/verifyLockerAuth/:authNum", (req, res) => {
  const { authNum } = req.params;
  if (!authNum) return res.status(400).json({ message: "인증번호 필요" });

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ message: err.message });

    connection.query(
      `SELECT yid, col, row, jumper, serial, label, senderHp, receiverHp 
       FROM locker 
       WHERE authNum=?`,
      [authNum],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ message: err.message });
        if (!results.length)
          return res
            .status(404)
            .json({ message: "인증번호가 존재하지 않거나 잘못되었습니다." });

        // 필요한 정보 반환
        res.json({
          yid: results[0].yid,
          col: results[0].col,
          row: results[0].row,
          jumper: results[0].jumper,
          serial: results[0].serial,
          label: results[0].label,
          senderHp: results[0].senderHp,
          receiverHp: results[0].receiverHp,
        });
      }
    );
  });
});

// ----------------------------
// SaveLog 조회
// ----------------------------
router.get("/SaveLog", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    let wsql = " WHERE receiverHp = ?";
    const params = [req.decoded.hp];

    if (req.query.maxDate) {
      wsql += " AND regDate > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')";
      params.push(
        dateFormat(new Date(req.query.maxDate), "yyyy-mm-dd HH:MM:ss")
      );
    }

    connection.query(
      "SELECT * FROM saveLog " + wsql + " ORDER BY saveSq DESC LIMIT 1000",
      params,
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ type: "error", message: err });
        res.json({ success: true, data: results });
      }
    );
  });
});

// ----------------------------
// TakeLog 조회
// ----------------------------
router.get("/TakeLog", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    let wsql = " WHERE receiverHp = ?";
    const params = [req.decoded.hp];

    if (req.query.maxDate) {
      wsql += " AND takeDate > STR_TO_DATE(?, '%Y-%m-%d %H:%i:%s')";
      params.push(
        dateFormat(new Date(req.query.maxDate), "yyyy-mm-dd HH:MM:ss")
      );
    }

    connection.query(
      "SELECT * FROM takeLog " + wsql + " ORDER BY takeSq DESC LIMIT 1000",
      params,
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ type: "error", message: err });
        res.json({ success: true, data: results });
      }
    );
  });
});

// ----------------------------
// 트랜잭션 헬퍼
// ----------------------------
function withTransaction(pool, jobsCallback, res, successCallback) {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        return res.status(500).json({ type: "error", message: err });
      }

      const jobs = jobsCallback(connection);

      Promise.all(jobs)
        .then(() => {
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => {});
              return res.status(500).json({ type: "error", message: err });
            }
            successCallback(connection);
            connection.release();
          });
        })
        .catch((err) => {
          connection.rollback(() => {});
          connection.release();
          res.status(500).json({ type: "error", message: err });
        });
    });
  });
}
// ----------------------------
// 상태 코드 정의
// ----------------------------
const LOCKER_STATUS = {
  A: "보관중",
  B: "사용가능",
  C: "사용불가",
  D: "보관하는중",
  E: "찾으려는중",
};

// ----------------------------
// Locker open_to_save → D
// ----------------------------
router.post("/Locker/open_to_save", ensureAuthorized, (req, res) => {
  const lockerParam = { status: "D", pwd: req.body.pwd }; // 서버에서 강제 지정
  const saveLogParam = {
    yid: req.body.yid,
    lockerLabel: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    serial: req.body.serial,
    senderHp: req.body.saveHp,
    receiverHp: req.body.toHp,
    pwd: req.body.pwd,
    regDate: new Date(),
  };

  withTransaction(
    pool,
    (conn) => [
      dbUpdate(conn, "locker", lockerParam, {
        yid: req.body.yid,
        col: req.body.col,
        row: req.body.row,
      }),
      dbInsert(conn, "saveLog", saveLogParam),
    ],
    res,
    () =>
      res.json({
        yid: req.body.yid,
        status: "D",
        statusLabel: LOCKER_STATUS["D"],
      })
  );
});

// ----------------------------
// Locker open_to_take → E
// ----------------------------
router.post("/Locker/open_to_take", checkAuthorized, (req, res) => {
  const lockerParam = { status: "E" }; // 서버에서 강제 지정
  const takeLogParam = {
    yid: req.body.yid,
    lockerLabel: req.body.label,
    col: req.body.col,
    row: req.body.row,
    jumper: req.body.jumper,
    receiverHp: req.body.toHp,
    pwd: req.body.pwd,
    takeDate: new Date(),
  };

  withTransaction(
    pool,
    (conn) => [
      dbUpdate(conn, "locker", lockerParam, {
        yid: req.body.yid,
        col: req.body.col,
        row: req.body.row,
      }),
      dbInsert(conn, "takeLog", takeLogParam),
    ],
    res,
    () =>
      res.json({
        yid: req.body.yid,
        status: "E",
        statusLabel: LOCKER_STATUS["E"],
      })
  );
});

// ----------------------------
// Locker close → B (사용가능) / 로그 기록 없음
// ----------------------------
router.post("/Locker/close", ensureAuthorized, (req, res) => {
  const newStatus = "B"; // close 후 사용가능
  const lockerParam = { status: newStatus };

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    dbUpdate(connection, "locker", lockerParam, {
      yid: req.body.yid,
      col: req.body.col,
      row: req.body.row,
      jumper: req.body.jumper,
      serial: req.body.serial,
    })
      .then(() => {
        connection.release();
        res.json({
          success: true,
          yid: req.body.yid,
          col: req.body.col,
          row: req.body.row,
          status: newStatus,
          statusLabel: LOCKER_STATUS[newStatus],
        });
      })
      .catch((err) => {
        connection.release();
        res.status(500).json({ type: "error", message: err });
      });
  });
});

// ----------------------------
// Locker 사용 중 카운트 (보관 중 D, 찾으려는중 E 포함)
// ----------------------------
router.get("/LockerCnt", ensureAuthorized, (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    // "보관하는중(D)"와 "찾으려는중(E)" 상태를 사용 중으로 카운트
    connection.query(
      'SELECT COUNT(*) AS cnt FROM locker WHERE status IN ("D","E")',
      [],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ type: "error", message: err });

        res.json({
          success: true,
          data: results[0].cnt,
          detail: {
            D: results[0].cnt, // 보관하는중
            // 필요하면 E 상태도 따로 조회 가능
          },
        });
      }
    );
  });
});

module.exports = router;
