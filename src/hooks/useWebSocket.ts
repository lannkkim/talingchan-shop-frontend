"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getAccessToken } from "@/lib/axios";

interface UseWebSocketOptions {
  onMessage?: (event: MessageEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (event: Event) => void;
  enabled?: boolean;
}

export function useWebSocket(
  path: string | null,
  options: UseWebSocketOptions = {}
) {
  const { onMessage, onOpen, onClose, onError, enabled = true } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!path || !enabled) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const wsBase = baseUrl.replace(/^http/, "ws");
    const token = getAccessToken();
    const url = `${wsBase}${path}${token ? `?token=${encodeURIComponent(token)}` : ""}`;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      onOpenRef.current?.();
    };

    ws.onmessage = (event) => {
      onMessageRef.current?.(event);
    };

    ws.onclose = () => {
      setIsConnected(false);
      onCloseRef.current?.();
    };

    ws.onerror = (event) => {
      onErrorRef.current?.(event);
    };

    return () => {
      ws.close();
      wsRef.current = null;
      setIsConnected(false);
    };
  }, [path, enabled]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { isConnected, send };
}
