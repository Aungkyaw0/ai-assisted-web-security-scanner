"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, ArrowRight, Loader2, Lock, Zap, Search, Settings2, Check } from "lucide-react";

// ── Plugin data (from ZAP API) ──────────────────────────────────────────────

const ACTIVE_PLUGINS = [
  { id: "6", name: "Path Traversal" },
  { id: "7", name: "Remote File Inclusion" },
  { id: "10045", name: "Source Code Disclosure - /WEB-INF Folder" },
  { id: "10048", name: "Remote Code Execution - Shell Shock" },
  { id: "20015", name: "Heartbleed OpenSSL Vulnerability" },
  { id: "20017", name: "Source Code Disclosure - CVE-2012-1823" },
  { id: "20018", name: "Remote Code Execution - CVE-2012-1823" },
  { id: "20019", name: "External Redirect" },
  { id: "40009", name: "Server Side Include" },
  { id: "40012", name: "Cross Site Scripting (Reflected)" },
  { id: "40014", name: "Cross Site Scripting (Persistent)" },
  { id: "40018", name: "SQL Injection" },
  { id: "40019", name: "SQL Injection - MySQL (Time Based)" },
  { id: "40020", name: "SQL Injection - Hypersonic SQL (Time Based)" },
  { id: "40021", name: "SQL Injection - Oracle (Time Based)" },
  { id: "40022", name: "SQL Injection - PostgreSQL (Time Based)" },
  { id: "40026", name: "Cross Site Scripting (DOM Based)" },
  { id: "40027", name: "SQL Injection - MsSQL (Time Based)" },
  { id: "40043", name: "Log4Shell" },
  { id: "40045", name: "Spring4Shell" },
  { id: "40048", name: "Remote Code Execution (React2Shell)" },
  { id: "90019", name: "Server Side Code Injection" },
  { id: "90020", name: "Remote OS Command Injection" },
  { id: "90021", name: "XPath Injection" },
  { id: "90023", name: "XML External Entity Attack" },
  { id: "90024", name: "Generic Padding Oracle" },
  { id: "90034", name: "Cloud Metadata Potentially Exposed" },
  { id: "90035", name: "Server Side Template Injection" },
  { id: "90036", name: "Server Side Template Injection (Blind)" },
  { id: "90037", name: "Remote OS Command Injection (Time Based)" },
  { id: "0", name: "Directory Browsing" },
  { id: "10106", name: "HTTP Only Site" },
  { id: "30001", name: "Buffer Overflow" },
  { id: "30002", name: "Format String Error" },
  { id: "40003", name: "CRLF Injection" },
  { id: "40008", name: "Parameter Tampering" },
  { id: "40028", name: "ELMAH Information Leak" },
  { id: "40029", name: "Trace.axd Information Leak" },
  { id: "40032", name: ".htaccess Information Leak" },
  { id: "40034", name: ".env Information Leak" },
  { id: "40035", name: "Hidden File Finder" },
  { id: "40042", name: "Spring Actuator Information Leak" },
  { id: "40044", name: "Exponential Entity Expansion (Billion Laughs)" },
  { id: "90017", name: "XSLT Injection" },
  { id: "10047", name: "HTTPS Content Available via HTTP" },
  { id: "10058", name: "GET for POST" },
  { id: "10104", name: "User Agent Fuzzer" },
];

