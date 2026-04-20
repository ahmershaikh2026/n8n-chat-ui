import { useState, useCallback, useRef } from 'react';

const WEBHOOK_URL = import.meta.env.DEV
  ? '/api/n8n-chat'
  : import.meta.env.VITE_N8N_WEBHOOK_URL?.trim();

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SESSION_ID = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function getErrorMessage(response, payload, fallbackText) {
  if (typeof payload === 'object' && payload !== null && 'message' in payload) {
    const message = payload.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (fallbackText && fallbackText.trim()) {
    return fallbackText.trim();
  }

  return `HTTP ${response.status}: ${response.statusText}`;
}

async function parseResponse(response) {
  const rawText = await response.text();
  let payload = null;

  try {
    payload = rawText ? JSON.parse(rawText) : null;
  } catch {
    payload = rawText ? { output: rawText } : null;
  }

  if (!response.ok) {
    throw Object.assign(new Error(getErrorMessage(response, payload, rawText)), {
      status: response.status,
      payload
    });
  }

  return payload;
}

async function postJson(url, text, sessionId) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chatInput: text,
      sessionId
    })
  });

  return parseResponse(response);
}

async function postFormData(url, input, sessionId) {
  const formData = new FormData();
  formData.append('chatInput', input?.text || '');
  formData.append('sessionId', sessionId);

  if (input?.file) {
    formData.append('file', input.file);
  }

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  return parseResponse(response);
}

function extractAssistantOutput(data) {
  const payload = Array.isArray(data) ? data[0] : data;

  return (
    payload?.output ??
    payload?.response ??
    payload?.message ??
    payload?.text ??
    (typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2))
  );
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef(SESSION_ID);

  const addMessage = useCallback((role, content, file) => {
    const msg = {
      id: generateId(),
      role,
      content,
      file,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const sendMessage = useCallback(async (input) => {
    const text =
      typeof input === 'string'
        ? input.trim()
        : (input?.text || '').trim();

    const file = typeof input === 'object' && input !== null ? input.file : null;

    if ((!text && !file) || isLoading) return;

    if (!WEBHOOK_URL) {
      addMessage('error', 'Missing VITE_N8N_WEBHOOK_URL in .env.');
      return;
    }

    addMessage('user', text || '[Attached file]', file || undefined);
    setIsLoading(true);

    try {
      const data = file
        ? await postFormData(WEBHOOK_URL, { text, file }, sessionIdRef.current)
        : await postJson(WEBHOOK_URL, text, sessionIdRef.current);

      addMessage('assistant', String(extractAssistantOutput(data)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      addMessage('error', `Failed to reach the assistant: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages
  };
}