from typing import List, Dict, Any

DOCUMENT_KNOWLEDGE_BASE = [
    {
        "id": "DOC-101",
        "category": "security_policy",
        "title": "FinGuard AI Fraud Thresholds & Scoring Policy",
        "content": "Transactions with risk scores between 0-30% are Low Risk. 30-60% are Medium Risk. 60-80% are High Risk. Above 80% are Critical Risk. Critical and High risk transactions trigger automatic real-time WebSocket alerts and initiate an investigation case."
    },
    {
        "id": "DOC-102",
        "category": "model_info",
        "title": "Ensemble ML Architecture Overview",
        "content": "FinGuard AI utilizes 4 layers of fraud detection: 1) Supervised XGBoost for probability estimation, 2) Unsupervised Isolation Forest for anomaly detection, 3) PyTorch LSTM for sequential behavioral analysis, and 4) Rule-based engine for immediate policy enforcement."
    },
    {
        "id": "DOC-103",
        "category": "investigation_guide",
        "title": "Fraud Investigator SLA and Workflow Guidelines",
        "content": "Analysts investigating flagged cases must review the entity network graph (Device ID, IP address, Merchant, Account) and SHAP feature importance breakdown before taking actions: Mark Fraud, Mark Legitimate, or Escalate."
    }
]

class RAGEngine:
    """Retrieval-Augmented Generation context retriever for financial intelligence."""

    def __init__(self):
        self.documents = DOCUMENT_KNOWLEDGE_BASE

    def search_context(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        query_words = set(query.lower().split())
        results = []
        for doc in self.documents:
            content_words = set(doc["content"].lower().split() + doc["title"].lower().split())
            overlap = len(query_words.intersection(content_words))
            if overlap > 0:
                results.append((overlap, doc))
        
        results.sort(key=lambda x: x[0], reverse=True)
        return [doc for _, doc in results[:top_k]] if results else [self.documents[0]]

rag_engine = RAGEngine()
