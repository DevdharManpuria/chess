import { useEffect, useState } from "react";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
const MAX_RETRY_DELAY_MS = 10_000;

export const useSocket = () => {
    const [socket,setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        let current: WebSocket | null = null;
        let retryTimer: ReturnType<typeof setTimeout> | undefined;
        let attempt = 0;
        let stopped = false;

         const connect = () => {
            const ws = new WebSocket(WS_URL);
            current = ws;

            ws.onopen = () => {
                attempt = 0;
                setSocket(ws);
            };

            ws.onclose = () => {
                setSocket(null);
                if (stopped) return;
                // Retry after 1s, 2s, 4s, 8s, then every 10s.
                // Covers Render's cold start, where the first attempts can fail while the server wakes up.
                const delay = Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS);
                attempt++;
                retryTimer = setTimeout(connect, delay);
            };
        };

        connect();
        return () => {
            stopped = true;
            clearTimeout(retryTimer);
            current?.close();
        };
    }, [])

    return socket;
}