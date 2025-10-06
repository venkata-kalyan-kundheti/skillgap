# SkillGap AI Backend

## Environment variables

Create `backend/.env` with:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET=please-change
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
GEMINI_API_KEY=your-gemini-api-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your-smtp-password
```

## Auth endpoints
- `GET /auth/google` → Redirects to Google
- `GET /auth/google/callback` → OAuth callback
- `GET /auth/me` → Current session user
- `POST /auth/logout` → End session
- `POST /email-report` → Emails PDF report to logged-in user's email

Node.js/Express backend for the SkillGap AI application.

## Features

- **Resume Upload & Parsing**: POST `/upload-resume` - Upload PDF/DOCX files and extract text
- **Job Roles List**: GET `/roles` - Get available job roles
- **CORS Enabled**: Accepts requests from frontend
- **File Validation**: Type and size checks for uploads

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3001`

## API Endpoints

### GET /health
Health check endpoint
```bash
curl http://localhost:3001/health
```

### GET /roles
Get list of available job roles
```bash
curl http://localhost:3001/roles
```

Response:
```json
{
  "success": true,
  "data": [
    { "id": "data-analyst", "title": "Data Analyst", "category": "Analytics" },
    ...
  ]
}
```

### POST /upload-resume
Upload and parse resume file

```bash
curl -X POST http://localhost:3001/upload-resume \
  -F "resume=@/path/to/resume.pdf"
```

Response:
```json
{
  "success": true,
  "data": {
    "text": "Extracted resume content...",
    "fileName": "resume.pdf",
    "fileSize": 123456,
    "fileType": "application/pdf",
    "uploadedAt": "2025-10-03T12:00:00.000Z"
  }
}
```

## File Storage

Uploaded files are temporarily stored in the `backend/uploads/` directory.

### POST /generate-roadmap
Generate career roadmap and skill gap analysis using AI

```bash
curl -X POST http://localhost:3001/generate-roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe - Software Developer with 2 years experience...",
    "jobRole": "Data Analyst"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "skillsExtracted": ["JavaScript", "React", "Node.js"],
    "missingSkills": ["Python", "SQL", "Data Visualization"],
    "suggestedProjects": ["Build a data dashboard", "Create SQL analytics project"],
    "roadmap": {
      "week1": "Learn Python basics and data structures",
      "week2": "Master SQL queries and database design",
      "week3": "Study data visualization with libraries",
      "week4": "Build a complete analytics project"
    },
    "fitPercentage": 65
  }
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `GEMINI_API_KEY`: Google Gemini API key (required for /generate-roadmap endpoint)

## Gemini AI Integration

The backend uses **Google Gemini AI** (`models/gemini-2.5-flash`) to provide intelligent career guidance:

- Extracts technical and soft skills from resumes
- Identifies skill gaps for target job roles
- Generates personalized 4-week learning roadmaps
- Suggests practical projects to develop missing skills
- Calculates fit percentage for job role compatibility

The API key is configured but should be moved to environment variables for production use.

## Next Steps

- Move API key to environment variables for better security
- Add user authentication
- Implement cloud storage for resumes
- Add rate limiting and advanced security
