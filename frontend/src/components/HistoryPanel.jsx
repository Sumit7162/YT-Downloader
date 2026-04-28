import React, { useEffect, useRef } from 'react';
import './HistoryPanel.css';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function HistoryPanel({ history, isOpen, onClose, onRedownload, onRemove, onClear }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Lock body scroll when panel open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div className={`history-backdrop ${isOpen ? 'history-backdrop--visible' : ''}`} onClick={onClose} />

      {/* Panel */}
      <aside
        ref={panelRef}
        id="history-panel"
        className={`history-panel glass-card ${isOpen ? 'history-panel--open' : ''}`}
        aria-label="Download history"
      >
        {/* Header */}
        <div className="hp-header">
          <div className="hp-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
            Download History
          </div>
          <div className="hp-actions">
            {history.length > 0 && (
              <button
                id="clear-history-btn"
                className="btn btn-danger hp-clear-btn"
                onClick={onClear}
                aria-label="Clear all history"
              >
                Clear All
              </button>
            )}
            <button
              id="close-history-btn"
              className="btn btn-ghost hp-close-btn"
              onClick={onClose}
              aria-label="Close history"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="hp-content">
          {history.length === 0 ? (
            <div className="hp-empty">
              <div className="hp-empty-icon">📭</div>
              <p className="hp-empty-title">No downloads yet</p>
              <p className="hp-empty-sub">Your download history will appear here.</p>
            </div>
          ) : (
            <ul className="hp-list">
              {history.map((item) => (
                <li key={item.id} className="hp-item animate-fade-in">
                  {/* Thumbnail */}
                  <div className="hp-thumb-wrap">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="hp-thumb" loading="lazy" />
                    ) : (
                      <div className="hp-thumb-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <rect x="2" y="2" width="20" height="20" rx="4"/>
                          <polygon points="10,8 16,12 10,16"/>
                        </svg>
                      </div>
                    )}
                    <span className="hp-quality-badge">{item.quality || ''}</span>
                  </div>

                  {/* Info */}
                  <div className="hp-item-info">
                    <p className="hp-item-title" title={item.title}>{item.title}</p>
                    <div className="hp-item-meta">
                      <span className="hp-item-channel">{item.channel}</span>
                      <span className="hp-item-time">{timeAgo(item.timestamp)}</span>
                    </div>
                    <div className="hp-item-type">
                      <span className={`badge ${item.type === 'audio' ? 'badge-audio' : 'badge-video'}`}>
                        {item.type === 'audio' ? '🎵 Audio' : '🎬 Video'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="hp-item-actions">
                    <button
                      id={`redownload-btn-${item.id}`}
                      className="btn btn-ghost hp-redownload-btn"
                      onClick={() => onRedownload(item)}
                      aria-label="Download again"
                      title="Download again"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      id={`remove-history-btn-${item.id}`}
                      className="btn hp-remove-btn"
                      onClick={() => onRemove(item.id)}
                      aria-label="Remove from history"
                      title="Remove"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
