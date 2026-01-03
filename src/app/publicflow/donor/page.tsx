"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Wallet, Shield, ArrowUpRight, BarChart3,
    Search, Info, CheckCircle2, Globe, Activity, CreditCard, ChevronLeft, Heart
} from "lucide-react";
import { connectWallet, sendDonation, sendUSDCDonation, getTransparencyEvents, getTreasuryBalance, getAccountBalance, getUSDCBalance, NGO_CONFIG } from "@/lib/web3";

export default function DonorPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [donating, setDonating] = useState(false);
    const [amount, setAmount] = useState("0.01");
    const [trackingStep, setTrackingStep] = useState<0 | 1 | 2 | 3 | 4>(0);
    const [showImpactSummary, setShowImpactSummary] = useState(false);
    const [isSimMode, setIsSimMode] = useState(false);
    const [donationMethod, setDonationMethod] = useState<'crypto' | 'usd'>('crypto');
    const [events, setEvents] = useState<any[]>([]);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [treasuryBalance, setTreasuryBalance] = useState("42.5");
    const [donorBalance, setDonorBalance] = useState("0.0");
    const [donorUsdcBalance, setDonorUsdcBalance] = useState("0.0");
    const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvc: '' });
    const [isCustom, setIsCustom] = useState(false);
    const [disbursementInfo, setDisbursementInfo] = useState<any>(null);
    const [archivedTxHashes, setArchivedTxHashes] = useState<string[]>([]);
    const [trackingTxHash, setTrackingTxHash] = useState<string | null>(null);
    const [onRampStatus, setOnRampStatus] = useState<'idle' | 'authorizing' | 'bridging' | 'completed' | 'failed'>('idle');

    useEffect(() => {
        const saved = localStorage.getItem("archived_donations");
        if (saved) setArchivedTxHashes(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("archived_donations", JSON.stringify(archivedTxHashes));
    }, [archivedTxHashes]);

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
    }, [isSimMode, account]);

    const fetchData = async () => {
        if (isSimMode) {
            // In simulation, we maintain the state-based mock events added during handleDonate
            setTreasuryBalance("124,500.00");
            setDonorBalance("1.25");
            setDonorUsdcBalance("1,050.00");
            return;
        }

        try {
            const data = await getTransparencyEvents(NGO_CONFIG.treasury);
            setEvents(data);

            // AUTO-REHYDRATION LOGIC: Check if this user has a donation in the ledger
            if (account) {
                // Find the donation to track: either the specifically selected one, or the latest unarchived one
                let userDonation;
                if (trackingTxHash) {
                    userDonation = data.find((e: any) => e.receiptHash === trackingTxHash && e.type === "Incoming Donation");
                } else {
                    userDonation = data.find((e: any) =>
                        e.from?.toLowerCase() === account.toLowerCase() &&
                        e.type === "Incoming Donation" &&
                        !archivedTxHashes.includes(e.receiptHash)
                    );
                }

                if (userDonation) {
                    // Look for disbursements that happened AFTER (or in same block) as the donation
                    const settlement = data.find((e: any) => e.type === "Outgoing Expense" && e.blockNumber >= userDonation.blockNumber);

                    if (settlement && (trackingStep < 4 || trackingTxHash)) {
                        setTrackingStep(4);
                        setDisbursementInfo(settlement);
                    } else if (!settlement) {
                        setTrackingStep(3); // Donation found, but not yet spent
                    }
                }
            }

            const tBalance = await getAccountBalance(NGO_CONFIG.treasury);
            setTreasuryBalance(parseFloat(tBalance).toFixed(4));

            if (account && account !== "0xSimulated_Donor_Address") {
                const dBalance = await getAccountBalance(account);
                setDonorBalance(parseFloat(dBalance).toFixed(4));

                const dUsdcBalance = await getUSDCBalance(account);
                setDonorUsdcBalance(parseFloat(dUsdcBalance).toFixed(2));
            }
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    const displayedEvents = showAllEvents ? events : events.slice(0, 5);

    const handleConnect = async () => {
        if (isSimMode) {
            setAccount("0xSimulated_Donor_Address");
            return;
        }
        try {
            const { account: connectedAddress } = await connectWallet(true);

            setAccount(connectedAddress);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDonate = async () => {
        if (donationMethod === 'crypto' && !account && !isSimMode) return handleConnect();

        // Self-Donation Warning
        if (account?.toLowerCase() === NGO_CONFIG.treasury.trim().toLowerCase() && !isSimMode) {
            const confirmSelf = window.confirm("Self-Donation Alert: You are about to donate to your own wallet. Is this intended?");
            if (!confirmSelf) return;
        }

        setDonating(true);
        setTrackingStep(1);
        setShowImpactSummary(false);
        setDisbursementInfo(null); // RESET DISBURSEMENT FOR NEW FLOW
        setOnRampStatus('idle');

        if (donationMethod === 'usd') {
            try {
                setOnRampStatus('authorizing');
                await new Promise(r => setTimeout(r, 2000)); // Simulate Card Auth

                setOnRampStatus('bridging');
                await new Promise(r => setTimeout(r, 2500)); // Simulate USD to USDC conversion

                setOnRampStatus('completed');
                await new Promise(r => setTimeout(r, 1000));
            } catch (err) {
                console.error("On-ramp failed", err);
                setOnRampStatus('failed');
                setDonating(false);
                setTrackingStep(0);
                return;
            }
        }

        if (isSimMode) {
            setTimeout(() => {
                setTrackingStep(2);
                const donationAmount = donationMethod === 'usd' ? `$${amount} USD` : `${amount} ETH`;

                setTimeout(() => {
                    setTrackingStep(3);
                    const incomingEvent = {
                        id: `sim-in-${Date.now()}`,
                        type: "Incoming Donation",
                        name: donationMethod === 'usd' ? "Fiat-to-Crypto Onramp" : "Your Contribution",
                        amount: donationAmount,
                        timestamp: new Date().toLocaleString(),
                        receiptHash: "v_STRIPE_79213",
                        blockNumber: 9999998,
                        purpose: "N/A",
                        destination: "PublicFlow Vault",
                        goods: "N/A"
                    };
                    setEvents(prev => [incomingEvent, ...prev]);

                    setTimeout(() => {
                        const disbursement = {
                            id: `sim-out-${Date.now()}`,
                            type: "Outgoing Expense",
                            name: "Medical Supply Order",
                            amount: donationMethod === 'usd' ? `$${(parseFloat(amount) * 0.92).toFixed(2)}` : `${(parseFloat(amount) * 0.95).toFixed(3)} ETH`,
                            timestamp: new Date().toLocaleString(),
                            purpose: "Emergency Medical Relief",
                            destination: "United Health Supplies",
                            goods: "First Aid Kits & Rehydration Salts",
                            receiptHash: "0xIMPACT_PR_" + Math.random().toString(16).slice(2, 8),
                            blockNumber: 9999999
                        };

                        setTrackingStep(4);
                        setDonating(false);
                        setDisbursementInfo(disbursement);
                        setEvents(prev => [disbursement, ...prev]);
                        setAmount("0.01"); // Reset amount
                    }, 4000);
                }, 2000);
            }, 2000);
            return;
        }

        try {
            let tx;
            if (donationMethod === 'usd') {
                tx = await sendUSDCDonation(amount, NGO_CONFIG.treasury);
                setTrackingStep(2); // Registered with Smart Contract
            } else {
                tx = await sendDonation(amount, NGO_CONFIG.treasury);
                setTrackingStep(2); // Registered with Smart Contract
            }

            // Wait for confirmation
            await tx.wait();
            setTrackingStep(3); // Locked in NGO Vault

            setDonating(false);
            fetchData();

            // Note: Step 4 (Settlement) only occurs on-chain when the NGO actually spends the funds.
            // For real transactions, we stop here to show the funds are currently secured in the vault.

        } catch (err: any) {
            console.error(err);
            alert("Transaction failed or rejected.");
            setTrackingStep(0);
            setDonating(false);
        }
    };

    if (!account && !isSimMode) {
        return (
            <main className="min-h-screen bg-mesh flex flex-col items-center justify-center p-8 text-white">
                <Link href="/publicflow" className="absolute top-12 left-12 glass p-3 rounded-2xl hover:bg-white/10 transition-all text-white/40 hover:text-white group flex items-center gap-2 text-xs font-bold uppercase tracking-widest leading-none">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Portal
                </Link>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass p-12 rounded-[48px] max-w-lg w-full text-center border-emerald-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
                >
                    <div className="w-20 h-20 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                        <Heart className="text-white w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 tracking-tighter">Support a Cause</h2>
                    <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
                        Connect your wallet to support the {NGO_CONFIG.name} mission with transparent tracking.
                    </p>

                    <button
                        onClick={handleConnect}
                        className="w-full py-5 rounded-3xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                        <Wallet size={24} className="w-5 h-5 font-bold" />
                        Connect Donor Wallet
                    </button>

                    <button
                        onClick={() => setIsSimMode(true)}
                        className="mt-6 text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em]"
                    >
                        Enter Sim Mode Instead
                    </button>
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
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                            <Shield size={32} className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-glow">Donor Dashboard</h1>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Transparent Giving</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => { setIsSimMode(!isSimMode); setAccount(null); setTrackingStep(0); }}
                        className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all border ${isSimMode ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                    >
                        {isSimMode ? "Demo Mode: ON" : "Real Network"}
                    </button>
                    <button onClick={handleConnect} className="glass flex items-center gap-2 px-6 py-2.5 rounded-full hover:bg-white/5 transition-all text-xs font-medium border-white/10">
                        <div className={`w-2 h-2 rounded-full ${account ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "Connect Wallet"}
                    </button>
                </div>
            </nav>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 flex flex-col gap-8">
                    {/* Stats Summary Card */}
                    <div className="glass p-6 rounded-3xl grid grid-cols-2 gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Globe className="w-32 h-32" />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Impact Potential</div>
                            <div className="text-2xl font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                Ready to Disburse
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-white/30 uppercase mb-1">Balance</div>
                            <div className="text-2xl font-bold flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <Wallet size={20} className="w-4 h-4 text-emerald-500" />
                                    <span>{donorUsdcBalance} <span className="text-xs text-white/40">USDC</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span>{donorBalance} <span className="text-[10px] text-white/30 tracking-tight">ETH</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <section className="glass p-10 rounded-[48px] relative overflow-hidden min-h-[550px] flex flex-col">
                        <div className="flex justify-between items-center mb-12">
                            <h2 className="text-xl font-semibold flex items-center gap-3">
                                <Search className="w-6 h-6 text-emerald-500" />
                                {trackingStep === 4 ? "Past Transaction Tracking" : "Live Donation Tracking"}
                            </h2>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4].map((step) => (
                                    <div key={step} className={`w-2 h-2 rounded-full transition-all duration-500 ${trackingStep >= step ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center relative">
                            {trackingStep > 0 ? (
                                <div className="w-full max-w-3xl">
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 relative">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 block mb-2">
                                            {trackingStep === 1 && (
                                                donationMethod === 'usd'
                                                    ? (onRampStatus === 'authorizing' ? "Authorizing Payment Method..." : onRampStatus === 'bridging' ? "Bridging USD to USDC via Circle..." : "Initializing On-Chain Settlement...")
                                                    : "Verifying On-Chain Transfer..."
                                            )}
                                            {trackingStep === 2 && "Registering with PublicFlow Contract"}
                                            {trackingStep === 3 && "Locked in NGO Treasury Vault"}
                                            {trackingStep === 4 && (disbursementInfo ? `Settled: ${disbursementInfo.amount} disbursed` : "Impact Achieved: Funds Disbursed")}
                                        </span>
                                        <h3 className="text-2xl font-bold">
                                            {trackingStep === 1 && "Initialization"}
                                            {trackingStep === 2 && "Immutable Record Created"}
                                            {trackingStep === 3 && "Vault Secured"}
                                            {trackingStep === 4 && (disbursementInfo ? `Payout to Verified Partner` : "Mission Success")}
                                        </h3>
                                        {trackingStep === 4 && disbursementInfo && (
                                            <div className="mt-8 p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 max-w-md mx-auto text-left">
                                                <div className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mb-4 flex items-center gap-2">
                                                    <CheckCircle2 size={12} /> Verifiable Impact Receipt
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-white/30 uppercase font-bold">Purpose:</span>
                                                        <span className="text-xs font-bold text-white/80">{disbursementInfo.purpose}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-white/30 uppercase font-bold">Destination:</span>
                                                        <span className="text-xs font-bold text-blue-400">{disbursementInfo.destination}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-white/30 uppercase font-bold">Good/Service:</span>
                                                        <span className="text-xs font-bold text-emerald-400">{disbursementInfo.goods}</span>
                                                    </div>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] text-white/30 uppercase font-bold">Timestamp:</span>
                                                        <span className="text-xs font-mono text-white/40">{disbursementInfo.timestamp}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                                    <span className="text-[9px] text-white/20 font-black uppercase tracking-widest">On-Chain ID</span>
                                                    <span className="text-[10px] font-mono text-white/30">#{disbursementInfo.receiptHash}</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    <div className="flex justify-between items-center relative py-10">
                                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10" />
                                        <div className="flex flex-col items-center gap-4 relative">
                                            <div className={`w-16 h-16 rounded-3xl glass flex items-center justify-center border-emerald-500 transition-all duration-500 ${trackingStep >= 1 ? 'shadow-[0_0_40px_rgba(16,185,129,0.2)] border-emerald-500' : 'border-white/10'}`}>
                                                {donationMethod === 'usd' ? <CreditCard className="w-6 h-6 text-emerald-500" /> : <Wallet size={24} className="w-6 h-6 text-emerald-500" />}
                                            </div>
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{donationMethod === 'usd' ? "USD Conversion" : "Crypto Send"}</span>
                                        </div>
                                        <div className="flex-1 relative h-2">
                                            {trackingStep === 1 && (
                                                <motion.div animate={{ x: [-20, 100], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] absolute top-0" />
                                            )}
                                            {trackingStep > 1 && <div className="w-full h-0.5 bg-emerald-500/30 absolute top-0" />}
                                        </div>
                                        <div className="flex flex-col items-center gap-4 relative">
                                            <div className={`w-16 h-16 rounded-3xl glass flex items-center justify-center transition-all duration-500 ${trackingStep >= 2 ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'border-white/10'}`}>
                                                <BarChart3 size={24} className={`w-6 h-6 ${trackingStep >= 2 ? 'text-emerald-500' : 'text-white/20'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">PublicFlow Vault</span>
                                        </div>
                                        <div className="flex-1 relative h-2">
                                            {trackingStep === 2 && (
                                                <motion.div animate={{ x: [-20, 100], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] absolute top-0" />
                                            )}
                                            {trackingStep > 2 && <div className="w-full h-0.5 bg-emerald-500/30 absolute top-0" />}
                                        </div>
                                        <div className="flex flex-col items-center gap-4 relative">
                                            <div className={`w-16 h-16 rounded-3xl glass flex items-center justify-center transition-all duration-500 ${trackingStep >= 3 ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_50px_rgba(16,185,129,0.1)]' : 'border-white/10'}`}>
                                                <Shield className={`w-6 h-6 ${trackingStep >= 3 ? 'text-white' : 'text-white/10'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">NGO Vault</span>
                                        </div>
                                        <div className="flex-1 relative h-2">
                                            {trackingStep === 3 && (
                                                <motion.div animate={{ x: [-20, 100], opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] absolute top-0" />
                                            )}
                                            {trackingStep > 3 && <div className="w-full h-0.5 bg-blue-500/30 absolute top-0" />}
                                        </div>
                                        <div className="flex flex-col items-center gap-4 relative">
                                            <div className={`w-16 h-16 rounded-3xl glass flex items-center justify-center transition-all duration-500 ${trackingStep >= 4 ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'border-white/10'}`}>
                                                <Globe className={`w-6 h-6 ${trackingStep >= 4 ? 'text-blue-500' : 'text-white/20'}`} />
                                            </div>
                                            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Settlement</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center opacity-40">
                                    <Activity className="w-16 h-16 text-white/20 mx-auto mb-6" />
                                    <h3 className="text-xl font-medium">Awaiting Donation</h3>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-white/40">Enter amount on the right to start tracking</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-8">
                    <section className="glass p-8 rounded-[40px] border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-lg font-bold">Support Mission</h3>
                            <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                                <button onClick={() => { setDonationMethod('crypto'); setAmount('0.01'); }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${donationMethod === 'crypto' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-white/30 hover:text-white'}`}>Crypto</button>
                                <button onClick={() => { setDonationMethod('usd'); setAmount('100'); }} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${donationMethod === 'usd' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-white/30 hover:text-white'}`}>USD</button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            {donationMethod === 'usd' ? (
                                <div className="space-y-4">
                                    <input type="text" placeholder="Card Number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="text" placeholder="MM/YY" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono" />
                                        <input type="text" placeholder="CVC" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {["25", "100", "500"].map((val) => (
                                            <button key={val} onClick={() => { setAmount(val); setIsCustom(false); }} className={`py-3 rounded-2xl text-xs font-bold border transition-all ${amount === val && !isCustom ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-transparent text-white/40'}`}>${val}</button>
                                        ))}
                                        <button onClick={() => setIsCustom(true)} className={`py-3 rounded-2xl text-[10px] font-bold border transition-all ${isCustom ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-transparent text-white/40'}`}>Alt</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-2">
                                        {["0.01", "0.1", "1.0"].map((val) => (
                                            <button key={val} onClick={() => { setAmount(val); setIsCustom(false); }} className={`py-3 rounded-2xl text-xs font-bold border transition-all ${amount === val && !isCustom ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-transparent text-white/40'}`}>{val}</button>
                                        ))}
                                        <button onClick={() => setIsCustom(true)} className={`py-3 rounded-2xl text-[10px] font-bold border transition-all ${isCustom ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-500' : 'bg-white/5 border-transparent text-white/40'}`}>Alt</button>
                                    </div>
                                </div>
                            )}

                            {isCustom && <input type="text" placeholder="Enter amount" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono" value={amount} onChange={(e) => setAmount(e.target.value)} />}

                            {trackingStep === 4 ? (
                                <button
                                    onClick={() => {
                                        // Archive the current donation and its settlement
                                        if (events.length > 0 && account) {
                                            const currentDonation = events.find((e: any) =>
                                                (trackingTxHash ? e.receiptHash === trackingTxHash : e.from?.toLowerCase() === account.toLowerCase()) &&
                                                e.type === "Incoming Donation"
                                            );
                                            if (currentDonation?.receiptHash) {
                                                setArchivedTxHashes(prev => [...prev, currentDonation.receiptHash]);
                                            }
                                        }
                                        setTrackingStep(0);
                                        setDisbursementInfo(null);
                                        setTrackingTxHash(null);
                                    }}
                                    className="w-full py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] bg-emerald-500 text-black shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                                >
                                    <Heart className="w-5 h-5" />
                                    <span>Support Mission Again</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleDonate}
                                    disabled={donating && trackingStep > 0}
                                    className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-3 ${trackingStep > 0 ? 'bg-white/10 text-white/40 border border-white/10' : 'bg-emerald-500 text-black shadow-lg hover:scale-[1.02]'}`}
                                >
                                    {donating ? <Activity className="w-5 h-5 animate-spin" /> : <ArrowUpRight className="w-5 h-5" />}
                                    <span>{trackingStep > 0 ? "Tracking Progress..." : "Confirm & Send"}</span>
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="glass p-8 rounded-[40px] flex-1">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Audit Ledger</h3>
                            <button onClick={() => setTrackingTxHash(null)} className="text-[9px] font-bold text-emerald-500/50 hover:text-emerald-500 transition-colors uppercase tracking-widest">Auto-Track Latest</button>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {displayedEvents.map((event) => (
                                <button
                                    key={event.id}
                                    onClick={() => {
                                        if (event.type.includes('Donation')) {
                                            setTrackingTxHash(event.receiptHash);
                                            setTrackingStep(3); // Jump to tracking view
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }
                                    }}
                                    className={`w-full text-left p-4 rounded-3xl bg-white/[0.02] border transition-all ${trackingTxHash === event.receiptHash ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-white/5 hover:border-white/20'} flex justify-between items-center group`}
                                >
                                    <div>
                                        <div className="text-[11px] font-bold text-white/90 group-hover:text-emerald-400 transition-colors">{event.name}</div>
                                        <div className="text-[8px] font-black uppercase text-white/30 mt-1">{event.receiptHash ? `#${event.receiptHash}` : 'Pending Proof'}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`text-[10px] font-bold ${event.type.includes('Donation') ? 'text-emerald-500' : 'text-blue-400'}`}>{event.amount}</div>
                                        {event.type.includes('Donation') && (
                                            <div className="text-[7px] font-black text-white/10 uppercase tracking-widest group-hover:text-emerald-500/40 transition-colors">Click to Track</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
