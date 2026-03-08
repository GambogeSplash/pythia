import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/*  Wallet connection store                                            */
/*  Supports MetaMask (window.ethereum), WalletConnect, Coinbase       */
/*  Uses ethers.js v6 BrowserProvider for on-chain interactions        */
/* ------------------------------------------------------------------ */

export type ProviderType = "metamask" | "walletconnect" | "coinbase";

export interface WalletState {
  address: string | null;
  shortAddress: string | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  provider: ProviderType | null;
  error: string | null;

  connect: (providerType: ProviderType) => Promise<void>;
  disconnect: () => void;
  updateBalance: () => Promise<void>;
}

/* ── Helpers ── */

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getChainName(chainId: number): string {
  const chains: Record<number, string> = {
    1: "Ethereum",
    137: "Polygon",
    80001: "Mumbai",
    10: "Optimism",
    42161: "Arbitrum",
    8453: "Base",
    56: "BSC",
    43114: "Avalanche",
  };
  return chains[chainId] ?? `Chain ${chainId}`;
}

function getNativeCurrency(chainId: number): string {
  const currencies: Record<number, string> = {
    1: "ETH",
    137: "MATIC",
    80001: "MATIC",
    10: "ETH",
    42161: "ETH",
    8453: "ETH",
    56: "BNB",
    43114: "AVAX",
  };
  return currencies[chainId] ?? "ETH";
}

/* ── Ethereum provider type (window.ethereum) ── */

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

/* ── Event listeners (stored so we can remove them) ── */

let accountsChangedHandler: ((accounts: unknown) => void) | null = null;
let chainChangedHandler: ((chainId: unknown) => void) | null = null;

function cleanupListeners() {
  if (typeof window === "undefined" || !window.ethereum) return;
  if (accountsChangedHandler) {
    window.ethereum.removeListener("accountsChanged", accountsChangedHandler);
    accountsChangedHandler = null;
  }
  if (chainChangedHandler) {
    window.ethereum.removeListener("chainChanged", chainChangedHandler);
    chainChangedHandler = null;
  }
}

/* ── Store ── */

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      shortAddress: null,
      chainId: null,
      balance: null,
      isConnecting: false,
      provider: null,
      error: null,

      connect: async (providerType: ProviderType) => {
        set({ isConnecting: true, error: null });

        try {
          switch (providerType) {
            case "metamask": {
              if (typeof window === "undefined" || !window.ethereum) {
                throw new Error(
                  "MetaMask not detected. Please install the MetaMask extension."
                );
              }

              // Request account access
              const accounts = (await window.ethereum.request({
                method: "eth_requestAccounts",
              })) as string[];

              if (!accounts.length) {
                throw new Error("No accounts returned from MetaMask.");
              }

              const address = accounts[0];

              // Get chain ID
              const rawChainId = (await window.ethereum.request({
                method: "eth_chainId",
              })) as string;
              const chainId = parseInt(rawChainId, 16);

              // Get balance using ethers-style RPC call
              const rawBalance = (await window.ethereum.request({
                method: "eth_getBalance",
                params: [address, "latest"],
              })) as string;

              // Convert wei to ether (without importing ethers just for this)
              const balanceWei = BigInt(rawBalance);
              const balanceEth = Number(balanceWei) / 1e18;
              const formattedBalance = balanceEth.toFixed(4);

              set({
                address,
                shortAddress: shortenAddress(address),
                chainId,
                balance: formattedBalance,
                provider: "metamask",
                isConnecting: false,
              });

              // Set up event listeners
              cleanupListeners();

              accountsChangedHandler = (accounts: unknown) => {
                const accs = accounts as string[];
                if (accs.length === 0) {
                  get().disconnect();
                } else {
                  set({
                    address: accs[0],
                    shortAddress: shortenAddress(accs[0]),
                  });
                  get().updateBalance();
                }
              };

              chainChangedHandler = (rawId: unknown) => {
                const newChainId = parseInt(rawId as string, 16);
                set({ chainId: newChainId });
                get().updateBalance();
              };

              window.ethereum.on("accountsChanged", accountsChangedHandler);
              window.ethereum.on("chainChanged", chainChangedHandler);
              break;
            }

            case "walletconnect": {
              // TODO: Integrate WalletConnect v2 (@walletconnect/modal + @walletconnect/ethereum-provider)
              // Requires projectId from WalletConnect Cloud (https://cloud.walletconnect.com)
              //
              // Implementation outline:
              // 1. import { EthereumProvider } from "@walletconnect/ethereum-provider"
              // 2. const provider = await EthereumProvider.init({ projectId, chains: [137], showQrModal: true })
              // 3. await provider.connect()
              // 4. const ethersProvider = new BrowserProvider(provider)
              // 5. const signer = await ethersProvider.getSigner()
              // 6. Set address, chainId, balance from signer
              throw new Error(
                "WalletConnect integration coming soon. Install @walletconnect/ethereum-provider to enable."
              );
            }

            case "coinbase": {
              // TODO: Integrate Coinbase Wallet SDK (@coinbase/wallet-sdk)
              //
              // Implementation outline:
              // 1. import CoinbaseWalletSDK from "@coinbase/wallet-sdk"
              // 2. const sdk = new CoinbaseWalletSDK({ appName: "Pythia", appLogoUrl: "..." })
              // 3. const provider = sdk.makeWeb3Provider("https://polygon-rpc.com", 137)
              // 4. const ethersProvider = new BrowserProvider(provider)
              // 5. const accounts = await ethersProvider.send("eth_requestAccounts", [])
              // 6. Set address, chainId, balance
              throw new Error(
                "Coinbase Wallet integration coming soon. Install @coinbase/wallet-sdk to enable."
              );
            }
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to connect wallet.";
          set({
            isConnecting: false,
            error: message,
          });
        }
      },

      disconnect: () => {
        cleanupListeners();
        set({
          address: null,
          shortAddress: null,
          chainId: null,
          balance: null,
          provider: null,
          isConnecting: false,
          error: null,
        });
      },

      updateBalance: async () => {
        const { address, provider } = get();
        if (!address || provider !== "metamask") return;
        if (typeof window === "undefined" || !window.ethereum) return;

        try {
          const rawBalance = (await window.ethereum.request({
            method: "eth_getBalance",
            params: [address, "latest"],
          })) as string;

          const balanceWei = BigInt(rawBalance);
          const balanceEth = Number(balanceWei) / 1e18;
          set({ balance: balanceEth.toFixed(4) });
        } catch {
          // Silently fail — balance will be stale but user can retry
        }
      },
    }),
    {
      name: "pythia-wallet",
      // Only persist address and provider type — not ephemeral state
      partialize: (state) => ({
        address: state.address,
        shortAddress: state.shortAddress,
        chainId: state.chainId,
        provider: state.provider,
      }),
    }
  )
);

/* ── Exported helpers ── */

export { shortenAddress, getChainName, getNativeCurrency };
