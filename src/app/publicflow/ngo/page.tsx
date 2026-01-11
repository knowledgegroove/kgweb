"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Wallet, Shield, ArrowUpRight, BarChart3,
    Search, Info, CheckCircle2, Globe, Activity, CreditCard, ChevronLeft, Truck
} from "lucide-react";
import { connectWallet, sendDonation, sendUSDCDonation, getTransparencyEvents, getTreasuryBalance, getAccountBalance, getUSDCBalance, watchUSDC, NGO_CONFIG } from "@/lib/web3";
import { ethers } from "ethers";

interface HistoryEvent {
    id: string;
    type: string;
    name: string;
    from?: string;
    to?: string | null;
    amount: string;
    timestamp: string;
    receiptHash: string;
    blockNumber: number;
    purpose?: string;
    destination?: string;
    goods?: string;
}

export default function NGOPage() {
    const [account, setAccount] = useState<string | null>(null);
    const [treasuryBalance, setTreasuryBalance] = useState("0.0");
    const [usdcBalance, setUsdcBalance] = useState("0.0");
    const [events, setEvents] = useState<HistoryEvent[]>([]);
    const [disbursing, setDisbursing] = useState(false);
    const [disburseAmount, setDisburseAmount] = useState("");
    const [recipient, setRecipient] = useState("0xC42700c26467402582ec76f0e94dcc4564b9bef4");
    const [purpose, setPurpose] = useState("Logistics");
    const [supplierId, setSupplierId] = useState("SUP-7921");
    const [settlementPath, setSettlementPath] = useState<'usdc_direct' | 'fiat_offramp'>('usdc_direct');
    const [assetType, setAssetType] = useState<'usdc' | 'eth'>('usdc');
    const [merchantInfo, setMerchantInfo] = useState("Amazon Store #7921");
    const [authorizedSignatures, setAuthorizedSignatures] = useState(["Admin_1", "Audit_Bot_6"]);

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

            const uBalance = await getUSDCBalance(NGO_CONFIG.treasury);
            setUsdcBalance(parseFloat(uBalance).toFixed(2));
        } catch (err) {
            console.error("Failed to fetch data", err);
        }
    };

    const handleConnect = async () => {
        try {
            const { account: connectedAddress } = await connectWallet(true);

            // Strict NGO Admin Identity Check
            if (connectedAddress.trim().toLowerCase() !== NGO_CONFIG.admin.toLowerCase()) {
                alert(`Access Denied!\n\nPlease switch to the NGO Admin Controller (Account 2: ${NGO_CONFIG.admin.substring(0, 10)}...) to access this portal.`);
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
            let tx;
            if (settlementPath === 'usdc_direct') {
                // Direct on-chain settlement
                if (assetType === 'usdc') {
                    tx = await sendUSDCDonation(disburseAmount, recipient);
                } else {
                    tx = await sendDonation(disburseAmount, recipient);
                }
            } else {
                // Off-ramp settlement (Assume USDC is used for the fiat bridge)
                tx = await sendUSDCDonation(disburseAmount, NGO_CONFIG.offRampAddress);
            }

            await tx.wait();
            setDisburseAmount("");
            fetchData();

            const summary = settlementPath === 'fiat_offramp'
                ? `Off-Ramp Triggered!\n\nUSDC converted to USD via regulated bridge.\nFinal Destination: ${merchantInfo}\nPurpose: ${purpose}`
                : `Funds sent via ${assetType.toUpperCase()} to verified vendor wallet: ${recipient}`;

            alert(`Spend Authorized!\n\n${summary}\n\nRecord pushed to PublicFlow Vault.`);
        } catch (err: any) {
            console.error(err);
            alert(`Disbursement failed: ${err.message || 'Transaction rejected.'}`);
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
                    <h2 className="text-3xl font-bold mb-4 tracking-tighter">Vault Controller</h2>
                    <p className="text-white/40 text-sm mb-10 leading-relaxed font-medium">
                        Connect the <b>Authorized Signer Wallet (Account 2)</b> to request disbursements from the PublicFlow Vault.
                    </p>

                    <button
                        onClick={handleConnect}
                        className="w-full py-5 rounded-3xl bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-[0_10px_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                    >
                        <Wallet size={24} className="w-5 h-5 font-bold" />
                        Connect Admin Signer
                    </button>
                    <p className="mt-6 text-[9px] text-white/20 uppercase tracking-widest font-bold">Smart Contract Rules Enforced</p>
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
                            <h1 className="text-xl font-semibold tracking-tight text-glow">Vault Controller</h1>
                            <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">NGO Internal Governance</div>
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
                                <Activity size={32} className="w-24 h-24 text-emerald-500" />
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">PublicFlow Vault Assets</div>
                            <div className="text-4xl font-black text-glow mb-2">{usdcBalance} <span className="text-lg font-normal text-white/40">USDC</span></div>
                            <div className="text-xs font-bold text-white/20 mb-4 flex items-center gap-2">
                                <Shield size={12} className="text-blue-500" /> Contract Secured
                            </div>
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

                        <div className="space-y-6 max-w-xl">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Purpose Code</label>
                                    <select
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:border-blue-500/50 outline-none transition-all appearance-none"
                                    >
                                        <option value="Food & Water">Food & Water</option>
                                        <option value="Logistics">Logistics</option>
                                        <option value="Amazon Purchase">Amazon Purchase</option>
                                        <option value="Medical Supplies">Medical Supplies</option>
                                        <option value="Education">Education</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Supplier ID</label>
                                    <input
                                        type="text"
                                        value={supplierId}
                                        onChange={(e) => setSupplierId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono focus:border-blue-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Settlement Path</label>
                                    <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                                        <button
                                            onClick={() => setSettlementPath('usdc_direct')}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settlementPath === 'usdc_direct' ? 'bg-blue-500 text-white' : 'text-white/30'}`}
                                        > Direct Crypto </button>
                                        <button
                                            onClick={() => {
                                                setSettlementPath('fiat_offramp');
                                                setAssetType('usdc'); // Force USDC for off-ramp
                                            }}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${settlementPath === 'fiat_offramp' ? 'bg-blue-500 text-white' : 'text-white/30'}`}
                                        > Off-Ramp </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Asset Type</label>
                                    <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
                                        <button
                                            disabled={settlementPath === 'fiat_offramp'}
                                            onClick={() => setAssetType('usdc')}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${assetType === 'usdc' ? 'bg-blue-500 text-white' : 'text-white/30'}`}
                                        > USDC </button>
                                        <button
                                            disabled={settlementPath === 'fiat_offramp'}
                                            onClick={() => setAssetType('eth')}
                                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${assetType === 'eth' ? 'bg-blue-500 text-white' : 'text-white/30'} ${settlementPath === 'fiat_offramp' ? 'opacity-20 cursor-not-allowed' : ''}`}
                                        > ETH </button>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">
                                    {settlementPath === 'usdc_direct' ? 'Vendor Wallet Address' : 'Off-Ramp Payout Destination (Amazon, Bank, etc.)'}
                                </label>
                                <input
                                    type="text"
                                    value={settlementPath === 'usdc_direct' ? recipient : merchantInfo}
                                    onChange={(e) => settlementPath === 'usdc_direct' ? setRecipient(e.target.value) : setMerchantInfo(e.target.value)}
                                    placeholder={settlementPath === 'usdc_direct' ? '0x...' : 'e.g. Amazon.com Invoice #123'}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono focus:border-blue-500/50 outline-none transition-all"
                                />
                                {settlementPath === 'fiat_offramp' && (
                                    <p className="mt-2 text-[9px] text-white/20 uppercase tracking-widest font-bold">Funds will be bridged to: {NGO_CONFIG.offRampAddress.substring(0, 10)}...</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-3 block">Spend Request Amount</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={disburseAmount}
                                        onChange={(e) => setDisburseAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-6 text-2xl font-black focus:border-blue-500/50 outline-none transition-all"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/20">
                                        {settlementPath === 'fiat_offramp' ? 'USDC (for conversion)' : assetType.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleDisbursement}
                                disabled={disbursing || account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase()}
                                className={`w-full py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:hover:scale-100 ${account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() ? 'bg-white/5 text-white/20' : 'bg-blue-500 text-white shadow-blue-500/30'}`}
                            >
                                {disbursing ? <Activity className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
                                {account.toLowerCase() !== NGO_CONFIG.treasury.toLowerCase() ? "Connect Treasury to Authorize" : "Push to PublicFlow Contract"}
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
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold">{event.name}</span>
                                            <span className="text-[8px] font-black uppercase text-white/20 tracking-widest">{event.type}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold ${event.type.includes('Donation') ? 'text-emerald-500' : 'text-blue-400'}`}>{event.amount}</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1">
                                        {event.purpose && event.purpose !== "N/A" && (
                                            <div className="flex justify-between text-[8px] uppercase tracking-wider">
                                                <span className="text-white/20 font-bold">Purpose:</span>
                                                <span className="text-white/40">{event.purpose}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-[8px] uppercase tracking-wider">
                                            <span className="text-white/20 font-bold">Proof:</span>
                                            <span className="text-blue-500/50 font-mono">#{event.receiptHash}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
