/**
 * api.js — API utility functions for the YT-Downloader frontend
 */

const BASE_URL = 'https://yt-downloader-0gxt.onrender.com'; // Deployed backend URL

/**
 * Fetch video info and available formats from the backend.
 * @param {string} url - YouTube URL
 * @returns {Promise<object>} Video metadata and format options
 */
export async function fetchVideoInfo(url) {
  const response = await fetch(`${BASE_URL}/api/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch video info');
  }
  return data;
}

/**
 * Trigger a video/audio download via the backend.
 * The backend streams the file; we create a temporary object URL for the browser.
 * @param {string} url - YouTube URL
 * @param {string} formatId - yt-dlp format ID
 * @param {string} filename - Suggested download filename
 * @param {function} onProgress - Progress callback (optional)
 */
export async function downloadVideo(url, formatId, filename, onProgress) {
  const response = await fetch(`${BASE_URL}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, format_id: formatId, filename }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Download failed');
  }

  // Stream response with progress tracking
  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress && total > 0) {
      onProgress(Math.round((loaded / total) * 100));
    } else if (onProgress) {
      // Unknown total — pulse progress
      onProgress(-1);
    }
  }

  // Create blob and trigger download
  const blob = new Blob(chunks);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Health check
 */
export async function checkHealth() {
  const response = await fetch(`${BASE_URL}/api/health`);
  return response.ok;
}

/**
 * Format view count
 */
export function formatViews(count) {
  if (!count) return '';
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B views`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K views`;
  return `${count} views`;
}

/**
 * Sanitize a string for use as a filename
 */
export function sanitizeFilename(title, ext = 'mp4') {
  const safe = (title || 'video').replace(/[^a-z0-9\s\-_]/gi, '').replace(/\s+/g, '_').slice(0, 80);
  return `${safe}.${ext}`;
}

/**
 * Extract YouTube URL from a shared text (for mobile share target)
 */
export function extractYouTubeUrl(text) {
  const patterns = [
    /https?:\/\/(?:www\.)?youtube\.com\/watch\?[^\s]*/,
    /https?:\/\/youtu\.be\/[^\s]*/,
    /https?:\/\/(?:www\.)?youtube\.com\/shorts\/[^\s]*/,
    /https?:\/\/(?:m\.)?youtube\.com\/watch\?[^\s]*/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

/**
 * Validate if a string is a YouTube URL
 */
export function isValidYouTubeUrl(url) {
  return /^https?:\/\/(www\.|m\.)?(youtube\.com\/(watch|shorts)|youtu\.be\/)/.test(url);
}
