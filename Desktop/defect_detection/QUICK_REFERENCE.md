# 🚀 DEVELOPER QUICK REFERENCE

## Starting Services (Local Development)

### Terminal 1: AI Service
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows or: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python app.py
# ✅ Runs on http://localhost:8000
```

### Terminal 2: Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# ✅ Runs on http://localhost:5000
```

### Terminal 3: Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm start
# ✅ Runs on http://localhost:3000
```

---

## Health Checks

```bash
# AI Service
curl http://localhost:8000/health

# Backend
curl http://localhost:5000/health
```

---

## Key Endpoints

### Image Upload
```bash
curl -X POST "http://localhost:5000/api/detections/upload" \
  -F "image=@image.jpg"
```

### Get Results
```bash
curl "http://localhost:5000/api/detections"
```

### Get Recommendation
```bash
curl -X POST "http://localhost:5000/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{"defectType":"Scratches","severity":"High"}'
```

### Get Analytics
```bash
curl "http://localhost:5000/api/analytics"
```

---

## Common Commands

```bash
# Install dependencies
npm install          # Frontend/Backend
pip install -r requirements.txt  # AI

# Run development servers
npm run dev          # Backend (auto-reload)
npm start           # Frontend (dev server)
python app.py       # AI Service

# Build for production
npm run build       # Frontend

# Database
mongod              # Start local MongoDB
```

---

## Project Structure Quick Map

```
ai-service/         → Python ML Service
backend/            → Node.js Express API
frontend/           → React Web App
docs/               → Documentation
dataset/            → NEU Defect Dataset
```

---

## Environment Variables

### AI Service (.env)
```
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
DEVICE=cpu
```

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/defect_detection
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
```

---

## File Locations

| Component | Main File | Config | Port |
|-----------|-----------|--------|------|
| AI Service | ai-service/app.py | ai-service/.env | 8000 |
| Backend | backend/src/server.js | backend/.env | 5000 |
| Frontend | frontend/src/App.js | frontend/.env | 3000 |
| Database | - | - | 27017 |

---

## Useful Debugging Commands

```bash
# Check if port is in use
netstat -an | grep 8000      # Linux/Mac
netstat -ano | grep 8000     # Windows

# View logs
npm run dev                   # Shows Node logs
# Check browser console for React errors

# Test API
curl -v http://localhost:5000/health

# Database connection test
mongo mongodb://localhost:27017
```

---

## Frontend Components Hierarchy

```
App.js
├── Navbar
└── Routes
    ├── HomePage
    ├── UploadPage
    ├── ResultPage
    ├── DashboardPage
    └── ScrapInventoryPage
```

---

## Backend Routes Structure

```
/api
├── /detections
│   ├── POST upload
│   ├── GET :id
│   ├── GET (list)
│   └── DELETE :id
├── /scrap
│   ├── POST add
│   ├── GET all
│   ├── PUT update/:id
│   └── DELETE delete/:id
├── /recommend
│   ├── POST (get recommendation)
│   └── POST log
└── /analytics
    └── GET
```

---

## Database Collections

### Detection
```javascript
{
  imageUrl,
  defectType,
  confidence,
  severity,
  metalType,
  createdAt
}
```

### ScrapInventory
```javascript
{
  metalType,
  quantity,
  status,
  location,
  estimatedValue
}
```

### RecyclingLog
```javascript
{
  defectType,
  actionTaken,
  costSaved,
  co2Saved
}
```

---

## Docker Quick Start

```bash
# Run everything
docker-compose up

# Stop everything
docker-compose down

# View logs
docker-compose logs -f service_name
```

---

## Troubleshooting Checklist

- [ ] All services running?
- [ ] MongoDB connected?
- [ ] Environment variables set?
- [ ] Ports not in use?
- [ ] Dependencies installed?
- [ ] .env files configured?
- [ ] Cloudinary credentials (if using)?

---

## Frontend URLs

```
Home:       http://localhost:3000/
Upload:     http://localhost:3000/upload
Result:     http://localhost:3000/result/:id
Dashboard:  http://localhost:3000/dashboard
Inventory:  http://localhost:3000/inventory
```

---

## API Response Format

```javascript
{
  success: boolean,
  data: {},
  message: "string"
}
```

---

## Defect Types

1. Crazing
2. Inclusion
3. Patches
4. Pitted Surface
5. Rolled-in Scale
6. Scratches

---

## Severity Levels

- **Low**: confidence < 0.5
- **Medium**: 0.5 ≤ confidence ≤ 0.8
- **High**: confidence > 0.8

---

## Recycling Actions

1. Re-polish
2. Chemical Recycling
3. Thermal Recycling
4. Scrap Recycling
5. Reuse

---

## Version Info

- **Node.js**: 16+
- **Python**: 3.8+
- **React**: 18
- **Express**: 4
- **MongoDB**: 4.4+

---

## Useful Links

- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- FastAPI Docs: https://fastapi.tiangolo.com
- MongoDB Docs: https://docs.mongodb.com
- PyTorch Docs: https://pytorch.org

---

## Document Map

- **Getting Started**: SETUP.md
- **Quick Setup**: docs/QUICK_START.md
- **Full Overview**: README.md
- **API Reference**: docs/API.md
- **Deployment**: docs/DEPLOYMENT.md
- **Configuration**: docs/ENVIRONMENT.md
- **Training**: docs/TRAINING.md

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Port already in use | Change port in .env |
| Cannot connect to MongoDB | Start MongoDB or use Atlas |
| Module not found | Run npm/pip install |
| CORS error | Check REACT_APP_API_URL |
| Model not loading | Check MODEL_PATH |

---

## Quick Testing

```bash
# Test AI Service
curl http://localhost:8000/health

# Test Backend
curl http://localhost:5000/health

# Test Upload
curl -F "image=@test.jpg" http://localhost:5000/api/detections/upload

# Test Analytics
curl http://localhost:5000/api/analytics
```

---

## Performance Tips

- Use MongoDB indexes
- Implement response caching
- Lazy load React components
- Compress images
- Use CDN for static files

---

## Security Reminders

- Never commit .env files
- Don't log sensitive data
- Use HTTPS in production
- Validate all inputs
- Rotate secrets regularly

---

**Need more help? Check the docs/ folder!**

