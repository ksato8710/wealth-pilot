"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  Brain,
  Calculator,
  Coins,
  Bot,
  Newspaper,
  ShieldCheck,
  Check,
  X,
  TrendingUp,
  BarChart3,
  PieChart,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/* -------------------------------------------------------------------------- */
/*  Animated counter hook                                                     */
/* -------------------------------------------------------------------------- */

function useCountUp(
  end: number,
  duration: number = 2000,
  startOnView: boolean = true
) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  const start = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, duration, hasStarted]);

  useEffect(() => {
    if (!startOnView || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [start, startOnView]);

  return { count, ref };
}

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                        */
/* -------------------------------------------------------------------------- */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

/* -------------------------------------------------------------------------- */
/*  Section wrapper with viewport detection                                   */
/* -------------------------------------------------------------------------- */

function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={cn("relative w-full", className)}
    >
      {children}
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feature card data                                                         */
/* -------------------------------------------------------------------------- */

const features = [
  {
    icon: Brain,
    title: "AIポートフォリオ診断",
    description:
      "AIが保有銘柄のリスク・リターンを自動分析し、最適なリバランスを提案",
  },
  {
    icon: Calculator,
    title: "税金最適化エンジン",
    description:
      "損出し・益出しシミュレーション、NISA枠活用提案で年間数万円の節税",
  },
  {
    icon: Coins,
    title: "配当金トラッカー",
    description:
      "月別配当カレンダー、予想配当額、増配トレンドを自動追跡",
  },
  {
    icon: Bot,
    title: "AIアドバイザー",
    description:
      "自然言語で資産状況を質問。あなた専属のウェルスアドバイザー",
  },
  {
    icon: Newspaper,
    title: "リアルタイムニュース分析",
    description:
      "保有銘柄に影響するニュースをAIが即座に分析・通知",
  },
  {
    icon: ShieldCheck,
    title: "行動バイアス検知",
    description:
      "損切り遅れ、集中投資などの行動バイアスをAIが検知・警告",
  },
];

/* -------------------------------------------------------------------------- */
/*  Comparison data                                                           */
/* -------------------------------------------------------------------------- */

const comparisonRows = [
  "AI分析",
  "Web版",
  "税金最適化",
  "全資産管理",
  "無料口座数",
  "AI対話",
] as const;

type CompetitorData = Record<string, (boolean | string)[]>;

const competitors: CompetitorData = {
  WealthPilot: [true, true, true, true, "2口座", true],
  カビュウ: [false, false, false, true, "1口座", false],
  マネーフォワード: [false, true, false, true, "4口座", false],
  ロボフォリオ: [false, true, false, false, "1口座", false],
};

/* -------------------------------------------------------------------------- */
/*  Pricing data                                                              */
/* -------------------------------------------------------------------------- */

const plans = [
  {
    name: "Free",
    nameJa: "無料",
    price: "¥0",
    period: "/月",
    description: "まずは気軽にお試しください",
    features: ["2口座まで連携", "基本ダッシュボード", "月1回AI診断", "配当カレンダー"],
    highlighted: false,
    cta: "無料で始める",
  },
  {
    name: "Standard",
    nameJa: "スタンダード",
    price: "¥480",
    period: "/月",
    description: "本格的な資産管理をしたい方に",
    features: [
      "5口座まで連携",
      "AI分析 (無制限)",
      "配当トラッカー",
      "税金シミュレーション",
      "メールアラート",
    ],
    highlighted: true,
    cta: "14日間無料トライアル",
  },
  {
    name: "Professional",
    nameJa: "プロフェッショナル",
    price: "¥980",
    period: "/月",
    description: "プロレベルの投資管理を求める方に",
    features: [
      "無制限口座連携",
      "リアルタイムAI分析",
      "カスタムアラート",
      "APIアクセス",
      "優先サポート",
      "行動バイアスレポート",
    ],
    highlighted: false,
    cta: "14日間無料トライアル",
  },
];

/* -------------------------------------------------------------------------- */
/*  Mini mock chart components for Hero dashboard preview                     */
/* -------------------------------------------------------------------------- */

function MiniBarChart() {
  const bars = [40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95];
  return (
    <div className="flex items-end gap-1 h-20">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 0.8, delay: 0.8 + i * 0.05, ease: "easeOut" }}
          className={cn(
            "w-full rounded-sm",
            h > 70
              ? "bg-[#10b981]"
              : h > 50
              ? "bg-[#6366f1]"
              : "bg-[#6366f1]/50"
          )}
        />
      ))}
    </div>
  );
}

