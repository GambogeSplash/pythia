import { useState, useCallback, useRef } from "react";
import useSWR from "swr";
import type { AISignal } from "@/app/api/ai/signals/route";

/* ------------------------------------------------------------------ */
/*  useAIAnalysis — fetch streaming AI analysis for a market           */
/* ------------------------------------------------------------------ */

interface UseAIAnalysisReturn {
  analysis: string;
  isLoading: boolean;
  error: string | null;
  refetch: (question?: string) => void;
}

export function useAIAnalysis(marketId: string | null): UseAIAnalysisReturn {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refetch = useCallback(
    async (question?: string) => {
      if (!marketId) return;

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      setAnalysis("");

      try {
        const res = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ marketId, question }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setAnalysis(accumulated);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Analysis failed");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [marketId],
  );

  return { analysis, isLoading, error, refetch };
}

/* ------------------------------------------------------------------ */
/*  useAISignals — fetch AI trading signals with SWR auto-refresh      */
/* ------------------------------------------------------------------ */

const signalsFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`API error: ${r.status}`);
    return r.json();
  });

interface UseAISignalsReturn {
  signals: AISignal[];
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

export function useAISignals(): UseAISignalsReturn {
  const { data, error, isLoading, mutate } = useSWR<{ data: AISignal[] }>(
    "/api/ai/signals",
    signalsFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
      refreshInterval: 5 * 60 * 1000, // auto-refresh every 5 minutes
    },
  );

  return {
    signals: data?.data ?? [],
    isLoading,
    isError: !!error,
    error,
    mutate: () => { mutate(); },
  };
}

/* ------------------------------------------------------------------ */
/*  useAIChat — manage conversational AI chat state                    */
/* ------------------------------------------------------------------ */

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
}

export function useAIChat(marketContext?: string): UseAIChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
        timestamp: Date.now(),
      };

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);
      setError(null);

      // Abort any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const apiMessages = [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages, marketContext }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          const text = accumulated;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content: text } : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errMsg = err instanceof Error ? err.message : "Chat failed";
          setError(errMsg);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: "Sorry, I encountered an error. Please try again." }
                : m,
            ),
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming, marketContext],
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearMessages };
}
