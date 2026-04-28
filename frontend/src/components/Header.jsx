import React from 'react';
import './Header.css';

export default function Header({ historyCount, onToggleHistory }) {
  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo */}
        <div className="header-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="64" height="64" rx="14" fill="url(#logoGrad)"/>
              <polygon points="26,20 26,44 46,32" fill="white" opacity="0.95"/>
              <rect x="12" y="50" width="40" height="4" rx="2" fill="white" opacity="0.6"/>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <span className="logo-title gradient-text">YT Downloader</span>
            <span className="logo-sub">Fast &amp; Free</span>
          </div>
        </div>

        {/* Right actions */}
        <div className="header-actions">
          <button
            id="history-toggle-btn"
            className="btn btn-ghost history-btn"
            onClick={onToggleHistory}
            aria-label="Toggle download history"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
            <span className="history-label">History</span>
            {historyCount > 0 && (
              <span className="history-badge">{historyCount > 99 ? '99+' : historyCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
