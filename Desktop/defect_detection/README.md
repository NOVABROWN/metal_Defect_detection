# Metal Defect Detection & Recycling Management System

A comprehensive AI-powered system for detecting metal surface defects and recommending optimal recycling strategies.

## 📋 System Overview

**Architecture**: Microservices-based with RESTful APIs
- **AI Service**: Python FastAPI with CNN-based defect detection
- **Backend**: Node.js Express API with MongoDB
- **Frontend**: React.js with Tailwind CSS
- **Database**: MongoDB for data persistence

---

## 🎯 Project Structure

```
defect_detection/
├── ai-service/          # FastAPI ML service
│   ├── app.py
│   ├── defect_model.py
│   ├── utils.py
│   ├── requirements.txt
│   └── model/
├── backend/             # Node.js Express API
│   ├── src/
│   │   ├── server.js
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   ├── package.json
│   └── .env.example
├── frontend/            # React web application
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── public/
├── dataset/             # Dataset directory
├── docs/                # Documentation
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (local or cloud)
- Git

### Installation

#### 1. AI Service Setup

```bash
cd ai-service
python -m venv venv
source venv/Scripts/activate  # On Windows
pip install -r requirements.txt
```

Create `.env` file:
```
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
DEVICE=cuda  # or cpu
```

Run AI Service:
```bash
python app.py
# or
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/defect_detection
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Run Backend:
```bash
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

Run Frontend:
```bash
npm start
```

---

## 🏋️ Model Training

### Prerequisites for Training
- CUDA-capable GPU (recommended) or CPU (slower)
- ~2GB disk space for dataset
- ~4GB RAM minimum

### Step 1: Download Dataset

```bash
cd ai-service

# Install Kaggle CLI
pip install kaggle

# Configure Kaggle credentials
# Go to https://www.kaggle.com/settings/account and download kaggle.json
# Place it in ~/.kaggle/kaggle.json (Linux/Mac) or C:\Users\<YourUsername>\.kaggle\ (Windows)

# Run setup script
python download_dataset.py

# Download from Kaggle using CLI
kaggle datasets download -d kaustubhdikshit/neu-surface-defect-database

# Extract the dataset
# Unzip to dataset/ folder (should auto-organize)
python organize_dataset.py
```

**Dataset Structure (after extraction):**
```
dataset/
├── train/        (1,500 images total)
│   ├── Crazing/          (300 images)
│   ├── Inclusion/        (300 images)
│   ├── Patches/          (300 images)
│   ├── Pitted_Surface/   (300 images)
│   ├── Rolled-in_Scale/  (300 images)
│   └── Scratches/        (300 images)
└── test/         (300 images total)
    ├── Crazing/          (100 images)
    ├── Inclusion/        (100 images)
    ├── Patches/          (100 images)
    ├── Pitted_Surface/   (100 images)
    ├── Rolled-in_Scale/  (100 images)
    └── Scratches/        (100 images)
```

### Step 2: Train the Model

```bash
cd ai-service
python train.py
```

**Training Configuration:**
- Batch Size: 32
- Learning Rate: 0.001
- Epochs: 50 (with early stopping)
- Optimizer: Adam with ReduceLROnPlateau scheduler
- Data Augmentation: Rotation, Flip, ColorJitter, Affine transforms

**Training Output:**
- `model/defect_model.pth` - Best trained model
- `model/checkpoint_latest.pth` - Latest checkpoint
- `model/training_metrics.json` - Training statistics
- `model/training_curves.png` - Loss and accuracy plots

### Step 3: Monitor Training

Training metrics are displayed in real-time:
- Training loss and accuracy
- Validation loss and accuracy
- Learning rate adjustments
- Best model checkpoint

Example training output:
```
Epoch 1 - Train Loss: 0.8234, Accuracy: 65.23%
Epoch 1 - Val Loss: 0.5123, Accuracy: 78.45%
...
Training completed!
Best validation accuracy: 92.34%
```

### Step 4: Evaluate Model

After training, classification report and confusion matrix are generated:
```
Classification Report:
              precision    recall  f1-score   support
    Crazing       0.95      0.93      0.94       100
  Inclusion       0.92      0.94      0.93       100
    Patches       0.91      0.92      0.91       100
