# 台大開放式課程：宗教哲學

傅佩榮教授主講，劉信財整理。共 15 講，製作為靜態 HTML 網站。

**線上閱覽**：[philosophy-religion.vercel.app](https://philosophy-religion.vercel.app)

---

## 課程內容

| 講次 | 主題 |
|------|------|
| R01 | 宗教與宗教哲學簡介 |
| R02 | 宗教與信仰：從人生、政治到宗教信仰的探討 |
| R03 | 宗教的批判與回應：自然科學的挑戰 |
| R04 | 近代學科對宗教的批判與反思 |
| R05 | 現代人的宗教經驗與超越界 |
| R06 | 上帝存在與宗教信仰的哲學探討 |
| R07 | 神話與儀式：宗教、意義與人類文化的根基 |
| R08 | 宗教語言的本質與特色 |
| R09 | 猶太教：一神教的根源與歷史 |
| R10 | 印度教的修行方法與人生四階段 |
| R11 | 佛教的起源、思想與核心教義 |
| R12 | 密契主義：宗教經驗中的合一境界 |
| R13 | 儒家的宗教情操與人的核心思想 |
| R14 | 道家的宗教向度 |
| R15 | 宗教哲學總結：信仰、生死與人生智慧 |

---

## 網站結構

## index.html Tab 結構（首頁 6 tab）

| Tab ID | 名稱 | 內容 |
|--------|------|------|
| `courses` | 課程 | 15 講章節清單與連結 |
| `terms` | 專有名詞 | 跨 15 講整合，共 116 條術語 |
| `timeline` | 時間軸 | 5 個時代分期，共 78 條歷史記錄 |
| `people` | 重要人物 | 84 位西方／東方人物 |
| `search` | 搜尋 | 全文關鍵字搜尋 |
| `qa` | 問答 | 自然語言提問（呼叫 `/api/qa`） 

### 各講頁面（R01.html – R15.html）

每講包含 5 個 tab：

| Tab | 內容 |
|-----|------|
| 完整稿 | 逐字整理的全文講稿 |
| 大綱 | 章節大綱與重點摘要 |
| 專有名詞 | 該講術語與定義 |
| 時間軸 | 該講涉及的歷史年表 |
| 重要人物 | 該講出現的人物介紹 |

---

## 問答功能（`api/qa.js`）

架構：前端 POST `/api/qa` → Vercel Serverless Function → 關鍵字比對 `qa-content.json` top 5 段落 → 呼叫 Anthropic API → 回傳 `{answer, sources}`。

- 使用 Node.js 內建 `fetch` 呼叫 Anthropic API，**無需 `package.json`**
- 模型：`claude-haiku-4-5-20251001`，max_tokens: 800
- 中文關鍵字切詞：bigram（2 字）+ trigram（3 字）n-gram，長度加權計分
- 英文關鍵字：`/[a-zA-Z]{2,}/g` 比對
- `ANTHROPIC_API_KEY` 存放於 Vercel 環境變數（Sensitive/Encrypted），**不能在程式碼或 git 中出現**
- 更新環境變數後需重新部署（empty commit 或 `git push`）才生效

**qa-content.json 重新生成**：若 R*.html 內容更新，需重新執行 `_extract_qa_content.py`（位於專案根目錄，完成後可刪除）。

---


## 來源

- 課程影片：[台大開放式課程 — 宗教哲學](https://ocw.aca.ntu.edu.tw)（傅佩榮教授）
- 文字整理：劉信財
- 網站製作：Chad Liu
