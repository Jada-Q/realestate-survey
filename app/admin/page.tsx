export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase";
import type { Response } from "@/lib/supabase";

const Q2_LABELS: Record<string, string> = {
  agent_only: "A 主要靠中介",
  self_first: "B 自己先查",
  half_half: "C 各占一半",
  no_research: "D 没专门查",
};

const Q3_LABELS: Record<string, string> = {
  under_30m: "A 不到30分钟",
  "30m_2h": "B 30分钟～2小时",
  over_2h: "C 2小时以上",
  no_analysis: "D 不做分析",
};

const IDENTITY_LABELS: Record<string, string> = {
  buyer: "A 买家/投资者",
  agent: "B 从业者/中介",
  both: "C 两者都算",
};

function count<T extends string>(arr: T[]): Record<string, number> {
  return arr.reduce(
    (acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }),
    {} as Record<string, number>
  );
}

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-36 text-gray-600 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
        <div
          className="bg-blue-400 h-5 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-16 text-gray-500 text-right">
        {value}件 ({pct}%)
      </span>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const { key } = await searchParams;
  if (key !== process.env.ADMIN_KEY) notFound();

  const supabase = getServerClient();
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-red-500">数据库连接错误：{error.message}</div>
    );
  }

  const rows = (data ?? []) as Response[];
  const total = rows.length;

  // Q1: identity (multi-select — count each tag)
  const identityAll = rows.flatMap((r) => r.identity ?? []);
  const q1Count = count(identityAll);

  // Q2: buyer_source (only rows that answered)
  const q2Rows = rows.filter((r) => r.buyer_source);
  const q2Count = count(q2Rows.map((r) => r.buyer_source!));

  // Q3: agent_time
  const q3Rows = rows.filter((r) => r.agent_time);
  const q3Count = count(q3Rows.map((r) => r.agent_time!));

  // Q4: barriers
  const barriers = rows
    .filter((r) => r.barrier && r.barrier.trim())
    .map((r) => ({ text: r.barrier!, date: r.created_at }));

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-10">
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">后台统计</p>
        <h1 className="text-xl font-bold text-gray-800">在日华人不动产调研结果</h1>
        <p className="text-sm text-gray-400 mt-1">共 {total} 份回答</p>
      </div>

      {/* Q1 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-4 border-b pb-2">
          Q1 身份分布
        </h2>
        <div className="space-y-3">
          {Object.entries(IDENTITY_LABELS).map(([key, label]) => (
            <Bar
              key={key}
              label={label}
              value={q1Count[key] ?? 0}
              max={identityAll.length || 1}
            />
          ))}
        </div>
      </section>

      {/* Q2 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-1 border-b pb-2">
          Q2 买家：如何获取成交价格数据
        </h2>
        <p className="text-xs text-gray-400 mb-4">{q2Rows.length} 人回答</p>
        {q2Rows.length === 0 ? (
          <p className="text-sm text-gray-400">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(Q2_LABELS).map(([key, label]) => (
              <Bar
                key={key}
                label={label}
                value={q2Count[key] ?? 0}
                max={q2Rows.length}
              />
            ))}
          </div>
        )}
      </section>

      {/* Q3 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-1 border-b pb-2">
          Q3 从业者：整理数据所需时间
        </h2>
        <p className="text-xs text-gray-400 mb-4">{q3Rows.length} 人回答</p>
        {q3Rows.length === 0 ? (
          <p className="text-sm text-gray-400">暂无数据</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(Q3_LABELS).map(([key, label]) => (
              <Bar
                key={key}
                label={label}
                value={q3Count[key] ?? 0}
                max={q3Rows.length}
              />
            ))}
          </div>
        )}
      </section>

      {/* Q4 */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-1 border-b pb-2">
          Q4 最大障碍（开放回答）
        </h2>
        <p className="text-xs text-gray-400 mb-4">{barriers.length} 人回答</p>
        {barriers.length === 0 ? (
          <p className="text-sm text-gray-400">暂无数据</p>
        ) : (
          <ul className="space-y-3">
            {barriers.map((b, i) => (
              <li key={i} className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">{b.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(b.date).toLocaleDateString("zh-CN")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Raw table */}
      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-4 border-b pb-2">
          原始数据
        </h2>
        <div className="overflow-x-auto">
          <table className="text-xs w-full border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="pb-2 pr-3">时间</th>
                <th className="pb-2 pr-3">身份</th>
                <th className="pb-2 pr-3">Q2</th>
                <th className="pb-2 pr-3">Q3</th>
                <th className="pb-2">Q4障碍</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 align-top">
                  <td className="py-2 pr-3 text-gray-400 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">
                    {r.identity?.map((v) => IDENTITY_LABELS[v] ?? v).join("、")}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">
                    {r.buyer_source ? (Q2_LABELS[r.buyer_source] ?? r.buyer_source) : "—"}
                  </td>
                  <td className="py-2 pr-3 text-gray-600">
                    {r.agent_time ? (Q3_LABELS[r.agent_time] ?? r.agent_time) : "—"}
                  </td>
                  <td className="py-2 text-gray-600 max-w-xs">{r.barrier ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
