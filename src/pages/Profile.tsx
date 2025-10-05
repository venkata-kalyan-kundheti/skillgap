import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="shadow-medium bg-gradient-card animate-slide-up">
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>Your profile information and settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold">Profile Coming Soon</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    User profile and settings will be available once backend integration is complete
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 p-4 bg-muted/50 rounded-lg">
                💡 Placeholder: User profile, settings, and preferences will be managed here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
