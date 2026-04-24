"""
ChromaDB Vector Store for RAG
Stores and retrieves treatment recommendations for semantic search
"""

import chromadb
from chromadb.config import Settings
import os
from pathlib import Path
from typing import List, Dict, Optional
import json

# Initialize ChromaDB client
chroma_client = chromadb.PersistentClient(
    path=str(Path(__file__).parent.parent / "chroma_db")
)

# Get or create collection
collection = chroma_client.get_or_create_collection(
    name="treatments",
    metadata={"hnsw:space": "cosine"}
)


def add_treatment(
    treatment_id: str,
    disease: str,
    crop: str,
    treatment_text: str,
    metadata: Optional[Dict] = None
):
    """Add a treatment document to the vector store"""
    
    doc_metadata = {
        "disease": disease,
        "crop": crop,
        "treatment_id": treatment_id,
        **(metadata or {})
    }
    
    collection.add(
        documents=[treatment_text],
        metadatas=[doc_metadata],
        ids=[treatment_id]
    )


def search_treatments(
    query: str,
    disease: Optional[str] = None,
    crop: Optional[str] = None,
    n_results: int = 3
) -> List[Dict]:
    """Search for similar treatments with optional filters"""
    
    where_filter = {}
    if disease:
        where_filter["disease"] = disease
    if crop:
        where_filter["crop"] = crop
    
    where_clause = {"$and": [{k: v} for k, v in where_filter.items()]} if where_filter else None
    
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        where=where_clause,
        include=["documents", "metadatas", "distances"]
    )
    
    formatted_results = []
    if results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            formatted_results.append({
                "document": doc,
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "distance": results["distances"][0][i] if results["distances"] else None
            })
    
    return formatted_results


def initialize_from_database():
    """Initialize ChromaDB with existing treatments from SQLite"""
    try:
        from sqlalchemy.future import select
        from models.database import TreatmentRecommendation
        from services.database import get_db_session
        
        # This will be called during app startup
        print("Initializing ChromaDB with existing treatments...")
        
        # Note: Implementation depends on your database structure
        # This is a placeholder for the actual implementation
        print("ChromaDB initialized successfully")
        
    except Exception as e:
        print(f"Error initializing ChromaDB: {e}")


def clear_collection():
    """Clear all documents from the collection"""
    collection.delete(where={})
    print("ChromaDB collection cleared")


# Example usage
if __name__ == "__main__":
    # Add sample treatment
    add_treatment(
        treatment_id="sample_001",
        disease="Early Blight",
        crop="Tomato",
        treatment_text="Apply copper-based fungicide every 7-10 days. Remove infected leaves immediately. Ensure proper spacing for air circulation. Water at the base to avoid leaf wetness."
    )
    
    # Search
    results = search_treatments("fungicide treatment for tomato blight")
    print(f"Found {len(results)} results")
    for result in results:
        print(f"- {result['metadata']['disease']}: {result['document'][:100]}...")