Pitted_Surf       0.94      0.91      0.92       100
Rolled-in_S       0.93      0.95      0.94       100
   Scratches      0.96      0.94      0.95       100
```

### Tips for Better Training

1. **GPU Acceleration**: Use CUDA for faster training
   ```bash
   # Check CUDA availability
   python -c "import torch; print(torch.cuda.is_available())"
   ```

2. **Hyperparameter Tuning**: Edit `train.py` to adjust:
   - `BATCH_SIZE` - Increase for more GPU memory, decrease for less
   - `LEARNING_RATE` - Lower for more stable training
   - `NUM_EPOCHS` - Increase for better accuracy (may overfit)

3. **Data Augmentation**: Already included in training script:
   - Random horizontal flips
   - Rotation (±15 degrees)
   - Color jitter (brightness, contrast, saturation)
   - Random affine transformations

4. **Early Stopping**: Automatically stops if no improvement for 15 epochs

### Troubleshooting Training

| Issue | Solution |
|-------|----------|
| Out of Memory (OOM) | Reduce BATCH_SIZE in train.py |
| Slow training | Use GPU (check CUDA availability) |
| Low accuracy | Ensure dataset is properly extracted in correct structure |
| Model not saving | Check write permissions in model/ directory |
| Dataset not found | Run `python organize_dataset.py` after extraction |

---

## 📊 Defect Classification

The system can detect 6 types of metal surface defects:

1. **Crazing** - Fine surface cracks
2. **Inclusion** - Foreign particles embedded in metal
3. **Patches** - Discolored surface areas
4. **Pitted Surface** - Small depressions or holes
5. **Rolled-in Scale** - Scale pattern on surface
6. **Scratches** - Linear surface marks

---

## 🤖 AI Model Details

- **Architecture**: ResNet50 (Transfer Learning)
- **Input Size**: 224×224×3 pixels
- **Preprocessing**: 
  - Normalization to [0, 1]
  - ImageNet normalization
  - Data augmentation (rotation, flip, zoom, noise)
- **Output**: 
  ```json
  {
    "defect_type": "Scratch",
    "confidence": 0.94,
    "severity": "High"
  }
  ```

### Severity Levels
- **Low**: Confidence < 0.5
- **Medium**: Confidence 0.5-0.8
- **High**: Confidence > 0.8

---

## 📡 API Endpoints

### AI Service

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict` | Predict defect from image |
| POST | `/predict-batch` | Batch prediction |
| GET | `/health` | Health check |
| GET | `/model-info` | Model information |

### Backend API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/detections/upload` | Upload image for detection |
| GET | `/api/detections/:id` | Get detection result |
| GET | `/api/detections` | Get all detections |
| DELETE | `/api/detections/:id` | Delete detection |
| POST | `/api/scrap/add` | Add scrap item |
| GET | `/api/scrap/all` | Get all scrap items |
| PUT | `/api/scrap/update/:id` | Update scrap item |
| DELETE | `/api/scrap/delete/:id` | Delete scrap item |
| POST | `/api/recommend` | Get recycling recommendation |
| POST | `/api/recommend/log` | Log recycling action |
| GET | `/api/analytics` | Get analytics dashboard data |

---

## 📦 Dataset

