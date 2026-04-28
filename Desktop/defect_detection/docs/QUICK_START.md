# Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB (optional: use free MongoDB Atlas)
- Git

---

## 🚀 Option 1: Local Development (All 3 services)

### Step 1: Clone & Navigate
```bash
cd defect_detection
```

### Step 2: Setup AI Service
```bash
cd ai-service
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env file
cat > .env << EOF
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
DEVICE=cpu
LOG_LEVEL=INFO
EOF

# Run
python app.py
```

AI Service will be at: **http://localhost:8000**

---

### Step 3: Setup Backend (New Terminal)
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/defect_detection
AI_SERVICE_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=test
CLOUDINARY_API_KEY=test
CLOUDINARY_API_SECRET=test
EOF

# Run
npm run dev
```

Backend will be at: **http://localhost:5000**

---

### Step 4: Setup Frontend (New Terminal)
```bash
cd frontend
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000
EOF

# Run
npm start
```

Frontend will be at: **http://localhost:3000**

---

## 🐳 Option 2: Docker Compose (All Services)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  ai-service:
    build: ./ai-service
    ports:
      - "8000:8000"
    environment:
      - DEVICE=cpu
    depends_on:
      - mongodb

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/defect_detection
      - AI_SERVICE_URL=http://ai-service:8000
    depends_on:
      - mongodb
      - ai-service

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

volumes:
  mongo_data:
```

Run:
```bash
docker-compose up
```

---

## 🔧 Option 3: Cloud Setup (Fastest)

### 1. Deploy AI Service to Render
- Fork repo to GitHub
- Go to [render.com](https://render.com)
- Create new Web Service
- Connect GitHub
- Set environment: `DEVICE=cpu`
- Deploy!

### 2. Deploy Backend to Render
- Same process
- Set `MONGODB_URI=<MongoDB Atlas URI>`
- Set `AI_SERVICE_URL=<Your AI Service URL>`

### 3. Setup MongoDB Atlas
- Visit [atlas.mongodb.com](https://www.mongodb.com/cloud/atlas)
- Create free cluster
- Get connection string
- Add to Backend env

### 4. Deploy Frontend to Vercel
- Fork repo to GitHub
- Go to [vercel.com](https://vercel.com)
- Import project
- Set env variables
- Deploy!

---

## ✅ Verification

### 1. Check AI Service
```bash
curl http://localhost:8000/health
# Should return: {"success": true, "status": "AI Service is running", ...}
```

### 2. Check Backend
```bash
curl http://localhost:5000/health
# Should return: {"success": true, "status": "Backend API is running", ...}
```

### 3. Test Upload
```bash
# Open http://localhost:3000 in browser
# Go to Upload page
# Upload a metal image
# See results!
```

---

## 📚 Key Files Location

| Component | Main File | Config |
|-----------|-----------|--------|
| AI Service | `ai-service/app.py` | `ai-service/.env` |
| Backend | `backend/src/server.js` | `backend/.env` |
| Frontend | `frontend/src/App.js` | `frontend/.env` |

---

## 🆘 Troubleshooting

### AI Service won't start
```bash
# Check Python installation
python --version

# Reinstall dependencies
pip install --upgrade -r requirements.txt

# Run with debug
python app.py --debug
```

### Backend connection error
```bash
# Check MongoDB
mongod --version

# Check AI Service is running
curl http://localhost:8000/health

# Check backend logs
npm run dev
```

### Frontend blank page
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install

# Start fresh
npm start
```

---

## 🎯 Next Steps

1. ✅ System is running
2. 📸 Upload test images
3. 📊 Check dashboard
4. 📦 Add to inventory
5. 📈 View analytics
6. 🚀 Deploy to production (see DEPLOYMENT.md)

---

## 📖 More Documentation

- **Full Setup**: See `README.md`
- **API Reference**: See `docs/API.md`
- **Training**: See `docs/TRAINING.md`
- **Deployment**: See `docs/DEPLOYMENT.md`

---

## 💡 Tips

- Use `nodemon` for auto-reload: `npm install -g nodemon`
- Use `postman` to test APIs
- Check logs for debugging
- Keep `.env` files private
- Commit only `.env.example` files

---

**Ready to go? Start with Option 1 or 2 above!** 🚀
