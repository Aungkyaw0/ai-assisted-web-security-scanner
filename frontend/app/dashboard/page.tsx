"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { RefreshCcw, Activity, CheckCircle, XCircle, Clock, ShieldAlert, Trash2 } from "lucide-react";

type Scan = {
  _id: string;
  targetUrl: string;
  status: string;
  progress: number;
  scanType: string;
  createdAt: string;
  completedAt?: string;
};

export default function Dashboard() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, []);

  const fetchScans = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/scan/list");
      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch (err) {
      console.error("Failed to fetch scans:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScans();
    // Poll every 5 seconds to get live status updates
    const interval = setInterval(fetchScans, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this scan? This cannot be undone.")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const res = await fetch(`http://localhost:5000/api/scan/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        setScans(scans.filter(s => s._id !== id));
      } else if (res.status === 401 || res.status === 403) {
        alert("Session expired or unauthorized. Please login again.");
        localStorage.removeItem("admin_token");
        setIsAdmin(false);
        router.push("/login");
      }
    } catch (err) {
      console.error("Failed to delete scan:", err);
      alert("Failed to delete scan");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case "FAILED": return <XCircle className="w-5 h-5 text-red-400" />;
      case "PENDING": return <Clock className="w-5 h-5 text-slate-400" />;
      default: return <Activity className="w-5 h-5 text-blue-400 animate-pulse" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "FAILED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "PENDING": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-500" />
            Scan Dashboard
          </h1>
          <p className="text-slate-400 mt-2">Monitor and access your security scans.</p>
        </div>
        <button 
          onClick={fetchScans}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          title="Refresh List"
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Activity className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : scans.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-white mb-2">No Scans Found</h2>
          <p className="text-slate-400 mb-6">You haven&apos;t run any security scans yet.</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl transition-colors"
          >
            Start a New Scan
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={scan._id}
              onClick={() => {
                if (scan.status === "COMPLETED") {
                  router.push(`/dashboard/${scan._id}/summary`);
                }
              }}
              className={`glass-panel rounded-2xl p-6 transition-all ${
                scan.status === "COMPLETED" 
                  ? "cursor-pointer hover:bg-slate-800/80 hover:border-slate-600" 
                  : "opacity-80"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-lg font-medium text-white truncate" title={scan.targetUrl}>
                    {scan.targetUrl}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                    <span>Started: {new Date(scan.createdAt).toLocaleString()}</span>
                    {scan.completedAt && (
                      <span>Completed: {new Date(scan.completedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusStyle(scan.status)}`}>
                    {getStatusIcon(scan.status)}
                    <span className="font-semibold text-sm tracking-wide">
                      {scan.status}
                    </span>
                  </div>
                  
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider px-2 border border-slate-700/50 rounded bg-slate-800/30">
                    {scan.scanType || "full"} Scan
                  </div>
                  
                  {["SPIDERING", "SCANNING"].includes(scan.status) && (
                    <div className="w-32 flex items-center gap-2">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${scan.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 w-8">{scan.progress}%</span>
                    </div>
                  )}
                  
                  {isAdmin && (
                    <button 
                      onClick={(e) => handleDelete(e, scan._id)}
                      className="mt-2 p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors self-end"
                      title="Delete Scan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
