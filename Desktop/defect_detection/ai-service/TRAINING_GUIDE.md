# Model Training Guide

## Overview

This guide walks you through training the metal defect detection model using the NEU Surface Defect Database.

## Prerequisites

- Python 3.8+
- GPU with CUDA (recommended) or CPU
- 2GB+ free disk space for dataset
- 4GB+ RAM

## Step 1: Set Up Python Environment

```bash
cd ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Step 2: Download and Organize Dataset

### Option A: Using Kaggle CLI (Recommended)

```bash
# Install Kaggle CLI
pip install kaggle

# Configure Kaggle API credentials
# 1. Go to https://www.kaggle.com/settings/account
# 2. Click "Create New API Token"
# 3. Save kaggle.json to:
#    - Windows: C:\Users\<YourUsername>\.kaggle\kaggle.json
#    - Linux/Mac: ~/.kaggle/kaggle.json
# 4. Set permissions (Linux/Mac only):
#    chmod 600 ~/.kaggle/kaggle.json

# Download dataset
kaggle datasets download -d kaustubhdikshit/neu-surface-defect-database

# Extract to dataset folder
unzip neu-surface-defect-database.zip -d ../dataset/

# Organize dataset
python organize_dataset.py
```

### Option B: Manual Download

1. Visit: https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database
2. Click "Download" button
3. Extract to `dataset/` folder
4. Run `python organize_dataset.py`

### Verify Dataset

```bash
python download_dataset.py
```

This will verify the dataset structure and show:
```
DATASET VERIFICATION REPORT
===============================================================================
Crazing              | Train: ✓ 300  images | Test: ✓ 100 images
Inclusion            | Train: ✓ 300  images | Test: ✓ 100 images
Patches              | Train: ✓ 300  images | Test: ✓ 100 images
Pitted_Surface       | Train: ✓ 300  images | Test: ✓ 100 images
Rolled-in_Scale      | Train: ✓ 300  images | Test: ✓ 100 images
Scratches            | Train: ✓ 300  images | Test: ✓ 100 images
===============================================================================
TOTAL                | Train: 1800 images | Test: 300 images
```

## Step 3: Configure Training Parameters (Optional)

Edit `train.py` to adjust hyperparameters:

```python
# Hyperparameters (in train.py)
BATCH_SIZE = 32           # Images per batch
LEARNING_RATE = 0.001     # Learning rate
NUM_EPOCHS = 50           # Maximum epochs
DEVICE = ...              # GPU or CPU (auto-detected)
```

### Recommendations:

| Parameter | Recommendation | Notes |
|-----------|----------------|-------|
| BATCH_SIZE | 32 (GPU: 64) | Higher = faster but more memory |
| LEARNING_RATE | 0.001 | Lower = slower but more stable |
| NUM_EPOCHS | 50+ | More epochs = better accuracy |

## Step 4: Start Training

```bash
python train.py
```

### Expected Output:

```
Using device: cuda (or cpu)
Loading datasets...
Found 1500 images in ../dataset/train
Found 300 images in ../dataset/test
Train samples: 1500, Val samples: 300

Building ResNet50 model...
Model built successfully!

Starting training...
Total epochs: 50

Epoch 1 [TRAIN]: 100%|████████| 47/47 [02:34<00:00, 3.28s/batch]
Epoch 1 - Train Loss: 2.1234, Accuracy: 42.56%
Epoch 1 [VAL]: 100%|████████| 10/10 [00:18<00:00, 1.82s/batch]
Epoch 1 - Val Loss: 1.8432, Accuracy: 51.23%

Epoch 2 [TRAIN]: 100%|████████| 47/47 [02:35<00:00, 3.29s/batch]
Epoch 2 - Train Loss: 1.5234, Accuracy: 56.78%
...
```

## Step 5: Monitor Training Progress

Training generates several outputs:

### Live Console Output
- Real-time loss and accuracy
- Learning rate changes
- Best model checkpoints

### Generated Files

1. **model/defect_model.pth** - Best trained model (use for inference)
2. **model/checkpoint_latest.pth** - Latest checkpoint (for resuming)
3. **model/training_metrics.json** - Training statistics
4. **model/training_curves.png** - Loss and accuracy plots

### View Training Curves

```python
import json
import matplotlib.pyplot as plt

