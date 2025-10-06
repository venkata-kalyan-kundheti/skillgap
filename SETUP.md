# SkillGap AI - Setup Instructions

This application consists of two parts: a **Frontend** (React + Vite) and a **Backend** (Node.js + Express). Both need to be running for the application to work.

## Prerequisites

- Node.js (v16 or higher)
- npm or bun package manager
- A Gemini API key (get one from https://makersuite.google.com/app/apikey)

## Setup Steps

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# The backend uses the Gemini API key from server.js (already configured)
# If you need to use a different key, update line 13 in backend/server.js

# Start the backend server
npm start
```

The backend will start on **http://localhost:3001**

You should see:
```
🚀 SkillGap AI Backend running on http://localhost:3001
📁 Uploads directory: /path/to/backend/uploads
```

### 2. Frontend Setup

Open a **new terminal** and run:

```bash
# Navigate to project root (not backend folder)
cd ..

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will start on **http://localhost:5173** (or another port if 5173 is busy)

## How to Use

1. Make sure **both backend and frontend** are running
2. Open your browser to the frontend URL (usually http://localhost:5173)
3. Upload your resume (PDF or DOCX format)
4. Select your target job role
5. Click "Analyze My Fit"
6. View your personalized career roadmap!

## Features

- **Resume Parsing**: Automatically extracts text from PDF and DOCX files
- **AI-Powered Analysis**: Uses Google Gemini AI to analyze your skills
- **Dynamic Roadmap**: Creates flexible learning plans based on skill gap:
  - Small gap (70%+ match): 4-6 week roadmap
  - Moderate gap (40-70% match): 2-3 month roadmap
  - Large gap (<40% match): 3-6 month roadmap
- **Personalized Insights**: Get skill gap analysis and project recommendations

## Troubleshooting

### Backend not connecting
- Make sure the backend is running on port 3001
- Check the backend terminal for any error messages
- Verify the Gemini API key is valid

### Frontend shows "Backend not connected"
- Restart the backend server
- Make sure port 3001 is not being used by another application
- Check that both servers are running simultaneously

### Resume parsing fails
- Ensure your resume file is under 10MB
- Make sure the file is a valid PDF or DOCX format
- Check that the file contains readable text (not just images)

## Project Structure

```
project/
├── backend/           # Express.js backend
│   ├── server.js     # Main server file with API routes
│   ├── package.json  # Backend dependencies
│   └── uploads/      # Temporary file storage
├── src/              # React frontend
│   ├── pages/        # Page components
│   ├── components/   # Reusable UI components
│   └── services/     # API client services
└── package.json      # Frontend dependencies
```

## API Endpoints

### Backend API (http://localhost:3001)

- `GET /health` - Check backend status
- `GET /roles` - Get available job roles
- `POST /upload-resume` - Upload and parse resume
- `POST /generate-roadmap` - Generate AI-powered career roadmap

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- PDF.js & Mammoth.js (document parsing)

### Backend
- Node.js
- Express
- Google Generative AI (Gemini)
- Multer (file uploads)
- pdf-parse & mammoth (document parsing)

## Notes

- The backend temporarily stores uploaded files in the `backend/uploads` directory
- Resume data is stored in browser sessionStorage and cleared after navigation
- The Gemini API key in the code is for development purposes - replace with your own for production
