# Training Guide

## Dataset Setup

### 1. Download Dataset
Visit: https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database

### 2. Extract Files
```bash
# Extract to dataset/ folder
dataset/
├── train/
│   ├── Crazing/
│   ├── Inclusion/
│   ├── Patches/
│   ├── Pitted_Surface/
│   ├── Rolled-in_Scale/
│   └── Scratches/
└── test/
```

## Training Script

Create `ai-service/train.py`:

```python
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, datasets
from defect_model import DefectDetectionModel
from pathlib import Path

# Configuration
EPOCHS = 50
BATCH_SIZE = 32
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
DATASET_PATH = "../../dataset/train"

def train():
    # Build model
    model_wrapper = DefectDetectionModel()
    model = model_wrapper.build_model()
    
    # Load dataset
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])
    
    dataset = datasets.ImageFolder(DATASET_PATH, transform=transform)
    dataloader = torch.utils.data.DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # Training loop
    model.train()
    for epoch in range(EPOCHS):
        total_loss = 0
        for images, labels in dataloader:
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            total_loss += loss.item()
        
        avg_loss = total_loss / len(dataloader)
        print(f"Epoch [{epoch+1}/{EPOCHS}], Loss: {avg_loss:.4f}")
    
    # Save model
    model_wrapper.save_model()
    print("Training complete! Model saved.")

if __name__ == "__main__":
    train()
```

## Running Training

```bash
cd ai-service
python train.py
```

## Transfer Learning Details

- **Base Model**: ResNet50 (ImageNet weights)
- **Frozen Layers**: All backbone layers
- **Fine-tuned Layers**: Custom classification head
- **Head Architecture**:
  - Linear(2048, 512) + ReLU + Dropout(0.3)
  - Linear(512, 128) + ReLU + Dropout(0.2)
  - Linear(128, 6) → 6 classes

## Data Augmentation

- Rotation: ±20 degrees
- Horizontal flip: 50% probability
- Color jitter: ±20% brightness/contrast
- Normalization: ImageNet statistics

## Hyperparameters

- Epochs: 50
- Batch Size: 32
- Learning Rate: 0.001
- Optimizer: Adam
- Loss Function: CrossEntropyLoss
- Device: CUDA (if available)

## Expected Results

- Training Time: ~2-3 hours (GPU)
- Accuracy: ~92-95%
- Model Size: ~100MB

## Validation

```python
# Evaluate on test set
model.eval()
correct = 0
total = 0

with torch.no_grad():
    for images, labels in test_dataloader:
        outputs = model(images)
        _, predicted = torch.max(outputs, 1)
        total += labels.size(0)
        correct += (predicted == labels).sum().item()

accuracy = 100 * correct / total
print(f"Accuracy: {accuracy:.2f}%")
```

---

**Note**: Model checkpoints are saved in `ai-service/model/` directory
