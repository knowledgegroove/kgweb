"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Wallet, ArrowRight, Heart, Activity, Globe } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-mesh flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="w-16 h-16 bg-emerald-500 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
          <Shield className="text-white w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter mb-4 text-glow">Transparency Hub</h1>
        <p className="text-white/40 max-w-md mx-auto leading-relaxed text-sm font-medium uppercase tracking-[0.2em]">
          Radical Accountability for Global Giving
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Donor Entry */}
        <Link href="/publicflow/donor">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass p-10 rounded-[48px] border-emerald-500/20 hover:border-emerald-500/50 transition-all group bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Heart className="w-32 h-32 text-emerald-500" />
            </div>

            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20">
              <Wallet className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Donor Portal</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Contribute via Crypto or USD and track your money in real-time as it moves across the global ledger.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 group-hover:gap-4 transition-all">
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </Link>

        {/* NGO Entry */}
        <Link href="/publicflow/ngo">
          <motion.div
            whileHover={{ y: -10, scale: 1.02 }}
            className="glass p-10 rounded-[48px] border-blue-500/20 hover:border-blue-500/50 transition-all group bg-gradient-to-br from-white/[0.03] to-transparent relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Activity className="w-32 h-32 text-blue-400" />
            </div>

            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold mb-3">NGO Portal</h2>
            <p className="text-white/40 text-sm leading-relaxed mb-8">
              Manage treasury funds, disburse payments to providers, and provide verifiable proof of impact.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:gap-4 transition-all">
              Manage Vault <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </Link>
      </div>

      <div className="mt-24 grid grid-cols-3 gap-12 opacity-20 hover:opacity-100 transition-opacity duration-700">
        <div className="flex items-center gap-3">
          <Globe className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Global Audit</span>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Chain</span>
        </div>
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Zero Leakage</span>
        </div>
      </div>
    </main>
  );
}
