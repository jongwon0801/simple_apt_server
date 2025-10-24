/**
 * 랜덤 문자열/숫자 생성
 * len: 길이
 * type: 'N' -> 숫자, 그 외 -> 알파벳+숫자
 */
function randomString(len, type) {
  if (!len) len = 8;
  if (type === "N") {
    const max = Math.pow(10, len) - 1;
    return String(Math.floor(Math.random() * (max + 1))).padStart(len, "0");
  }
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

module.exports = { randomString };
