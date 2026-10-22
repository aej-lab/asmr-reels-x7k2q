#!/usr/bin/env python3
"""Sube un mp4 vertical como YouTube Short usando la YouTube Data API v3.

Uso: python3 youtube/upload_short.py youtube/queue/AAAA-MM-DD.json

El JSON de cola tiene este formato:
{
  "video": "reels/2026-10-22.mp4",
  "title": "Why do we yawn?",
  "description": "Texto + hashtags propios para YouTube",
  "tags": ["science", "facts"],
  "thumbnail": "reels/2026-10-22-cover.jpg",   (opcional)
  "contains_synthetic_media": true              (opcional, por defecto true)
}

Credenciales: variables de entorno YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET,
YOUTUBE_REFRESH_TOKEN (secrets del repo). No se imprimen nunca.
"""
import glob
import hashlib
import json
import os
import sys

import requests

TOKEN_URL = "https://oauth2.googleapis.com/token"
UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos"
THUMB_URL = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set"


def access_token() -> str:
    r = requests.post(
        TOKEN_URL,
        data={
            "client_id": os.environ["YOUTUBE_CLIENT_ID"],
            "client_secret": os.environ["YOUTUBE_CLIENT_SECRET"],
            "refresh_token": os.environ["YOUTUBE_REFRESH_TOKEN"],
            "grant_type": "refresh_token",
        },
        timeout=60,
    )
    if r.status_code != 200:
        sys.exit(f"Error renovando el token ({r.status_code}): {r.json().get('error')}")
    return r.json()["access_token"]


def build_metadata(m: dict) -> dict:
    title = m["title"].strip()[:100]
    description = m.get("description", "").strip()
    # Para que YouTube lo trate como Short basta con vertical y <= 3 min;
    # #Shorts en la descripción ayuda a clasificarlo.
    if "#shorts" not in description.lower() and "#shorts" not in title.lower():
        description = f"{description}\n\n#Shorts".strip()
    return {
        "snippet": {
            "title": title,
            "description": description,
            "tags": m.get("tags", []),
            "categoryId": "27",  # Education
            "defaultLanguage": "en",
            "defaultAudioLanguage": "en",
        },
        "status": {
            "privacyStatus": "public",
            "selfDeclaredMadeForKids": False,
            "containsSyntheticMedia": bool(m.get("contains_synthetic_media", True)),
        },
    }


def upload(token: str, video_path: str, metadata: dict) -> str:
    size = os.path.getsize(video_path)
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": str(size),
        "X-Upload-Content-Type": "video/mp4",
    }
    init = requests.post(
        UPLOAD_URL,
        params={"uploadType": "resumable", "part": "snippet,status"},
        headers=headers,
        data=json.dumps(metadata),
        timeout=60,
    )
    if init.status_code != 200:
        sys.exit(f"Error iniciando la subida ({init.status_code}): {init.text[:500]}")
    session = init.headers["Location"]
    with open(video_path, "rb") as fh:
        put = requests.put(
            session,
            data=fh,
            headers={"Content-Length": str(size), "Content-Type": "video/mp4"},
            timeout=600,
        )
    if put.status_code not in (200, 201):
        sys.exit(f"Error subiendo el vídeo ({put.status_code}): {put.text[:500]}")
    return put.json()["id"]


def set_thumbnail(token: str, video_id: str, thumb_path: str) -> None:
    ctype = "image/png" if thumb_path.lower().endswith(".png") else "image/jpeg"
    with open(thumb_path, "rb") as fh:
        r = requests.post(
            THUMB_URL,
            params={"videoId": video_id},
            headers={"Authorization": f"Bearer {token}", "Content-Type": ctype},
            data=fh,
            timeout=120,
        )
    if r.status_code != 200:
        # No es fatal: el vídeo ya está subido.
        try:
            err = r.json().get("error", {})
            detail = f"{err.get('message', '')} {[e.get('reason') for e in err.get('errors', [])]}"
        except Exception:
            detail = r.text[:300]
        print(f"Aviso: no se pudo poner la portada ({r.status_code}): {detail}")
    else:
        print("Portada aplicada correctamente.")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def already_uploaded(video_path: str, digest: str):
    """Devuelve el ID de YouTube si este mismo mp4 ya se subió antes."""
    for p in glob.glob(os.path.join("youtube", "done", "*.json")):
        with open(p, encoding="utf-8") as fh:
            done = json.load(fh)
        if done.get("video") == video_path or done.get("sha256") == digest:
            return done.get("youtube_video_id", "desconocido")
    return None


def main() -> None:
    manifest_path = sys.argv[1]
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)

    if not os.path.exists(manifest["video"]):
        sys.exit(f"No existe el vídeo {manifest['video']}")

    # Garantiza que se sube el MISMO mp4 que se publica en Instagram y una sola vez.
    digest = sha256_of(manifest["video"])
    prev = already_uploaded(manifest["video"], digest)
    if prev:
        print(f"Omitido: este vídeo ya está en YouTube (id {prev}).")
        os.remove(manifest_path)
        return

    token = access_token()
    video_id = upload(token, manifest["video"], build_metadata(manifest))
    print(f"Subido: https://youtube.com/shorts/{video_id}")

    thumb = manifest.get("thumbnail")
    if thumb and os.path.exists(thumb):
        set_thumbnail(token, video_id, thumb)

    # Registrar el resultado y mover la cola a done/ para no repetir la subida.
    manifest["youtube_video_id"] = video_id
    manifest["sha256"] = digest
    done_dir = os.path.join("youtube", "done")
    os.makedirs(done_dir, exist_ok=True)
    with open(os.path.join(done_dir, os.path.basename(manifest_path)), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    os.remove(manifest_path)


if __name__ == "__main__":
    main()
