import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                View your analysis history and track your progress
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate("/")}>
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </div>

          {/* Placeholder Content */}
          <Card className="shadow-medium bg-gradient-card animate-slide-up">
            <CardHeader>
              <CardTitle>Analysis History</CardTitle>
              <CardDescription>Your past resume analyses will appear here</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">No analyses yet</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Start by uploading your resume and selecting a target role to get personalized insights
                  </p>
                </div>
                <Button variant="default" onClick={() => navigate("/")}>
                  Get Started
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">
                💡 Placeholder: Past analyses with timestamps and quick access will be listed here
              </p>
            </CardContent>
          </Card>

          {/* Stats Cards Placeholder */}
          <div className="grid sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <Card className="bg-gradient-card shadow-soft">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground mt-1">Total Analyses</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-soft">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-accent">0</div>
                <p className="text-sm text-muted-foreground mt-1">Skills Tracked</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card shadow-soft">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-primary">0</div>
                <p className="text-sm text-muted-foreground mt-1">Projects Completed</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
