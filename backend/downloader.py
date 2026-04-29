"""
YT-Downloader — yt-dlp wrapper module
Handles video info extraction and downloading with quality categorization.
Uses tv_embedded/mweb clients to bypass YouTube bot detection on cloud servers.
"""

import yt_dlp
import os
import re
import uuid
import threading
import time

# Temp download directory
DOWNLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

# Path to cookies file (optional — if provided, helps bypass restrictions)
COOKIES_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.txt")

# Auto-cleanup: remove files older than 10 minutes
def cleanup_old_files():
    """Remove downloaded files older than 10 minutes."""
    while True:
        try:
            now = time.time()
            for filename in os.listdir(DOWNLOAD_DIR):
                filepath = os.path.join(DOWNLOAD_DIR, filename)
                if os.path.isfile(filepath) and (now - os.path.getmtime(filepath)) > 600:
                    os.remove(filepath)
        except Exception:
            pass
        time.sleep(60)

# Start cleanup thread
cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleanup_thread.start()


def format_duration(seconds):
    """Convert seconds to HH:MM:SS or MM:SS format."""
    if not seconds:
        return "Unknown"
    seconds = int(seconds)
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def format_filesize(size_bytes):
    """Convert bytes to human-readable format."""
    if not size_bytes:
        return "Unknown"
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} TB"


def _build_ydl_opts(extra=None):
    """
    Build yt-dlp options with the best bot-bypass settings.
    - When cookies.txt is present: uses 'web' client which supports
      age-restricted videos and is authenticated via cookies.
    - When no cookies: uses 'tv_embedded' which works without login
      but cannot access age-restricted content.
    """
    has_cookies = os.path.exists(COOKIES_FILE)

    if has_cookies:
        # Authenticated mode: 'web' supports age-restricted content
        player_clients = ['web', 'mweb']
        user_agent = (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/124.0.0.0 Safari/537.36'
        )
    else:
        # Unauthenticated mode: tv_embedded doesn't need login
        player_clients = ['tv_embedded', 'web_creator', 'mweb']
        user_agent = (
            'Mozilla/5.0 (SMART-TV; Linux; Tizen 6.0) AppleWebKit/538.1 '
            '(KHTML, like Gecko) Version/6.0 TV Safari/538.1'
        )

    opts = {
        'quiet': True,
        'no_warnings': True,
        'nocheckcertificate': True,
        'geo_bypass': True,
        'extractor_args': {
            'youtube': {
                'player_client': player_clients,
            }
        },
        'http_headers': {
            'User-Agent': user_agent,
        },
    }

    if has_cookies:
        opts['cookiefile'] = COOKIES_FILE

    if extra:
        opts.update(extra)

    return opts


def get_video_info(url):
    """
    Extract video metadata and available formats from a YouTube URL.
    Returns structured data with video info and categorized quality options.
    """
    ydl_opts = _build_ydl_opts({
        'extract_flat': False,
    })

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    # Extract basic info
    video_data = {
        'id': info.get('id', ''),
        'title': info.get('title', 'Unknown Title'),
        'thumbnail': info.get('thumbnail', ''),
        'duration': format_duration(info.get('duration')),
        'duration_seconds': info.get('duration', 0),
        'channel': info.get('uploader', info.get('channel', 'Unknown')),
        'view_count': info.get('view_count', 0),
        'upload_date': info.get('upload_date', ''),
        'description': (info.get('description', '') or '')[:200],
        'url': url,
    }

    # Process formats
    formats = info.get('formats', [])
    video_formats = []
    audio_formats = []
    seen_resolutions = set()
    seen_audio_bitrates = set()

    # Sort formats by quality (highest first)
    sorted_formats = sorted(
        formats,
        key=lambda f: (f.get('height') or 0, f.get('tbr') or 0),
        reverse=True
    )

    for fmt in sorted_formats:
        format_id = fmt.get('format_id', '')
        ext = fmt.get('ext', '')
        vcodec = fmt.get('vcodec', 'none')
        acodec = fmt.get('acodec', 'none')
        height = fmt.get('height')
        filesize = fmt.get('filesize') or fmt.get('filesize_approx')
        tbr = fmt.get('tbr')
        abr = fmt.get('abr')

        # Skip fragmented streaming formats
        protocol = fmt.get('protocol', '')
        if protocol in ('m3u8', 'm3u8_native'):
            continue

        # Video+Audio combined formats
        if vcodec != 'none' and acodec != 'none' and height:
            resolution_key = f"{height}p"
            if resolution_key not in seen_resolutions:
                seen_resolutions.add(resolution_key)
                video_formats.append({
                    'format_id': format_id,
                    'quality': resolution_key,
                    'height': height,
                    'ext': ext,
                    'filesize': format_filesize(filesize),
                    'filesize_bytes': filesize,
                    'type': 'video',
                    'codec': vcodec.split('.')[0],
                    'has_audio': True,
                    'bitrate': f"{int(tbr)}kbps" if tbr else "Unknown",
                })

        # Audio only formats
        elif vcodec == 'none' and acodec != 'none' and abr:
            abr_key = int(abr)
            if abr_key not in seen_audio_bitrates and ext in ('m4a', 'mp3', 'webm', 'opus'):
                seen_audio_bitrates.add(abr_key)
                audio_formats.append({
                    'format_id': format_id,
                    'quality': f"{abr_key}kbps",
                    'ext': ext,
                    'filesize': format_filesize(filesize),
                    'filesize_bytes': filesize,
                    'type': 'audio',
                    'codec': acodec.split('.')[0],
                    'bitrate': f"{abr_key}kbps",
                })

    # Sort video by height descending, audio by bitrate descending
    video_formats.sort(key=lambda x: x.get('height', 0), reverse=True)
    audio_formats.sort(
        key=lambda x: int(re.sub(r'[^\d]', '', x.get('bitrate', '0')) or 0),
        reverse=True
    )

    # Limit to best options
    video_formats = video_formats[:6]
    audio_formats = audio_formats[:4]

    # Fallback: if no combined formats found, generate format-string options
    if not video_formats:
        for quality in ['2160', '1440', '1080', '720', '480', '360']:
            video_formats.append({
                'format_id': f'bestvideo[height<={quality}]+bestaudio/best[height<={quality}]',
                'quality': f'{quality}p',
                'height': int(quality),
                'ext': 'mp4',
                'filesize': 'Unknown',
                'filesize_bytes': None,
                'type': 'video',
                'codec': 'auto',
                'has_audio': True,
                'bitrate': 'auto',
            })

    video_data['video_formats'] = video_formats
    video_data['audio_formats'] = audio_formats

    return video_data


def download_video(url, format_id):
    """
    Download a video/audio with the specified format.
    Returns the path to the downloaded file.
    """
    unique_id = str(uuid.uuid4())[:8]
    output_template = os.path.join(DOWNLOAD_DIR, f'{unique_id}_%(title)s.%(ext)s')

    ydl_opts = _build_ydl_opts({
        'format': format_id,
        'outtmpl': output_template,
        'merge_output_format': 'mp4',
    })

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

        # Check for merged mp4 file
        if not os.path.exists(filename):
            base, _ = os.path.splitext(filename)
            filename = base + '.mp4'

        if not os.path.exists(filename):
            # Search for any file with the unique_id prefix
            for f in os.listdir(DOWNLOAD_DIR):
                if f.startswith(unique_id):
                    filename = os.path.join(DOWNLOAD_DIR, f)
                    break

    return filename if os.path.exists(filename) else None
