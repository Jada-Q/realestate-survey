#!/usr/bin/env node

const BASE_URL = "https://realestate-survey.vercel.app";
const ADMIN_KEY = process.env.ADMIN_KEY || "survey2026";

const checks = [
  { path: "/", expect: 200, label: "问卷主页" },
  { path: `/admin?key=${ADMIN_KEY}`, expect: 200, label: "后台统计" },
];

let failed = false;

for (const check of checks) {
  const res = await fetch(BASE_URL + check.path);
  if (res.status !== check.expect) {
    console.error(`❌ ${check.label} (${check.path}) → ${res.status}`);
    failed = true;
  } else {
    console.log(`✅ ${check.label} → ${res.status}`);
  }
}

if (failed) {
  console.error("\n部署验证失败，请检查以上错误。");
  process.exit(1);
}

console.log("\n所有检查通过。");
