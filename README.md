# 🎬 YT Downloader

<div align="center">

![YT Downloader](https://img.shields.io/badge/YT%20Downloader-v1.0.0-7c3aed?style=for-the-badge&logo=youtube&logoColor=white)
![React](https://img.shields.io/badge/React-18-61dafb?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.8+-3776ab?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)
![yt-dlp](https://img.shields.io/badge/yt--dlp-latest-ff0000?style=for-the-badge)

**A premium, full-stack YouTube video downloader with a stunning glassmorphism UI.**  
Download any YouTube video in every available quality — 4K, 1080p, 720p, 480p, 360p, and audio-only.

</div>

---

## ✨ Features

- 🎯 **Paste & Download** — Paste any YouTube URL and instantly see all quality options
- 📱 **Mobile Share Target** — Share directly from YouTube app on Android → app processes it
- 🎬 **All Video Qualities** — 4K, 1440p, 1080p, 720p, 480p, 360p (combined video+audio)
- 🎵 **Audio Only** — Download just the audio in various bitrates (m4a/mp3)
- 📋 **Download History** — Full history saved locally, with one-click re-download
- ⚡ **Real-time Progress** — Live progress bar while downloading
- 🔔 **Toast Notifications** — Success/error feedback
- 🌙 **Dark Glassmorphism UI** — Premium purple-to-cyan gradient design
- 📲 **Fully Responsive** — Optimized for both mobile and desktop

---

## 🏗️ Project Structure

```
YT-Downloader/
├── backend/                   # Python Flask API
│   ├── app.py                 # Flask server + REST endpoints
│   ├── downloader.py          # yt-dlp wrapper logic
│   ├── requirements.txt       # Python dependencies
│   └── downloads/             # Temp folder (auto-cleaned)
│
├── frontend/                  # React + Vite SPA
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx / .css
│   │   │   ├── URLInput.jsx / .css
│   │   │   ├── VideoPreview.jsx / .css
│   │   │   ├── QualitySelector.jsx / .css
│   │   │   ├── DownloadProgress.jsx / .css
│   │   │   ├── HistoryPanel.jsx / .css
│   │   │   └── Toast.jsx / .css
│   │   ├── hooks/
│   │   │   └── useHistory.js
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Home.css
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **ffmpeg** *(recommended for merging video+audio streams)* — [ffmpeg.org](https://ffmpeg.org)

### 1. Clone / Open the Project

```bash
cd YT-Downloader
```

### 2. Set Up the Backend

```bash
cd backend

# Create a virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the Flask server
python app.py
```

The backend will start at **http://localhost:5000**

### 3. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend

# Install dependencies (already done if you followed the build steps)
npm install

# Start the dev server
npm run dev
```

The frontend will start at **http://localhost:3000**

### 4. Open in Browser

Navigate to **http://localhost:3000** and start downloading! 🎉

---

## 🎮 How to Use

### Desktop (PC)

1. **Paste** a YouTube URL into the input field  
   *(or click the "Paste URL" button to paste from clipboard)*
2. Click **"Fetch Video"**
3. Wait for the video info to load
4. **Choose your quality** from the cards (Video or Audio Only)
5. The download starts automatically — watch the progress bar
6. Find your file in the **Downloads** folder

### Mobile

#### Option A: Paste URL
Same as desktop — open the app in your mobile browser and paste the link.

#### Option B: Share directly from YouTube
1. Open a video in the **YouTube app**
2. Tap **Share → Copy Link**
3. Open the YT Downloader app
4. Tap **"Paste URL"** — it auto-detects and fetches!

#### Option C: PWA Share Target *(advanced)*
Install the app as a PWA and it registers as a share target — then:
1. Open YouTube app → tap Share
2. Select **"YT Downloader"** from the share sheet
3. The app opens with the video pre-loaded!

---

## 🔌 API Reference

### `GET /api/health`
Returns server status.
```json
{ "status": "ok", "message": "YT-Downloader API is running" }
```

### `POST /api/info`
Fetch video metadata and available formats.

**Request body:**
```json
{ "url": "https://youtube.com/watch?v=dQw4w9WgXcQ" }
```

**Response:**
```json
{
  "id": "dQw4w9WgXcQ",
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": "3:33",
  "channel": "Channel Name",
  "view_count": 1234567,
  "video_formats": [
    {
      "format_id": "137+140",
      "quality": "1080p",
      "ext": "mp4",
      "filesize": "45.2 MB",
      "type": "video"
    }
  ],
  "audio_formats": [
    {
      "format_id": "140",
      "quality": "128kbps",
      "ext": "m4a",
      "type": "audio"
    }
  ]
}
```

### `POST /api/download`
Download a specific format.

**Request body:**
```json
{
  "url": "https://youtube.com/watch?v=...",
  "format_id": "137+140",
  "filename": "Video_Title.mp4"
}
```

**Response:** Binary file stream (triggers browser download)

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast SPA with HMR |
| **Styling** | Vanilla CSS | Glassmorphism, animations |
| **Backend** | Python Flask | REST API server |
| **Download Engine** | yt-dlp | YouTube extraction |
| **CORS** | flask-cors | Cross-origin requests |
| **History** | localStorage | Client-side persistence |
| **Font** | Inter (Google Fonts) | Modern typography |

---

## ⚙️ Configuration

### Backend Port
Edit `backend/app.py` — last line:
```python
app.run(debug=True, host='0.0.0.0', port=5000)  # Change port here
```

### Frontend Port / API Target
Edit `frontend/vite.config.js`:
```js
server: {
  port: 3000,
  proxy: {
    '/api': { target: 'http://localhost:5000' }  // Match backend port
  }
}
```

### Download Folder
Edit `backend/downloader.py`:
```python
DOWNLOAD_DIR = os.path.join(os.path.dirname(...), "downloads")
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---|---|
| `yt-dlp not found` | Run `pip install yt-dlp` inside the venv |
| Video info fails | Update yt-dlp: `pip install -U yt-dlp` |
| No video+audio combined | Install ffmpeg and add to PATH |
| CORS errors | Ensure backend is running on port 5000 |
| Download starts but no file | Check `backend/downloads/` folder permissions |
| Age-restricted video fails | Not supported without YouTube cookies |

### Update yt-dlp (if downloads break)
YouTube frequently changes its API. Update yt-dlp regularly:
```bash
pip install -U yt-dlp
```

---

## 📋 Legal Disclaimer

This tool is for **personal use only**. Only download videos you have the right to download. Respect YouTube's [Terms of Service](https://www.youtube.com/t/terms). The authors are not responsible for any misuse.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Made By ♥ Sumit · Download & Enjoy

</div>
