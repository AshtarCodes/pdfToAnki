const error = require("./cli.js").error;

function checkForAnkiConnectError(data) {
  if (data?.error) {
    // throw data.error;
    error(data.error);
    return;
  }
}

module.exports = {
  checkForAnkiConnectError,
};
