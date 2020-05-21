const exitHooks = [];

process.on('beforeExit', async () => {
  try {
    await Promise.all(exitHooks.map((fn) => fn()));
  } catch (err) {
    process.exit(1);
    throw err;
  }
});

module.exports = {
  exitHooks,
};
