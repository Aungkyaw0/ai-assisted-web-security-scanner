"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Search, ChevronDown, Shield,
  AlertTriangle, Database, Code, Globe,
  FileWarning, KeyRound, Eye, Server
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Vulnerability Knowledge Data
// ─────────────────────────────────────────────────────────────────────────────

type VulnEntry = {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  risk: string;
  whatIsIt: string;
  howItWorks: string;
  commonCauses: string[];
  prevention: string[];
  badCode: { language: string; code: string; label: string };
  goodCode: { language: string; code: string; label: string };
};

const vulnerabilities: VulnEntry[] = [
  {
    id: "sqli",
    name: "SQL Injection (SQLi)",
    icon: <Database className="w-5 h-5" />,
    color: "red",
    risk: "High",
    whatIsIt: "SQL Injection happens when an attacker inserts malicious SQL code into an input field (like a login form or search box). The application then runs this code against its database, potentially exposing or modifying sensitive data.",
    howItWorks: "If a website builds SQL queries by directly inserting user input without checking it first, an attacker can manipulate the query. For example, entering ' OR 1=1 -- in a login form could bypass authentication entirely.",
    commonCauses: [
      "Directly inserting user input into SQL queries (string concatenation)",
      "Not validating or sanitizing input from forms and URLs",
      "Using outdated database libraries without parameterized query support"
    ],
    prevention: [
      "Always use parameterized queries (prepared statements)",
      "Validate and sanitize all user input",
      "Use an ORM (like Sequelize, Prisma) which escapes input automatically",
      "Apply the principle of least privilege to database accounts"
    ],
    badCode: {
      language: "javascript",
      label: "❌ Vulnerable — user input directly in query",
      code: `// DANGEROUS: Direct string concatenation
const query = "SELECT * FROM users WHERE username = '" + userInput + "'";
// Attacker input: ' OR 1=1 --
// Resulting query: SELECT * FROM users WHERE username = '' OR 1=1 --'`
    },
    goodCode: {
      language: "javascript",
      label: "✅ Safe — using parameterized query",
      code: `// SAFE: Parameterized query
const query = "SELECT * FROM users WHERE username = ?";
db.execute(query, [userInput]);
// User input is treated as data, not SQL code`
    }
  },
  {
    id: "xss",
    name: "Cross-Site Scripting (XSS)",
    icon: <Code className="w-5 h-5" />,
    color: "orange",
    risk: "High",
    whatIsIt: "XSS occurs when an attacker injects malicious JavaScript into a web page that other users view. The victim's browser runs this script, thinking it's part of the legitimate website.",
    howItWorks: "If a website displays user-supplied data without escaping it, an attacker can inject a <script> tag. When another user views that page, the script runs in their browser — it can steal cookies, redirect them to a fake site, or modify what they see.",
    commonCauses: [
      "Displaying user input on a page without encoding or escaping HTML",
      "Using innerHTML or dangerouslySetInnerHTML with untrusted data",
      "Not setting proper Content Security Policy (CSP) headers"
    ],
    prevention: [
      "Always escape/encode user input before rendering it in HTML",
      "Use framework-provided safe rendering (React auto-escapes by default)",
      "Set Content-Security-Policy headers to restrict script sources",
      "Never use innerHTML with untrusted content"
    ],
    badCode: {
      language: "html",
      label: "❌ Vulnerable — raw user input in HTML",
      code: `<!-- DANGEROUS: Directly inserting user input -->
<p>Welcome, <span id="name"></span></p>
<script>
  document.getElementById("name").innerHTML = userInput;
  // If userInput = <script>alert('hacked')</script>
  // The script will execute!
</script>`
    },
    goodCode: {
      language: "html",
      label: "✅ Safe — using textContent instead",
      code: `<!-- SAFE: Using textContent (no HTML parsing) -->
<p>Welcome, <span id="name"></span></p>
<script>
  document.getElementById("name").textContent = userInput;
  // Even if userInput contains <script>, it's shown as plain text
</script>`
    }
  },
  {
    id: "csrf",
    name: "Cross-Site Request Forgery (CSRF)",
    icon: <Globe className="w-5 h-5" />,
    color: "yellow",
    risk: "Medium",
    whatIsIt: "CSRF tricks a logged-in user into performing actions they didn't intend — like changing their password or transferring money — by making their browser send a forged request to a website where they're authenticated.",
    howItWorks: "The attacker creates a malicious page (or email link) that sends a request to the target website. Because the user's browser automatically includes their session cookie, the server thinks the request is legitimate.",
    commonCauses: [
      "Not using CSRF tokens in forms",
      "Relying only on cookies for authentication without additional verification",
      "Accepting state-changing requests via GET instead of POST"
    ],
    prevention: [
      "Include a unique CSRF token in every form and verify it server-side",
      "Use the SameSite cookie attribute (Strict or Lax)",
      "Require re-authentication for sensitive actions",
      "Never use GET requests for actions that change data"
    ],
    badCode: {
      language: "html",
      label: "❌ Vulnerable — form without CSRF token",
      code: `<!-- DANGEROUS: No CSRF token -->
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker-account" />
  <input name="amount" value="1000" />
  <button type="submit">Transfer</button>
</form>
<!-- An attacker can host this on their site and trick users into submitting it -->`
    },
    goodCode: {
      language: "html",
      label: "✅ Safe — form with CSRF token",
      code: `<!-- SAFE: Hidden CSRF token verified by the server -->
<form action="/transfer" method="POST">
  <input type="hidden" name="_csrf" value="random-unique-token-abc123" />
  <input name="to" value="" />
  <input name="amount" value="" />
  <button type="submit">Transfer</button>
</form>
<!-- Server checks that _csrf matches the user's session -->`
    }
  },
  {
    id: "cmdi",
    name: "Command Injection",
    icon: <Server className="w-5 h-5" />,
    color: "red",
    risk: "High",
    whatIsIt: "Command Injection occurs when an application passes user input directly to a system shell command. An attacker can inject additional commands that the server will execute with the application's privileges.",
    howItWorks: "If a web application runs a system command like ping using user-supplied input, an attacker can append extra commands using special characters like ; or &&. For example, entering 127.0.0.1 ; cat /etc/passwd would run both commands.",
    commonCauses: [
      "Using user input in shell commands (exec, system, child_process)",
      "Not validating or restricting what characters users can enter",
      "Running shell commands when safer alternatives exist"
    ],
    prevention: [
      "Avoid calling system commands with user input whenever possible",
      "Use language-specific libraries instead of shell commands",
      "If shell commands are necessary, use allowlists for valid input",
      "Never pass raw user input to exec() or similar functions"
    ],
    badCode: {
      language: "javascript",
      label: "❌ Vulnerable — user input in shell command",
      code: `// DANGEROUS: User input directly in exec()
const { exec } = require("child_process");
exec("ping -c 4 " + userInput);
// Attacker input: 127.0.0.1 ; rm -rf /
// Both commands will execute!`
    },
    goodCode: {
      language: "javascript",
      label: "✅ Safe — using execFile with arguments array",
      code: `// SAFE: Using execFile (no shell interpretation)
const { execFile } = require("child_process");
execFile("ping", ["-c", "4", userInput]);
// userInput is passed as a single argument, not interpreted as shell`
    }
  },
  {
    id: "pathtraversal",
    name: "Path Traversal",
    icon: <FileWarning className="w-5 h-5" />,
    color: "orange",
    risk: "High",
    whatIsIt: "Path Traversal (or Directory Traversal) lets an attacker access files outside the intended directory by using special characters like ../ in file paths. This can expose configuration files, source code, or sensitive system files.",
    howItWorks: "If a web application serves files based on user input (like ?file=report.pdf), an attacker can change it to ?file=../../etc/passwd to read system files that should not be accessible.",
    commonCauses: [
      "Using user input to construct file paths without validation",
      "Not restricting file access to a specific directory",
      "Allowing ../ sequences in file path parameters"
    ],
    prevention: [
      "Validate that the resolved file path stays within the intended directory",
      "Use an allowlist of permitted filenames when possible",
      "Strip or reject ../ sequences from user input",
      "Use path.resolve() and verify the result starts with the allowed base path"
    ],
    badCode: {
      language: "javascript",
      label: "❌ Vulnerable — no path validation",
      code: `// DANGEROUS: User controls the file path
const filePath = "./uploads/" + req.query.file;
res.sendFile(filePath);
// Attacker input: ../../etc/passwd
// Serves: ./uploads/../../etc/passwd → /etc/passwd`
    },
    goodCode: {
      language: "javascript",
      label: "✅ Safe — validating resolved path",
      code: `// SAFE: Resolve path and verify it stays in uploads/
const path = require("path");
const basePath = path.resolve("./uploads");
const filePath = path.resolve("./uploads", req.query.file);

if (!filePath.startsWith(basePath)) {
  return res.status(403).send("Access denied");
}
res.sendFile(filePath);`
    }
  },
  {
    id: "idor",
    name: "Insecure Direct Object Reference (IDOR)",
    icon: <KeyRound className="w-5 h-5" />,
    color: "yellow",
    risk: "Medium",
    whatIsIt: "IDOR happens when a web application exposes internal references (like database IDs) in URLs or API endpoints, and doesn't check whether the logged-in user is actually authorized to access that resource.",
    howItWorks: "For example, if you can view your profile at /user/123, and you change the URL to /user/124 to see another person's profile, that's an IDOR vulnerability. The server should check whether you're allowed to view user 124's data.",
    commonCauses: [
      "Using predictable IDs (like sequential numbers) in URLs or APIs",
      "Not checking if the logged-in user owns or has access to the requested resource",
      "Relying on the frontend to hide links instead of enforcing access on the server"
    ],
    prevention: [
      "Always verify authorization server-side before returning data",
      "Check that the requesting user owns or has permission to access the resource",
      "Use UUIDs instead of sequential IDs to make guessing harder",
      "Implement proper role-based access control (RBAC)"
    ],
    badCode: {
      language: "javascript",
      label: "❌ Vulnerable — no authorization check",
      code: `// DANGEROUS: Anyone can view any user's data
app.get("/api/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user); // No check if the requester is allowed!
});`
    },
    goodCode: {
      language: "javascript",
      label: "✅ Safe — checking authorization",
      code: `// SAFE: Verify the requester owns this data
app.get("/api/user/:id", authenticate, async (req, res) => {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ error: "Access denied" });
  }
  const user = await User.findById(req.params.id);
  res.json(user);
});`
    }
  },
  {
    id: "infoleak",
    name: "Information Disclosure",
    icon: <Eye className="w-5 h-5" />,
    color: "blue",
    risk: "Low — Medium",
    whatIsIt: "Information Disclosure happens when an application accidentally reveals sensitive information — like server versions, internal paths, debug messages, or stack traces — in responses, headers, or error pages.",
    howItWorks: "Attackers look at HTTP headers, error messages, and page source code for clues about the technology stack, file structure, or configuration. This information helps them plan more targeted attacks.",
    commonCauses: [
      "Showing detailed error messages or stack traces in production",
      "Including server version info in HTTP headers (X-Powered-By, Server)",
      "Leaving debug mode enabled in production environments"
    ],
    prevention: [
      "Use generic error pages in production (don't show stack traces)",
      "Remove or suppress server identification headers",
      "Disable debug mode before deploying to production",
      "Review what information your API responses include"
    ],
    badCode: {
      language: "javascript",
      label: "❌ Vulnerable — exposing internal details",
      code: `// DANGEROUS: Sending the full error to the client
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,       // Exposes internal file paths!
    dbHost: process.env.DB  // Exposes database host!
  });
});`
    },
    goodCode: {
      language: "javascript",
      label: "✅ Safe — generic error message",
      code: `// SAFE: Log internally, send generic message
app.use((err, req, res, next) => {
  console.error(err.stack); // Log for developers only
  res.status(500).json({
    error: "Something went wrong. Please try again."
  });
});`
    }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Vuln Card Component
// ─────────────────────────────────────────────────────────────────────────────

const riskColorMap: Record<string, string> = {
  "High": "bg-red-500/10 text-red-400 border-red-500/30",
  "Medium": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "Low — Medium": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
};

const cardBorderMap: Record<string, string> = {
  red: "border-l-red-500",
  orange: "border-l-orange-500",
  yellow: "border-l-yellow-500",
  blue: "border-l-blue-500",
};

const iconBgMap: Record<string, string> = {
  red: "bg-red-500/15 text-red-400",
  orange: "bg-orange-500/15 text-orange-400",
  yellow: "bg-yellow-500/15 text-yellow-400",
  blue: "bg-blue-500/15 text-blue-400",
};

function VulnCard({ vuln }: { vuln: VulnEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-2xl overflow-hidden border-l-4 ${cardBorderMap[vuln.color] || "border-l-slate-500"}`}
    >
      {/* Card Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBgMap[vuln.color]}`}>
            {vuln.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{vuln.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{vuln.whatIsIt.slice(0, 80)}...</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${riskColorMap[vuln.risk] || "bg-slate-500/10 text-slate-400 border-slate-500/30"}`}>
            {vuln.risk}
          </span>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-5 border-t border-slate-800/60 pt-5">
              {/* What Is It */}
              <div>
                <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">What is it?</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{vuln.whatIsIt}</p>
              </div>

              {/* How It Works */}
              <div>
                <h4 className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-2">How does it work?</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{vuln.howItWorks}</p>
              </div>

              {/* Common Causes */}
              <div>
                <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">Common Causes</h4>
                <ul className="space-y-1.5">
                  {vuln.commonCauses.map((cause, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">How to Prevent It</h4>
                <ul className="space-y-1.5">
                  {vuln.prevention.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                      <span className="text-emerald-500 mt-1">✓</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code Examples */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Bad Code */}
                <div className="rounded-xl border border-red-500/20 overflow-hidden">
                  <div className="bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400">
                    {vuln.badCode.label}
                  </div>
                  <pre className="p-4 text-xs text-slate-300 overflow-x-auto leading-relaxed bg-slate-950/50">
                    <code>{vuln.badCode.code}</code>
                  </pre>
                </div>
                {/* Good Code */}
                <div className="rounded-xl border border-emerald-500/20 overflow-hidden">
                  <div className="bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400">
                    {vuln.goodCode.label}
                  </div>
                  <pre className="p-4 text-xs text-slate-300 overflow-x-auto leading-relaxed bg-slate-950/50">
                    <code>{vuln.goodCode.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = vulnerabilities.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.whatIsIt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-5">
          <BookOpen className="w-7 h-7 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Vulnerability Knowledge Base</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Learn about common web vulnerabilities found by security scanners. Each entry includes a simple explanation, why it happens, how to prevent it, and code examples.
        </p>
      </motion.div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search vulnerabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-colors"
          />
        </div>
      </div>

      {/* Vulnerability List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <AlertTriangle className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No vulnerabilities match your search.</p>
          </div>
        ) : (
          filtered.map((vuln, idx) => (
            <motion.div
              key={vuln.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <VulnCard vuln={vuln} />
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center text-xs text-slate-600 border-t border-slate-800 pt-8"
      >
        <p>Content based on <span className="text-slate-400">OWASP Top 10</span> and common findings from <span className="text-slate-400">OWASP ZAP Scanner</span>.</p>
        <p className="mt-1">For in-depth learning, visit <a href="https://owasp.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">owasp.org</a></p>
      </motion.div>
    </div>
  );
}
