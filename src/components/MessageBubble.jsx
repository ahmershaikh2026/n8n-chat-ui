import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
export function MessageBubble({ message }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const time = message.timestamp.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    return (
        <div className={`message-wrapper ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
                {message.role === 'user' ? (
                    <>
                        <p className="user-text">{message.content}</p>
                        {message.file && (
                            <div className="file-attachment">
                                <span role="img" aria-label="PDF">📎</span> {message.file.name || 'PDF attachment'}
                            </div>
                        )}
                    </>
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                )}
                {message.role !== 'user' && (
                    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy response">
                        {copied ? '✓ Copied' : 'Copy'}
                    </button>
                )}
            </div>
            <span className="timestamp">{time}</span>
        </div>
    );
}
