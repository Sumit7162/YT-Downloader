import React, { useState, useCallback } from 'react';
import URLInput from '../components/URLInput';
import VideoPreview from '../components/VideoPreview';
import QualitySelector from '../components/QualitySelector';
import DownloadProgress from '../components/DownloadProgress';
import { fetchVideoInfo, downloadVideo } from '../utils/api';
import { showToast } from '../components/Toast';
import './Home.css';

export default function Home({ onDownloadComplete }) {
  const [phase, setPhase] = useState('input');      // input | loading | ready | downloading | done
  const [videoData, setVideoData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [downloadingFormatId, setDownloadingFormatId] = useState(null);
  const [activeFilename, setActiveFilename] = useState('');

  // Fetch video info
  const handleFetch = useCallback(async (url) => {
    setPhase('loading');
    setVideoData(null);
    try {
      const data = await fetchVideoInfo(url);
      setVideoData(data);
      setPhase('ready');
    } catch (err) {
      setPhase('input');
      showToast(err.message || 'Failed to fetch video info. Please try again.', 'error');
    }
  }, []);

  // Download handler
  const handleDownload = useCallback(async (url, formatId, filename, fmt) => {
    setDownloadingFormatId(formatId);
    setActiveFilename(filename);
    setPhase('downloading');
    setProgress(0);

    try {
      await downloadVideo(url, formatId, filename, (p) => setProgress(p));
      setPhase('done');
      showToast(`✅ "${filename}" downloaded successfully!`, 'success');

      // Add to history
      if (onDownloadComplete && videoData) {
        onDownloadComplete({
          videoId: videoData.id,
          title: videoData.title,
          thumbnail: videoData.thumbnail,
          channel: videoData.channel,
          duration: videoData.duration,
          url: videoData.url,
          formatId,
          quality: fmt.quality,
          type: fmt.type,
          ext: fmt.ext,
          filename,
        });
      }

      // Return to ready state after a moment
      setTimeout(() => {
        setPhase('ready');
        setDownloadingFormatId(null);
      }, 1500);

    } catch (err) {
      setPhase('ready');
      setDownloadingFormatId(null);
      showToast(err.message || 'Download failed. Please try again.', 'error');
    }
  }, [videoData, onDownloadComplete]);

  const handleReset = () => {
    setPhase('input');
    setVideoData(null);
    setDownloadingFormatId(null);
  };

  const handleReady = () => {
    setPhase('ready');
    setDownloadingFormatId(null);
  };

  return (
    <div className="home">
      <div className="container">
        {/* URL Input — always show unless ready/downloading */}
        {(phase === 'input' || phase === 'loading') && (
          <URLInput
            onFetch={handleFetch}
            isLoading={phase === 'loading'}
          />
        )}

        {/* Video info + quality selector */}
        {(phase === 'ready' || phase === 'downloading' || phase === 'done') && videoData && (
          <div className="home-results">
            <VideoPreview video={videoData} onReset={handleReset} />

            <div className="home-divider">
              <div className="home-divider-line" />
              <span className="home-divider-label">Select Download Quality</span>
              <div className="home-divider-line" />
            </div>

            <QualitySelector
              video={videoData}
              onDownload={handleDownload}
              isDownloading={phase === 'downloading'}
              downloadingFormatId={downloadingFormatId}
            />

            {/* Download progress */}
            {phase === 'downloading' && (
              <DownloadProgress
                progress={progress}
                filename={activeFilename}
              />
            )}

            {/* Done success state */}
            {phase === 'done' && (
              <div className="home-success animate-slide-up">
                <div className="home-success-icon">✅</div>
                <div className="home-success-text">
                  <strong>Download complete!</strong>
                  <span>Check your Downloads folder.</span>
                </div>
              </div>
            )}

            {/* Download another button */}
            <div className="home-another">
              <button
                id="download-another-btn"
                className="btn btn-ghost"
                onClick={handleReset}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7-7 7 7"/>
                </svg>
                Download Another Video
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
