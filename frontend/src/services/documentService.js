import api from './api';

const LOCAL_DOCS_KEY = "agrivision_local_documents";

const readLocalDocs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeLocalDocs = (docs) => {
  localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
};

const normalizePayload = (data) => {
  if (data instanceof FormData) {
    return {
      title: data.get("title") || "Untitled",
      crop_type: data.get("crop_type") || "Unknown",
      disease_name: data.get("disease_name") || "",
      content: data.get("content") || "",
      tags: data.get("tags") || "",
    };
  }

  return data || {};
};

export const getDocuments = async () => {
  try {
    const response = await api.get("/documents");
    return response.data;
  } catch {
    return readLocalDocs();
  }
};

export const uploadDocument = async (data) => {
  try {
    const response = await api.post("/documents", data);
    return response.data;
  } catch {
    const payload = normalizePayload(data);
    const docs = readLocalDocs();
    const newDoc = {
      id: `local-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...payload,
    };
    docs.unshift(newDoc);
    writeLocalDocs(docs);
    return newDoc;
  }
};

export const deleteDocument = async (id) => {
  try {
    await api.delete(`/documents/${id}`);
  } catch {
    const docs = readLocalDocs();
    const updated = docs.filter((doc) => (doc.id || doc._id) !== id);
    writeLocalDocs(updated);
  }
};

export const queryRAG = async (question, cropType) => {
  try {
    const response = await api.post("/rag/query", { question, cropType, llm: true });
    return response.data;
  } catch {
    const docs = readLocalDocs();
    const q = (question || "").toLowerCase();
    const filtered = docs.filter((doc) => {
      const matchesCrop = cropType
        ? (doc.crop_type || "").toLowerCase().includes(cropType.toLowerCase())
        : true;
      const text = `${doc.title || ""} ${doc.disease_name || ""} ${doc.content || ""}`.toLowerCase();
      return matchesCrop && (!q || text.includes(q));
    });

    return {
      results: filtered.slice(0, 5).map((doc) => ({
        title: doc.title,
        crop_type: doc.crop_type,
        disease_name: doc.disease_name,
        snippet: (doc.content || "").slice(0, 220),
        score: 0.5,
      })),
      sources: filtered.slice(0, 5).map((doc) => ({
        document_name: doc.title,
      })),
      fallback: true,
    };
  }
};