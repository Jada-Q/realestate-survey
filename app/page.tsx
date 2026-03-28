"use client";

import { useState } from "react";

const Q1_OPTIONS = [
  { value: "buyer", label: "A  正在考虑 / 已在日本购置不动产的投资者或自住买家" },
  { value: "agent", label: "B  不动产从业者（中介、仲介、顾问等）" },
  { value: "both", label: "C  两者都算" },
];

const Q2_OPTIONS = [
  { value: "agent_only", label: "A  主要靠中介提供，自己不太查" },
  { value: "self_first", label: "B  自己先查政府或平台数据，再和中介确认" },
  { value: "half_half", label: "C  两者差不多各占一半" },
  { value: "no_research", label: "D  没有专门查过，凭感觉和经验" },
];

const Q3_OPTIONS = [
  { value: "under_30m", label: "A  不到30分钟" },
  { value: "30m_2h", label: "B  30分钟～2小时" },
  { value: "over_2h", label: "C  2小时以上，比较费时" },
  { value: "no_analysis", label: "D  基本不做，直接凭经验报" },
];

type Step = "form" | "done";

export default function SurveyPage() {
  const [step, setStep] = useState<Step>("form");
  const [identity, setIdentity] = useState<string[]>([]);
  const [buyerSource, setBuyerSource] = useState("");
  const [agentTime, setAgentTime] = useState("");
  const [barrier, setBarrier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isBuyer = identity.includes("buyer") || identity.includes("both");
  const isAgent = identity.includes("agent") || identity.includes("both");

  function toggleIdentity(value: string) {
    setIdentity((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (identity.length === 0) {
      setError("请至少选择一个身份");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity,
          buyer_source: isBuyer ? buyerSource : null,
          agent_time: isAgent ? agentTime : null,
          barrier: barrier || null,
        }),
      });
      if (!res.ok) throw new Error("提交失败");
      setStep("done");
    } catch {
      setError("提交时出了问题，请稍后再试");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "done") {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-6">🙏</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">感谢您的回答！</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          您的反馈对我非常有价值。<br />
          调研结果整理后会在群里分享。
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">在日华人 × 不动产</p>
        <h1 className="text-xl font-bold text-gray-800 leading-snug">
          获取日本不动产信息的习惯调研
        </h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          大家好，我是裴瑜，在日本住了18年，目前在做小调研，想了解大家在日本买房/做不动产时获取市场信息的习惯和痛点。<br />
          <span className="text-gray-400">不卖东西，纯粹做需求了解，1分钟搞定～</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Q1 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Q1. 您的身份是？<span className="text-gray-400 font-normal ml-1">（可多选）</span>
          </p>
          <div className="space-y-2">
            {Q1_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  identity.includes(opt.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 accent-blue-500"
                  checked={identity.includes(opt.value)}
                  onChange={() => toggleIdentity(opt.value)}
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Q2 - buyers only */}
        {isBuyer && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Q2. 买房前，您通常怎么了解目标区域的成交价格？
            </p>
            <p className="text-xs text-gray-400 mb-3">买家 / 投资者请回答</p>
            <div className="space-y-2">
              {Q2_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    buyerSource === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="buyer_source"
                    className="mt-0.5 accent-blue-500"
                    checked={buyerSource === opt.value}
                    onChange={() => setBuyerSource(opt.value)}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Q3 - agents only */}
        {isAgent && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Q3. 给中国客户做市场分析或报价参考时，整理数据大概要花多少时间？
            </p>
            <p className="text-xs text-gray-400 mb-3">从业者请回答</p>
            <div className="space-y-2">
              {Q3_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    agentTime === opt.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="agent_time"
                    className="mt-0.5 accent-blue-500"
                    checked={agentTime === opt.value}
                    onChange={() => setAgentTime(opt.value)}
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Q4 */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Q4. 在日本获取中文不动产价格数据，您觉得最大的障碍是什么？
          </p>
          <p className="text-xs text-gray-400 mb-3">随便说，开放回答</p>
          <textarea
            className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:border-blue-400 resize-none"
            rows={4}
            placeholder="例：日文看不懂 / 不知道去哪查 / 中介给的数据不透明……"
            value={barrier}
            onChange={(e) => setBarrier(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting || identity.length === 0}
          className="w-full py-3 rounded-lg bg-blue-500 text-white font-medium text-sm hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "提交中…" : "提交回答"}
        </button>

        <p className="text-center text-xs text-gray-400">
          感谢参与 · 结果整理后会在群里分享
        </p>
      </form>
    </main>
  );
}
