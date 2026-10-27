#!/usr/bin/env python3
"""Publica un mp4 vertical en TikTok con la Content Posting API (Direct Post).

Uso: python3 tiktok/upload_tiktok.py tiktok/queue/AAAA-MM-DD.json

El JSON de cola tiene este formato:
{
  "video": "reels/2026-10-22.mp4",
  "title": "Texto del pie + hashtags propios para TikTok (máx. 2200 caracteres)",
  "cover_timestamp_ms": 1000,      (opcional: fotograma usado como portada)
  "is_aigc": true                  (opcional, por defecto true: etiqueta contenido generado por IA)
}

Credenciales (secrets del repo, nunca se imprimen):
  TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_REFRESH_TOKEN

Privacidad: se pide la máxima disponible para la cuenta. Mientras la app de TikTok
no haya pasado la auditoría, TikTok solo ofrece SELF_ONLY (solo yo) y el vídeo se
publica en privado; tras la auditoría pasa a público sin tocar nada.
Se puede forzar con la variable TIKTOK_PRIVACY (p. ej. SELF_ONLY para pruebas).
"""
import glob
import hashlib
import json
import os
import sys
import time

import requests

API = "https://open.tiktokapis.com"
TOKEN_URL = f"{API}/v2/oauth/token/"
CREATOR_URL = f"{API}/v2/post/publish/creator_info/query/"
INIT_URL = f"{API}/v2/post/publish/video/init/"
STATUS_URL = f"{API}/v2/post/publish/status/fetch/"

# Orden de preferencia de privacidad (de más a menos pública).
PRIVACY_ORDER = ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"]
MB = 1024 * 1024


def access_token() -> str:
    r = requests.post(
        TOKEN_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_key": os.environ["TIKTOK_CLIENT_KEY"],
            "client_secret": os.environ["TIKTOK_CLIENT_SECRET"],
            "grant_type": "refresh_token",
            "refresh_token": os.environ["TIKTOK_REFRESH_TOKEN"],
        },
        timeout=60,
    )
    body = r.json() if r.content else {}
    if r.status_code != 200 or "access_token" not in body:
        sys.exit(f"Error renovando el token ({r.status_code}): {body.get('error')} {body.get('error_description', '')}")
    new_refresh = body.get("refresh_token")
    if new_refresh and new_refresh != os.environ["TIKTOK_REFRESH_TOKEN"]:
        # TikTok puede rotar el refresh token. El antiguo suele seguir valiendo un tiempo,
        # pero conviene actualizar el secret TIKTOK_REFRESH_TOKEN (no se imprime aquí).
        print("AVISO: TikTok ha devuelto un refresh token nuevo; hay que actualizar el secret TIKTOK_REFRESH_TOKEN.")
    return body["access_token"]


def choose_privacy(token: str) -> str:
    r = requests.post(
        CREATOR_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
        timeout=60,
    )
    body = r.json() if r.content else {}
    err = body.get("error", {})
    if r.status_code != 200 or err.get("code") not in (None, "ok"):
        sys.exit(f"Error consultando la cuenta ({r.status_code}): {err.get('code')} {err.get('message', '')}")
    options = body.get("data", {}).get("privacy_level_options", [])
    forced = os.environ.get("TIKTOK_PRIVACY", "").strip()
    if forced:
        if forced not in options:
            sys.exit(f"TIKTOK_PRIVACY={forced} no está disponible para esta cuenta (opciones: {options})")
        return forced
    for level in PRIVACY_ORDER:
        if level in options:
            return level
    sys.exit(f"TikTok no ofrece ninguna privacidad válida (opciones: {options})")


def plan_chunks(size: int):
    """Devuelve (chunk_size, total_chunks) según las reglas de TikTok:
    trozos de 5-64 MB (el último puede llegar a 128 MB); <5 MB se sube de una vez."""
    if size <= 64 * MB:
        return size, 1
    chunk = 32 * MB
    return chunk, size // chunk  # el último trozo absorbe el resto