**Source**: [Kaggle NEU Surface Defect Database](https://www.kaggle.com/datasets/kaustubhdikshit/neu-surface-defect-database)

### Download and Setup

1. Visit the Kaggle dataset link
2. Download the dataset
3. Extract to `dataset/` folder
4. Dataset structure:
   ```
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

---

## 🔧 Configuration

### Environment Variables

**AI Service (.env)**
```
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
MODEL_PATH=model/defect_model.pth
DEVICE=cuda
LOG_LEVEL=INFO
```

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/defect_detection
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
```

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
REACT_APP_VERSION=1.0.0
```

---

## 💾 Database Schema

### Collections

#### Detections
```javascript
{
  _id: ObjectId,
  imageUrl: String,
  imageFileName: String,
  defectType: String, // Enum: ['Crazing', 'Inclusion', ...]
  confidence: Number, // 0-1
  severity: String,   // 'Low', 'Medium', 'High'
  metalType: String,  // 'Steel', 'Aluminum', etc.
  createdAt: Date,
  status: String      // 'pending', 'processed', 'archived'
}
```

#### ScrapInventory
```javascript
{
  _id: ObjectId,
  metalType: String,
  quantity: Number,
  unit: String,       // 'kg', 'tons'
  status: String,     // 'reusable', 'scrap', 'recycled'
  location: String,
  addedDate: Date,
  lastUpdated: Date,
  estimatedValue: Number,
  notes: String
}
```

#### RecyclingLogs
```javascript
{
  _id: ObjectId,
  detectionId: ObjectId,
  defectType: String,
  actionTaken: String, // 'Re-polish', 'Chemical Recycling', etc.
  costSaved: Number,
  co2Saved: Number,
  timestamp: Date
}
```

---

## 🎨 Frontend Pages

1. **Home** - Overview and features
2. **Upload** - Image upload with drag-drop
3. **Result** - Detection results and recommendations
4. **Dashboard** - Analytics and metrics
5. **Inventory** - Scrap management

---

## ♻️ Recycling Recommendation Logic

```
IF defect = Scratch AND severity = Low
  → Re-polish (Cost saved: $150, CO₂: 10kg)

IF defect = Crazing AND severity = Low
  → Reuse (Cost saved: $100, CO₂: 15kg)

IF defect = (Inclusion OR Patches) AND severity = Medium
  → Chemical Recycling (Cost saved: $200, CO₂: 20kg)

IF severity = High
  → Scrap Recycling (Cost saved: $80, CO₂: 25kg)

IF defect = (Rolled-in Scale OR Pitted Surface)
  → Thermal Recycling (Cost saved: $180, CO₂: 22kg)
```

---

## 📈 Analytics Metrics

- **Total Detections**: Count of all analyzed images
- **Recycling Actions**: Count of executed recommendations
- **Cost Saved**: Cumulative monetary savings
- **CO₂ Saved**: Total environmental impact
- **Reuse Percentage**: % of reusable vs. scrap
- **Defect Distribution**: Breakdown by defect type
- **Severity Distribution**: Low/Medium/High split

---

## 🚢 Deployment

### AI Service (Render/Railway/AWS)
```bash
# Create Dockerfile
# Push to GitHub
# Connect to Render/Railway
# Set environment variables
```

### Backend (Render/Vercel)
```bash
# Set environment variables in deployment platform
# Connect MongoDB Atlas
# Configure Cloudinary
```

### Frontend (Vercel/Netlify)
```bash
# npm run build
# Deploy from build folder
# Set environment variables
```

---

## 🔌 Integration Points

1. **Frontend → Backend**: REST API calls (axios)
2. **Backend → AI Service**: HTTP requests with image files
3. **Backend → Database**: MongoDB queries
4. **Backend → Cloudinary**: Image storage and hosting

---

## 🛠️ Development Tools

- **API Testing**: Postman, Insomnia
- **Version Control**: Git/GitHub
- **Monitoring**: Sentry, LogRocket
- **Database**: MongoDB Compass
- **DevTools**: VS Code, Chrome DevTools

---

## 📝 API Response Format

All APIs return standardized format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

---

## 🐛 Troubleshooting

### Issue: AI Service connection failed
**Solution**: Ensure AI Service is running on correct port

### Issue: MongoDB connection error
**Solution**: Check MongoDB URI and credentials

### Issue: Image upload fails
**Solution**: Verify Cloudinary credentials and limits

### Issue: Model not loading
**Solution**: Check model file path and device availability

---

## 🔒 Security

- Environment variables for sensitive data
- Cloudinary for secure image storage
- CORS configuration for API access
- Input validation on all endpoints

---

## 📚 Future Enhancements

- [ ] Real-time webcam detection
- [ ] Cost optimization engine
- [ ] Predictive maintenance with LSTM
- [ ] Multi-factory support
- [ ] IoT sensor integration
- [ ] Blockchain for scrap tracking
- [ ] Mobile app
- [ ] Marketplace module

---

## 📄 License

MIT License - feel free to use for your projects!

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check GitHub issues
4. Contact development team

---

**Last Updated**: April 2026
**Version**: 1.0.0
