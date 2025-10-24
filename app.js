const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const mysql = require("mysql2");
const expressWinston = require("express-winston");
const winston = require("winston");
require("winston-daily-rotate-file");

// -----------------------------
// 라우트 불러오기
// -----------------------------
const routes = require("./routes"); // 통합된 index.js

// -----------------------------
// Express 앱 초기화
// -----------------------------
const app = express();

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
// Angular 정적 파일 서빙
// API 라우터 admin 쓰면 안됨
// -----------------------------
app.use("/admin", express.static(path.join(__dirname, "public/admin")));
app.use(
  "/admin/partials",
  express.static(path.join(__dirname, "public/admin/partials"))
);
app.use(
  "/bower_components",
  express.static(path.join(__dirname, "public/bower_components"))
);
app.use("/js", express.static(path.join(__dirname, "public/js")));
app.use("/css", express.static(path.join(__dirname, "public/css")));

// -----------------------------
// admin SPA 진입점
// -----------------------------
app.get("/admin/*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/admin/index.html"));
});

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
app.use("/v1", routes); // 통합 API 라우터
app.use("/api", require("./routes/index")); // 루트가 아닌 별도 API 경로
app.get("/", (req, res) => res.send("Server is running")); // 서버 상태 확인용

// -----------------------------
// 에러 처리
// -----------------------------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ type: "error", message: err.message, code: 500 });
});

module.exports = app;
