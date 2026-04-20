import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';

export function InputBar({ onSend, onClear, disabled }) {
    const [value, setValue] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleSend = () => {
        if (!value.trim() && !file) return;
        onSend({ text: value, file });
        setValue('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleFileChange = (event) => {
        const selected = event.target.files && event.target.files[0];
        if (!selected) return;
        if (selected.type !== 'application/pdf') {
            alert('Only PDF files are allowed.');
            return;
        }
        setFile(selected);
    };

    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="input-bar">
            <textarea
                className="input-field"
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command… e.g. Create test cases for NIN-106"
                rows={2}
                disabled={disabled}
            />
            <div className="input-actions">
                <button className="btn-clear" onClick={onClear} title="Clear chat">Clear</button>
                <label htmlFor="pdf-upload" className="pdf-upload-label" title="Attach PDF">
                    <input
                        id="pdf-upload"
                        type="file"
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={disabled}
                    />
                    <span className="pdf-upload-icon" role="img" aria-label="Attach PDF" style={{ opacity: disabled ? 0.5 : 1 }}>
                        📎
                    </span>
                </label>
                {file && (
                    <span className="attached-file">
                        {file.name}
                        <button className="remove-file-btn" onClick={handleRemoveFile} title="Remove file" type="button">✖</button>
                    </span>
                )}
                <button className="btn-send" onClick={handleSend} disabled={disabled || (!value.trim() && !file)}>Send</button>
            </div>
        </div>
    );
}
