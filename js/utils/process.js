const fs = require("fs/promises");
const { APP_TEMP_DIR } = require("./constants.js");

process._agentFlash = {
  pendingWrites: new Set(),
};

process.on("uncaughtException", async (error) => {
  console.error("Critical error:", error);
  // Wait for any pending writes
  if (process._agentFlash.pendingWrites.size > 0) {
    await Promise.allSettled([...process._agentFlash.pendingWrites]);
  }

  await removeTempDir();

  process.exit(1);
});

process.on("exit", async () => {
  // Wait for any pending writes
  if (process._agentFlash.pendingWrites.size > 0) {
    await Promise.allSettled([...process._agentFlash.pendingWrites]);
  }

  await removeTempDir();
});

async function removeTempDir() {
  try {
    await fs.rm(APP_TEMP_DIR, { recursive: true, force: true });
  } catch (err) {
    console.error("Process.on(exit):: Error cleaning up temp directory: ", err);
  }
}
