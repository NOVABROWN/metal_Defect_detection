import os
import shutil
from typing import List, Dict, Any

# Patch langchain module BEFORE any langchain imports.
# langchain_classic internals reference langchain.verbose/debug/llm_cache
# which were removed in LangChain 1.x — pre-patching avoids AttributeError.
import langchain as _lc
if not hasattr(_lc, "verbose"):  _lc.verbose = False
if not hasattr(_lc, "debug"):    _lc.debug = False
if not hasattr(_lc, "llm_cache"): _lc.llm_cache = None
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader, TextLoader, CSVLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain.chains.retrieval import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate


from dotenv import load_dotenv
import logging

load_dotenv(override=True)

logger = logging.getLogger(__name__)

# Constants
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploaded_docs")

# Ensure directories exist
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

class RAGEngine:
    def __init__(self):
        self.embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        self.vector_store = Chroma(
            persist_directory=CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings,
            collection_name="industrial_knowledge"
        )
        
        # Initialize LLM based on available API keys
        api_key = os.getenv("GEMINI_API_KEY")
        groq_key = os.getenv("GROQ_API_KEY")
        
        self.llm = None
        self.rag_chain = None
        
        try:
            if groq_key:
                logger.info("Using Groq LLM...")
                self.llm = ChatGroq(
                    model="llama-3.1-8b-instant",
                    temperature=0.3,
                    groq_api_key=groq_key
                )
            elif api_key:
                logger.info("Using Gemini LLM...")
                self.llm = ChatGoogleGenerativeAI(
                    model="models/gemini-1.5-flash",
                    temperature=0.3,
                    google_api_key=api_key
                )
            else:
                logger.warning("No API keys found. Will operate in Mock AI Fallback mode.")
        except Exception as e:
            logger.error(f"Failed to initialize LLM: {str(e)}")
            
        if self.llm:
            self.setup_chains()

    def setup_chains(self):
        """Setup the retrieval and prompt chains"""
        system_prompt = (
            "You are an expert AI industrial engineer assistant specialized in metal defect detection, "
            "recycling optimization, and smart manufacturing.\n"
            "Use the following pieces of retrieved context to answer the user's question. "
            "If you don't know the answer, say that you don't know, but try to provide general industrial knowledge if applicable.\n"
            "If the user asks about an image or prediction, try to incorporate the explainable AI insights provided in the query context.\n"
            "\n"
            "{context}\n"
        )
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{input}"),
        ])
        
        retriever = self.vector_store.as_retriever(search_kwargs={"k": 4})
        question_answer_chain = create_stuff_documents_chain(self.llm, prompt)
        self.rag_chain = create_retrieval_chain(retriever, question_answer_chain)

    async def ingest_document(self, file_path: str, filename: str) -> Dict[str, Any]:
        """Ingest a single document into the vector store"""
        try:
            ext = os.path.splitext(filename)[1].lower()
            loader = None
            
            if ext == '.pdf':
                loader = PyPDFLoader(file_path)
            elif ext == '.docx':
                loader = Docx2txtLoader(file_path) # Needs docx2txt package if not installed, but python-docx is installed. Let's use it or fallback to TextLoader for now. We might need docx2txt.
            elif ext == '.txt':
                loader = TextLoader(file_path)
            elif ext == '.csv':
                loader = CSVLoader(file_path)
            else:
                return {"success": False, "error": f"Unsupported file type: {ext}"}
                
            documents = loader.load()
            
            # Split texts
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100,
                length_function=len
            )
            chunks = text_splitter.split_documents(documents)
            
            # Add metadata
            for chunk in chunks:
                chunk.metadata["source_file"] = filename
                
            # Add to vector store
            self.vector_store.add_documents(chunks)
            
            return {
                "success": True, 
                "chunks_added": len(chunks),
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"Error ingesting document {filename}: {str(e)}")
            return {"success": False, "error": str(e)}

    async def chat(self, query: str, context_data: Dict[str, Any] = None) -> str:
        """
        Chat with the RAG model.
        context_data can contain explicit information about a recent defect prediction
        to power the Explainable AI (XAI) feature.
        """
        try:
            # Enhance query with XAI context if provided
            enhanced_query = query
            if context_data and "prediction" in context_data:
                pred = context_data["prediction"]
                enhanced_query = f"User Query: {query}\n\nContext regarding recent prediction:\n"
                enhanced_query += f"- Predicted Defect: {pred.get('defect_type')}\n"
                enhanced_query += f"- Confidence Score: {pred.get('confidence')}%\n"
                enhanced_query += f"- Severity: {pred.get('severity')}\n"
                enhanced_query += "Please incorporate this specific prediction into your response, explaining possible causes and solutions."
            
            if self.rag_chain:
                response = self.rag_chain.invoke({"input": enhanced_query})
                return response["answer"]
            else:
                raise Exception("No active LLM chain configured (API keys missing or invalid).")
        except Exception as e:
            logger.error(f"Chat generation error: {str(e)}")
            logger.info("Falling back to Mock AI offline retrieval.")
            return self._mock_chat(query, context_data)

    def _mock_chat(self, query: str, context_data: Dict[str, Any] = None) -> str:
        """
        Fallback mock chat that performs manual retrieval without an LLM.
        """
        try:
            docs = self.vector_store.similarity_search(query, k=2)
            
            response = "🤖 **Mock AI Fallback Mode:**\n"
            response += "_I encountered an API connection issue, so I am running in offline mode. Here is the raw information I found in your knowledge base:_\n\n"
            
            if context_data and "prediction" in context_data:
                pred = context_data["prediction"]
                response += f"**Detection Context Received:**\n- Type: {pred.get('defect_type')}\n- Severity: {pred.get('severity')}\n\n"
            
            if not docs:
                response += "No relevant documents found in the database."
            else:
                for i, doc in enumerate(docs):
                    source = doc.metadata.get("source_file", "Unknown Document")
                    response += f"**Source:** {source}\n> {doc.page_content.strip()}\n\n"
                    
            return response
        except Exception as e:
            return f"System completely offline. Error: {str(e)}"

# Singleton instance
rag_engine = RAGEngine()
