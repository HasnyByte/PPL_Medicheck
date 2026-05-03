import numpy as np
import json
from sentence_transformers import SentenceTransformer
from db import get_connection

# load model sekali
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# cache global
DOCUMENTS = []

def load_documents_once():
    global DOCUMENTS

    if DOCUMENTS:
        return DOCUMENTS

    conn = get_connection()

    with conn.cursor() as cursor:
        cursor.execute("SELECT content, embedding, penyakit, kategori FROM documents")
        rows = cursor.fetchall()

        for row in rows:
            content, emb_json, penyakit, kategori = row

            DOCUMENTS.append({
                "content": content,
                "embedding": np.array(json.loads(emb_json)),
                "metadata": {
                    "penyakit": penyakit,
                    "kategori": kategori
                }
            })

    conn.close()
    return DOCUMENTS


# 🔥 INI fungsi yang kamu tanya
def retrieve(query, top_k=3):
    query_emb = model.encode(query)

    documents = load_documents_once()

    embeddings = np.array([doc["embedding"] for doc in documents])

    scores = embeddings @ query_emb / (
        np.linalg.norm(embeddings, axis=1) * np.linalg.norm(query_emb)
    )

    top_idx = np.argsort(scores)[-top_k:][::-1]

    return [documents[i] for i in top_idx]