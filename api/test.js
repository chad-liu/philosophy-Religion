module.exports = function handler(req, res) {
  const allKeys = Object.keys(process.env).filter(k =>
    k.includes("ANTHROPIC") || k.includes("API") || k.includes("KEY")
  );
  res.json({
    ok: true,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
    matchingEnvKeys: allKeys,
  });
};
