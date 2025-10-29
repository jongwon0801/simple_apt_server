const express = require("express");
const router = express.Router();

// -----------------------------
// Auth (인증 관련)
// -----------------------------
// api 요청 예시 /api/auth/login/authenticate
router.use("/auth/login", require("./auth/login")); // 로그인

// -----------------------------
// 택배기사 Crud
// -----------------------------
router.use(
  "/deliveryStaff/deliveryStaffCrud",
  require("./deliveryStaff/deliveryStaffCrud")
); // deliveryStaff Crud

// -----------------------------
// Log (보관/수령 로그)
// -----------------------------
router.use("/log/saveLog", require("./log/saveLog")); // 보관 로그 조회/등록
router.use("/log/takeLog", require("./log/takeLog")); // 수령 로그 조회/등록

// -----------------------------
// AppleBox (보관함 그룹)
// -----------------------------
router.use("/applebox/appleboxCrud", require("./applebox/appleboxCrud")); // applebox Crud
router.use("/applebox/dashboardCrud", require("./applebox/dashboardCrud")); // dashboardCrud

// -----------------------------
// Locker (락커 관련)
// -----------------------------
router.use("/locker/lockerAction", require("./locker/lockerAction")); // save / take 관리자 locker 상태변경
router.use("/locker/lockerCrud", require("./locker/lockerCrud")); // locker Crud

// -----------------------------
// Notice (공지사항)
// -----------------------------
router.use("/notice/noticeCrud", require("./notice/noticeCrud")); // notice Crud

// -----------------------------
// VPN
// -----------------------------
router.use("/vpn/vpnCrud", require("./vpn/vpnCrud")); // vpn Crud

// -----------------------------
// RaspiApi (외부에서 요청하는 api ensureAuthorized 없음)
// -----------------------------
router.use(
  "/RaspiApi/auth/deliveryStaff",
  require("./RaspiApi/auth/deliveryStaff")
); // 배달기사 인증/등록
router.use("/RaspiApi/auth/lockerAuth", require("./RaspiApi/auth/lockerAuth")); // 보관함 인증번호

router.use(
  "/RaspiApi/locker/lockerAction",
  require("./RaspiApi/locker/lockerAction")
); // save / take 보관함 locker 상태변경

// -----------------------------
// File upload
// -----------------------------
// router.use("/files/upload", require("./files/upload")); // 파일 업로드 라우트

module.exports = router;
