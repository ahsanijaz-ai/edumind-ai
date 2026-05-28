import chromadb
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from core.config import settings

# Initialize Chroma DB locally
chroma_client = chromadb.PersistentClient(path="./chroma_db")

def get_embeddings():
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )

def get_vector_store():
    return Chroma(
        client=chroma_client,
        collection_name="edumind_materials",
        embedding_function=get_embeddings()
    )

def add_documents_to_db(documents: list[Document]):
    vector_store = get_vector_store()
    vector_store.add_documents(documents)
    
def search_documents(query: str, k: int = 3):
    vector_store = get_vector_store()
    results = vector_store.similarity_search(query, k=k)
    return results
