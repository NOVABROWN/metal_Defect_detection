from fastapi import FastAPI, File, UploadFile, HTTPException
from dotenv import load_dotenv
load_dotenv(override=True)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
from PIL import Image
import io
import logging
from defect_model import DefectDetectionModel
from utils import preprocess_image, get_severity_level

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Metal Defect Detection API",
    description="AI Service for detecting defects in metal surfaces and AI Chatbot",
    version="1.0.0"
)

from chat_router import router as chat_router
app.include_router(chat_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model on startup
model = None

@app.on_event("startup")
async def load_model():
    global model
    try:
        logger.info("Loading defect detection model...")
        model = DefectDetectionModel()
        model.load_model()
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "success": True,
        "status": "AI Service is running",
        "message": "Model loaded and ready for predictions"
    }

@app.post("/predict")
async def predict_defect(file: UploadFile = File(...)):
    """
    Predict defect type from uploaded image
    
    Input: Image file (JPG, PNG)
    Output: 
    {
        "defect_type": str,
        "confidence": float,
        "severity": str
    }
    """
    try:
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Preprocess image
        processed_image = preprocess_image(image)
        
        # Make prediction
        if model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")
        
        defect_type, confidence = model.predict(processed_image)
        severity = get_severity_level(confidence)
        
        return {
            "success": True,
            "data": {
                "defect_type": defect_type,
                "confidence": float(confidence),
                "severity": severity
            },
            "message": "Prediction completed successfully"
        }
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return {
            "success": False,
            "data": {},
            "message": f"Error during prediction: {str(e)}"
        }

@app.post("/predict-batch")
async def predict_batch(files: list[UploadFile] = File(...)):
    """
    Batch prediction for multiple images
    """
    try:
        results = []
        
        for file in files:
            contents = await file.read()
            image = Image.open(io.BytesIO(contents))
            processed_image = preprocess_image(image)
            
            defect_type, confidence = model.predict(processed_image)
            severity = get_severity_level(confidence)
            
            results.append({
                "filename": file.filename,
                "defect_type": defect_type,
                "confidence": float(confidence),
                "severity": severity
            })
        
        return {
            "success": True,
            "data": results,
            "message": f"Batch prediction completed for {len(results)} images"
        }
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return {
            "success": False,
            "data": [],
            "message": f"Error during batch prediction: {str(e)}"
        }

@app.get("/model-info")
async def get_model_info():
    """Get information about the loaded model"""
    return {
        "success": True,
        "data": {
            "model_type": "CNN - ResNet50 Transfer Learning",
            "input_size": [224, 224, 3],
            "defect_classes": [
                "Crazing",
                "Inclusion",
                "Patches",
                "Pitted Surface",
                "Rolled-in Scale",
                "Scratches"
            ],
            "framework": "PyTorch"
        },
        "message": "Model information retrieved"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
