from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Form
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
import shutil
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from rag_engine import rag_engine, UPLOAD_DIR
import logging
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["AI Chatbot"])

@router.post("/generate-report")
async def generate_report(data: Dict[str, Any]):
    """
    Generate a PDF inspection report based on detection data.
    """
    try:
        report_dir = os.path.join(os.path.dirname(__file__), "reports")
        os.makedirs(report_dir, exist_ok=True)
        
        filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        file_path = os.path.join(report_dir, filename)
        
        doc = SimpleDocTemplate(file_path, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []
        
        # Title
        elements.append(Paragraph("Industrial Metal Defect Inspection Report", styles['Title']))
        elements.append(Spacer(1, 12))
        
        # Summary
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", styles['Normal']))
        elements.append(Spacer(1, 24))
        
        # Data Table
        table_data = [
            ["Attribute", "Details"],
            ["Defect Type", data.get("defectType", "N/A")],
            ["Confidence", f"{data.get('confidence', 0)}%"],
            ["Severity", data.get("severity", "N/A")],
            ["Metal Type", data.get("metalType", "N/A")],
            ["Timestamp", data.get("createdAt", "N/A")]
        ]
        
        t = Table(table_data, colWidths=[150, 300])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(t)
        elements.append(Spacer(1, 24))
        
        # AI Insights Section
        elements.append(Paragraph("AI Assistant Insights", styles['Heading2']))
        elements.append(Paragraph(
            "The detected defect has been analyzed by our AI system. "
            "Recommended maintenance and recycling procedures should be followed as per the dashboard guidelines.",
            styles['Normal']
        ))
        
        doc.build(elements)
        
        return FileResponse(file_path, filename=filename, media_type='application/pdf')
        
    except Exception as e:
        logger.error(f"Report generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# MongoDB connection for chat history
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/metal_defect_db")
client = AsyncIOMotorClient(MONGODB_URL)
db = client.get_database()
chat_collection = db.get_collection("chat_history")

class ChatRequest(BaseModel):
    message: str
    session_id: str
    context_data: Optional[Dict[str, Any]] = None

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Send a message to the AI Chatbot and get a response.
    Stores conversation history in MongoDB.
    """
    try:
        # Get AI Response
        ai_response = await rag_engine.chat(
            query=request.message, 
            context_data=request.context_data
        )
        
        # Save to MongoDB
        chat_doc = {
            "session_id": request.session_id,
            "user_message": request.message,
            "ai_response": ai_response,
            "context_used": request.context_data is not None,
            "timestamp": datetime.utcnow()
        }
        await chat_collection.insert_one(chat_doc)
        
        return {
            "success": True,
            "data": {
                "response": ai_response,
                "timestamp": chat_doc["timestamp"].isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-docs")
async def upload_document(file: UploadFile = File(...)):
    """
    Upload a document (PDF, TXT, DOCX, CSV) to be ingested into the RAG vector database.
    """
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        
        # Save file locally temporarily
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Ingest into Vector DB
        result = await rag_engine.ingest_document(file_path, file.filename)
        
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
            
        return {
            "success": True,
            "message": f"Successfully indexed {result['chunks_added']} chunks from {file.filename}",
            "data": result
        }
        
    except Exception as e:
        logger.error(f"Document upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history/{session_id}")
async def get_chat_history(session_id: str, limit: int = 50):
    """
    Retrieve past conversation history for a specific session.
    """
    try:
        cursor = chat_collection.find({"session_id": session_id}).sort("timestamp", 1).limit(limit)
        history = await cursor.to_list(length=limit)
        
        # Format for response
        formatted_history = []
        for doc in history:
            formatted_history.append({
                "id": str(doc["_id"]),
                "role": "user",
                "content": doc["user_message"],
                "timestamp": doc["timestamp"].isoformat()
            })
            formatted_history.append({
                "id": str(doc["_id"]) + "_ai",
                "role": "ai",
                "content": doc["ai_response"],
                "timestamp": doc["timestamp"].isoformat()
            })
            
        return {
            "success": True,
            "data": formatted_history
        }
        
    except Exception as e:
        logger.error(f"Error fetching history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
