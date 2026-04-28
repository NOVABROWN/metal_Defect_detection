import torch
import torch.nn as nn
from torchvision import models, transforms
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DefectDetectionModel:
    """
    CNN model for metal defect detection using Transfer Learning (ResNet50)
    """
    
    DEFECT_CLASSES = [
        "Crazing",
        "Inclusion", 
        "Patches",
        "Pitted Surface",
        "Rolled-in Scale",
        "Scratches"
    ]
    
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.transform = self._get_transforms()
        self.class_to_idx = {cls: idx for idx, cls in enumerate(self.DEFECT_CLASSES)}
        self.idx_to_class = {idx: cls for idx, cls in enumerate(self.DEFECT_CLASSES)}
        
    def _get_transforms(self):
        """Define image transformation pipeline"""
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def build_model(self):
        """Build ResNet50 model with custom classification head"""
        try:
            logger.info("Building ResNet50 model...")
            
            # Load pretrained ResNet50
            resnet50 = models.resnet50(pretrained=True)
            
            # Freeze backbone layers
            for param in resnet50.parameters():
                param.requires_grad = False
            
            # Replace final classification layer
            num_features = resnet50.fc.in_features
            resnet50.fc = nn.Sequential(
                nn.Linear(num_features, 512),
                nn.ReLU(),
                nn.Dropout(0.3),
                nn.Linear(512, 128),
                nn.ReLU(),
                nn.Dropout(0.2),
                nn.Linear(128, len(self.DEFECT_CLASSES))
            )
            
            self.model = resnet50.to(self.device)
            logger.info("Model built successfully!")
            return self.model
            
        except Exception as e:
            logger.error(f"Error building model: {str(e)}")
            raise
    
    def load_model(self):
        """Load model from checkpoint or create new one"""
        model_path = Path("model/defect_model.pth")
        
        if model_path.exists():
            logger.info(f"Loading model from {model_path}...")
            self.build_model()
            checkpoint = torch.load(model_path, map_location=self.device)
            self.model.load_state_dict(checkpoint)
            self.model.eval()
        else:
            logger.info("No checkpoint found. Creating new model...")
            self.build_model()
            self.model.eval()
    
    def predict(self, image_tensor):
        """
        Make prediction on image tensor
        Returns: (defect_type, confidence_score)
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Ensure input is on correct device
            if not isinstance(image_tensor, torch.Tensor):
                image_tensor = self.transform(image_tensor)
            
            image_tensor = image_tensor.unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted_idx = torch.max(probabilities, 1)
                
                defect_type = self.idx_to_class[predicted_idx.item()]
                confidence_score = confidence.item()
            
            return defect_type, confidence_score
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise
    
    def predict_with_probabilities(self, image_tensor):
        """
        Get predictions with all class probabilities
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            if not isinstance(image_tensor, torch.Tensor):
                image_tensor = self.transform(image_tensor)
            
            image_tensor = image_tensor.unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
            
            results = {}
            for idx, cls in self.idx_to_class.items():
                results[cls] = probabilities[0, idx].item()
            
            return results
            
        except Exception as e:
            logger.error(f"Error in predict_with_probabilities: {str(e)}")
            raise
    
    def save_model(self, save_path="model/defect_model.pth"):
        """Save model checkpoint"""
        try:
            Path("model").mkdir(exist_ok=True)
            torch.save(self.model.state_dict(), save_path)
            logger.info(f"Model saved to {save_path}")
        except Exception as e:
            logger.error(f"Error saving model: {str(e)}")
            raise
