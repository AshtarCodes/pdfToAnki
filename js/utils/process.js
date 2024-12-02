process._agentFlash = {
  pendingWrites: new Set(),
};

process.on("uncaughtException", async (error) => {
  console.error("Critical error:", error);
  // Wait for any pending writes
  if (process._agentFlash.pendingWrites.size > 0) {
    await Promise.allSettled([...process._agentFlash.pendingWrites]);
  }

  process.exit(1);
});
