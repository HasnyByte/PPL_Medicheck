import json
from db import get_connection

# 1. load JSON
with open("embedded_chunks.json", "r") as f:
    data = json.load(f)

# 2. koneksi DB
conn = get_connection()

with conn.cursor() as cursor:
    sql = """
    INSERT INTO documents (content, embedding, penyakit, kategori)
    VALUES (%s, %s, %s, %s)
    """

    data_to_insert = []

    for d in data:
        data_to_insert.append((
            d["content"],
            json.dumps(d["embedding"]),   # penting
            d["metadata"]["penyakit"],
            d["metadata"]["kategori"]
        ))

    # 3. insert batch
    cursor.executemany(sql, data_to_insert)

conn.commit()
conn.close()

print(" Semua data JSON berhasil masuk ke DB")