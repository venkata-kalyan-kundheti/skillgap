import { useState } from "react";
import { Upload, Sparkles, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { parseResume, ParsedResume } from "@/services/resumeParser";
import { getRoles } from "@/services/rolesService";
import { generateCareerRoadmap } from "@/services/aiService";

const Landing = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const roles = getRoles();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setSelectedFile(file);
        toast({
          title: "Resume uploaded",
          description: `${file.name} is ready for analysis`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or DOCX file",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No resume uploaded",
        description: "Please upload your resume first",
        variant: "destructive",
      });
      return;
    }
    if (!selectedRole) {
      toast({
        title: "No role selected",
        description: "Please select a role to analyze",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      toast({
        title: "Parsing resume...",
        description: "Extracting text from your document",
      });

      const parsed = await parseResume(selectedFile);
      setParsedResume(parsed);

      toast({
        title: "Generating roadmap...",
        description: "AI is analyzing your skills and creating a personalized plan",
      });

      const roadmapData = await generateCareerRoadmap(parsed.text, selectedRole);

      sessionStorage.setItem('parsedResume', JSON.stringify(parsed));
      sessionStorage.setItem('selectedRole', selectedRole);
      sessionStorage.setItem('roadmapData', JSON.stringify(roadmapData));

      toast({
        title: "Analysis complete!",
        description: `${roadmapData.fitPercentage}% match with your target role`,
      });

      setTimeout(() => {
        navigate("/results");
      }, 1000);

    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6 animate-float">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI-Powered Career Analysis</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              SkillGap AI – Discover Your Career Fit
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Upload your resume and see if you're ready for your dream job. Get personalized insights, skill gap analysis, and a roadmap to success.
            </p>

            {/* Upload and Analysis Card */}
            <Card className="max-w-2xl mx-auto shadow-large bg-gradient-card animate-slide-up">
              <CardContent className="p-8 space-y-6">
                {/* File Upload */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground text-left">
                    Upload Your Resume
                  </label>
                  <div className="flex items-center gap-4">
                    <label htmlFor="resume-upload" className="flex-1">
                      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary transition-colors cursor-pointer bg-background">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {selectedFile ? selectedFile.name : "Click to upload PDF or DOCX"}
                          </p>
                        </div>
                      </div>
                      <input
                        id="resume-upload"
                        type="file"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-foreground text-left">
                    Select Target Role
                  </label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Choose your target role" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Analyze Button */}
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Analyze My Fit
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            What You'll Get
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Skills Analysis</h3>
                <p className="text-muted-foreground">
                  Comprehensive breakdown of your existing skills matched against job requirements
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold">Gap Identification</h3>
                <p className="text-muted-foreground">
                  Clear insights into skills you need to develop for your target role
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-soft hover:shadow-medium transition-all duration-300">
              <CardContent className="p-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Personalized Roadmap</h3>
                <p className="text-muted-foreground">
                  Step-by-step learning path with projects and timeline to reach your goal
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
