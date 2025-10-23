const express = require("express");
const router = express.Router();

// -----------------------------
// Auth (인증 관련)
// -----------------------------
// api 요청 예시 /api/auth/login/authenticate
router.use("/auth/login", require("./auth/login")); // 로그인
router.use("/auth/deliverer", require("./auth/deliverer")); // 배달기사 인증/등록
router.use("/auth/lockerAuth", require("./auth/lockerAuth")); // 보관함 인증번호

// -----------------------------
// Log (보관/수령 로그)
// -----------------------------
router.use("/log/saveLog", require("./log/saveLog")); // 보관 로그 조회/등록
router.use("/log/takeLog", require("./log/takeLog")); // 수령 로그 조회/등록

// -----------------------------
// Auth (인증 관련)
// -----------------------------
router.use("/applebox/appleboxCrud", require("./applebox/appleboxCrud")); // applebox Crud

// -----------------------------
// Locker (보관함 액션)
// -----------------------------
router.use("/locker/lockerAction", require("./locker/lockerAction")); // open/close 등
router.use("/locker/lockerCount", require("./locker/lockerCount")); // 사용 중 카운트
router.use("/locker/lockerCrud", require("./locker/lockerCrud")); // locker Crud

// -----------------------------
// File upload
// -----------------------------
router.use("/files/upload", require("./files/upload")); // 파일 업로드 라우트

module.exports = router;
