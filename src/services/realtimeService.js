import api from './api';
import { getAccessToken } from './auth';

const DEFAULT_TOPICS = [];
const PUBLIC_TOPICS = new Set(['catalog.updated']);

let socket = null;
let reconnectTimer = null;
let reconnectAttempt = 0;
let connectPromise = null;
const listeners = new Set();
const seenEventIds = new Map();
let subscribedTopics = new Set(DEFAULT_TOPICS);
let activeSocketTopics = new Set();
let activeSocketAuthMode = null;

function buildWsUrl(path, wsAccess) {
  const apiBase = import.meta.env.VITE_API_URL || 'https://jean-emmanuel-diap.com/lid';
  const url = new URL(path || '/api/v1/realtime/ws', apiBase);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('ws-access', wsAccess);
  return url.toString();
}

function rememberEventId(eventId) {
  if (!eventId) return false;
  const now = Date.now();
  const previous = seenEventIds.get(eventId);
  if (previous && now - previous < 60_000) {
    return true;
  }
  seenEventIds.set(eventId, now);
  if (seenEventIds.size > 500) {
    for (const [id, ts] of seenEventIds.entries()) {
      if (now - ts > 120_000) {
        seenEventIds.delete(id);
      }
    }
  }
  return false;
}

async function connect() {
  if (connectPromise) {
    return connectPromise;
  }
  connectPromise = (async () => {
    try {
      const token = getAccessToken();
      const requestedTopics = Array.from(subscribedTopics);
      const publicTopics = requestedTopics.filter((topic) => PUBLIC_TOPICS.has(topic));
      let topics = token ? requestedTopics : publicTopics;
      let authMode = token ? 'private' : 'public';
      if (topics.length === 0) {
        activeSocketTopics = new Set();
        activeSocketAuthMode = authMode;
        return;
      }

      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        const hasAllTopics = topics.every((topic) => activeSocketTopics.has(topic));
        if (hasAllTopics && activeSocketAuthMode === authMode) {
          return;
        }
        try {
          socket.close();
        } catch {
          // ignore close errors
        }
        socket = null;
      }

      let data = null;
      try {
        const path = authMode === 'private' ? '/api/v1/realtime/ws-access' : '/api/v1/realtime/ws-access/public';
        const response = await api.post(path, { topics });
        data = response?.data;
      } catch (err) {
        if (authMode === 'private' && publicTopics.length > 0) {
          authMode = 'public';
          topics = publicTopics;
          const fallback = await api.post('/api/v1/realtime/ws-access/public', { topics });
          data = fallback?.data;
        } else {
          throw err;
        }
      }
      const wsAccess = data?.['ws-access'] || data?.wsAccess || data?.ticket;
      if (!wsAccess) return;

      activeSocketTopics = new Set(topics);
      activeSocketAuthMode = authMode;

      socket = new WebSocket(buildWsUrl(data?.wsPath, wsAccess));
      socket.onopen = () => {
        reconnectAttempt = 0;
      };
      socket.onmessage = (event) => {
        let payload = null;
        try {
          payload = JSON.parse(event?.data || '{}');
        } catch {
          return;
        }
        if (rememberEventId(payload?.eventId)) {
          return;
        }
        listeners.forEach((listener) => {
          try {
            listener(payload);
          } catch {
            // ignore listener errors
          }
        });
      };
      socket.onclose = scheduleReconnect;
      socket.onerror = scheduleReconnect;
    } catch {
      scheduleReconnect();
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

function scheduleReconnect() {
  if (typeof window === 'undefined' || reconnectTimer || listeners.size === 0) {
    return;
  }
  reconnectAttempt += 1;
  const delay = Math.min(15_000, 1_000 * 2 ** Math.min(reconnectAttempt, 4));
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect().catch(() => {});
  }, delay);
}

function shutdownIfUnused() {
  if (listeners.size > 0) {
    return;
  }
  if (typeof window !== 'undefined' && reconnectTimer) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempt = 0;
  if (socket) {
    try {
      socket.close();
    } catch {
      // ignore
    }
    socket = null;
  }
  activeSocketTopics = new Set();
  activeSocketAuthMode = null;
}

export function subscribeFrontendRealtime(listener, topics = DEFAULT_TOPICS) {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
    return () => {};
  }
  if (Array.isArray(topics) && topics.length > 0) {
    topics.forEach((topic) => {
      if (topic) subscribedTopics.add(String(topic));
    });
  }

  listeners.add(listener);
  connect().catch(() => {});

  return () => {
    listeners.delete(listener);
    shutdownIfUnused();
  };
}
