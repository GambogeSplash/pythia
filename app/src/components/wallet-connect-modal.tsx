"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore, getChainName, getNativeCurrency } from "@/lib/wallet-store";
import type { ProviderType } from "@/lib/wallet-store";

/* ------------------------------------------------------------------ */
/*  Wallet Connect Modal                                               */
/*  3 wallet options: MetaMask, WalletConnect, Coinbase Wallet         */
/*  Post-connect: shows address, chain, balance, disconnect            */
/* ------------------------------------------------------------------ */

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Wallet option config ── */

interface WalletOption {
  id: ProviderType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: "metamask",
    name: "MetaMask",
    description: "Connect with browser extension",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M24.5 3.5L15.2 10.5L16.8 6.3L24.5 3.5Z" fill="#E2761B" stroke="#E2761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.5 3.5L12.7 10.6L11.2 6.3L3.5 3.5Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M21.2 18.9L18.8 22.7L24 24.1L25.5 19L21.2 18.9Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2.5 19L4 24.1L9.2 22.7L6.8 18.9L2.5 19Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12.8L7.6 14.9L12.8 15.1L12.6 9.5L9 12.8Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 12.8L15.3 9.4L15.2 15.1L20.4 14.9L19 12.8Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.2 22.7L12.5 21.1L9.6 19L9.2 22.7Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15.5 21.1L18.8 22.7L18.4 19L15.5 21.1Z" fill="#E4761B" stroke="#E4761B" strokeWidth="0.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "walletconnect",
    name: "WalletConnect",
    description: "Scan QR with mobile wallet",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#3B99FC" />
        <path
          d="M8.4 11.2C11.5 8.1 16.5 8.1 19.6 11.2L20 11.6C20.1 11.7 20.1 11.9 20 12L18.8 13.2C18.7 13.3 18.6 13.3 18.5 13.2L18 12.7C15.8 10.5 12.2 10.5 10 12.7L9.5 13.2C9.4 13.3 9.3 13.3 9.2 13.2L8 12C7.9 11.9 7.9 11.7 8 11.6L8.4 11.2ZM22.1 13.7L23.2 14.8C23.3 14.9 23.3 15.1 23.2 15.2L18.4 20C18.3 20.1 18.1 20.1 18 20L14.8 16.8C14.7 16.7 14.6 16.7 14.5 16.8L11.3 20C11.2 20.1 11 20.1 10.9 20L6.1 15.2C6 15.1 6 14.9 6.1 14.8L7.2 13.7C7.3 13.6 7.5 13.6 7.6 13.7L10.8 16.9C10.9 17 11 17 11.1 16.9L14.3 13.7C14.4 13.6 14.6 13.6 14.7 13.7L17.9 16.9C18 17 18.1 17 18.2 16.9L21.4 13.7C21.5 13.6 21.7 13.6 21.8 13.7L22.1 13.7Z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    description: "Connect with Coinbase",
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="6" fill="#0052FF" />
        <path
          d="M14 4C8.5 4 4 8.5 4 14C4 19.5 8.5 24 14 24C19.5 24 24 19.5 24 14C24 8.5 19.5 4 14 4ZM11.5 11.5C11.5 11.2 11.7 11 12 11H16C16.3 11 16.5 11.2 16.5 11.5V16.5C16.5 16.8 16.3 17 16 17H12C11.7 17 11.5 16.8 11.5 16.5V11.5Z"
          fill="white"
        />
      </svg>
    ),
  },
];

/* ── Animation variants ── */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 400 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.2 },
  }),
};

/* ── Component ── */

export function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const {
    address,
    shortAddress,
    chainId,
    balance,
    isConnecting,
    provider,
    error,
    connect,
    disconnect,
  } = useWalletStore();

  const isConnected = !!address;

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleConnect = async (providerType: ProviderType) => {
    await connect(providerType);
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.15 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-bg-overlay backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[380px] mx-4 rounded-[18px] bg-bg-base-1 overflow-hidden"
            style={{
              boxShadow:
                "inset 0 0 0 1px var(--color-divider-heavy), 0 24px 48px rgba(0,0,0,0.4)",
            }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider)",
              }}
            >
              <h2 className="text-body-14 font-semibold text-text-primary">
                {isConnected ? "Wallet Connected" : "Connect Wallet"}
              </h2>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 rounded-md bg-action-translucent hover:bg-action-translucent-hover transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="text-text-tertiary"
                >
                  <path
                    d="M11 3L3 11M3 3L11 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              {isConnected ? (
                /* ── Connected state ── */
                <div className="space-y-4">
                  {/* Address & Chain */}
                  <div className="rounded-[12px] bg-bg-base-2 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-caption-12 text-text-tertiary">
                        Address
                      </span>
                      <span className="font-mono text-numbers-12 text-text-primary">
                        {shortAddress}
                      </span>
                    </div>
                    <div
                      className="h-px"
                      style={{ background: "var(--color-divider-thin)" }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-caption-12 text-text-tertiary">
                        Network
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-signal-green live-flicker-green" />
                        <span className="text-body-12 text-text-primary">
                          {chainId ? getChainName(chainId) : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div
                      className="h-px"
                      style={{ background: "var(--color-divider-thin)" }}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-caption-12 text-text-tertiary">
                        Balance
                      </span>
                      <span className="font-mono text-numbers-12 text-signal-green">
                        {balance ?? "—"}{" "}
                        {chainId ? getNativeCurrency(chainId) : ""}
                      </span>
                    </div>
                  </div>

                  {/* Provider badge */}
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {WALLET_OPTIONS.find((w) => w.id === provider)?.icon}
                    </div>
                    <span className="text-caption-12 text-text-quaternary capitalize">
                      Connected via {provider}
                    </span>
                  </div>

                  {/* Disconnect */}
                  <button
                    onClick={handleDisconnect}
                    className="w-full py-2.5 rounded-[10px] text-body-12 font-medium text-signal-red bg-signal-red-dim hover:bg-signal-red/20 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                /* ── Wallet selection ── */
                <div className="space-y-2">
                  {WALLET_OPTIONS.map((wallet, i) => (
                    <motion.button
                      key={wallet.id}
                      custom={i}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleConnect(wallet.id)}
                      disabled={isConnecting}
                      className="w-full flex items-center gap-3.5 px-4 py-3 rounded-[12px] bg-bg-base-2 hover:bg-bg-base-3 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px var(--color-divider-thin)",
                      }}
                    >
                      <div className="flex-shrink-0 w-[28px] h-[28px]">
                        {wallet.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-body-12 font-medium text-text-primary group-hover:text-signal-green transition-colors">
                          {wallet.name}
                        </div>
                        <div className="text-caption-12 text-text-quaternary">
                          {wallet.description}
                        </div>
                      </div>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="text-text-quaternary group-hover:text-text-tertiary transition-colors"
                      >
                        <path
                          d="M6 4L10 8L6 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.button>
                  ))}

                  {/* Connecting spinner */}
                  {isConnecting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2 py-3"
                    >
                      <div className="w-4 h-4 border-2 border-signal-green/30 border-t-signal-green rounded-full animate-spin" />
                      <span className="text-caption-12 text-text-tertiary">
                        Connecting...
                      </span>
                    </motion.div>
                  )}

                  {/* Error message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-[8px] bg-signal-red-dim px-3 py-2.5 text-caption-12 text-signal-red"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 text-center"
              style={{
                boxShadow: "inset 0 1px 0 0 var(--color-divider-thin)",
              }}
            >
              <span className="text-caption-12 text-text-quaternary">
                Polymarket uses Polygon (Chain ID 137)
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
