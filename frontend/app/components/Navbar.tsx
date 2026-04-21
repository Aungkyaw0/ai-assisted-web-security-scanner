"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check login status on mount and when pathname changes
  useEffect(() => {
    // eslint-disable-next-line
    setIsAdmin(!!localStorage.getItem("admin_token"));
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setIsAdmin(false);
    router.push("/");
  };

  return (
    <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
      <Link href="/" className="hover:text-white transition-colors">Scanner</Link>
      <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
      <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
      <Link href="/help" className="hover:text-white transition-colors">Help</Link>
      
      {isAdmin ? (
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 hover:text-red-400 transition-colors ml-4 pl-4 border-l border-slate-700"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      ) : (
        <Link href="/login" className="hover:text-blue-400 transition-colors ml-4 pl-4 border-l border-slate-700">
          Admin
        </Link>
      )}
    </nav>
  );
}
