# API Documentation

## Base URLs

- **AI Service**: `http://localhost:8000`
- **Backend API**: `http://localhost:5000`
- **Production AI Service**: `https://your-ai-service.onrender.com`
- **Production Backend**: `https://your-backend.onrender.com`

---

## 🤖 AI Service Endpoints

### 1. Predict Defect

**Endpoint**: `POST /predict`

**Description**: Analyze single image for metal defects

**Request**:
```bash
curl -X POST "http://localhost:8000/predict" \
  -F "file=@image.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "defect_type": "Scratches",
    "confidence": 0.94,
    "severity": "High"
  },
  "message": "Prediction completed successfully"
}
```

---

### 2. Batch Predict

**Endpoint**: `POST /predict-batch`

**Description**: Analyze multiple images

**Request**:
```bash
curl -X POST "http://localhost:8000/predict-batch" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg" \
  -F "files=@image3.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "filename": "image1.jpg",
      "defect_type": "Crazing",
      "confidence": 0.87,
      "severity": "Medium"
    },
    {
      "filename": "image2.jpg",
      "defect_type": "Scratches",
      "confidence": 0.92,
      "severity": "High"
    }
  ],
  "message": "Batch prediction completed for 2 images"
}
```

---

### 3. Health Check

**Endpoint**: `GET /health`

**Description**: Check if AI Service is running

**Response**:
```json
{
  "success": true,
  "status": "AI Service is running",
  "message": "Model loaded and ready for predictions"
}
```

---

### 4. Model Info

**Endpoint**: `GET /model-info`

**Description**: Get information about loaded model

**Response**:
```json
{
  "success": true,
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
```

---

## 📡 Backend API Endpoints

### Detections

#### Upload Image

**Endpoint**: `POST /api/detections/upload`

**Description**: Upload image and get detection

**Request**:
```bash
curl -X POST "http://localhost:5000/api/detections/upload" \
  -F "image=@metal_surface.jpg"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "detectionId": "63fa1b2c9d1e4a5f8c6d9e2a",
    "imageUrl": "https://cloudinary.com/...",
    "defectType": "Scratches",
    "confidence": 0.94,
    "severity": "High"
  },
  "message": "Detection completed successfully"
}
```

---

#### Get Detection Result

**Endpoint**: `GET /api/detections/:id`

**Description**: Get detection result by ID

**Request**:
```bash
curl "http://localhost:5000/api/detections/63fa1b2c9d1e4a5f8c6d9e2a"
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "63fa1b2c9d1e4a5f8c6d9e2a",
    "imageUrl": "https://...",
    "imageFileName": "metal_surface.jpg",
    "defectType": "Scratches",
    "confidence": 0.94,
    "severity": "High",
    "metalType": "Steel",
    "createdAt": "2024-01-15T10:30:00Z",
    "status": "processed"
  },
  "message": "Detection retrieved successfully"
}
```

---

#### Get All Detections

**Endpoint**: `GET /api/detections?page=1&limit=10`

**Description**: Get all detections with pagination

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "message": "Detections retrieved successfully"
}
```

---

#### Delete Detection

**Endpoint**: `DELETE /api/detections/:id`

**Description**: Delete detection record

**Response**:
```json
{
  "success": true,
  "data": {
    "deletedId": "63fa1b2c9d1e4a5f8c6d9e2a"
  },
  "message": "Detection deleted successfully"
}
```

---

### Scrap Inventory

#### Add Item

**Endpoint**: `POST /api/scrap/add`

**Request**:
```json
{
  "metalType": "Steel",
  "quantity": 150,
  "status": "reusable",
  "location": "Warehouse A",
  "notes": "Good condition steel plate",
  "estimatedValue": 500
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "63fa1b2c9d1e4a5f8c6d9e2a",
    "metalType": "Steel",
    "quantity": 150,
    "status": "reusable",
    "location": "Warehouse A",
    "addedDate": "2024-01-15T10:30:00Z"
  },
  "message": "Scrap item added successfully"
}
```

---

#### Get All Inventory

**Endpoint**: `GET /api/scrap/all?status=reusable&metalType=Steel`

**Query Parameters**:
- `status`: Filter by status (reusable, scrap, recycled)
- `metalType`: Filter by metal type

**Response**:
```json
{
  "success": true,
  "data": [...],
  "summary": {
    "total": 15,
    "totalQuantity": 2500,
    "byStatus": {
      "reusable": 1500,
      "scrap": 1000
    },
    "byMetal": {
      "Steel": 2000,
      "Aluminum": 500
    }
  },
  "message": "Scrap inventory retrieved successfully"
}
```

---

#### Update Inventory Item

**Endpoint**: `PUT /api/scrap/update/:id`

**Request**:
```json
{
  "quantity": 200,
  "status": "recycled",
  "location": "Recycling Center B"
}
```

---

#### Delete Inventory Item

**Endpoint**: `DELETE /api/scrap/delete/:id`

---

### Recycling Recommendations

#### Get Recommendation

**Endpoint**: `POST /api/recommend`

**Request**:
```json
{
  "defectType": "Scratches",
  "severity": "High",
  "confidence": 0.94
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "action": "Scrap Recycling",
    "method": "Thermal/Mechanical Recycling",
    "costSaved": 80,
    "co2Saved": 25,
    "defectType": "Scratches",
    "severity": "High",
    "confidence": 0.94
  },
  "message": "Recycling recommendation generated successfully"
}
```

---

#### Log Recycling Action

**Endpoint**: `POST /api/recommend/log`

**Request**:
```json
{
  "detectionId": "63fa1b2c9d1e4a5f8c6d9e2a",
  "defectType": "Scratches",
  "actionTaken": "Scrap Recycling",
  "costSaved": 80,
  "co2Saved": 25,
  "metalWeight": 50
}
```

---

### Analytics

#### Get Dashboard Data

**Endpoint**: `GET /api/analytics`

**Response**:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalDetections": 145,
      "totalRecyclingActions": 120,
      "totalScrapInventory": 42,
      "totalCostSaved": 9850.50,
      "totalCo2Saved": 2150.75,
      "reusedMetalPercentage": 65.3
    },
    "detectionsByType": [
      { "_id": "Scratches", "count": 45, "avgConfidence": 0.91 },
      { "_id": "Crazing", "count": 32, "avgConfidence": 0.88 }
    ],
    "severityDistribution": [
      { "_id": "High", "count": 65 },
      { "_id": "Medium", "count": 55 },
      { "_id": "Low", "count": 25 }
    ],
    "trend": {
      "detectionsTrend": [...],
      "recyclingTrend": [...]
    }
  },
  "message": "Analytics data retrieved successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": {}
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **AI Service**: 100 requests/hour per IP
- **Backend API**: 1000 requests/hour per IP
- **Frontend**: No limit (same-domain)

---

## Authentication

Currently no authentication required. For production, consider adding JWT tokens:

```bash
Authorization: Bearer <jwt-token>
```

---

## Code Examples

### JavaScript/Axios

```javascript
import axios from 'axios';

// Upload image
const formData = new FormData();
formData.append('image', imageFile);

const response = await axios.post(
  'http://localhost:5000/api/detections/upload',
  formData
);

console.log(response.data);
```

### Python/Requests

```python
import requests

with open('metal_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'http://localhost:8000/predict',
        files=files
    )
    
print(response.json())
```

### cURL

```bash
curl -X POST \
  -H "Content-Type: multipart/form-data" \
  -F "image=@image.jpg" \
  http://localhost:5000/api/detections/upload
```

---

**API Version**: 1.0.0
**Last Updated**: April 2026
