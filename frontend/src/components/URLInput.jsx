import React, { useState, useRef, useEffect } from 'react';
import { isValidYouTubeUrl, extractYouTubeUrl } from '../utils/api';
import './URLInput.css';

export default function URLInput({ onFetch, isLoading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Handle mobile Web Share Target — URL passed via ?url= query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get('url') || params.get('text');
    if (sharedUrl) {
      const extracted = extractYouTubeUrl(sharedUrl) || sharedUrl;
      setUrl(extracted);
      // Auto-fetch when arriving from share target
      if (isValidYouTubeUrl(extracted)) {
        setTimeout(() => handleFetch(extracted), 500);
      }
    }
  }, []);

  const handleFetch = (urlOverride) => {
    const target = (urlOverride || url).trim();
    setError('');
    if (!target) {
      setError('Please enter a YouTube URL.');
      inputRef.current?.focus();
      return;
    }
    if (!isValidYouTubeUrl(target)) {
      setError('Invalid URL. Please paste a YouTube link (youtube.com or youtu.be).');
      return;
    }
    onFetch(target);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const extracted = extractYouTubeUrl(text) || text;
      setUrl(extracted);
      setError('');
      if (isValidYouTubeUrl(extracted)) {
        onFetch(extracted);
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl('');
    setError('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleFetch();
  };

  return (
    <div className="url-input-section animate-slide-up">
      {/* Hero text */}
      <div className="url-hero">
        <h1 className="url-hero-title">
          Download Any YouTube Video
        </h1>
        <p className="url-hero-subtitle">
          Paste a link below — get every quality option instantly. Free, fast, no limits.
        </p>
      </div>

      {/* Input area */}
      <div className="url-input-wrapper glass-card">
        <div className="url-input-row">
          {/* YouTube icon */}
          <div className="url-yt-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.54 6.42A2.78 2.78 0 0 0 20.6 4.46C18.88 4 12 4 12 4s-6.88 0-8.6.46A2.78 2.78 0 0 0 1.46 6.42 29.1 29.1 0 0 0 1 12a29.1 29.1 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.4 19.54C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96A29.1 29.1 0 0 0 23 12a29.1 29.1 0 0 0-.46-5.58Z" fill="#ff4444"/>
              <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="white"/>
            </svg>
          </div>

          {/* Text input */}
          <input
            ref={inputRef}
            id="youtube-url-input"
            type="url"
            className="input-field url-text-input"
            placeholder="https://youtube.com/watch?v=... or youtu.be/..."
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear */}
          {url && !isLoading && (
            <button
              id="clear-url-btn"
              className="btn-clear"
              onClick={handleClear}
              aria-label="Clear URL"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p className="url-error animate-slide-down">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            {error}
          </p>
        )}

        {/* Action buttons */}
        <div className="url-actions">
          <button
            id="paste-url-btn"
            className="btn btn-ghost url-paste-btn"
            onClick={handlePaste}
            disabled={isLoading}
            aria-label="Paste from clipboard"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="6" height="4" rx="1"/>
              <path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/>
            </svg>
            Paste URL
          </button>

          <button
            id="fetch-video-btn"
            className="btn btn-primary url-fetch-btn"
            onClick={() => handleFetch()}
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Analyzing...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                Fetch Video
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="url-tips">
        <div className="url-tip">
          <span className="tip-icon">📱</span>
          <span>On mobile: use <strong>Share → YT Downloader</strong></span>
        </div>
        <div className="url-tip">
          <span className="tip-icon">⚡</span>
          <span>Supports <strong>4K, 1080p, 720p, 480p, 360p</strong> &amp; audio</span>
        </div>
      </div>
    </div>
  );
}
