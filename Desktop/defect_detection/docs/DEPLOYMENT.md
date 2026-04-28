# Deployment Guide

## 🚀 Production Deployment

### 1. AI Service Deployment (Render/Railway)

#### Step 1: Prepare Dockerfile

Create `ai-service/Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Step 2: Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set Environment Variables:
   ```
   AI_SERVICE_HOST=0.0.0.0
   AI_SERVICE_PORT=8000
   DEVICE=cpu
   LOG_LEVEL=INFO
   ```
5. Deploy!

**AI Service URL**: `https://your-ai-service.onrender.com`

---

### 2. Backend Deployment (Render/Railway)

#### Step 1: Prepare Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "src/server.js"]
```

#### Step 2: Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Set Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-uri>
   AI_SERVICE_URL=https://your-ai-service.onrender.com
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   JWT_SECRET=<your-jwt-secret>
   ```
4. Deploy!

**Backend URL**: `https://your-backend.onrender.com`

---

### 3. MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP address (or 0.0.0.0)
5. Get connection string
6. Add to Backend `.env`: `MONGODB_URI=<connection-string>`

---

### 4. Frontend Deployment (Vercel)

#### Step 1: Prepare for Production

Update `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_AI_SERVICE_URL=https://your-ai-service.onrender.com
REACT_APP_VERSION=1.0.0
```

#### Step 2: Deploy to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import project from GitHub
4. Set Environment Variables
5. Deploy!

**Frontend URL**: `https://your-frontend.vercel.app`

---

### 5. Cloudinary Setup (Image Storage)

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get credentials from Dashboard
3. Add to Backend `.env`:
   ```
   CLOUDINARY_CLOUD_NAME=xyz
   CLOUDINARY_API_KEY=abc
   CLOUDINARY_API_SECRET=def
   ```

---

## 📋 Production Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created and secured
- [ ] Cloudinary account setup
- [ ] CORS configured correctly
- [ ] Error logging setup
- [ ] Database backups enabled
- [ ] SSL certificates verified
- [ ] Rate limiting implemented
- [ ] HTTPS enforced
- [ ] Security headers configured

---

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure allowed origins
3. **Rate Limiting**: Implement on all endpoints
4. **Input Validation**: Validate all inputs
5. **Authentication**: Consider adding JWT auth
6. **HTTPS**: Always use HTTPS in production
7. **Database**: Enable authentication and backups
8. **API Keys**: Rotate regularly

---

## 📊 Monitoring

### Backend Monitoring
```javascript
// Add error tracking with Sentry
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

app.use(Sentry.Handlers.errorHandler());
```

### AI Service Monitoring
```python
# Add structured logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

---

## 🔧 Scaling Considerations

1. **Horizontal Scaling**: Use load balancers
2. **Caching**: Implement Redis for frequently accessed data
3. **CDN**: Use Cloudflare for frontend
4. **Database Optimization**: Index frequently queried fields
5. **API Optimization**: Implement pagination and filtering
6. **Image Optimization**: Resize and compress before upload

---

## 📈 Performance Optimization

1. **Frontend**:
   - Lazy load components
   - Code splitting
   - Minify and compress
   - Use CDN

2. **Backend**:
   - Database indexing
   - Query optimization
   - Caching strategies
   - Connection pooling

3. **AI Service**:
   - Model quantization
   - Batch processing
   - GPU optimization
   - Request queuing

---

## 🚨 Troubleshooting Deployment

| Issue | Solution |
|-------|----------|
| Service not starting | Check logs, verify environment variables |
| Database connection failed | Verify MongoDB URI, check whitelist |
| CORS errors | Configure CORS middleware correctly |
| Slow predictions | Check GPU availability, monitor logs |
| Disk space issues | Clean up old images, implement cleanup jobs |

---

## 📞 Post-Deployment

1. Test all endpoints
2. Monitor error logs
3. Check performance metrics
4. Enable auto-scaling if needed
5. Setup alerts for errors
6. Document deployment process
7. Create runbook for issues

---

**Deployment Platform Comparison**

| Platform | AI Service | Backend | Frontend |
|----------|-----------|---------|----------|
| Render | ✅ | ✅ | ✅ |
| Railway | ✅ | ✅ | ✅ |
| AWS | ✅ | ✅ | ✅ |
| Vercel | ✅ | ❌ | ✅ |
| Netlify | ❌ | ❌ | ✅ |

---

**Estimated Costs** (monthly)
- AI Service: $7-20
- Backend: $7-20
- Frontend: $0-20
- MongoDB: $0-57
- Cloudinary: $0-99
- **Total**: $14-216 depending on usage

