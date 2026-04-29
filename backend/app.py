"""
YT-Downloader — Flask API Server
Provides REST endpoints for video info extraction and downloading.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from downloader import get_video_info, download_video
import os

app = Flask(__name__)

# Allow all origins (frontend on Vercel/Netlify/localhost can all call this)
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=False)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'message': 'YT-Downloader API is running'})


@app.route('/api/info', methods=['POST', 'OPTIONS'])
def video_info():
    """
    Extract video information and available formats.
    Expects JSON body: { "url": "https://youtube.com/watch?v=..." }
    """
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'Missing URL in request body'}), 400

    url = data['url'].strip()

    # Basic URL validation
    if not any(domain in url for domain in ['youtube.com', 'youtu.be']):
        return jsonify({'error': 'Invalid YouTube URL. Please provide a valid YouTube link.'}), 400

    try:
        info = get_video_info(url)
        return jsonify(info)
    except Exception as e:
        error_msg = str(e)
        if 'Video unavailable' in error_msg:
            return jsonify({'error': 'This video is unavailable or private.'}), 404
        elif 'age' in error_msg.lower():
            return jsonify({'error': 'This video is age-restricted and cannot be downloaded.'}), 403
        elif 'Sign in' in error_msg or 'bot' in error_msg.lower():
            return jsonify({
                'error': 'YouTube is blocking this request. Please add cookies.txt to the backend folder. See README for instructions.'
            }), 403
        return jsonify({'error': f'Failed to fetch video info: {error_msg}'}), 500


@app.route('/api/download', methods=['POST', 'OPTIONS'])
def download():
    """
    Download a video/audio in the specified format.
    Expects JSON body: { "url": "...", "format_id": "...", "filename": "..." }
    """
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    if not data or 'url' not in data or 'format_id' not in data:
        return jsonify({'error': 'Missing URL or format_id in request body'}), 400

    url = data['url'].strip()
    format_id = data['format_id']
    suggested_filename = data.get('filename', 'video.mp4')

    try:
        filepath = download_video(url, format_id)
        if not filepath:
            return jsonify({'error': 'Download failed — file not found after processing.'}), 500

        response = send_file(
            filepath,
            as_attachment=True,
            download_name=suggested_filename,
        )
        return response

    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"\nStarting YT-Downloader API Server on port {port}")
    app.run(debug=False, host='0.0.0.0', port=port)