function MiniLineIndicator() {
  return (
    <svg viewBox="0 0 200 50" className="w-full h-12 overflow-visible">
      <motion.path
        d="M 0 40 Q 30 35, 50 25 T 100 20 T 150 10 T 200 5"
        fill="none"
        stroke="#6366f1"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
      />
      <motion.path
        d="M 0 40 Q 30 35, 50 25 T 100 20 T 150 10 T 200 5 L 200 50 L 0 50 Z"
        fill="url(#lineGrad)"
        opacity="0.15"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 0.5, delay: 2 }}
      />
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page component                                                            */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const assets = useCountUp(9800, 2200);
  const nisa = useCountUp(2647, 2200);
  const growth = useCountUp(2467, 2200);

  return (
    <div className="relative min-h-screen overflow-x-hidden scroll-smooth">
      {/* ---- Grid overlay ---- */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* ================================================================== */}
      {/*  NAVIGATION                                                        */}
      {/* ================================================================== */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#27272a]/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1]">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#fafafa]">
              WealthPilot
            </span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
            >
              機能
            </a>
            <a
              href="#comparison"
              className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
            >
              比較
            </a>
            <a
              href="#pricing"
              className="text-sm text-[#a1a1aa] transition-colors hover:text-white"
            >
              料金
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              ログイン
            </Button>
            <Link href="/dashboard">
              <Button size="sm">無料で始める</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ================================================================== */}
      {/*  HERO                                                              */}
      {/* ================================================================== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        {/* Decorative gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#6366f1]/10 blur-[120px]" />
          <div className="absolute top-1/3 -left-40 h-[400px] w-[400px] rounded-full bg-[#a78bfa]/8 blur-[100px]" />
          <div className="absolute top-1/4 -right-40 h-[350px] w-[350px] rounded-full bg-[#818cf8]/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl w-full">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#18181b]/80 px-4 py-1.5 text-sm text-[#a1a1aa] backdrop-blur-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#6366f1]" />
              AIエージェント搭載の次世代資産管理
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            >
              <span className="text-[#fafafa]">AIがあなたの資産運用を、</span>
              <br />
              <span className="gradient-text">次のレベルへ</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="mt-6 max-w-2xl text-base leading-relaxed text-[#a1a1aa] sm:text-lg md:text-xl"
            >
              WealthPilot - AIエージェントが資産分析、税金最適化、リバランス提案まで。
              <br className="hidden sm:block" />
              カビュウを超える次世代ポートフォリオ管理。
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link href="/dashboard">
                <Button size="lg" className="group gap-2 text-base">
                  無料で始める
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="text-base">
                  機能を見る
                </Button>
              </a>
            </motion.div>

            {/* Animated stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="mt-16 grid w-full max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3"
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  ref={assets.ref}
                  className="text-3xl font-bold text-[#fafafa] tabular-nums"
                >
                  {assets.count.toLocaleString()}万円+
                </span>
                <span className="text-sm text-[#a1a1aa]">運用資産額</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  ref={nisa.ref}
                  className="text-3xl font-bold text-[#fafafa] tabular-nums"
                >
                  {nisa.count.toLocaleString()}万+
                </span>
                <span className="text-sm text-[#a1a1aa]">
                  日本のNISA口座数
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span
                  ref={growth.ref}
                  className="text-3xl font-bold text-[#10b981] tabular-nums"
                >
                  {(growth.count / 100).toFixed(2)}%
                </span>
                <span className="text-sm text-[#a1a1aa]">
                  AI資産運用市場 成長率
                </span>
              </div>
            </motion.div>

            {/* Mock dashboard preview */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
              className="mt-16 w-full max-w-4xl"
            >
              <div className="gradient-border rounded-xl">
                <Card className="overflow-hidden bg-[#18181b]/90 backdrop-blur-sm">
                  {/* Dashboard mock header */}
                  <div className="flex items-center gap-2 border-b border-[#27272a] px-5 py-3">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]/60" />
                    <div className="h-3 w-3 rounded-full bg-[#eab308]/60" />
                    <div className="h-3 w-3 rounded-full bg-[#10b981]/60" />
                    <span className="ml-3 text-xs text-[#52525b]">
                      WealthPilot Dashboard
                    </span>
                  </div>
                  <CardContent className="p-5 pt-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {/* Total assets card */}
                      <div className="glass-card rounded-lg p-4">
                        <p className="text-xs text-[#a1a1aa]">総資産額</p>
                        <p className="mt-1 text-2xl font-bold text-[#fafafa]">
                          ¥12,847,320
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#10b981]">
                          <TrendingUp className="h-3 w-3" />
                          +8.42%
                        </p>
                      </div>
                      {/* Today PnL */}
                      <div className="glass-card rounded-lg p-4">
                        <p className="text-xs text-[#a1a1aa]">本日の損益</p>
                        <p className="mt-1 text-2xl font-bold text-[#10b981]">
                          +¥34,200
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#10b981]">
                          <TrendingUp className="h-3 w-3" />
                          +0.27%
                        </p>
                      </div>
                      {/* Dividend card */}
                      <div className="glass-card rounded-lg p-4">
                        <p className="text-xs text-[#a1a1aa]">年間配当予想</p>
                        <p className="mt-1 text-2xl font-bold text-[#fafafa]">
                          ¥385,000
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-sm text-[#a1a1aa]">
                          <Coins className="h-3 w-3" />
                          利回り 3.0%
                        </p>
                      </div>
                    </div>
                    {/* Chart area */}
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="glass-card rounded-lg p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-medium text-[#a1a1aa]">
                            月別リターン
                          </span>
                          <BarChart3 className="h-3.5 w-3.5 text-[#6366f1]" />
                        </div>
                        <MiniBarChart />
                      </div>
                      <div className="glass-card rounded-lg p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-medium text-[#a1a1aa]">
                            資産推移
                          </span>
                          <PieChart className="h-3.5 w-3.5 text-[#6366f1]" />
                        </div>
                        <MiniLineIndicator />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FEATURES                                                          */}
      {/* ================================================================== */}
      <Section id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#27272a] bg-[#18181b]/80 px-4 py-1.5 text-sm text-[#a1a1aa]">
              <Zap className="h-3.5 w-3.5 text-[#6366f1]" />
              主な機能
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
              投資管理に必要な
              <span className="gradient-text">すべてを、ひとつに</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#a1a1aa]">
              AIの力で、これまで専門家にしかできなかった資産分析・最適化を、すべての投資家へ。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:border-[#6366f1]/40 hover:shadow-xl hover:shadow-[#6366f1]/5 hover:-translate-y-1">
                  {/* Subtle gradient on hover */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#6366f1]/0 to-[#6366f1]/0 transition-all duration-300 group-hover:from-[#6366f1]/5 group-hover:to-transparent" />
                  <CardHeader>
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#6366f1]/10 ring-1 ring-[#6366f1]/20">
                      <feature.icon className="h-5 w-5 text-[#6366f1]" />
                    </div>
                    <CardTitle className="text-[#fafafa]">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ================================================================== */}
      {/*  COMPARISON                                                        */}
      {/* ================================================================== */}
      <Section id="comparison" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
              なぜ<span className="gradient-text">WealthPilot</span>か
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#a1a1aa]">
              主要サービスとの機能比較。WealthPilotはAI分析と税金最適化を兼ね備えた唯一のプラットフォームです。
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 overflow-x-auto">
            <div className="min-w-[640px]">
              <Card className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#27272a]">
                      <th className="px-5 py-4 text-left font-medium text-[#a1a1aa]">
                        機能
                      </th>
                      {Object.keys(competitors).map((name) => (
                        <th
                          key={name}
                          className={cn(
                            "px-5 py-4 text-center font-semibold",
                            name === "WealthPilot"
                              ? "bg-[#6366f1]/10 text-[#6366f1]"
                              : "text-[#a1a1aa]"
                          )}
                        >
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row, rowIdx) => (
                      <tr
                        key={row}
                        className={cn(
                          "border-b border-[#27272a]/60",
                          rowIdx === comparisonRows.length - 1 && "border-b-0"
                        )}
                      >
                        <td className="px-5 py-3.5 font-medium text-[#fafafa]">
                          {row}
                        </td>
                        {Object.entries(competitors).map(([name, vals]) => {
                          const val = vals[rowIdx];
                          return (
                            <td
                              key={`${name}-${row}`}
                              className={cn(
                                "px-5 py-3.5 text-center",
                                name === "WealthPilot" && "bg-[#6366f1]/5"
                              )}
                            >
                              {typeof val === "boolean" ? (
                                val ? (
                                  <Check className="mx-auto h-5 w-5 text-[#10b981]" />
                                ) : (
                                  <X className="mx-auto h-5 w-5 text-[#52525b]" />
                                )
                              ) : (
                                <span className="text-[#fafafa]">{val}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================================================================== */}
      {/*  PRICING                                                           */}
      {/* ================================================================== */}
      <Section id="pricing" className="py-24 sm:py-32">
        {/* Decorative orb */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-[#6366f1]/5 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
              シンプルな<span className="gradient-text">料金プラン</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[#a1a1aa]">
              すべてのプランに14日間の無料トライアル付き。いつでもキャンセル可能です。
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {plans.map((plan) => (
              <motion.div key={plan.name} variants={fadeUp}>
                <Card
                  className={cn(
                    "relative h-full transition-all duration-300",
                    plan.highlighted
                      ? "border-[#6366f1]/60 shadow-xl shadow-[#6366f1]/10 scale-[1.02]"
                      : "hover:border-[#27272a]/80"
                  )}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#6366f1] px-4 py-1 text-xs font-semibold text-white">
                      おすすめ
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-[#a1a1aa]">
                        {plan.name}
                      </span>
                      <span className="text-xs text-[#52525b]">
                        {plan.nameJa}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-[#fafafa]">
                        {plan.price}
                      </span>
                      <span className="text-sm text-[#a1a1aa]">
                        {plan.period}
                      </span>
                    </div>
                    <CardDescription className="mt-1">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 pt-4">
                    <ul className="space-y-3">
                      {plan.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2.5 text-sm text-[#a1a1aa]"
                        >
                          <Check className="h-4 w-4 shrink-0 text-[#10b981]" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4">
                      <Link href="/dashboard" className="block">
                        <Button
                          className="w-full"
                          variant={plan.highlighted ? "default" : "outline"}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ================================================================== */}
      {/*  CTA                                                               */}
      {/* ================================================================== */}
      <Section className="py-24 sm:py-32">
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-[#18181b]/80 backdrop-blur-xl"
          >
            {/* Gradient decorations inside CTA card */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-[#6366f1]/15 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#a78bfa]/10 blur-[80px]" />

            <div className="relative flex flex-col items-center px-6 py-16 text-center sm:py-20">
              <h2 className="text-3xl font-bold tracking-tight text-[#fafafa] sm:text-4xl">
                今すぐ無料で始めましょう
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#a1a1aa]">
                AIがあなたの資産運用パートナーに。クレジットカード不要、2口座まで永久無料。
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
                <Input
                  type="email"
                  placeholder="メールアドレスを入力"
                  className="h-12 flex-1 text-base"
                />
                <Button size="lg" className="h-12 shrink-0 gap-2 text-base">
                  無料登録
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-4 text-xs text-[#52525b]">
                クレジットカード不要 - 2口座まで永久無料
              </p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================================================================== */}
      {/*  FOOTER                                                            */}
      {/* ================================================================== */}
      <footer className="border-t border-[#27272a] bg-[#09090b]">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
            {/* Logo and copy */}
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6366f1]">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-[#fafafa]">
                  WealthPilot
                </span>
              </Link>
              <p className="text-sm text-[#52525b]">
                &copy; 2026 WealthPilot Inc. All rights reserved.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-[#a1a1aa]">
              <a href="#" className="transition-colors hover:text-white">
                プライバシーポリシー
              </a>
              <a href="#" className="transition-colors hover:text-white">
                利用規約
              </a>
              <a href="#" className="transition-colors hover:text-white">
                お問い合わせ
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-8 border-t border-[#27272a]/60 pt-6">
            <p className="text-center text-xs leading-relaxed text-[#52525b]">
              ※
              本サービスは投資助言を行うものではありません。投資判断はご自身の責任で行ってください。
              <br />
              掲載されている情報は情報提供を目的としたものであり、特定の金融商品の勧誘を意図するものではありません。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
