"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Wallet, Shield, ArrowUpRight, BarChart3,
    Search, Info, CheckCircle2, Globe, Activity, CreditCard, ChevronLeft, Truck
} from "lucide-react";
import { connectWallet, sendDonation, getTransparencyEvents, getTreasuryBalance, getAccountBalance, watchUSDC, NGO_CONFIG } from "@/lib/web3";
import { ethers } from "ethers";

export default function NGOPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [treasuryBalance, setTreasuryBalance] = useState("0.0");
    const [usdcBalance, setUsdcBalance] = useState("0.0");
    const [events, setEvents] = useState<any[]>([]);
    const [disbursing, setDisbursing] = useState(false);
    const [disburseAmount, setDisburseAmount] = useState("");
    const [recipient, setRecipient] = useState("0xC42700c26467402582ec76f0e94dcc4564b9bef4"); // Defaulting to Account 1 (Donor) for the demo

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 8000);

        // Real-time Account Listener
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts: string[]) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                } else {
                    setAccount(null);
                }
            });
        }

        return () => {
            clearInterval(interval);
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => { });
            }
        };
    }, [account]);

    const fetchData = async () => {
        try {
            const data = await getTransparencyEvents(NGO_CONFIG.treasury);
            setEvents(data);

            const tBalance = await getAccountBalance(NGO_CONFIG.treasury);
            setTreasuryBalance(parseFloat(tBalance).toFixed(4));
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    const handleConnect = async () => {
        try {
            const { account: connectedAddress } = await connectWallet(true);

            // Strict NGO Admin Identity Check
            if (connectedAddress.trim().toLowerCase() !== NGO_CONFIG.treasury.toLowerCase()) {
                alert(`Access Denied!\n\nPlease switch to the NGO Admin Wallet (Account 2: ${NGO_CONFIG.treasury.substring(0, 10)}...) to access this portal.`);
                return;
            }

            setAccount(connectedAddress);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDisbursement = async () => {
        if (!account) return handleConnect();
        setDisbursing(true);
        try {
            const tx = await sendDonation(disburseAmount, recipient);
            await tx.wait();
            setDisburseAmount("");
            fetchData();
            alert("Disbursement successful! Funds sent to verified provider.");
        } catch (err) {
            console.error(err);
            alert("Disbursement failed.");
        } finally {
            setDisbursing(false);
        }
    };

    if (!account) {
        return (
            <main className="min-h-screen bg-mesh flex flex-col items-center justify-center p-8 text-white">
                <Link href="/publicflow" className="absolute top-12 left-12 glass p-3 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white group flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-none">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Portal
                </Link>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-[48px] max-w-lg w-full text-center border-blue-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                    <div className="w-20 h-20 bg-blue-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(59,130,246,0.4)]">
                        <Shield size={32} className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tighter">NGO Admin Access</h2>
                    <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
                        Please connect the <b>Verified Treasury Wallet (Account 2)</b> to manage disbursements and monitor impact.
                    </p>

                    <button
                        onClick={handleConnect}
                        className="w-full py-5 rounded-3xl bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                        <Wallet size={24} className="w-5 h-5 font-bold" />
                        Connect Admin Wallet
                    </button>
                    <p className="mt-6 text-[9px] text-white/20 uppercase tracking-widest font-bold">Authorized Multisig Required</p>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-mesh p-8 md:p-12 lg:p-16 flex flex-col items-center">
            <nav className="w-full max-w-6xl flex justify-between items-center mb-12">
                <div className="flex items-center gap-6">
                    <Link href="/publicflow" className="glass p-2.5 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                            <Shield size={32} className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-glow">NGO Portal</h1>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Treasury & Impact Management</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() && (
                        <div className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center gap-2 group relative cursor-help">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-orange-500">Read-Only Mode</span>
                            <div className="absolute top-10 right-0 w-64 glass p-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                <p className="text-[10px] text-white/60 leading-relaxed capitalize">
                                    Your connected wallet doesn't match the treasury address. You can view logs but cannot authorize disbursements.
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleConnect}
                        className="glass flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-medium border-white/10 hover:bg-white/5 transition-all"
                    >
                        <div className={`w-2 h-2 rounded-full ${account.toLowerCase() === NGO_CONFIG.treasury.toLowerCase() ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
                        {account.substring(0, 6)}...{account.substring(38)}
                        <span className="ml-2 text-[8px] font-bold text-white/20 uppercase">Switch</span>
                    </button>
                </div>
            </nav>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-3xl bg-orange-500/5 border border-orange-500/20 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-orange-500" />
                                <div className="text-xs font-semibold text-orange-500/80">
                                    Action Required: Switch to your Treasury Wallet ({NGO_CONFIG.treasury.substring(0, 6)}...) in MetaMask.
                                </div>
                            </div>
                            <button onClick={handleConnect} className="text-[10px] font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400">Fix Now</button>
                        </motion.div>
                    )}
                    {/* Treasury Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="glass p-8 rounded-[40px] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <Shield size={32} className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Total Treasury Balance</div>
                            <div className="text-4xl font-black text-glow mb-4">{treasuryBalance} <span className="text-lg font-normal text-white/40">ETH</span></div>
                            <button
                                onClick={watchUSDC}
                                className="py-2 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest"
                            >
                                + Sync USDC Ledger
                            </button>
                        </div>

                        <div className="glass p-8 rounded-[40px] relative overflow-hidden group flex flex-col justify-center">
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Audit Health</div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_#10b981]" />
                                <div className="text-xl font-bold">Real-time Verified</div>
                            </div>
                            <p className="text-[10px] text-white/40 mt-4 leading-relaxed">
                                All incoming and outgoing transactions are indexed via Alchemy and verified on the Sepolia network.
                            </p>
                        </div>
                    </div>

                    <section className="glass p-10 rounded-[48px] relative overflow-hidden">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <Truck className="w-6 h-6 text-blue-400" />
                                <h2 className="text-xl font-bold">Disburse Funds</h2>
                            </div>
                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-[9px] font-black uppercase text-blue-400 tracking-widest border border-blue-500/20">Authorized Access Only</span>
                        </div>

                        <div className="space-y-6 max-w-md">
                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Recipient Address (Provider/Logistics)</label>
                                <input
                                    type="text"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono focus:border-blue-500/50 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Disbursement Amount (ETH)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={disburseAmount}
                                        onChange={(e) => setDisburseAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-lg font-bold focus:border-blue-500/50 outline-none transition-all"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20">ETH</div>
                                </div>
                            </div>

                            <button
                                onClick={handleDisbursement}
                                disabled={disbursing || account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase()}
                                className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:scale-100 ${account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() ? 'bg-white/5 text-white/20' : 'bg-blue-500 text-white shadow-blue-500/30'}`}
                            >
                                {disbursing ? <Activity className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                                {account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() ? "Connect Treasury to Disburse" : "Authorize Disbursement"}
                            </button>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 flex flex-col">
                    <section className="glass p-8 rounded-[40px] flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Master Audit Ledger</h3>
                        </div>
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[11px] font-bold">{event.name}</span>
                                        <span className={`text-[10px] font-bold ${event.type.includes('Donation') ? 'text-emerald-500' : 'text-blue-400'}`}>{event.amount}</span>
                                    </div>
                                    <div className="text-[8px] font-black uppercase text-white/20 tracking-widest">{event.type}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
