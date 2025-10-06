# SkillGap AI - Quick Start Guide

## 🚀 Running the Application in VSCode

### Step 1: Open Two Terminals

In VSCode, you need **two terminal windows** running simultaneously:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

You should see:
```
🚀 SkillGap AI Backend running on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

You should see:
```
VITE ready in X ms
➜ Local: http://localhost:5173
```

### Step 2: Open Your Browser

Navigate to **http://localhost:5173**

## ✅ What You'll See

1. **Landing Page**: Upload your resume and select target role
2. **Analysis**: Backend processes your resume with Gemini AI
3. **Results Dashboard**: View your personalized roadmap with:
   - Current skills extracted from resume
   - Missing skills for target role
   - Suggested projects
   - **Dynamic learning roadmap** (adapts based on skill gap):
     - High match (70%+): 4-6 week plan
     - Medium match (40-70%): 2-3 month plan
     - Low match (<40%): 3-6 month plan

## 🔑 Important Notes

- **Both terminals must stay open** while using the app
- Backend runs on port **3001**
- Frontend runs on port **5173**
- Resume files must be PDF or DOCX format (max 10MB)

## 🐛 Troubleshooting

**"Backend not connected" error:**
- Make sure Terminal 1 (backend) is running
- Check http://localhost:3001/health in your browser
- If port 3001 is busy, kill the process and restart

**Frontend won't start:**
- Make sure port 5173 is available
- Try `npm run dev -- --port 3000` to use a different port

**Dependencies missing:**
- Run `npm install` in both root directory AND backend directory

## 📁 File Support

- ✅ PDF files
- ✅ DOCX files (Microsoft Word)
- ❌ Images of resumes (must be text-based documents)

## 🎯 Available Job Roles

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

## 💡 Tips for Best Results

1. Use a well-formatted resume with clear sections
2. Include technical skills, experience, and education
3. Ensure text is machine-readable (not scanned images)
4. File should be under 10MB

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS
**Backend:** Node.js, Express, Gemini AI
**Document Parsing:** PDF.js, Mammoth.js

---

Need more details? See **SETUP.md** for complete documentation.
