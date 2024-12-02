const fsPromises = require("fs/promises");
const error = require("./cli.js").error;

async function checkExists(path) {
  try {
    await fsPromises.access(path);
    return true;
  } catch {
    return false;
  }
}

async function createDirIfMissing(path) {
  try {
    if (!(await checkExists(path))) {
      await fsPromises.mkdir(path, { recursive: true });
    }
  } catch (err) {
    return error("Error creating directory:", err);
  }
}

module.exports = {
  checkExists,
  createDirIfMissing,
};
