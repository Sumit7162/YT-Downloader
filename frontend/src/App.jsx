import React, { useState } from 'react';
import Header from './components/Header';
import HistoryPanel from './components/HistoryPanel';
import ToastContainer, { showToast } from './components/Toast';
import Home from './pages/Home';
import { useHistory } from './hooks/useHistory';
import { downloadVideo, sanitizeFilename } from './utils/api';
import './App.css';

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const { history, addToHistory, removeFromHistory, clearHistory } = useHistory();

  const handleDownloadComplete = (entry) => {
    addToHistory(entry);
  };

  const handleRedownload = async (item) => {
    setHistoryOpen(false);
    const filename = item.filename || sanitizeFilename(item.title, item.ext || 'mp4');
    showToast(`Re-downloading "${item.title}"...`, 'info');
    try {
      await downloadVideo(item.url, item.formatId, filename, null);
      showToast(`✅ Re-download complete!`, 'success');
    } catch (err) {
      showToast(err.message || 'Re-download failed.', 'error');
    }
  };

  return (
    <div className="app">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1" aria-hidden="true" />
      <div className="bg-orb bg-orb-2" aria-hidden="true" />
      <div className="bg-orb bg-orb-3" aria-hidden="true" />

      {/* Header */}
      <Header
        historyCount={history.length}
        onToggleHistory={() => setHistoryOpen((o) => !o)}
      />

      {/* Main content */}
      <main className="app-main" id="main-content">
        <Home onDownloadComplete={handleDownloadComplete} />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container app-footer-inner">
          <span>
            Made By <span style={{ color: 'var(--pink-accent)' }}> ♥ </span> Sumit
          </span>
          <span className="footer-sep">·</span>
          <span>Download & Enjoy</span>
        </div>
      </footer>

      {/* History Panel */}
      <HistoryPanel
        history={history}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRedownload={handleRedownload}
        onRemove={removeFromHistory}
        onClear={clearHistory}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
