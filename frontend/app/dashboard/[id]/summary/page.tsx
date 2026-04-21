"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, ArrowLeft, Loader2, AlertTriangle, Info, ArrowRight } from "lucide-react";

type SummaryItem = {
  name: string;
  risk: string;
  instances: number;
};

type ScanSummary = {
  targetUrl: string;
  totalAlerts: number;
  uniqueVulnerabilities: number;
  createdAt: string;
  completedAt: string;
  summary: SummaryItem[];
};

export default function SummaryPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<ScanSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/scan/${id}/summary`);
        if (!res.ok) throw new Error("Failed to fetch scan summary");
        const json = await res.json();
        setData(json);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, [id]);

  const getRiskStyle = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return "bg-red-500/10 text-red-400 border-red-500/30";
      case "medium": return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case "low": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high": return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case "medium": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case "low": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
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
          <h2 className="text-xl font-semibold text-white mb-2">Error Loading Summary</h2>
          <p className="text-red-300">{error || "Scan data could not be found."}</p>
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
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Header Card */}
      <div className="glass-panel rounded-2xl p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Scan Report</h1>
          <p className="text-blue-400 text-lg font-medium break-all">{data.targetUrl}</p>
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
            <span>Scan Time: {new Date(data.completedAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-3xl font-bold text-white">{data.uniqueVulnerabilities}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Vuln Types</span>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-w-[120px]">
            <span className="text-3xl font-bold text-blue-400">{data.totalAlerts}</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Instances</span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Vulnerability Summary
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/40 text-slate-300 text-sm">
                <th className="px-6 py-4 font-medium">Vulnerability Name</th>
                <th className="px-6 py-4 font-medium w-48">Risk Level</th>
                <th className="px-6 py-4 font-medium w-48 text-center">Instances</th>
                <th className="px-6 py-4 font-medium w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.summary.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    No vulnerabilities found! Your application appears secure.
                  </td>
                </tr>
              ) : (
                data.summary.map((item, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={idx}
                    onClick={() => router.push(`/dashboard/${id}/summary/${encodeURIComponent(item.name)}`)}
                    className="hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-white font-medium group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${getRiskStyle(item.risk)}`}>
                        {getRiskIcon(item.risk)}
                        {item.risk}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-sm font-mono border border-slate-700">
                        {item.instances}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500 group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4 inline-block" />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