def init_post(token: str, manifest: dict, size: int, privacy: str):
    chunk_size, total = plan_chunks(size)
    post_info = {
        "title": manifest["title"].strip()[:2200],
        "privacy_level": privacy,
        "disable_duet": False,
        "disable_comment": False,
        "disable_stitch": False,
        "is_aigc": bool(manifest.get("is_aigc", True)),
    }
    if "cover_timestamp_ms" in manifest:
        post_info["video_cover_timestamp_ms"] = int(manifest["cover_timestamp_ms"])
    payload = {
        "post_info": post_info,
        "source_info": {
            "source": "FILE_UPLOAD",
            "video_size": size,
            "chunk_size": chunk_size,
            "total_chunk_count": total,
        },
    }
    r = requests.post(
        INIT_URL,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
        data=json.dumps(payload),
        timeout=60,
    )
    body = r.json() if r.content else {}
    err = body.get("error", {})
    if r.status_code != 200 or err.get("code") not in (None, "ok"):
        sys.exit(f"Error iniciando la publicación ({r.status_code}): {err.get('code')} {err.get('message', '')}")
    data = body["data"]
    return data["publish_id"], data["upload_url"], chunk_size, total


def upload_chunks(upload_url: str, video_path: str, size: int, chunk_size: int, total: int) -> None:
    with open(video_path, "rb") as fh:
        for i in range(total):
            start = i * chunk_size
            end = size - 1 if i == total - 1 else start + chunk_size - 1
            fh.seek(start)
            data = fh.read(end - start + 1)
            r = requests.put(
                upload_url,
                data=data,
                headers={
                    "Content-Type": "video/mp4",
                    "Content-Length": str(len(data)),
                    "Content-Range": f"bytes {start}-{end}/{size}",
                },
                timeout=600,
            )
            if r.status_code not in (200, 201, 206):
                sys.exit(f"Error subiendo el trozo {i + 1}/{total} ({r.status_code}): {r.text[:300]}")


def wait_for_publish(token: str, publish_id: str, timeout_s: int = 300) -> dict:
    deadline = time.time() + timeout_s
    last = {}
    while time.time() < deadline:
        r = requests.post(
            STATUS_URL,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json; charset=UTF-8"},
            data=json.dumps({"publish_id": publish_id}),
            timeout=60,
        )
        body = r.json() if r.content else {}
        last = body.get("data", {})
        status = last.get("status")
        if status == "PUBLISH_COMPLETE":
            return last
        if status == "FAILED":
            sys.exit(f"TikTok rechazó la publicación: {last.get('fail_reason')}")
        time.sleep(10)
    sys.exit(f"Tiempo agotado esperando a TikTok (último estado: {last.get('status')})")


def sha256_of(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def already_uploaded(video_path: str, digest: str):
    """Devuelve el publish_id si este mismo mp4 ya se publicó antes en TikTok."""
    for p in glob.glob(os.path.join("tiktok", "done", "*.json")):
        with open(p, encoding="utf-8") as fh:
            done = json.load(fh)
        if done.get("video") == video_path or done.get("sha256") == digest:
            return done.get("tiktok_publish_id", "desconocido")
    return None


def main() -> None:
    manifest_path = sys.argv[1]
    with open(manifest_path, encoding="utf-8") as fh:
        manifest = json.load(fh)

    if not os.path.exists(manifest["video"]):
        sys.exit(f"No existe el vídeo {manifest['video']}")

    # Garantiza que se publica el MISMO mp4 que en Instagram/YouTube y una sola vez.
    digest = sha256_of(manifest["video"])
    prev = already_uploaded(manifest["video"], digest)
    if prev:
        print(f"Omitido: este vídeo ya está en TikTok (publish_id {prev}).")
        os.remove(manifest_path)
        return

    token = access_token()
    privacy = choose_privacy(token)
    size = os.path.getsize(manifest["video"])
    publish_id, upload_url, chunk_size, total = init_post(token, manifest, size, privacy)
    upload_chunks(upload_url, manifest["video"], size, chunk_size, total)
    result = wait_for_publish(token, publish_id)
    print(f"Publicado en TikTok (privacidad: {privacy}, publish_id {publish_id}).")

    manifest["tiktok_publish_id"] = publish_id
    manifest["tiktok_privacy"] = privacy
    ids = result.get("publicaly_available_post_id") or result.get("publicly_available_post_id")
    if ids:
        manifest["tiktok_post_ids"] = ids
    manifest["sha256"] = digest
    done_dir = os.path.join("tiktok", "done")
    os.makedirs(done_dir, exist_ok=True)
    with open(os.path.join(done_dir, os.path.basename(manifest_path)), "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    os.remove(manifest_path)


if __name__ == "__main__":
    main()
