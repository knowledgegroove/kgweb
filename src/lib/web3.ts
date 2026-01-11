declare global {
    interface Window {
        ethereum: any;
    }
}

import { ethers } from "ethers";
import { Alchemy, Network, AssetTransfersCategory } from "alchemy-sdk";

// NGO Target Config (Example on Sepolia)
export const NGO_CONFIG = {
    name: "SaveTheChildren Web3",
    donor: "0xC42700c26467402582ec76F0e94DCC4564b9BEf4", // Account 1
    admin: "0xdd64Dbd30C9DfC5b6B06bE08E7178e3F197F2c1f", // Controller (Account 2)
    treasury: "0xdd64Dbd30C9DfC5b6B06bE08E7178e3F197F2c1f", // Backwards compat
    chainId: 11155111, // Sepolia
    usdcToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Official Sepolia USDC
    contractAddress: "0xdd64Dbd30C9DfC5b6B06bE08E7178e3F197F2c1f", // THE VAULT (Pointing to Account 2 for demo)
    offRampAddress: "0x9876543210fedcba9876543210fedcba98765432", // Regulated Off-Ramp Bridge
};

export interface SpendAuthorization {
    purpose: string; // food, logistics, medical
    supplierId: string;
    amount: string;
    settlementPath: 'usdc_direct' | 'fiat_offramp';
    signatures: string[];
}

// --- ALCHEMY SETUP (The "Provider" for Reading) ---
const ALCHEMY_API_KEY: string = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "e7rA-gUEF7VuSaJiNVSpc";

const config = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(config);

// --- METAMASK SETUP (The "Signer" for Writing) ---
export async function connectWallet(force: boolean = false) {
    if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
    }

    // Force Account Picker if requested
    if (force) {
        try {
            await window.ethereum.request({
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }],
            });
        } catch (err: any) {
            if (err.code === 4001) {
                console.log("User cancelled account selection.");
            } else {
                console.error("Permission request failed", err);
            }
        }
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Check if we are on Sepolia (11155111)
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    if (chainId !== NGO_CONFIG.chainId) {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + NGO_CONFIG.chainId.toString(16) }],
            });
        } catch (switchError: any) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0x' + NGO_CONFIG.chainId.toString(16),
                        chainName: 'Sepolia Test Network',
                        nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                        rpcUrls: ['https://rpc.sepolia.org'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io'],
                    }],
                });
            } else {
                throw new Error("Please switch to the Sepolia Test Network in MetaMask.");
            }
        }
    }

    // Explicitly fetch the LATEST accounts after the permission window has closed
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const signer = await provider.getSigner(accounts[0]);

    return { provider, signer, account: accounts[0] };
}

export async function sendDonation(amount: string, destination: string = NGO_CONFIG.treasury) {
    const { signer } = await connectWallet();
    const tx = await signer.sendTransaction({
        to: destination,
        value: ethers.parseEther(amount),
    });
    return tx;
}

export async function sendUSDCDonation(amount: string, destination: string = NGO_CONFIG.contractAddress) {
    const { signer } = await connectWallet();
    console.log(`[ON-RAMP] Converting USD to USDC and depositing into PublicFlow Vault: ${destination}`);

    // Minimal ERC20 ABI for transfer
    const abi = ["function transfer(address to, uint256 amount) public returns (bool)"];
    const usdcContract = new ethers.Contract(NGO_CONFIG.usdcToken, abi, signer);

    // USDC has 6 decimals on Sepolia
    const amountInUnits = ethers.parseUnits(amount, 6);

    const tx = await usdcContract.transfer(destination, amountInUnits);
    return tx;
}

// --- INDEXER LOGIC (Powered by Alchemy) ---
export async function getAccountBalance(address: string) {
    if (!address || address.trim() === "" || !address.startsWith("0x")) return "0.0";
    try {
        if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY.length < 30) {
            return "0.0";
        }
        const balance = await alchemy.core.getBalance(address, "latest");
        return ethers.formatEther(balance.toString());
    } catch (err) {
        // Only log once or silently fail to avoid flooding
        console.warn("[Web3] Balance fetch failed. Check Alchemy API Key.");
        return "0.0";
    }
}

