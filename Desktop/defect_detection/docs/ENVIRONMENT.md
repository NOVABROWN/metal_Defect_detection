# Environment Configuration Guide

## 🔑 Essential Environment Variables

### AI Service (.env)

```env
# Server Configuration
AI_SERVICE_HOST=0.0.0.0          # API host
AI_SERVICE_PORT=8000             # API port

# Model Configuration
MODEL_PATH=model/defect_model.pth # Path to saved model
DEVICE=cuda                       # cuda or cpu

# Logging
LOG_LEVEL=INFO                    # DEBUG, INFO, WARNING, ERROR

# Optional: For monitoring
SENTRY_DSN=https://...           # Sentry error tracking
```

### Backend (.env)

```env
# Environment
NODE_ENV=development              # development or production
PORT=5000                         # API port

# Database
MONGODB_URI=mongodb://localhost:27017/defect_detection
# OR for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/defect_detection

# AI Service Communication
AI_SERVICE_URL=http://localhost:8000

# Image Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Authentication
JWT_SECRET=your_random_secret_key_min_32_characters

# Optional: Error Tracking
SENTRY_DSN=https://...

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API URLs
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:8000

# App Info
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=development

# Optional: Analytics
REACT_APP_GA_ID=UA-XXXXXXXXX-X
```

---

## 🔐 Generating Secrets

### JWT Secret
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte]($RANDOM % 256)}))
```

---

## ☁️ Getting Cloudinary Credentials

1. Sign up: https://cloudinary.com
2. Dashboard shows:
   - Cloud Name
   - API Key
   - API Secret
3. Keep API Secret private!

---

## 🗄️ MongoDB Connection Strings

### Local MongoDB
```
mongodb://localhost:27017/defect_detection
```

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster.mongodb.net/defect_detection?retryWrites=true&w=majority
```

Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account
3. Create cluster
4. Create database user
5. Get connection string
6. Click "Connect" → "Connect your application"

---

## 🚀 Production Environment Variables

### AI Service (Production)
```env
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
DEVICE=cpu                          # CPU for cloud (cheaper)
LOG_LEVEL=WARNING                   # Less logging in production
MODEL_PATH=model/defect_model.pth
SENTRY_DSN=<your-sentry-dsn>
```

### Backend (Production)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<atlas-connection-string>
AI_SERVICE_URL=https://your-ai-service.onrender.com
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
JWT_SECRET=<generate-secure-random-32-chars>
SENTRY_DSN=<your-sentry-dsn>
LOG_LEVEL=error
```

### Frontend (Production)
```env
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_AI_SERVICE_URL=https://your-ai-service.onrender.com
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
```

---

## 🔒 Security Best Practices

1. **Never commit .env files**
   ```bash
   # .gitignore should have:
   .env
   .env.local
   .env.*.local
   ```

2. **Use .env.example**
   ```bash
   # Commit this file instead
   # It shows structure without secrets
   ```

3. **Rotate secrets regularly**
   - Change JWT_SECRET monthly
   - Rotate Cloudinary API keys yearly
   - Regenerate MongoDB passwords

4. **Use environment-specific configs**
   - `.env.development`
   - `.env.production`
   - `.env.staging`

5. **Don't log sensitive data**
   ```javascript
   // ❌ Bad
   console.log('API Key:', process.env.CLOUDINARY_API_KEY);
   
   // ✅ Good
   console.log('Cloudinary configured');
   ```

---

## ✅ Verification Checklist

- [ ] All required variables set
- [ ] Database connection works
- [ ] API calls successful
- [ ] Images uploading to Cloudinary
- [ ] Predictions working
- [ ] No secrets in code
- [ ] .env.example up to date

---

## 🆘 Common Issues

### "ECONNREFUSED: Connection refused"
- MongoDB not running
- Solution: Start MongoDB or use Atlas

### "401 Unauthorized"
- Cloudinary credentials invalid
- Solution: Check credentials, regenerate if needed

### "CORS error"
- Frontend/Backend URL mismatch
- Solution: Verify URLs in .env files

### "Model not found"
- MODEL_PATH incorrect
- Solution: Check model file exists

---

## 📝 Template Files

Copy these and fill in your values:

### Backend .env
```bash
cp backend/.env.example backend/.env
# Edit and fill in your values
```

### Frontend .env
```bash
cp frontend/.env.example frontend/.env
# Edit and fill in your values
```

### AI Service .env
```bash
cp ai-service/.env.example ai-service/.env
# Edit and fill in your values
```

