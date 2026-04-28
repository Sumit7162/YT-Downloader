import React from 'react';
import { formatViews } from '../utils/api';
import './VideoPreview.css';

export default function VideoPreview({ video, onReset }) {
  const uploadDate = video.upload_date
    ? new Date(
        video.upload_date.slice(0, 4) + '-' +
        video.upload_date.slice(4, 6) + '-' +
        video.upload_date.slice(6, 8)
      ).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : null;

  return (
    <div className="video-preview glass-card animate-slide-up">
      {/* Thumbnail */}
      <div className="preview-thumbnail-wrap">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="preview-thumbnail"
          loading="lazy"
        />
        {/* Duration overlay */}
        <div className="preview-duration">{video.duration}</div>
        {/* Play overlay */}
        <div className="preview-play-overlay">
          <div className="preview-play-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5,3 19,12 5,21"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="preview-info">
        <div className="preview-info-top">
          <h2 className="preview-title" title={video.title}>{video.title}</h2>
          <button
            id="reset-video-btn"
            className="btn btn-ghost preview-reset-btn"
            onClick={onReset}
            aria-label="Search different video"
            title="Download a different video"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="preview-meta">
          {/* Channel */}
          <span className="preview-meta-item preview-channel">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {video.channel}
          </span>

          {/* Views */}
          {video.view_count > 0 && (
            <span className="preview-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {formatViews(video.view_count)}
            </span>
          )}

          {/* Upload date */}
          {uploadDate && (
            <span className="preview-meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <path d="M16 2v4M8 2v4M3 10h18"/>
              </svg>
              {uploadDate}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {video.description && (
          <p className="preview-description">{video.description}{video.description.length >= 200 ? '...' : ''}</p>
        )}
      </div>
    </div>
  );
}
