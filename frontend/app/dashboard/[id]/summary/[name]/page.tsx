"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Loader2, ShieldAlert, AlertTriangle, Info,
  Server, Code, FileText, Database, Sparkles, Brain,
  BookOpen, Shield, Target, Wrench, GraduationCap, CheckCircle2,
  ChevronDown, ChevronUp
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AiAnalysis = {
  vulnerabilityOverview: string;
  whyThisOccurs: string;
  riskAndConfidenceInterpretation: string;
  affectedRequestContext: string;
  potentialImpact: string;
  developerFixGuidance: string;
  studentLearningNotes: string;
  generatedAt: string;
};

type AlertInstance = {
  alertIndex: number;
  name: string;
  risk: string;
  url: string;
  method: string;
  param: string;
  attack: string;
  evidence: string;
  otherInfo: string;
  aiAnalysis: AiAnalysis | null;
};

type AlertsResponse = {
  name: string;
  risk: string;
  totalInstances: number;
  instances: AlertInstance[];
};

// ─────────────────────────────────────────────────────────────────────────────
// AI Insights Section Component
// ─────────────────────────────────────────────────────────────────────────────

function AiInsightsSection({ analysis }: { analysis: AiAnalysis }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sections = [
    {
      icon: <Brain className="w-4 h-4" />,
      title: "Vulnerability Overview",
      content: analysis.vulnerabilityOverview,
      color: "blue"
    },
    {
      icon: <Target className="w-4 h-4" />,
      title: "Why This Occurs",
      content: analysis.whyThisOccurs,
      color: "orange"
    },
    {
      icon: <Shield className="w-4 h-4" />,
      title: "Risk & Confidence Interpretation",
      content: analysis.riskAndConfidenceInterpretation,
      color: "red"
    },
    {
      icon: <Server className="w-4 h-4" />,
      title: "Affected Request Context",
      content: analysis.affectedRequestContext,
      color: "cyan"
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      title: "Potential Impact",
      content: analysis.potentialImpact,
      color: "yellow"
    },
    {
      icon: <Wrench className="w-4 h-4" />,
      title: "Developer Fix Guidance",
      content: analysis.developerFixGuidance,
      color: "emerald"
    },
    {
      icon: <GraduationCap className="w-4 h-4" />,
      title: "Student Learning Notes",
      content: analysis.studentLearningNotes,
      color: "purple"
    }
  ];

  const colorMap: Record<string, string> = {
    blue: "border-blue-500/30 bg-blue-500/5",
    orange: "border-orange-500/30 bg-orange-500/5",
    red: "border-red-500/30 bg-red-500/5",
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    purple: "border-purple-500/30 bg-purple-500/5"
  };

  const iconColorMap: Record<string, string> = {
    blue: "text-blue-400",
    orange: "text-orange-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
    yellow: "text-yellow-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="border-t border-slate-800"
    >
      {/* AI Section Header — clickable to toggle expand/collapse */}
      <div
        onClick={() => setIsExpanded(prev => !prev)}
        className="px-6 py-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border-b border-slate-800/60 cursor-pointer select-none hover:from-purple-500/15 hover:via-blue-500/15 hover:to-cyan-500/15 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white tracking-wide">AI-Powered Analysis</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generated {new Date(analysis.generatedAt).toLocaleDateString()}</span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="p-1 rounded-md bg-slate-800/60 border border-slate-700/50"
            >
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI Analysis Cards — collapsible */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6 grid grid-cols-1 gap-4">
              {sections.map((section, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  key={section.title}
                  className={`rounded-xl p-4 border ${colorMap[section.color]}`}
                >
                  <h4 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-2 ${iconColorMap[section.color]}`}>
                    {section.icon}
                    {section.title}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default function InstanceDetailPage() {
  const { id, name } = useParams();
  const decodedName = decodeURIComponent(name as string);
  const router = useRouter();
  
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Track loading and error state per instance (by alert _id)
  const [aiLoadingMap, setAiLoadingMap] = useState<Record<number, boolean>>({});
  const [aiErrorMap, setAiErrorMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/scan/${id}/alerts?name=${encodeURIComponent(decodedName)}`);
        if (!res.ok) throw new Error("Failed to fetch alert details");
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlerts();
  }, [id, decodedName]);

  // ── Generate AI Insights for a specific instance ────────────────────
  const handleGenerateInsights = async (alertIndex: number) => {
    // Set loading state for this specific instance
    setAiLoadingMap(prev => ({ ...prev, [alertIndex]: true }));
    setAiErrorMap(prev => ({ ...prev, [alertIndex]: "" }));

    try {
      const res = await fetch(
        `http://localhost:5000/api/scan/${id}/alerts/${alertIndex}/ai-insights`,
        { method: "POST" }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate AI insights");
      }

      const { aiAnalysis } = await res.json();

      // Update the specific instance in state with the AI analysis
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          instances: prev.instances.map(inst =>
            inst.alertIndex === alertIndex
              ? { ...inst, aiAnalysis }
              : inst
          )
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      setAiErrorMap(prev => ({ ...prev, [alertIndex]: message }));
    } finally {
      setAiLoadingMap(prev => ({ ...prev, [alertIndex]: false }));
    }
  };

  const getRiskStyle = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium": return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "low": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case "high": return <ShieldAlert className="w-5 h-5 text-red-400" />;
      case "medium": return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      case "low": return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <div className="glass-panel rounded-2xl p-8 border-red-500/20">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Details</h2>
          <p className="text-red-300">{error || "Could not find instances."}</p>
          <button 
            onClick={() => router.back()}
            className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button 
        onClick={() => router.push(`/dashboard/${id}/summary`)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Summary
      </button>

      {/* Header */}
      <div className="glass-panel rounded-2xl p-8 mb-8 border-l-4 border-l-blue-500">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {getRiskIcon(data.risk)}
              <h1 className="text-2xl font-bold text-white">{data.name}</h1>
            </div>
            <p className="text-slate-400">Technical details for all instances found.</p>
          </div>
          <div className="flex gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border ${getRiskStyle(data.risk)}`}>
              Risk: {data.risk}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              <Database className="w-4 h-4" />
              Instances: {data.totalInstances}
            </span>
          </div>
        </div>
      </div>

      {/* Instances List */}
      <div className="space-y-6">
        {data.instances.map((instance, index) => (
          <motion.div
            key={index} 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Instance Header */}
            <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  instance.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 
                  instance.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 
                  'bg-slate-500/20 text-slate-400'
                }`}>
                  {instance.method || 'GET'}
                </span>
                <span className="text-white font-mono text-sm truncate" title={instance.url}>
                  {instance.url}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-500 whitespace-nowrap">Instance #{index + 1}</span>

                {/* AI Generate Button — only show if no analysis yet */}
                {!instance.aiAnalysis && (
                  <button
                    onClick={() => handleGenerateInsights(instance.alertIndex)}
                    disabled={aiLoadingMap[instance.alertIndex]}
                    className={`
                      inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold
                      transition-all duration-300 whitespace-nowrap
                      ${aiLoadingMap[instance.alertIndex]
                        ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 hover:shadow-lg hover:shadow-purple-500/25 active:scale-95'
                      }
                    `}
                  >
                    {aiLoadingMap[instance.alertIndex] ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Generate AI Insights
                      </>
                    )}
                  </button>
                )}

                {/* Show badge if already generated */}
                {instance.aiAnalysis && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    AI Analyzed
                  </span>
                )}
              </div>
            </div>

            {/* Error message for this instance */}
            <AnimatePresence>
              {aiErrorMap[instance.alertIndex] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-6 py-3 bg-red-500/10 border-b border-red-500/20"
                >
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {aiErrorMap[instance.alertIndex]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Technical Details Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {instance.param && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Server className="w-3.5 h-3.5" />
                    Vulnerable Parameter
                  </h3>
                  <code className="text-blue-300 bg-blue-900/20 px-2 py-1 rounded text-sm break-all">
                    {instance.param}
                  </code>
                </div>
              )}

              {instance.attack && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60 md:col-span-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Code className="w-3.5 h-3.5" />
                    Attack Vector / Payload
                  </h3>
                  <pre className="text-red-300 bg-red-900/10 p-3 rounded border border-red-500/10 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {instance.attack}
                  </pre>
                </div>
              )}

              {instance.evidence && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60 md:col-span-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5" />
                    Evidence Found
                  </h3>
                  <pre className="text-emerald-300 bg-emerald-900/10 p-3 rounded border border-emerald-500/10 text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                    {instance.evidence}
                  </pre>
                </div>
              )}
              
              {instance.otherInfo && (
                <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800/60 md:col-span-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                    <Info className="w-3.5 h-3.5" />
                    Additional Information
                  </h3>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap">
                    {instance.otherInfo}
                  </p>
                </div>
              )}
            </div>

            {/* AI Analysis Section — shown when analysis exists */}
            <AnimatePresence>
              {instance.aiAnalysis && (
                <AiInsightsSection analysis={instance.aiAnalysis} />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
