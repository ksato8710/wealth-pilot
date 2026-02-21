"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  Lightbulb,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  aiChatSuggestions,
  holdings as mockHoldings,
  monthlyDividends as mockMonthlyDividends,
  taxSimulation as mockTaxSimulation,
  nisaStatus as mockNisaStatus,
} from "@/data/mock-data";
import type { ChatMessage } from "@/lib/types";

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content:
    "こんにちは！WealthPilot AIアドバイザーです。あなたのポートフォリオについて何でもお聞きください。資産分析、リバランス提案、税金最適化、配当予測など、幅広くサポートします。",
  timestamp: new Date().toISOString(),
};

function generateResponse(message: string): string {
  const totalAsset = mockHoldings.reduce((s, h) => s + h.marketValue, 0);
  const totalUnrealized = mockHoldings.reduce((s, h) => s + h.unrealizedPL, 0);
  const totalAnnualDiv = mockHoldings.reduce((s, h) => s + h.annualDividend, 0);

  if (message.includes("配当")) {
    const currentMonthDiv = mockMonthlyDividends.find(
      (d) => d.month === "2026-02"
    );
    const nextMonthDiv = mockMonthlyDividends.find((d) => d.month === "2026-03");
    const yearTotal = mockMonthlyDividends
      .filter((d) => d.month.startsWith("2026"))
      .reduce((s, d) => s + d.amount + d.forecast, 0);
    return `配当金分析をお伝えします。

**2026年の配当金見通し**
- 年間予想配当金: ${formatCurrency(yearTotal)}
- 今月 (2月): ${formatCurrency(currentMonthDiv?.amount || 0)}（実績）+ ${formatCurrency(currentMonthDiv?.forecast || 0)}（予測）
- 来月 (3月): ${formatCurrency(nextMonthDiv?.forecast || 0)}（予測） - 権利確定集中月です
- 年間配当利回り: ${((totalAnnualDiv / totalAsset) * 100).toFixed(2)}%

**高配当銘柄トップ3**
${mockHoldings
  .filter((h) => h.dividendYield > 0)
  .sort((a, b) => b.dividendYield - a.dividendYield)
  .slice(0, 3)
  .map(
    (h, i) =>
      `${i + 1}. ${h.name} (${h.symbol}): 利回り ${h.dividendYield}% / 年間 ${formatCurrency(h.annualDividend)}`
  )
  .join("\n")}

3月は配当権利確定が集中する月です。権利落ち前後の価格変動にご注意ください。`;
  }

  if (message.includes("リスク") || message.includes("分析")) {
    const sectors = new Map<string, number>();
    mockHoldings.forEach((h) => {
      sectors.set(h.sector, (sectors.get(h.sector) || 0) + h.marketValue);
    });
    const topSectors = [...sectors.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    return `ポートフォリオのリスク分析結果です。

**資産概要**
- 総資産: ${formatCurrency(totalAsset)}
- 含み損益: ${formatCurrency(totalUnrealized)} (${totalUnrealized >= 0 ? "+" : ""}${((totalUnrealized / (totalAsset - totalUnrealized)) * 100).toFixed(1)}%)
- 銘柄数: ${mockHoldings.length}銘柄

**セクター集中度 (上位3)**
${topSectors.map(([sector, value]) => `- ${sector}: ${formatCurrency(value)} (${((value / totalAsset) * 100).toFixed(1)}%)`).join("\n")}

**リスク要因**
1. テクノロジーセクターの比率が約23%と高めです。分散投資の観点から、ディフェンシブセクターへの配分を検討してください。
2. NTT (9432) に${formatCurrency(30000)}の含み損があります。損出しによる税金最適化を検討できます。
3. 米国株の為替リスクにもご注意ください。円高局面では評価額が減少する可能性があります。

全体としては適度に分散されていますが、上記のポイントを改善することでリスク調整後リターンを向上できます。`;
  }

  if (message.includes("税金") || message.includes("節税")) {
    return `税金最適化のアドバイスです。

**今年度の税金状況**
- 実現利益: ${formatCurrency(mockTaxSimulation.realizedProfit)}
- 実現損失: ${formatCurrency(Math.abs(mockTaxSimulation.realizedLoss))}
- 純利益: ${formatCurrency(mockTaxSimulation.netProfit)}
- 推定税額: ${formatCurrency(mockTaxSimulation.estimatedTax)}（税率 ${mockTaxSimulation.taxRate}%）

**節税戦略の提案**
1. **損出し（タックスロスハーベスティング）**: NTT株の含み損${formatCurrency(30000)}を確定させることで、約${formatCurrency(6095)}の節税が可能です。
2. **NISA枠の活用**: JTを特定口座からNISA口座へ移管することで、年間配当${formatCurrency(38250)}が非課税になります（年間約${formatCurrency(7770)}の節税）。
3. **利益確定タイミングの調整**: 三菱商事の利益確定を来年に延期し、NISA枠を活用する戦略で約${formatCurrency(15441)}の節税が見込めます。

合計で最大 ${formatCurrency(mockTaxSimulation.recommendations.reduce((s, r) => s + r.estimatedSaving, 0))} の節税が可能です。詳しくは「税金最適化」ページをご確認ください。`;
  }

  if (message.includes("NISA")) {
    const growthRemaining = mockNisaStatus.growthLimit - mockNisaStatus.growthUsed;
    const tsumitateRemaining =
      mockNisaStatus.tsumitateLimit - mockNisaStatus.tsumitateUsed;
    const lifetimeRemaining =
      mockNisaStatus.lifetimeLimit - mockNisaStatus.lifetimeUsed;

    return `NISA枠の最適活用についてアドバイスします。

**現在のNISA利用状況**
- 成長投資枠: ${formatCurrency(mockNisaStatus.growthUsed)} / ${formatCurrency(mockNisaStatus.growthLimit)}（残り ${formatCurrency(growthRemaining)}）
- つみたて投資枠: ${formatCurrency(mockNisaStatus.tsumitateUsed)} / ${formatCurrency(mockNisaStatus.tsumitateLimit)}（残り ${formatCurrency(tsumitateRemaining)}）
- 生涯投資枠: ${formatCurrency(mockNisaStatus.lifetimeUsed)} / ${formatCurrency(mockNisaStatus.lifetimeLimit)}（残り ${formatCurrency(lifetimeRemaining)}）

**最適化提案**
1. **成長投資枠 (残り${formatCurrency(growthRemaining)})**: 高配当銘柄のJT（日本たばこ産業）を特定口座からNISA口座に移管することをお勧めします。年間配当${formatCurrency(38250)}が非課税になります。
2. **つみたて投資枠 (残り${formatCurrency(tsumitateRemaining)})**: eMAXIS Slim 全世界株式の積立額を増額し、枠を最大限活用しましょう。月あたり${formatCurrency(Math.round(tsumitateRemaining / 10))}を追加投資できます。
3. **優先順位**: 高配当銘柄 → 成長株の順にNISA口座へ移管することで、非課税メリットを最大化できます。

年末に向けて計画的にNISA枠を使い切ることをお勧めします。`;
  }

  return `ポートフォリオの概要をお伝えします。

**資産サマリー**
- 総資産評価額: ${formatCurrency(totalAsset)}
- 含み損益: ${formatCurrency(totalUnrealized)}（${totalUnrealized >= 0 ? "+" : ""}${((totalUnrealized / (totalAsset - totalUnrealized)) * 100).toFixed(1)}%）
- 保有銘柄数: ${mockHoldings.length}銘柄
- 年間予想配当: ${formatCurrency(totalAnnualDiv)}

**パフォーマンスハイライト**
- 最も好調: ${mockHoldings.sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)[0].name}（${mockHoldings.sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)[0].unrealizedPLPercent > 0 ? "+" : ""}${mockHoldings.sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent)[0].unrealizedPLPercent.toFixed(1)}%）
- 要注目: NTT（-8.8%） - 損出し検討の余地あり

何か特定のトピックについて詳しく知りたい場合は、お気軽にお聞きください。例えば「配当金の分析」「リスク分析」「税金最適化」「NISA活用」など対応できます。`;
}

function formatMessageContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**")) {
      return (
        <p key={i} className="mt-3 mb-1 text-sm font-bold text-white">
          {line.replace(/\*\*/g, "")}
        </p>
      );
    }

    const boldParts = line.split(/(\*\*[^*]+\*\*)/g);
    const formatted = boldParts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <span key={j} className="font-semibold text-white">
            {part.replace(/\*\*/g, "")}
          </span>
        );
      }
      return part;
    });

    if (line.startsWith("- ") || line.startsWith("  -")) {
      return (
        <p key={i} className="ml-2 text-sm leading-relaxed text-[#d4d4d8]">
          {formatted}
        </p>
      );
    }

    if (/^\d+\./.test(line)) {
      return (
        <p key={i} className="ml-1 text-sm leading-relaxed text-[#d4d4d8]">
          {formatted}
        </p>
      );
    }

    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }

    return (
      <p key={i} className="text-sm leading-relaxed text-[#d4d4d8]">
        {formatted}
      </p>
    );
  });
}

