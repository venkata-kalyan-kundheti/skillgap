require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize Gemini AI
let genAI;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Middleware
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;
const corsOrigins = ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'];
if (FRONTEND_URL && !corsOrigins.includes(FRONTEND_URL)) corsOrigins.push(FRONTEND_URL);
app.use(cors({ origin: corsOrigins, credentials: true }));

app.set('trust proxy', 1);
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

// Auth: Google OAuth
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (e) {
    done(e);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  callbackURL: `${BACKEND_URL}/auth/google/callback`,
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const name = profile.displayName;
    const imageUrl = profile.photos && profile.photos[0] && profile.photos[0].value;
    const googleId = profile.id;
    if (!email) return done(new Error('Google email is required'));
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, imageUrl, googleId },
      create: { email, name, imageUrl, googleId },
    });
    done(null, user);
  } catch (e) {
    done(e);
  }
}));

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login-failed`, session: true }),
  (req, res) => res.redirect(FRONTEND_URL)
);
app.get('/auth/me', (req, res) => {
  if (req.user) {
    const { id, email, name, imageUrl } = req.user;
    return res.json({ authenticated: true, user: { id, email, name, imageUrl } });
  }
  res.json({ authenticated: false, user: null });
});
app.post('/auth/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    req.session.destroy(() => {
      res.clearCookie('sid', { path: '/' });
      res.json({ success: true });
    });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillGap AI Backend is running' });
});

// Get available job roles
app.get('/roles', (req, res) => {
  const roles = [
    { id: 'data-analyst', title: 'Data Analyst', category: 'Analytics' },
    { id: 'software-engineer', title: 'Software Engineer', category: 'Engineering' },
    { id: 'product-manager', title: 'Product Manager', category: 'Management' },
    { id: 'cloud-engineer', title: 'Cloud Engineer', category: 'Engineering' },
    { id: 'devops-engineer', title: 'DevOps Engineer', category: 'Engineering' },
    { id: 'data-scientist', title: 'Data Scientist', category: 'Analytics' },
    { id: 'frontend-developer', title: 'Frontend Developer', category: 'Engineering' },
    { id: 'backend-developer', title: 'Backend Developer', category: 'Engineering' },
    { id: 'fullstack-developer', title: 'Full Stack Developer', category: 'Engineering' },
    { id: 'ux-designer', title: 'UX Designer', category: 'Design' },
    { id: 'ui-designer', title: 'UI Designer', category: 'Design' },
    { id: 'project-manager', title: 'Project Manager', category: 'Management' },
    { id: 'business-analyst', title: 'Business Analyst', category: 'Analytics' },
    { id: 'qa-engineer', title: 'QA Engineer', category: 'Engineering' },
    { id: 'security-engineer', title: 'Security Engineer', category: 'Engineering' },
  ];
  
  res.json({ success: true, data: roles });
});

// Generate career roadmap using Gemini AI
app.post('/generate-roadmap', async (req, res) => {
  try {
    const { resumeText, jobRole } = req.body;

    if (!resumeText || !jobRole) {
      return res.status(400).json({
        success: false,
        error: 'Both resumeText and jobRole are required'
      });
    }

    if (!GEMINI_API_KEY || !genAI) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured'
      });
    }

    // Create the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create the prompt
    const prompt = `You are a career development expert. Analyze the following resume and compare it with the target job role to provide a detailed skill gap analysis and learning roadmap.

Resume Content:
${resumeText}

Target Job Role: ${jobRole}

Please analyze and provide a response in the following JSON format (return ONLY valid JSON, no markdown):
{
  "skillsExtracted": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "suggestedProjects": ["project1", "project2", ...],
  "roadmap": [
    {
      "period": "Week 1-2" or "Month 1" (choose based on skill gap),
      "title": "Foundation Phase",
      "goals": ["Goal 1", "Goal 2", ...],
      "resources": ["Resource 1", "Resource 2", ...]
    }
  ],
  "estimatedTimeframe": "4 weeks" or "3 months" (total time needed),
  "fitPercentage": 75
}

Instructions:
1. Extract all technical and soft skills mentioned in the resume
2. Identify key skills required for the ${jobRole} role that are missing from the resume
3. Suggest 3-5 practical projects that would help develop the missing skills
4. Create a flexible learning roadmap based on the skill gap:
   - If skill gap is SMALL (fitPercentage > 70): Create a 4-6 week roadmap with weekly phases
   - If skill gap is MODERATE (fitPercentage 40-70): Create a 2-3 month roadmap with bi-weekly or monthly phases
   - If skill gap is LARGE (fitPercentage < 40): Create a 3-6 month roadmap with monthly phases
5. Each roadmap phase should include:
   - period: Time period for this phase (e.g., "Week 1-2", "Month 1", "Weeks 3-4")
   - title: A descriptive title for what this phase focuses on
   - goals: Specific, actionable learning goals for this period
   - resources: Recommended learning resources, courses, or practice areas
