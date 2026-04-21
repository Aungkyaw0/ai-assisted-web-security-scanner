"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle, Search, BarChart3, Brain, Shield,
  MousePointerClick, ArrowRight, ChevronDown, ChevronUp,
  Monitor, Globe, ListChecks, Sparkles, Lock
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "1. Start a Scan",
    description: "Go to the Scanner page, enter a target URL, choose Quick or Full scan mode, and click \"Start Scan\". The scanner will begin analysing the website for vulnerabilities.",
    color: "blue"
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "2. Monitor Progress",
    description: "You'll see a real-time progress bar. The scan goes through spidering (crawling pages) and then active scanning (testing for vulnerabilities). Wait for it to complete.",
    color: "violet"
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "3. View Dashboard",
    description: "Go to the Dashboard page to see all your past and current scans. Click on any completed scan to view its detailed results.",
    color: "cyan"
  },
  {
    icon: <ListChecks className="w-6 h-6" />,
    title: "4. Explore Vulnerability Summary",
    description: "The summary page groups findings by vulnerability type and shows the risk level (High, Medium, Low, Informational) and how many instances were found.",
    color: "emerald"
  },
  {
    icon: <MousePointerClick className="w-6 h-6" />,
    title: "5. View Instance Details",
    description: "Click on any vulnerability type to see all individual instances — including the affected URL, HTTP method, parameter, attack payload, and evidence.",
    color: "orange"
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "6. Generate AI Insights",
    description: "Click the \"Generate AI Insights\" button on any instance to get an AI-powered analysis. It explains the vulnerability, why it occurs, its impact, and how to fix it — in plain language.",
    color: "purple"
  }
];

const faqs = [
  {
    q: "What is a Quick Scan vs Full Scan?",
    a: "A Quick Scan runs a smaller set of high-priority checks and finishes faster. A Full Scan runs all available vulnerability tests and takes longer, but is more thorough."
  },
  {
    q: "What does the AI analysis do?",
    a: "The AI reads the technical data of a specific vulnerability instance and generates a plain-English explanation. It covers what the vulnerability is, why it happens, its potential impact, how to fix it, and educational notes for learning."
  },
  {
    q: "Is my data stored?",
    a: "Yes. Scan results and AI analyses are stored in the database so you can revisit them anytime without re-scanning or re-generating."
  },
  {
    q: "What does each risk level mean?",
    a: "High = serious security issue that should be fixed immediately. Medium = notable risk that should be addressed. Low = minor issue with limited impact. Informational = not a vulnerability, but useful to know about."
  },
  {
    q: "Can I scan any website?",
    a: "You should only scan websites you own or have explicit permission to test. Scanning websites without authorization may be illegal."
  },
  {
    q: "What is OWASP ZAP?",
    a: "OWASP ZAP (Zed Attack Proxy) is a free, open-source security tool used to find vulnerabilities in web applications. This scanner uses ZAP as its scanning engine behind the scenes."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// FAQ Accordion Item
// ─────────────────────────────────────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-slate-800/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
      >
        <span className="text-sm font-medium text-white pr-4">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }}>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        </motion.div>
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 pb-4 text-sm text-slate-400 leading-relaxed"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

const colorMap: Record<string, string> = {
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30 text-blue-400",
  violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400",
  cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
  orange: "from-orange-500/20 to-orange-500/5 border-orange-500/30 text-orange-400",
  purple: "from-purple-500/20 to-purple-500/5 border-purple-500/30 text-purple-400",
};

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-14"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/30 mb-5">
          <HelpCircle className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">User Guide</h1>
        <p className="text-slate-400 max-w-xl mx-auto">
          A quick walkthrough of how to use the AI-Assisted Web Security Scanner — from starting a scan to understanding AI-generated insights.
        </p>
      </motion.div>

      {/* How It Works — Steps */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <ArrowRight className="w-5 h-5 text-blue-400" />
          How It Works
        </h2>
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`flex items-start gap-4 p-5 rounded-xl border bg-gradient-to-r ${colorMap[step.color]}`}
            >
              <div className="shrink-0 mt-0.5">{step.icon}</div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scan Modes */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Search className="w-5 h-5 text-violet-400" />
          Scan Modes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">⚡ Quick Scan</h3>
            <ul className="text-sm text-slate-400 space-y-1.5">
              <li>• Runs high-priority checks only</li>
              <li>• Faster results (a few minutes)</li>
              <li>• Good for a quick overview</li>
            </ul>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="text-sm font-semibold text-violet-400 mb-2">🔍 Full Scan</h3>
            <ul className="text-sm text-slate-400 space-y-1.5">
              <li>• Runs all available vulnerability tests</li>
              <li>• Takes longer (10–30+ minutes)</li>
              <li>• More comprehensive results</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Risk Levels */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-400" />
          Risk Levels
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { level: "High", color: "bg-red-500/10 text-red-400 border-red-500/30", desc: "Critical issue" },
            { level: "Medium", color: "bg-orange-500/10 text-orange-400 border-orange-500/30", desc: "Notable risk" },
            { level: "Low", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", desc: "Minor issue" },
            { level: "Info", color: "bg-blue-500/10 text-blue-400 border-blue-500/30", desc: "Good to know" },
          ].map((r) => (
            <div key={r.level} className={`rounded-xl p-4 border text-center ${r.color}`}>
              <div className="text-lg font-bold mb-1">{r.level}</div>
              <div className="text-xs opacity-80">{r.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </section>
    </div>
  );
}
