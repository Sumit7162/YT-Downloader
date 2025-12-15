from flask import Flask, render_template, request, send_from_directory
import yt_dlp
import os

app = Flask(__name__)

DOWNLOAD_FOLDER = "downloads"
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/download", methods=["POST"])
def download():
    url = request.form["url"]
    quality = request.form["quality"]

    ydl_opts = {
        "outtmpl": f"{DOWNLOAD_FOLDER}/%(title)s.%(ext)s",
        "merge_output_format": "mp4",
        "quiet": True
    }

    if quality == "best":
        ydl_opts["format"] = "best"
    elif quality == "1080":
        ydl_opts["format"] = "bestvideo[height<=1080]+bestaudio/best"
    elif quality == "720":
        ydl_opts["format"] = "bestvideo[height<=720]+bestaudio/best"
    elif quality == "480":
        ydl_opts["format"] = "bestvideo[height<=480]+bestaudio/best"
    elif quality == "audio":
        ydl_opts.update({
            "format": "bestaudio",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
            }]
        })

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

        # Fix extension for mp3
        if quality == "audio":
            filename = filename.rsplit(".", 1)[0] + ".mp3"

    return render_template(
        "index.html",
        download_link=os.path.basename(filename)
    )

@app.route("/files/<filename>")
def serve_file(filename):
    return send_from_directory(DOWNLOAD_FOLDER, filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True)
