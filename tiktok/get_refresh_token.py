#!/usr/bin/env python3
"""Autoriza la cuenta de TikTok una sola vez y obtiene el refresh token.

Ejecútalo en tu ordenador (NO en GitHub Actions: el repo es público y el log se vería):

    python3 tiktok/get_refresh_token.py

Te pide el Client key y el Client secret de la app (developers.tiktok.com), te da una
URL para abrir e iniciar sesión con @asmr_explains, y luego te pide el código que
muestra la página de retorno. Al final imprime el refresh token, que debes guardar como
secret TIKTOK_REFRESH_TOKEN del repo (junto a TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET).
"""
import getpass
import secrets
import sys
import urllib.parse

import requests

AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/"
TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
SCOPES = "user.info.basic,video.publish,video.upload"
# Debe coincidir EXACTAMENTE con el Redirect URI registrado en la app de TikTok.
REDIRECT_URI = "https://aej-lab.github.io/asmr-reels-x7k2q/tiktok-callback.html"


def main() -> None:
    client_key = input("Client key: ").strip()
    client_secret = getpass.getpass("Client secret (no se muestra): ").strip()
    state = secrets.token_urlsafe(16)
    url = AUTH_URL + "?" + urllib.parse.urlencode(
        {
            "client_key": client_key,
            "scope": SCOPES,
            "response_type": "code",
            "redirect_uri": REDIRECT_URI,
            "state": state,
        }
    )
    print("\n1) Abre esta URL, inicia sesión con la cuenta de @asmr_explains y pulsa Autorizar:\n")
    print(url)
    print("\n2) La página de retorno te mostrará un código. Pégalo aquí.")
    code = urllib.parse.unquote(input("Código: ").strip())

    r = requests.post(
        TOKEN_URL,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "client_key": client_key,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": REDIRECT_URI,
        },
        timeout=60,
    )
    body = r.json() if r.content else {}
    if r.status_code != 200 or "refresh_token" not in body:
        sys.exit(f"Error ({r.status_code}): {body.get('error')} {body.get('error_description', '')}")
    print("\nHecho. Scopes concedidos:", body.get("scope"))
    print("Refresh token (guárdalo como secret TIKTOK_REFRESH_TOKEN; no lo compartas):\n")
    print(body["refresh_token"])


if __name__ == "__main__":
    main()
