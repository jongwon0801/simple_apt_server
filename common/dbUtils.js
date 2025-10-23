// common/dbUtils.js
module.exports = {
  dbInsert: function (connection, table, data) {
    return new Promise((resolve, reject) => {
      connection.query("INSERT INTO ?? SET ?", [table, data], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  dbUpdate: function (connection, table, data, where) {
    return new Promise((resolve, reject) => {
      connection.query(
        "UPDATE ?? SET ? WHERE ?",
        [table, data, where],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  },
};