6. Calculate a fit percentage (0-100) based on how well the resume matches the job role requirements
7. Set estimatedTimeframe to reflect the total duration of the roadmap
8. Return ONLY the JSON object, no additional text or markdown`;

    // Generate content
    console.log('🤖 Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Gemini response received:', text.substring(0, 200) + '...');

    // Parse the JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI response. Please try again.'
      });
    }

    // Validate the response structure
    if (!analysisData.skillsExtracted || !analysisData.missingSkills ||
        !analysisData.suggestedProjects || !analysisData.roadmap ||
        !Array.isArray(analysisData.roadmap) ||
        typeof analysisData.fitPercentage !== 'number' ||
        !analysisData.estimatedTimeframe) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response structure from AI'
      });
    }

    res.json({
      success: true,
      data: analysisData
    });

  } catch (error) {
    console.error('❌ Error generating roadmap:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate roadmap'
    });
  }
});

// Generate PDF and email to authenticated user
app.post('/email-report', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    const { selectedRole, roadmapData } = req.body || {};
    if (!selectedRole || !roadmapData) {
      return res.status(400).json({ success: false, error: 'selectedRole and roadmapData are required' });
    }

    const pdfBuffer = await generateReportPdf({
      userName: req.user.name || req.user.email,
      selectedRole,
      roadmapData,
    });

    await sendEmailWithAttachment({
      to: req.user.email,
      subject: `Your SkillGap AI report – ${selectedRole}`,
      text: 'Attached is your personalized SkillGap AI report as a PDF.',
      attachment: { filename: `SkillGap_Report_${selectedRole}.pdf`, content: pdfBuffer },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error emailing report:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send email' });
  }
});

// Upload and parse resume
app.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    const filePath = req.file.path;
    let extractedText = '';

    // Extract text based on file type
    if (req.file.mimetype === 'application/pdf') {
      extractedText = await extractTextFromPDF(filePath);
    } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      extractedText = await extractTextFromDOCX(filePath);
    }

    // Validate extracted text
    if (!extractedText || extractedText.trim().length < 50) {
      // Clean up file
      fs.unlinkSync(filePath);
      return res.status(400).json({
        success: false,
        error: 'Could not extract enough text from the resume. Please ensure the file is not empty or corrupted.'
      });
    }

    // Return extracted data
    res.json({
      success: true,
      data: {
        text: extractedText.trim(),
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      }
    });

    // Clean up file after processing (optional - you can keep it temporarily)
    // setTimeout(() => {
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    // }, 60000); // Delete after 1 minute

  } catch (error) {
    console.error('Error processing resume:', error);
    
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process resume'
    });
  }
});

// Helper functions
async function sendEmailWithAttachment({ to, subject, text, attachment }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({
    from: SMTP_USER,
    to,
    subject,
    text,
    attachments: [attachment],
  });
}

function addWrappedText(doc, text, options = {}) {
  const { x = 50, y = undefined, width = 500, lineGap = 4 } = options;
  doc.text(text, x, y, { width, lineGap });
}

async function generateReportPdf({ userName, selectedRole, roadmapData }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header
    doc.fontSize(20).fillColor('#111827').text('SkillGap AI – Career Analysis Report');
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#374151').text(`For: ${userName}`);
    doc.text(`Target Role: ${selectedRole}`);
    if (typeof roadmapData.fitPercentage === 'number') {
      doc.text(`Fit Percentage: ${roadmapData.fitPercentage}%`);
    }

    doc.moveDown(1);
    doc.strokeColor('#E5E7EB').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Skills Extracted
    doc.fontSize(16).fillColor('#111827').text('Your Skills');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#374151');
    if (Array.isArray(roadmapData.skillsExtracted) && roadmapData.skillsExtracted.length) {
      addWrappedText(doc, `• ${roadmapData.skillsExtracted.join('\n• ')}`);
    } else {
      addWrappedText(doc, 'No skills extracted');
    }

    doc.moveDown(1);

    // Missing Skills
    doc.fontSize(16).fillColor('#111827').text('Skills to Develop');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#7F1D1D');
    if (Array.isArray(roadmapData.missingSkills) && roadmapData.missingSkills.length) {
      addWrappedText(doc, `• ${roadmapData.missingSkills.join('\n• ')}`);
    } else {
      addWrappedText(doc, 'No major skill gaps identified');
    }

    doc.moveDown(1);

    // Roadmap
    doc.fontSize(16).fillColor('#111827').text('Learning Roadmap');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#374151');
    if (Array.isArray(roadmapData.roadmap) && roadmapData.roadmap.length) {
      roadmapData.roadmap.forEach((phase, index) => {
        doc.fontSize(12).fillColor('#1F2937').text(`${index + 1}. ${phase.title} (${phase.period})`);
        if (Array.isArray(phase.goals) && phase.goals.length) {
          addWrappedText(doc, `Goals:\n• ${phase.goals.join('\n• ')}`, { width: 500 });
        }
        if (Array.isArray(phase.resources) && phase.resources.length) {
          addWrappedText(doc, `Resources:\n• ${phase.resources.join('\n• ')}`, { width: 500 });
        }
        doc.moveDown(0.5);
      });
    } else {
      addWrappedText(doc, 'No roadmap data available');
    }

    doc.end();
  });
}
// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds 10MB limit'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillGap AI Backend running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
});
