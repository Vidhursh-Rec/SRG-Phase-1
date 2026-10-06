"""
policy_retriever.py
--------------------
WHY THIS FILE EXISTS:
This is the "R" in RAG for your policy-violation check. Before the
decision engine can ask "does this response contradict company policy?",
it first needs the RELEVANT chunk of the policy document -- not the whole
document (too long, wastes tokens, dilutes the LLM's judgement).

This file's only job: given a query (the bot's draft response, or the
customer's question), return the top-k most relevant policy chunks from
storage/policy_docs/, using embedding similarity search (FAISS).

It does NOT decide violation/no-violation -- that's decision_engine.py's
job, using an LLM to compare the response against what THIS file retrieves.
"""

import os
import pickle
from pathlib import Path

try:
    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np
except ImportError as e:
    raise ImportError(
        "Missing dependency for policy_retriever.py. Run:\n"
        "  pip install sentence-transformers faiss-cpu numpy --break-system-packages"
    ) from e


POLICY_DOCS_DIR = Path(__file__).resolve().parent.parent / "storage" / "policy_docs"
INDEX_DIR = Path(__file__).resolve().parent.parent / "storage" / "faiss_index"
INDEX_FILE = INDEX_DIR / "policy.index"
CHUNKS_FILE = INDEX_DIR / "chunks.pkl"

_MODEL_NAME = "all-MiniLM-L6-v2"  # small, fast, good enough for short policy chunks


def _chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    """Simple sliding-window chunking so long policy docs aren't embedded as one blob."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start = end - overlap
    return chunks


class PolicyRetriever:
    def __init__(self):
        self.model = SentenceTransformer(_MODEL_NAME)
        self.index = None
        self.chunks: list[str] = []

    def build_index(self, docs_dir: Path = POLICY_DOCS_DIR):
        """
        Reads every .txt file in storage/policy_docs/, chunks it, embeds it,
        and builds a FAISS index. Run this once whenever policy docs change
        -- not on every request (that would be slow and pointless).
        """
        self.chunks = []
        for file in Path(docs_dir).glob("*.txt"):
            text = file.read_text(encoding="utf-8")
            self.chunks.extend(_chunk_text(text))

        if not self.chunks:
            raise ValueError(f"No .txt policy documents found in {docs_dir}")

        embeddings = self.model.encode(self.chunks, convert_to_numpy=True)
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dim)
        self.index.add(embeddings)

        INDEX_DIR.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(INDEX_FILE))
        with open(CHUNKS_FILE, "wb") as f:
            pickle.dump(self.chunks, f)

    def load_index(self):
        """Loads a previously built index from disk instead of rebuilding."""
        if not INDEX_FILE.exists():
            raise FileNotFoundError(
                "No saved FAISS index found. Call build_index() first."
            )
        self.index = faiss.read_index(str(INDEX_FILE))
        with open(CHUNKS_FILE, "rb") as f:
            self.chunks = pickle.load(f)

    def retrieve(self, query: str, k: int = 3) -> list[str]:
        """Returns the top-k most relevant policy chunks for a given query."""
        if self.index is None:
            raise RuntimeError("Index not loaded. Call build_index() or load_index() first.")
        query_vec = self.model.encode([query], convert_to_numpy=True)
        distances, indices = self.index.search(query_vec, k)
        return [self.chunks[i] for i in indices[0] if i < len(self.chunks)]
