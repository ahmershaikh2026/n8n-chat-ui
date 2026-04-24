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
                                    'Rate quality of NIN-XY', 
                                    'What should I test in NIN-XY?',
                                    'Show open bugs for NIN-XY ',
                                    'Show TCs missing steps',                            
                                    'Create story using below description',
                                    'Read the attached requirements document and create separate Jira stories for each requirement ID along with testcases in project NIN',
                                    'Create test cases for NIN-XY',
                                    'Reconcile linked Zephyr test cases against Jira story NIN-XY',
                                    'Log a critical bug for NIN-XY. Fund transfer times out after OTP verification.',
                                    'Create test cycle "Sprint XY" in NIN',
                                    'Create a task "Automation" under story NIN-XY'
                                ].map(s => (
  _jsx("div", {
    className: "suggestion-chip",
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') sendMessage(s);
    },
    children: s
  }, s)
)) })] })), messages.map(msg => (_jsx(MessageBubble, { message: msg }, msg.id))), isLoading && _jsx(TypingIndicator, {}), _jsx("div", { ref: bottomRef })] }), _jsx(InputBar, { onSend: sendMessage, onClear: clearMessages, disabled: isLoading })] }));
}