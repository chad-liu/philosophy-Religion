const fs = require("fs");
const path = require("path");

let content;
try {
  const raw = fs.readFileSync(path.join(__dirname, "..", "qa-content.json"), "utf-8");
  content = JSON.parse(raw);
} catch (e) {
  content = null;
  console.error("Failed to load qa-content.json:", e.message);
}

function buildTerms(question) {
  const terms = new Set();
  const en = question.match(/[a-zA-Z]{2,}/g) || [];
  en.forEach((w) => terms.add(w.toLowerCase()));
  const zh = question.replace(/[^一-鿿]/g, "");
  for (let i = 0; i < zh.length; i++) {
    if (i + 1 < zh.length) terms.add(zh.slice(i, i + 2));
    if (i + 2 < zh.length) terms.add(zh.slice(i, i + 3));
  }
  if (zh.length <= 3) for (const ch of zh) terms.add(ch);
  return [...terms].filter((t) => t.length > 0);
}

function findRelevant(question) {
  const terms = buildTerms(question);
  if (!terms.length) return [];
  const scored = [];
  for (const lec of content) {
    for (const sec of lec.sections) {
      const text = sec.h + sec.p;
      const score = terms.reduce((s, t) => s + (text.includes(t) ? t.length : 0), 0);
      if (score > 0) {
        scored.push({ score, lecture: lec.lecture, title: lec.title, h: sec.h, p: sec.p });
      }
    }
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  // Diagnose: content loaded?
  if (!content) {
    return res.status(500).json({ error: "[DEBUG] qa-content.json 未載入" });
  }

  // Parse body (Vercel may auto-parse JSON)
  let question;
  try {
    const parsed = typeof req.body === "object" && req.body !== null
      ? req.body
      : JSON.parse(req.body || "{}");
    question = parsed.question;
  } catch (e) {
    return res.status(400).json({ error: "[DEBUG] body parse error: " + e.message });
  }

  if (!question?.trim()) {
    return res.status(400).json({ error: "請輸入問題" });
  }

  const relevant = findRelevant(question.trim());
  if (!relevant.length) {
    return res.json({
      answer: "很抱歉，在課程內容中未找到與此問題相關的段落。請嘗試使用不同的關鍵字提問。",
      sources: [],
    });
  }

  const context = relevant
    .map((r) => `【${r.lecture}｜${r.title}】\n${r.h}\n${r.p}`)
    .join("\n\n---\n\n");

  // Diagnose: check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "[DEBUG] ANTHROPIC_API_KEY 未設定" });
  }

  let apiRes;
  try {
    apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 800,
        system:
          "你是台大開放式課程「宗教哲學」的課程助手（傅佩榮教授主講）。請根據提供的課程段落，用繁體中文、簡明扼要地回答學生問題。回答應忠實於課程觀點。若所提供的段落未能充分回答問題，請如實說明「課程中未直接討論此問題」。",
        messages: [
          {
            role: "user",
            content: `以下是相關課程內容：\n\n${context}\n\n學生問題：${question}`,
          },
        ],
      }),
    });
  } catch (e) {
    return res.status(500).json({ error: "[DEBUG] fetch error: " + e.message });
  }

  if (!apiRes.ok) {
    const err = await apiRes.text();
    return res.status(500).json({ error: "[DEBUG] Anthropic " + apiRes.status + ": " + err.slice(0, 200) });
  }

  const data = await apiRes.json();
  const answer = data.content?.[0]?.text || "無法取得回答";
  const sources = [...new Set(relevant.map((r) => r.lecture))];

  res.json({ answer, sources });
};
