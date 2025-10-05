
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyC0v_gJNNF1zG1rTUjSTxX8cWFKTWvRzAo";

// Initialize Gemini AI
let genAI;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080', 'https://*.lovable.app'],
  credentials: true
}));

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

// Routes

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
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

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
  "roadmap": {
    "week1": "Focus area and specific goals",
    "week2": "Focus area and specific goals",
    "week3": "Focus area and specific goals",
    "week4": "Focus area and specific goals"
  },
  "fitPercentage": 75
}

Instructions:
1. Extract all technical and soft skills mentioned in the resume
2. Identify key skills required for the ${jobRole} role that are missing from the resume
3. Suggest 3-5 practical projects that would help develop the missing skills
4. Create a 4-week learning roadmap with specific, actionable goals for each week
5. Calculate a fit percentage (0-100) based on how well the resume matches the job role requirements
6. Return ONLY the JSON object, no additional text or markdown`;

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
        typeof analysisData.fitPercentage !== 'number') {
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
