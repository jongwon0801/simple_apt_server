/**
 * 트랜잭션 헬퍼
 * @param {Pool} pool - MySQL 커넥션 풀
 * @param {Function} jobsCallback - connection을 받아서 Promise 배열 반환
 * @param {Object} res - Express response 객체
 * @param {Function} successCallback - 트랜잭션 성공 시 호출
 */
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

module.exports = { withTransaction };
