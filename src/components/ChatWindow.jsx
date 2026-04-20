import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator';
import { InputBar } from './InputBar.jsx';
import { useChat } from '../hooks/useChat';
const BOT_NAME = import.meta.env.VITE_BOT_NAME ?? 'QA Assistant';
export function ChatWindow() {
    const { messages, isLoading, sendMessage, clearMessages } = useChat();
    const bottomRef = useRef(null);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);
    return (_jsxs("div", { className: "chat-container", children: [_jsxs("header", { className: "chat-header", children: [_jsxs("div", { className: "header-left", children: [_jsx("span", { className: "bot-avatar", children: "\uD83E\uDD16" }), _jsxs("div", { children: [_jsx("h1", { children: BOT_NAME }), _jsx("p", { className: "header-subtitle", children: "Jira \u00B7 Zephyr Scale \u00B7 AI Powered" })] })] }), _jsx("span", { className: `status-dot ${isLoading ? 'thinking' : 'online'}`, children: isLoading ? 'Thinking…' : 'Online' })] }), _jsxs("div", { className: "messages-area", children: [messages.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("p", { className: "empty-title", children: "How can I help you today?" }), _jsx("div", { className: "suggestions", children: [
                                    'Create test cases for NIN-106',
                                    'Create a bug under story NIN-88. Login button broken.',
                                    'Create test cycle "Sprint 24" in NIN',
                                    'Add all TCs for NIN-92 to test plan NIN-P3'
                                ].map(s => (_jsx("button", { className: "suggestion-chip", onClick: () => sendMessage(s), children: s }, s))) })] })), messages.map(msg => (_jsx(MessageBubble, { message: msg }, msg.id))), isLoading && _jsx(TypingIndicator, {}), _jsx("div", { ref: bottomRef })] }), _jsx(InputBar, { onSend: sendMessage, onClear: clearMessages, disabled: isLoading })] }));
}