const PASSIVE_PLUGINS = [
  { id: "10003", name: "Vulnerable JS Library (Retire.js)" },
  { id: "10020", name: "Anti-clickjacking Header" },
  { id: "90022", name: "Application Error Disclosure" },
  { id: "10015", name: "Re-examine Cache-control Directives" },
  { id: "10038", name: "Content Security Policy (CSP) Header Not Set" },
  { id: "10055", name: "CSP" },
  { id: "10019", name: "Content-Type Header Missing" },
  { id: "10010", name: "Cookie No HttpOnly Flag" },
  { id: "90033", name: "Loosely Scoped Cookie" },
  { id: "10054", name: "Cookie without SameSite Attribute" },
  { id: "10011", name: "Cookie Without Secure Flag" },
  { id: "10098", name: "Cross-Domain Misconfiguration" },
  { id: "10017", name: "Cross-Domain JavaScript Source File Inclusion" },
  { id: "10202", name: "Absence of Anti-CSRF Tokens" },
  { id: "10033", name: "Directory Browsing" },
  { id: "10097", name: "Hash Disclosure" },
  { id: "10034", name: "Heartbleed OpenSSL Vulnerability (Indicative)" },
  { id: "10009", name: "In Page Banner Information Leak" },
  { id: "2", name: "Private IP Disclosure" },
  { id: "3", name: "Session ID in URL Rewrite" },
  { id: "10023", name: "Information Disclosure - Debug Error Messages" },
  { id: "10024", name: "Information Disclosure - Sensitive Info in URL" },
  { id: "10025", name: "Information Disclosure - Sensitive Info in Referrer" },
  { id: "10027", name: "Information Disclosure - Suspicious Comments" },
  { id: "10105", name: "Weak Authentication Method" },
  { id: "10041", name: "HTTP to HTTPS Insecure Transition in Form Post" },
  { id: "10042", name: "HTTPS to HTTP Insecure Transition in Form Post" },
  { id: "10108", name: "Reverse Tabnabbing" },
  { id: "10040", name: "Secure Pages Include Mixed Content" },
  { id: "10062", name: "PII Disclosure" },
  { id: "10036", name: "HTTP Server Response Header" },
  { id: "10035", name: "Strict-Transport-Security Header" },
  { id: "90003", name: "Sub Resource Integrity Attribute Missing" },
  { id: "10096", name: "Timestamp Disclosure" },
  { id: "10021", name: "X-Content-Type-Options Header Missing" },
  { id: "10037", name: "X-Powered-By Header Information Leak" },
  { id: "10029", name: "Cookie Poisoning" },
  { id: "10031", name: "User Controllable HTML Element Attribute (XSS)" },
  { id: "10043", name: "User Controllable JavaScript Event (XSS)" },
  { id: "10028", name: "Off-site Redirect" },
];

// ── Plugin Checklist Component ──────────────────────────────────────────────