# Load metrics
with open('model/training_metrics.json') as f:
    metrics = json.load(f)

# Plot
plt.plot(metrics['train_losses'], label='Train Loss')
plt.plot(metrics['val_losses'], label='Val Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()
```

## Step 6: Evaluate Results

After training completes, you'll see:

```
Classification Report:
              precision    recall  f1-score   support
    Crazing       0.95      0.93      0.94       100
  Inclusion       0.92      0.94      0.93       100
    Patches       0.91      0.92      0.91       100
Pitted_Surf       0.94      0.91      0.92       100
Rolled-in_S       0.93      0.95      0.94       100
   Scratches      0.96      0.94      0.95       100
    
    accuracy                           0.93       600
```

## Step 7: Use Trained Model

The trained model is automatically used by the API service:

```bash
# Navigate to ai-service directory
cd ai-service

# Start the API
python app.py
# or
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The model will automatically load from `model/defect_model.pth`

## Troubleshooting

### Issue: "Dataset not found"
**Solution:**
```bash
python download_dataset.py
# Check dataset structure
```

### Issue: "Out of Memory (OOM)"
**Solution:**
- Reduce BATCH_SIZE: `BATCH_SIZE = 16` or `BATCH_SIZE = 8`
- Or use CPU (slower but less memory)

### Issue: "CUDA out of memory"
**Solution:**
```python
# In train.py, change:
DEVICE = torch.device("cpu")  # Force CPU usage
```

### Issue: "Slow training on CPU"
**Solution:**
- Use GPU (RTX/Tesla card recommended)
- Reduce NUM_EPOCHS to test faster

### Issue: "Model not loading after training"
**Solution:**
```bash
# Check file exists:
ls -la model/defect_model.pth  # Linux/Mac
dir model\defect_model.pth     # Windows

# Retrain if missing:
python train.py
```

### Issue: "Low validation accuracy"
**Solution:**
1. Increase NUM_EPOCHS (more training)
2. Lower LEARNING_RATE (more stable)
3. Verify dataset is properly extracted
4. Check for corrupted images

## Advanced Options

### Resume Training from Checkpoint

```python
# In train.py, modify the train() function:
checkpoint = torch.load('model/checkpoint_latest.pth')
model.load_state_dict(checkpoint['model_state_dict'])
optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
start_epoch = checkpoint['epoch'] + 1
```

### Use Different Backbone

```python
# In train.py, change build_model():
# ResNet101
model = models.resnet101(pretrained=True)

# VGG19
model = models.vgg19(pretrained=True)

# MobileNetV2 (faster, less accurate)
model = models.mobilenet_v2(pretrained=True)
```

### Fine-tune All Layers

```python
# In train.py, modify build_model():
# Don't freeze any layers
for param in model.parameters():
    param.requires_grad = True
```

## Performance Benchmarks

Expected performance on NEU dataset with recommended settings:

| Device | Batch Size | Time/Epoch | Total Time (50 epochs) |
|--------|-----------|-----------|----------------------|
| RTX 3070 | 64 | 15s | ~12 minutes |
| RTX 2080 | 32 | 25s | ~21 minutes |
| CPU (i7) | 16 | 120s | ~100 minutes |

Expected accuracy after training:

| Metric | Value |
|--------|-------|
| Best Val Accuracy | 92-95% |
| Best Train Accuracy | 96-98% |
| F1-Score (avg) | 0.93-0.95 |

## Best Practices

1. **Use GPU**: 5-10x faster than CPU
2. **Monitor Training**: Watch loss curves for overfitting
3. **Save Checkpoints**: Already done automatically
4. **Validate Regularly**: Done every epoch
5. **Use Data Augmentation**: Already included
6. **Early Stopping**: Built-in (stops after 15 epochs without improvement)
7. **Learning Rate Scheduling**: Automatically reduces LR if accuracy plateaus

## Next Steps

1. ✅ Train the model
2. Run the API server: `python app.py`
3. Start the backend: `npm run dev` (in backend/)
4. Start the frontend: `npm start` (in frontend/)
5. Upload images for predictions

## References

- NEU Dataset: https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database
- ResNet Paper: https://arxiv.org/abs/1512.03385
- PyTorch Documentation: https://pytorch.org/docs/stable/index.html
- Transfer Learning: https://cs231n.github.io/transfer-learning/
