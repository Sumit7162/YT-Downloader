import React from 'react';
import { sanitizeFilename } from '../utils/api';
import './QualitySelector.css';

const QUALITY_ICONS = {
  '2160p': '⚡',
  '1440p': '💎',
  '1080p': '🔥',
  '720p': '⭐',
  '480p': '📱',
  '360p': '💾',
};

export default function QualitySelector({ video, onDownload, isDownloading, downloadingFormatId }) {
  const { video_formats = [], audio_formats = [], title, url } = video;

  const handleDownload = (fmt) => {
    const ext = fmt.ext || (fmt.type === 'audio' ? 'm4a' : 'mp4');
    const filename = sanitizeFilename(title, ext);
    onDownload(url, fmt.format_id, filename, fmt);
  };

  const isRecommended = (fmt) => fmt.quality === '720p' || fmt.quality === '1080p';

  return (
    <div className="quality-selector animate-slide-up">
      <div className="quality-header">
        <h3 className="quality-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Choose Quality
        </h3>
        <span className="quality-count">
          {video_formats.length + audio_formats.length} options available
        </span>
      </div>

      {/* Video formats */}
      {video_formats.length > 0 && (
        <div className="quality-group">
          <div className="quality-group-label">
            <span className="badge badge-video">Video + Audio</span>
          </div>
          <div className="quality-grid">
            {video_formats.map((fmt) => {
              const isActive = downloadingFormatId === fmt.format_id;
              const rec = isRecommended(fmt);
              return (
                <button
                  key={fmt.format_id}
                  id={`download-btn-${fmt.quality}`}
                  className={`quality-card ${rec ? 'quality-card--recommended' : ''} ${isActive ? 'quality-card--active' : ''}`}
                  onClick={() => handleDownload(fmt)}
                  disabled={isDownloading}
                  aria-label={`Download ${fmt.quality} video`}
                >
                  {rec && <span className="badge badge-recommended quality-rec-badge">Best</span>}
                  <span className="quality-icon">{QUALITY_ICONS[fmt.quality] || '🎬'}</span>
                  <span className="quality-res">{fmt.quality}</span>
                  <span className="quality-ext">{(fmt.ext || 'mp4').toUpperCase()}</span>
                  <span className="quality-size">{fmt.filesize}</span>
                  {isActive && (
                    <div className="quality-downloading">
                      <span className="spinner" style={{ borderTopColor: 'var(--purple-light)' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Audio formats */}
      {audio_formats.length > 0 && (
        <div className="quality-group">
          <div className="quality-group-label">
            <span className="badge badge-audio">Audio Only</span>
          </div>
          <div className="quality-grid quality-grid--audio">
            {audio_formats.map((fmt) => {
              const isActive = downloadingFormatId === fmt.format_id;
              return (
                <button
                  key={fmt.format_id}
                  id={`download-btn-audio-${fmt.bitrate}`}
                  className={`quality-card quality-card--audio ${isActive ? 'quality-card--active' : ''}`}
                  onClick={() => handleDownload(fmt)}
                  disabled={isDownloading}
                  aria-label={`Download audio ${fmt.bitrate}`}
                >
                  <span className="quality-icon">🎵</span>
                  <span className="quality-res">{fmt.bitrate}</span>
                  <span className="quality-ext">{(fmt.ext || 'm4a').toUpperCase()}</span>
                  <span className="quality-size">{fmt.filesize}</span>
                  {isActive && (
                    <div className="quality-downloading">
                      <span className="spinner" style={{ borderTopColor: 'var(--pink-accent)' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {video_formats.length === 0 && audio_formats.length === 0 && (
        <div className="quality-empty">
          <p>No downloadable formats found for this video.</p>
        </div>
      )}
    </div>
  );
}
