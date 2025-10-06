import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import CircularProgress from "@/components/CircularProgress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheck as CheckCircle2, Circle as XCircle, BookOpen, Calendar, ArrowLeft, Target } from "lucide-react";
import { emailReport, getCurrentUser } from "@/services/apiClient";

interface RoadmapPhase {
  period: string;
  title: string;
  goals: string[];
  resources: string[];
}

interface RoadmapData {
  skillsExtracted: string[];
  missingSkills: string[];
  suggestedProjects: string[];
  roadmap: RoadmapPhase[];
  estimatedTimeframe: string;
  fitPercentage: number;
}

const Results = () => {
  const navigate = useNavigate();
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [canEmail, setCanEmail] = useState<boolean>(false);
  const [emailing, setEmailing] = useState<boolean>(false);

  useEffect(() => {
    // Load data from sessionStorage
    const storedRoadmap = sessionStorage.getItem('roadmapData');
    const storedRole = sessionStorage.getItem('selectedRole');
    
    if (storedRoadmap) {
      setRoadmapData(JSON.parse(storedRoadmap));
    }
    if (storedRole) {
      setSelectedRole(storedRole);
    }
    
    // Redirect if no data
    if (!storedRoadmap && !storedRole) {
      navigate('/');
    }
    getCurrentUser().then((res) => setCanEmail(res.authenticated)).catch(() => setCanEmail(false));
  }, [navigate]);


  const handleBackToHome = () => {
    // Clear session storage
    sessionStorage.removeItem('parsedResume');
    sessionStorage.removeItem('selectedRole');
    sessionStorage.removeItem('roadmapData');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={handleBackToHome}
            className="group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Upload New Resume
          </Button>

          {/* Header with Progress */}
          <div className="text-center space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Career Analysis Report
              </h1>
              <p className="text-muted-foreground text-lg">
                Target Role: <span className="font-semibold text-foreground">{selectedRole}</span>
              </p>
            </div>

            {/* Circular Progress */}
            {roadmapData && (
              <div className="flex justify-center py-8">
                <CircularProgress percentage={roadmapData.fitPercentage} />
              </div>
            )}
          </div>

          {/* Skills Overview - Side by Side */}
          <div className="grid md:grid-cols-2 gap-6 animate-slide-up">
            {/* Existing Skills */}
            <Card className="shadow-medium bg-gradient-card border-primary/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Your Skills</CardTitle>
                    <CardDescription>Identified from your resume</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {roadmapData && roadmapData.skillsExtracted.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roadmapData.skillsExtracted.map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant="secondary" 
                        className="py-2 px-3 animate-fade-in"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    No skills data available
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card className="shadow-medium bg-gradient-card border-destructive/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-destructive" />
                  </div>
                  <div>
                    <CardTitle>Skills to Develop</CardTitle>
                    <CardDescription>Focus areas for growth</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {roadmapData && roadmapData.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {roadmapData.missingSkills.map((skill, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="py-2 px-3 border-destructive/30 text-destructive animate-fade-in"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    Great! No major skill gaps identified
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Suggested Projects Grid */}
          <Card className="shadow-medium bg-gradient-card animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <CardTitle>Recommended Projects</CardTitle>
                  <CardDescription>Hands-on projects to bridge the gap</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {roadmapData && roadmapData.suggestedProjects.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmapData.suggestedProjects.map((project, i) => (
                    <Card 
                      key={i} 
                      className="hover:shadow-medium transition-all duration-300 hover:-translate-y-1 bg-background/50 animate-fade-in"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-sm leading-relaxed">{project}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                  No project recommendations available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Learning Roadmap Timeline */}
          <Card className="shadow-medium bg-gradient-card animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Learning Roadmap</CardTitle>
                  <CardDescription>
                    {roadmapData?.estimatedTimeframe
                      ? `Estimated completion: ${roadmapData.estimatedTimeframe}`
                      : "Your personalized path to success"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {roadmapData && roadmapData.roadmap && roadmapData.roadmap.length > 0 ? (
                <div className="space-y-6">
                  {roadmapData.roadmap.map((phase, i) => (
                    <div
                      key={i}
                      className="flex gap-6 animate-fade-in"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    >
                      {/* Timeline indicator */}
                      <div className="flex flex-col items-center pt-1">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border-4 border-background shadow-medium">
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-foreground">{i + 1}</span>
                          </div>
                        </div>
                        {i < roadmapData.roadmap.length - 1 && (
                          <div className="flex-1 w-0.5 bg-gradient-to-b from-primary/50 to-primary/10 mt-2 min-h-[100px]"></div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <Card className="bg-background/50 hover:shadow-medium transition-all duration-300">
                          <CardContent className="p-5 space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {phase.period}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-lg text-primary">
                                {phase.title}
                              </h4>
                            </div>

                            {/* Goals */}
                            {phase.goals && phase.goals.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium mb-2 text-foreground">Learning Goals:</h5>
                                <ul className="space-y-2">
                                  {phase.goals.map((goal, goalIdx) => (
                                    <li key={goalIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                      <span>{goal}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Resources */}
                            {phase.resources && phase.resources.length > 0 && (
                              <div>
                                <h5 className="text-sm font-medium mb-2 text-foreground">Resources:</h5>
                                <ul className="space-y-2">
                                  {phase.resources.map((resource, resIdx) => (
                                    <li key={resIdx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                      <BookOpen className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                                      <span>{resource}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
                  No roadmap data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Bottom Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Button 
              variant="hero" 
              size="lg"
              onClick={handleBackToHome}
              className="min-w-[200px]"
            >
              Analyze Another Resume
            </Button>
            {canEmail && roadmapData && (
              <Button
                variant="default"
                size="lg"
                disabled={emailing}
                onClick={async () => {
                  setEmailing(true);
                  try {
                    await emailReport(selectedRole, roadmapData);
                    alert('Report sent to your email');
                  } catch (e) {
                    alert('Failed to send email');
                  } finally {
                    setEmailing(false);
                  }
                }}
              >
                {emailing ? 'Sending...' : 'Email me this report (PDF)'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
