# HealthLoop Deployment & Operations Guide

## 1. Local Production Deployment (Single Command)

HealthLoop's Flask backend is engineered to serve both the REST API and the compiled React production static bundle (`frontend/dist`) concurrently.

```bash
# 1. Build the React frontend
cd frontend
npm install
npm run build
cd ..

# 2. Run the unified Flask server
python backend/run.py
```
Open your browser at `http://127.0.0.1:5000` to access the full production application!

---

## 2. Docker & Containerized Deployment

Create a `Dockerfile` for containerized environments (Google Cloud Run, AWS ECS, Railway, Render):

```dockerfile
# Multi-stage Dockerfile
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY .env.example ./.env

ENV PORT=5000
EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "backend.run:app"]
```

---

## 3. Cloud MongoDB (Atlas) Integration

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Obtain your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/healthloop_db?retryWrites=true&w=majority`.
3. Set the environment variable:
   ```bash
   MONGO_URI="mongodb+srv://<user>:<password>@cluster0.mongodb.net/healthloop_db"
   ```
HealthLoop will immediately and seamlessly connect to MongoDB Atlas upon startup.

---

## 4. Google Gemini API Setup

1. Visit [Google AI Studio](https://aistudio.google.com/) and click **Get API Key**.
2. Add your key to `.env`:
   ```ini
   GEMINI_API_KEY=AIzaSy...
   GEMINI_MODEL=gemini-1.5-flash
   ```
HealthLoop uses the key to generate live generative coaching, while retaining its built-in rule engine fallback for resilient offline capability.
