import time
import requests
import subprocess
import os

while True:
    try:
        res = requests.get("http://backend:8000/stream/active")
        res.raise_for_status()
        streams = res.json()

        for stream in streams:
            username = stream["username"]
            stream_id = stream["id"]
            hls_url = f"http://nginx:80/{username}_stream{stream_id}/master.m3u8"
            preview_dir = f"/hls/{username}_stream{stream_id}"
            os.makedirs(preview_dir, exist_ok=True)
            output_path = f"{preview_dir}/preview.jpg"

            subprocess.run([
                "ffmpeg", "-y", "-i", hls_url,
                "-frames:v", "1", "-q:v", "2",
                output_path
            ], check=True)
            print(f"[ok] Updated preview: {output_path}")
    except Exception as e:
        print("[error]", e)

    time.sleep(60)
