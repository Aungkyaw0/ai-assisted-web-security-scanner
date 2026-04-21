"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Loader2, Lock, Zap, Search } from "lucide-react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState<"quick" | "full">("full");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL (e.g., http://example.com)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: url.startsWith("http") ? url : `https://${url}`,
          scanType 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start scan");
      }

      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError("An unknown error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl flex flex-col items-center text-center space-y-8"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-sm font-medium border border-blue-500/20">
          <SparklesIcon className="w-4 h-4" />
          <span>Educational AI Security Scanner</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Secure Your Web Apps <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">
            Intelligently
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Uncover vulnerabilities with an automated OWASP ZAP scan and get expert-level explanations and remediation steps. Built for modern development.
        </p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="w-full max-w-xl glass-card rounded-2xl p-2 mt-4"
        >
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !url}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-blue-900/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Starting...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Scan Target</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-4 mt-6 mb-2">
            <button
              onClick={() => setScanType("quick")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                scanType === "quick" 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                  : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Quick Scan
              </div>
            </button>
            <button
              onClick={() => setScanType("full")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                scanType === "full" 
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" 
                  : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Full Scan
              </div>
            </button>
          </div>

          {error && (
            <motion.p 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="text-red-400 text-sm mt-3 px-2 text-left"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <FeatureCard 
            icon={<Lock className="w-6 h-6 text-blue-400" />}
            title="OWASP ZAP Engine"
            desc="Powered by industry-standard vulnerability scanning."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-violet-400" />}
            title="Async Scanning"
            desc="Run scans in the background while you focus on other tasks."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-emerald-400" />}
            title="Technical Insights"
            desc="Detailed instance mapping with payloads and evidence."
          />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:bg-slate-800/60 transition-colors cursor-default">
      <div className="p-3 bg-slate-900 rounded-xl shadow-inner border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}
