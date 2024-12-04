const path = require("path");
const os = require("os");
const APP_NAME = "agent-flash";
// TODO: allow this temp dir to be set via cli argument. Idea is for a server or other tool to isolate file writes by user or by request.
const APP_TEMP_DIR = path.join(os.tmpdir(), APP_NAME);

module.exports = { APP_NAME, APP_TEMP_DIR };