export default function AIAdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmed,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      setTimeout(() => {
        const response = generateResponse(trimmed);
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    },
    [isTyping]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-[#09090b]">
      {/* Left Sidebar - Suggestions (desktop only) */}
      <aside className="hidden w-72 shrink-0 border-r border-[#27272a] bg-[#09090b] p-4 lg:block">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#6366f1]" />
            <h2 className="text-sm font-semibold text-white">
              おすすめの質問
            </h2>
          </div>
          <p className="text-xs text-[#71717a]">
            クリックして質問を入力欄に挿入できます
          </p>
          <div className="space-y-2">
            {aiChatSuggestions.map((suggestion, index) => (
              <motion.button
                key={suggestion}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex w-full items-start gap-2 rounded-lg border border-[#27272a] bg-[#18181b] p-3 text-left text-sm text-[#a1a1aa] transition-all duration-200 hover:border-[#6366f1]/50 hover:bg-[#6366f1]/5 hover:text-white"
              >
                <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6366f1]" />
                <span>{suggestion}</span>
              </motion.button>
            ))}
          </div>

          <div className="mt-6 rounded-lg border border-[#27272a] bg-[#18181b] p-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#71717a]" />
              <p className="text-xs text-[#71717a]">
                対応トピック
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {["配当分析", "リスク評価", "税金最適化", "NISA活用", "リバランス", "銘柄分析"].map(
                (topic) => (
                  <span
                    key={topic}
                    className="rounded-md bg-[#27272a] px-2 py-0.5 text-[10px] text-[#a1a1aa]"
                  >
                    {topic}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {/* Chat Header */}
        <div className="shrink-0 border-b border-[#27272a] bg-[#09090b] px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6366f1]/10">
              <Bot className="h-5 w-5 text-[#6366f1]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">
                AI アドバイザー
              </h1>
              <p className="text-xs text-[#10b981]">
                オンライン
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  {message.role === "assistant" ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/10">
                      <Bot className="h-4 w-4 text-[#6366f1]" />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-[#6366f1] text-white"
                        : "border border-[#27272a] bg-[#18181b]"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    ) : (
                      <div>{formatMessageContent(message.content)}</div>
                    )}
                    <p
                      className={`mt-2 text-[10px] ${
                        message.role === "user"
                          ? "text-white/60"
                          : "text-[#52525b]"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6366f1]/10">
                    <Bot className="h-4 w-4 text-[#6366f1]" />
                  </div>
                  <div className="rounded-2xl border border-[#27272a] bg-[#18181b] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <motion.span
                        className="h-2 w-2 rounded-full bg-[#6366f1]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.span
                        className="h-2 w-2 rounded-full bg-[#6366f1]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.span
                        className="h-2 w-2 rounded-full bg-[#6366f1]"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Mobile Suggestion Chips */}
        <div className="shrink-0 border-t border-[#27272a] bg-[#09090b] px-4 pt-3 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {aiChatSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="shrink-0 rounded-full border border-[#27272a] bg-[#18181b] px-3 py-1.5 text-xs text-[#a1a1aa] transition-colors hover:border-[#6366f1]/50 hover:text-white"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-[#27272a] bg-[#09090b] p-4 md:px-6">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-3xl items-center gap-2"
          >
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={isTyping}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isTyping}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
