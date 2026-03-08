"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, X, Send, Sparkles } from "lucide-react";
import { useAIChat } from "@/hooks/use-ai";

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  marketContext?: string;
}

const SUGGESTED_PROMPTS = [
  "Analyze top movers",
  "Find arbitrage opportunities",
  "Risk assessment for my portfolio",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-signal-green"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
}

export function AIChatPanel({ isOpen, onClose, marketContext }: AIChatPanelProps) {
  const { messages, isStreaming, sendMessage, clearMessages } =
    useAIChat(marketContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-[420px] flex-col bg-bg-base-1"
            style={{
              boxShadow:
                "inset 1px 0 0 0 var(--color-divider-heavy), -8px 0 32px -4px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                boxShadow: "inset 0 -1px 0 0 var(--color-divider-heavy)",
              }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-green/10">
                <Brain className="h-4 w-4 text-signal-green" />
              </div>
              <div className="flex-1">
                <h2 className="text-caption-12 font-semibold text-text-primary">
                  Pythia AI
                </h2>
                <span className="flex items-center gap-1 text-[10px] text-text-quaternary">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-green opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal-green" />
                  </span>
                  Online
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearMessages}
                  className="flex h-7 items-center gap-1 rounded-[6px] bg-action-secondary px-2.5 text-[10px] text-text-secondary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary"
                >
                  Clear
                </button>
                <button
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-action-secondary text-text-secondary transition-colors duration-150 hover:bg-action-secondary-hover hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-green/10">
                    <Sparkles className="h-7 w-7 text-signal-green" />
                  </div>
                  <h3 className="mt-4 text-body-12 font-semibold text-text-primary">
                    Ask Pythia anything
                  </h3>
                  <p className="mt-1 text-center text-[11px] leading-relaxed text-text-quaternary">
                    Market analysis, trading signals, risk assessment,
                    <br />
                    arbitrage detection, and more.
                  </p>

                  {/* Suggested prompts */}
                  <div className="mt-6 flex flex-col gap-2 w-full">
                    {SUGGESTED_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handlePromptClick(prompt)}
                        className="flex items-center gap-2 rounded-[10px] bg-bg-base-2 px-3 py-2.5 text-left text-body-12 text-text-secondary transition-colors duration-150 hover:bg-bg-base-3 hover:text-text-primary"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px var(--color-divider-thin)",
                        }}
                      >
                        <Sparkles className="h-3 w-3 shrink-0 text-signal-green" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`mb-3 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] ${msg.role === "user" ? "" : "flex gap-2"}`}
                  >
                    {/* AI avatar */}
                    {msg.role === "assistant" && (
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal-green/10">
                        <Brain className="h-3 w-3 text-signal-green" />
                      </div>
                    )}

                    <div>
                      {msg.role === "assistant" && (
                        <span className="mb-1 block text-[10px] font-medium text-signal-green">
                          Pythia AI
                        </span>
                      )}
                      <div
                        className={`rounded-[12px] px-3 py-2 ${
                          msg.role === "user"
                            ? "bg-bg-base-3 text-body-12 text-text-primary"
                            : "bg-bg-base-2 text-body-12 text-text-secondary"
                        }`}
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px var(--color-divider-thin)",
                        }}
                      >
                        {msg.content ? (
                          <div className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </div>
                        ) : (
                          <TypingDots />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Streaming indicator when last message is still empty */}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1].content.length > 0 && (
                  <div className="mb-3 flex justify-start">
                    <div className="flex gap-2">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-signal-green/10">
                        <Brain className="h-3 w-3 text-signal-green" />
                      </div>
                      <TypingDots />
                    </div>
                  </div>
                )}
            </div>

            {/* Input area */}
            <div
              className="px-4 py-3"
              style={{
                boxShadow: "inset 0 1px 0 0 var(--color-divider-heavy)",
              }}
            >
              <div
                className="flex items-center gap-2 rounded-[12px] bg-bg-base-2 px-3 py-2"
                style={{
                  boxShadow: "inset 0 0 0 1px var(--color-divider-heavy)",
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about markets, strategies, risk..."
                  disabled={isStreaming}
                  className="flex-1 bg-transparent text-body-12 text-text-primary placeholder:text-text-quaternary outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signal-green text-bg-base-0 transition-all duration-150 hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1.5 text-center text-[9px] text-text-quaternary">
                AI-generated analysis. Not financial advice. DYOR.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
