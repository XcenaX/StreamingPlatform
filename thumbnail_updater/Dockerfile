FROM python:3.11-slim

RUN apt update && apt install -y ffmpeg && pip install requests

WORKDIR /app
COPY main.py .

CMD ["python", "main.py"]
