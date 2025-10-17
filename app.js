const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql");
const expressWinston = require("express-winston");
const winston = require("winston");
require("winston-daily-rotate-file");

// 라우트 불러오기
const upload = require("./routes/upload");
const api = require("./routes/api");
const admin = require("./routes/admin");

// routes 객체 정의
const routes = {
  upload,
  api,
  admin,
};

const app = express();

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

// -----------------------------
// 뷰 엔진 설정
// -----------------------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// -----------------------------
// 기본 미들웨어
// -----------------------------
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard cat",
    cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: true,
  })
);

// -----------------------------
// applebox-host 프록시 처리
// -----------------------------
app.use((req, res, next) => {
  const appleboxHost = req.headers["applebox-host"];
  if (!appleboxHost) return next();

  const st = appleboxHost.indexOf("-");
  const ed = appleboxHost.indexOf(".");
  const yid = appleboxHost.substring(st + 1, ed);

  pool.getConnection((err, connection) => {
    if (err) return res.status(500).json({ type: "error", message: err });

    connection.query(
      "SELECT ip FROM applebox WHERE yid = ?",
      [yid],
      (err, results) => {
        connection.release();
        if (err) return res.status(500).json({ type: "error", message: err });
        if (!results.length)
          return res.status(404).json({ type: "error", message: "Not found" });

        const toIp = results[0].ip;
        if (!toIp)
          return res
            .status(500)
            .json({ type: "error", message: "Device IP not set" });

        const request = require("request");
        const x = request({
          uri: "http://" + toIp + req.url,
          headers: { Authorization: req.headers["authorization"] },
          method: req.method,
          json: req.body,
          timeout: 5000,
        }).on("error", (err) => {
          console.error(err);
          res.status(520).json({ error: "not connected" });
        });

        x.pipe(res);
      }
    );
  });
});

// -----------------------------
// 로깅 설정 (express-winston)
// -----------------------------
const transport = new winston.transports.DailyRotateFile({
  json: true,
  filename: "./logs/log",
  datePattern: "yyyy-MM-dd.",
  prepend: true,
  level: "warn",
});

expressWinston.requestWhitelist.push("body");

app.use(
  expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true,
        level: "error",
      }),
      transport,
    ],
    statusLevels: false,
    level: (req, res) => {
      if (
        [
          "/v1/Locker/open_to_save",
          "/v1/Locker/open_to_take",
          "/v1/Locker/close",
        ].includes(req.path)
      )
        return "warn";

      if (res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);

// -----------------------------
// 라우트 연결
// -----------------------------
app.use("/upload", upload);
app.use("/v1", api);
app.use("/admin", admin);
app.get("/", (req, res) => res.send("Server is running"));

// -----------------------------
// 에러 처리
// -----------------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ type: "error", message: err.message, code: 500 });
});

module.exports = app;