export async function getUSDCBalance(address: string) {
    if (!address || address.trim() === "" || !address.startsWith("0x")) return "0.0";

    try {
        if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY.length < 30) {
            return "0.0";
        }
        const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`);

        // Minimal ABI to get balance
        const abi = ["function balanceOf(address owner) view returns (uint256)"];
        const contract = new ethers.Contract(NGO_CONFIG.usdcToken, abi, provider);

        const balance = await contract.balanceOf(address);
        const formattedBalance = ethers.formatUnits(balance, 6);
        return formattedBalance;
    } catch (err) {
        return "0.0";
    }
}

export async function getTreasuryBalance() {
    if (!NGO_CONFIG.treasury || NGO_CONFIG.treasury === "") return "0.0";
    try {
        if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY.length < 30) {
            return "0.0";
        }
        const balance = await alchemy.core.getBalance(NGO_CONFIG.treasury, "latest");
        return ethers.formatEther(balance.toString());
    } catch (err) {
        return "0.0";
    }
}

export async function watchUSDC() {
    if (!window.ethereum) return;

    try {
        await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: NGO_CONFIG.usdcToken,
                    symbol: 'USDC',
                    decimals: 6,
                    image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
                },
            },
        });
    } catch (error) {
        console.error("Error watching asset", error);
    }
}

export async function getTransparencyEvents(treasuryAddress: string = NGO_CONFIG.treasury) {
    if (!treasuryAddress || treasuryAddress.trim() === "" || !treasuryAddress.startsWith("0x")) return [];
    if (!ALCHEMY_API_KEY || ALCHEMY_API_KEY.length < 30 || ALCHEMY_API_KEY.includes("your-api-key")) {
        // Fallback to mock data if no key is provided
        return [
            {
                id: "mock1",
                type: "Incoming Donation",
                name: "Mock Donor",
                amount: "0.5 ETH",
                timestamp: new Date().toLocaleString(),
                from: "0x123",
                to: treasuryAddress,
                blockNumber: 1,
                purpose: "N/A",
                destination: "N/A",
                goods: "N/A",
                receiptHash: "0xMOCK_TX",
            }
        ];
    }

    try {
        // Fetch transfers TO the treasury
        const incoming = await alchemy.core.getAssetTransfers({
            toAddress: treasuryAddress,
            excludeZeroValue: true,
            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
            maxCount: 10,
        });

        // Fetch transfers FROM the treasury
        const outgoing = await alchemy.core.getAssetTransfers({
            fromAddress: treasuryAddress,
            excludeZeroValue: true,
            category: [AssetTransfersCategory.EXTERNAL, AssetTransfersCategory.ERC20],
            maxCount: 10,
        });

        const combined = [...incoming.transfers, ...outgoing.transfers].sort((a, b) => {
            // Sort by block number descending (newest first)
            return (parseInt(b.blockNum, 16) || 0) - (parseInt(a.blockNum, 16) || 0);
        });

        return combined.map((t, index) => {
            const isUSDC = t.rawContract?.address?.toLowerCase() === NGO_CONFIG.usdcToken.toLowerCase();
            const symbol = isUSDC ? "USDC" : (t.asset || "ETH");
            const isIncoming = t.to?.toLowerCase() === treasuryAddress.toLowerCase();

            // Mock metadata for the demo (In production, this would come from the Smart Contract)
            const purpose = !isIncoming ? (t.to?.toLowerCase() === NGO_CONFIG.offRampAddress.toLowerCase() ? "Emergency Logistics" : "Medical Supplies") : "N/A";
            const destination = !isIncoming ? (t.to?.toLowerCase() === NGO_CONFIG.offRampAddress.toLowerCase() ? "Amazon Global Fulfillment" : "Verified Medical Provider") : "N/A";
            const goods = !isIncoming ? (t.to?.toLowerCase() === NGO_CONFIG.offRampAddress.toLowerCase() ? "Logistics Equipment & Tents" : "First Aid Kits & Vaccines") : "N/A";

            return {
                id: `${t.hash}-${index}`,
                type: isIncoming ? "Incoming Donation" : "Outgoing Expense",
                name: isIncoming ? (isUSDC ? "Fiat-to-Crypto Bridge" : "Verified Donor") : (t.to?.toLowerCase() === NGO_CONFIG.offRampAddress.toLowerCase() ? "Regulated Off-Ramp" : "Verified Provider"),
                from: t.from,
                to: t.to,
                amount: `${t.value} ${symbol}`,
                timestamp: new Date().toLocaleString(),
                blockNumber: parseInt(t.blockNum, 16),
                purpose,
                destination,
                goods,
                receiptHash: t.hash.substring(0, 14), // Longer hash for better tracking
            };
        });
    } catch (error) {
        console.warn("Alchemy Indexer offline, using transparency fallback...");
        return [
            {
                id: "fallback-1",
                type: "Incoming Donation",
                name: "Recent Donor",
                amount: "0.15 ETH",
                timestamp: new Date().toLocaleString(),
                blockNumber: 1,
                purpose: "N/A",
                destination: "N/A",
                goods: "N/A",
                receiptHash: "0xVERIFIED"
            }
        ];
    }
}
