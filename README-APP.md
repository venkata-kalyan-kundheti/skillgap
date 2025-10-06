# SkillGap AI - Career Fit Analyzer

An AI-powered resume analysis tool that helps you identify skill gaps and provides a personalized learning roadmap to land your dream job.

## 🎯 Features

- **Resume Parsing**: Upload PDF or DOCX resumes for automatic text extraction
- **AI-Powered Analysis**: Uses Google Gemini AI to analyze skills and job fit
- **Skill Gap Identification**: Compares your skills against target role requirements
- **Dynamic Learning Roadmap**: Creates flexible timelines based on your skill gap:
  - **Small Gap (70%+ match)**: 4-6 week roadmap
  - **Moderate Gap (40-70% match)**: 2-3 month roadmap
  - **Large Gap (<40% match)**: 3-6 month roadmap
- **Project Recommendations**: Get 3-5 practical projects to build missing skills
- **Professional UI**: Beautiful, responsive design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js v16 or higher
- npm or bun package manager

### Installation & Running

**You need TWO terminal windows running simultaneously:**

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## 📖 Documentation

- **QUICKSTART.md** - Fast getting started guide
- **SETUP.md** - Detailed setup and configuration
- **START.sh** - Helper script to check dependencies

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │────────▶│    Backend      │
│   (React)       │         │   (Express)     │
│   Port 5173     │◀────────│   Port 3001     │
└─────────────────┘         └────────┬────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Gemini AI     │
                            │   (Google)      │
                            └─────────────────┘
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS + shadcn/ui components
- PDF.js and Mammoth.js for document parsing
- React Router for navigation

**Backend:**
- Node.js with Express
- Google Generative AI (Gemini 2.0 Flash)
- Multer for file uploads
- pdf-parse and mammoth for server-side parsing
- CORS enabled for local development

## 📂 Project Structure

```
project/
├── backend/              # Backend API server
│   ├── server.js        # Express server with API routes
│   ├── package.json     # Backend dependencies
│   └── uploads/         # Temporary file storage
├── src/                 # Frontend source code
│   ├── pages/          # Page components (Landing, Results)
│   ├── components/     # Reusable UI components
│   ├── services/       # API client and business logic
│   └── lib/            # Utility functions
├── public/             # Static assets
└── dist/               # Production build output
```

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check backend status |
| GET | `/roles` | Get available job roles |
| POST | `/upload-resume` | Upload and parse resume file |
| POST | `/generate-roadmap` | Generate AI career analysis |

## 🎨 Available Job Roles

- Data Analyst
- Software Engineer
- Product Manager
- Cloud Engineer
- DevOps Engineer
- Data Scientist
- Frontend/Backend/Full Stack Developer
- UX/UI Designer
- Project Manager
- Business Analyst
- QA Engineer
- Security Engineer

## 🔧 Configuration

### Backend Configuration
The Gemini API key is configured in `backend/server.js` (line 13). For production, use environment variables:

```bash
export GEMINI_API_KEY=your_api_key_here
```

### Frontend Configuration
The API base URL defaults to `http://localhost:3001`. To change it, set:

```bash
export VITE_API_URL=http://your-backend-url
```

## 📋 Requirements

- Resume files must be PDF or DOCX format
- Maximum file size: 10MB
- Files must contain readable text (not scanned images)
- Backend must be running for the app to work

## 🐛 Troubleshooting

**"Backend not connected" error:**
- Ensure backend is running on port 3001
- Check http://localhost:3001/health in your browser
- Restart the backend server

**Resume parsing fails:**
- Verify file is valid PDF or DOCX
- Check file size is under 10MB
- Ensure document contains extractable text

**Port conflicts:**
- Backend uses port 3001
- Frontend uses port 5173
- Change ports if needed with `--port` flag

## 🧪 Testing

To verify everything is working:

1. Start backend and check: http://localhost:3001/health
2. Start frontend and visit: http://localhost:5173
3. Upload a sample resume and select a role
4. Verify the analysis completes successfully

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
