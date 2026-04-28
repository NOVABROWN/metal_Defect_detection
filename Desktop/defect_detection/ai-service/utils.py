import cv2
import numpy as np
from PIL import Image
from torchvision import transforms

def preprocess_image(image, target_size=(224, 224)):
    """
    Preprocess image for model prediction
    """
    # Convert PIL image to numpy array if needed
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    # If grayscale, convert to RGB
    if len(image.shape) == 2:
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_RGBA2RGB)
    
    # Resize to target size
    image = cv2.resize(image, target_size)
    
    # Normalize
    image = image.astype(np.float32) / 255.0
    
    return image

def normalize_image(image):
    """
    Apply ImageNet normalization
    """
    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])
    
    image = (image - mean) / std
    return image

def get_severity_level(confidence):
    """
    Determine severity level based on confidence score
    
    Logic:
    - confidence < 0.5 → Low
    - 0.5 ≤ confidence ≤ 0.8 → Medium
    - confidence > 0.8 → High
    """
    if confidence < 0.5:
        return "Low"
    elif confidence <= 0.8:
        return "Medium"
    else:
        return "High"

def apply_data_augmentation(image):
    """
    Apply data augmentation techniques
    - Rotation
    - Flip
    - Zoom
    - Noise
    """
    augmentations = {
        'rotation': lambda img: cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE),
        'flip_h': lambda img: cv2.flip(img, 1),
        'flip_v': lambda img: cv2.flip(img, 0),
    }
    
    return augmentations

def add_gaussian_noise(image, mean=0, std=0.1):
    """Add Gaussian noise to image"""
    noise = np.random.normal(mean, std, image.shape)
    noisy_image = np.clip(image + noise, 0, 255).astype(np.uint8)
    return noisy_image

def apply_brightness_augmentation(image, factor=0.2):
    """Apply random brightness adjustment"""
    adjustment = np.random.uniform(1 - factor, 1 + factor)
    augmented = np.clip(image * adjustment, 0, 255).astype(np.uint8)
    return augmented

def apply_contrast_augmentation(image, factor=0.2):
    """Apply random contrast adjustment"""
    mean = image.mean()
    adjustment = np.random.uniform(1 - factor, 1 + factor)
    augmented = np.clip((image - mean) * adjustment + mean, 0, 255).astype(np.uint8)
    return augmented

def resize_image(image, size=(224, 224)):
    """Resize image maintaining aspect ratio"""
    if isinstance(image, Image.Image):
        image = np.array(image)
    
    height, width = image.shape[:2]
    aspect_ratio = width / height
    
    if aspect_ratio > 1:
        new_width = size[0]
        new_height = int(size[0] / aspect_ratio)
    else:
        new_height = size[1]
        new_width = int(size[1] * aspect_ratio)
    
    resized = cv2.resize(image, (new_width, new_height))
    
    # Pad to target size
    pad_top = (size[1] - new_height) // 2
    pad_bottom = size[1] - new_height - pad_top
    pad_left = (size[0] - new_width) // 2
    pad_right = size[0] - new_width - pad_left
    
    padded = cv2.copyMakeBorder(
        resized, pad_top, pad_bottom, pad_left, pad_right,
        cv2.BORDER_CONSTANT, value=[0, 0, 0]
    )
    
    return padded

def extract_image_features(image):
    """
    Extract statistical features from image
    """
    features = {
        'mean': np.mean(image),
        'std': np.std(image),
        'min': np.min(image),
        'max': np.max(image),
        'median': np.median(image),
    }
    
    # Edge detection
    edges = cv2.Canny(image, 100, 200)
    features['edge_density'] = np.sum(edges) / edges.size
    
    return features
