import type { NextConfig } from "next";

// 层级 1：构建时检查必填 env var，缺失直接构建失败
const required = ["ADMIN_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env var: ${key}`);
}

const nextConfig: NextConfig = {};

export default nextConfig;