function PluginChecklist({ title, plugins, selected, onToggle, onSelectAll, onClearAll, color }: {
  title: string;
  plugins: { id: string; name: string }[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  color: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = plugins.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const borderColor = color === "red" ? "border-red-500/30" : "border-blue-500/30";
  const headerBg = color === "red" ? "bg-red-500/10" : "bg-blue-500/10";
  const headerText = color === "red" ? "text-red-400" : "text-blue-400";
  const checkColor = color === "red" ? "bg-red-500" : "bg-blue-500";

  return (
    <div className={`rounded-xl border ${borderColor} overflow-hidden`}>
      <div className={`px-4 py-3 ${headerBg} flex items-center justify-between`}>
        <h4 className={`text-sm font-semibold ${headerText}`}>{title} ({selected.size}/{plugins.length})</h4>
        <div className="flex gap-2">
          <button onClick={onSelectAll} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800/50">All</button>
          <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-0.5 rounded bg-slate-800/50">None</button>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-slate-800/60">
        <input type="text" placeholder="Filter plugins..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg py-1.5 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50" />
      </div>
      <div className="max-h-64 overflow-y-auto p-2 space-y-0.5">
        {filtered.map(plugin => (
          <button key={plugin.id} onClick={() => onToggle(plugin.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors ${selected.has(plugin.id) ? 'bg-slate-800/60 text-white' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-300'}`}>
            <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${selected.has(plugin.id) ? `${checkColor} border-transparent` : 'border-slate-600'}`}>
              {selected.has(plugin.id) && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="truncate">{plugin.name}</span>
            <span className="ml-auto text-[10px] text-slate-600 shrink-0">#{plugin.id}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No plugins match.</p>}
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanType, setScanType] = useState<"quick" | "full" | "advanced">("full");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // Advanced mode state
  const [selectedActive, setSelectedActive] = useState<Set<string>>(new Set());
  const [selectedPassive, setSelectedPassive] = useState<Set<string>>(new Set());

  const totalSelected = selectedActive.size + selectedPassive.size;

  const togglePlugin = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    setFn(next);
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL (e.g., http://example.com)");
      return;
    }

    // Reject hostnames that don't look like real addresses
    // e.g. "abc" becomes "https://abc" which passes new URL() but isn't a real target
    const host = parsedUrl.hostname;
    const isLocalhost = host === "localhost";
    const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host === "[::1]";
    const hasDot = host.includes(".");
    if (!isLocalhost && !isIP && !hasDot) {
      setError("Please enter a valid URL with a proper domain (e.g., http://example.com)");
      return;
    }

    if (scanType === "advanced" && totalSelected === 0) {
      setError("Please select at least one plugin for the advanced scan.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        url: url.startsWith("http") ? url : `https://${url}`,
        scanType,
      };

      if (scanType === "advanced") {
        body.advancedConfig = {
          activePlugins: Array.from(selectedActive),
          passivePlugins: Array.from(selectedPassive),
        };
      }

      const response = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
          <span className="text-transparent bg-clip-text bg-gradient-to-red from-blue-400 to-violet-500">Intelligently</span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          Uncover vulnerabilities with an automated OWASP ZAP scan and get expert-level explanations and remediation steps. Built for modern development.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`w-full glass-card rounded-2xl p-2 mt-4 transition-all duration-300 ${scanType === "advanced" ? "max-w-3xl" : "max-w-xl"}`}
        >
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-2 relative">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-500" />
              <input type="text" placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                disabled={isLoading} />
            </div>
            <button type="submit" disabled={isLoading || !url}
              className="flex items-center justify-center gap-2 bg-gradient-to-red from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-4 rounded-xl font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed group shadow-lg shadow-blue-900/20">
              {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Starting...</span></>) : (<><Shield className="w-5 h-5" /><span>Scan Target</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </form>

          {/* Scan Mode Tabs */}
          <div className="flex items-center justify-center gap-3 mt-6 mb-2">
            <button onClick={() => setScanType("quick")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scanType === "quick" ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300"}`}>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" />Quick Scan</div>
            </button>
            <button onClick={() => setScanType("full")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scanType === "full" ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300"}`}>
              <div className="flex items-center gap-2"><Shield className="w-4 h-4" />Full Scan</div>
            </button>
            <button onClick={() => setScanType("advanced")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${scanType === "advanced" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-800/50 text-slate-400 border border-transparent hover:text-slate-300"}`}>
              <div className="flex items-center gap-2"><Settings2 className="w-4 h-4" />Advanced Scan</div>
            </button>
          </div>

          {/* Advanced Panel */}
          <AnimatePresence>
            {scanType === "advanced" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }} className="overflow-hidden">
                <div className="border-t border-slate-800/60 mt-2 pt-4 px-2 pb-2">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-slate-400">Select the specific scan plugins you want to run. <span className="text-amber-400 font-medium">{totalSelected} plugin(s) selected.</span></p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PluginChecklist title="Active Scan Plugins" plugins={ACTIVE_PLUGINS} selected={selectedActive} color="red"
                      onToggle={(id) => togglePlugin(selectedActive, setSelectedActive, id)}
                      onSelectAll={() => setSelectedActive(new Set(ACTIVE_PLUGINS.map(p => p.id)))}
                      onClearAll={() => setSelectedActive(new Set())} />
                    <PluginChecklist title="Passive Scan Plugins" plugins={PASSIVE_PLUGINS} selected={selectedPassive} color="blue"
                      onToggle={(id) => togglePlugin(selectedPassive, setSelectedPassive, id)}
                      onSelectAll={() => setSelectedPassive(new Set(PASSIVE_PLUGINS.map(p => p.id)))}
                      onClearAll={() => setSelectedPassive(new Set())} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-red-400 text-sm mt-3 px-2 text-left">{error}</motion.p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-16">
          <FeatureCard icon={<Lock className="w-6 h-6 text-blue-400" />} title="OWASP ZAP Engine" desc="Powered by industry-standard vulnerability scanning." />
          <FeatureCard icon={<Zap className="w-6 h-6 text-violet-400" />} title="Async Scanning" desc="Run scans in the background while you focus on other tasks." />
          <FeatureCard icon={<Shield className="w-6 h-6 text-emerald-400" />} title="Technical Insights" desc="Detailed instance mapping with payloads and evidence." />
        </div>
      </motion.div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-3 hover:bg-slate-800/60 transition-colors cursor-default">
      <div className="p-3 bg-slate-900 rounded-xl shadow-inner border border-slate-700/50">{icon}</div>
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
