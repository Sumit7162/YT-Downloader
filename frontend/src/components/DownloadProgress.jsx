import React from 'react';
import './DownloadProgress.css';

export default function DownloadProgress({ progress, filename, onCancel }) {
  const isIndeterminate = progress === -1;
  const displayProgress = isIndeterminate ? null : Math.min(progress, 100);

  return (
    <div className="download-progress glass-card animate-slide-up">
      <div className="dp-header">
        <div className="dp-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <div className="dp-info">
          <span className="dp-label">Downloading</span>
          <span className="dp-filename" title={filename}>{filename}</span>
        </div>
        {displayProgress !== null && (
          <span className="dp-percent">{displayProgress}%</span>
        )}
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        {isIndeterminate ? (
          <div className="progress-bar-indeterminate" />
        ) : (
          <div
            className="progress-bar-fill"
            style={{ width: `${displayProgress}%` }}
          />
        )}
      </div>

      {/* Status text */}
      <div className="dp-footer">
        <span className="dp-status">
          {isIndeterminate
            ? 'Processing on server, please wait...'
            : displayProgress < 30
            ? 'Starting download...'
            : displayProgress < 70
            ? 'Transferring data...'
            : displayProgress < 100
            ? 'Almost done...'
            : 'Finalizing...'}
        </span>
        {onCancel && (
          <button
            id="cancel-download-btn"
            className="btn btn-danger dp-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
