const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || "";

if (!url || !key) {
  console.error("SUPABASE_URL, SUPABASE_ANON_KEY 환경 변수가 필요합니다.");
  process.exit(1);
}

const content = `window.SUPABASE_URL = ${JSON.stringify(url)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};
window.SITE_URL = ${JSON.stringify(siteUrl)};
`;

fs.writeFileSync(path.join(__dirname, "..", "config.js"), content);
console.log("config.js 생성 완료");
