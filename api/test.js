module.exports = function handler(req, res) {
  res.json({ ok: true, method: req.method, key: !!process.env.ANTHROPIC_API_KEY });
};
