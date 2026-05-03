"""
Chat Memory — Manajemen History Percakapan
==========================================
Modul ini mengelola riwayat percakapan per session.
"""

import time
from collections import defaultdict
from typing import Optional
import os

# ── Konfigurasi ───────────────────────────────────────────────────────────────

MAX_HISTORY_MESSAGES = 20   # Simpan maksimal 20 pesan per session (10 giliran)
SESSION_TTL_SECONDS  = 3600 # Hapus session yang tidak aktif selama 1 jam


# ── In-Memory Store (Development) ────────────────────────────────────────────

class ChatMemory:
    """
    Menyimpan history percakapan dalam format OpenAI messages.
    
    Format history:
    [
        {"role": "user",      "content": "Apa itu diabetes?"},
        {"role": "assistant", "content": "Diabetes adalah..."},
        {"role": "user",      "content": "Gejalanya apa?"},
        ...
    ]

    """

    def __init__(self):
        # session_id → {"messages": [...], "last_active": timestamp}
        self._store: dict[str, dict] = defaultdict(
            lambda: {"messages": [], "last_active": time.time()}
        )

    def get_history(self, session_id: str) -> list[dict]:
        """
        Ambil history percakapan untuk session ini.
        Kembalikan list messages (tanpa system prompt).
        """
        self._cleanup_expired()
        session = self._store[session_id]
        session["last_active"] = time.time()
        return session["messages"].copy()

    def add_turn(self, session_id: str, user_msg: str, assistant_msg: str):

        session = self._store[session_id]
        messages = session["messages"]

        messages.append({"role": "user",      "content": user_msg})
        messages.append({"role": "assistant", "content": assistant_msg})

        # Sliding window: buang pesan lama jika melebihi batas
        # Selalu buang sepasang (user+assistant) agar tetap seimbang
        while len(messages) > MAX_HISTORY_MESSAGES:
            messages.pop(0)  # hapus user lama
            messages.pop(0)  # hapus assistant lama

        session["last_active"] = time.time()

    def clear(self, session_id: str):
        """Hapus seluruh history untuk session ini."""
        if session_id in self._store:
            del self._store[session_id]

    def get_session_info(self, session_id: str) -> dict:
        """Info debug untuk session tertentu."""
        session = self._store.get(session_id)
        if not session:
            return {"exists": False}
        return {
            "exists": True,
            "message_count": len(session["messages"]),
            "turn_count": len(session["messages"]) // 2,
            "last_active": session["last_active"],
        }

    def _cleanup_expired(self):
        """Hapus session yang sudah kadaluarsa (hemat memori)."""
        now = time.time()
        expired = [
            sid for sid, data in self._store.items()
            if now - data["last_active"] > SESSION_TTL_SECONDS
        ]
        for sid in expired:
            del self._store[sid]