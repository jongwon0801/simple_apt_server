const mysql = require("mysql2");

// MySQL 커넥션 풀 생성
const pool = mysql.createPool({
  connectionLimit: 20,
  acquireTimeout: 5000,
  host: "localhost",
  user: "yellowbox",
  password: "dpfshdnqkrtm",
  database: "yellowbox",
  multipleStatements: true, // 여러 쿼리 한번에 실행 가능
});

// 풀 연결 테스트 (선택)
pool.getConnection((err, conn) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
  } else {
    console.log("MySQL 연결 성공!");
    conn.release();
  }
});

module.exports = pool;
