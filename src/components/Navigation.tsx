import { Link, useLocation } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, getGoogleAuthUrl, logout } from "@/services/apiClient";

const Navigation = () => {
  const location = useLocation();
  const [user, setUser] = useState<{ id: string; email: string; name?: string; imageUrl?: string } | null>(null);

  useEffect(() => {
    getCurrentUser().then((res) => {
      if (res.authenticated) setUser(res.user);
      else setUser(null);
    }).catch(() => setUser(null));
  }, [location.pathname]);
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-primary rounded-lg group-hover:scale-110 transition-transform duration-300 shadow-soft">
              <Briefcase className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SkillGap AI
            </span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                {user.imageUrl ? (
                  <img src={user.imageUrl} alt="avatar" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
                    {user.email[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.name || user.email}</span>
                <Button variant="outline" size="sm" onClick={async () => { await logout(); setUser(null); }}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button asChild size="sm" variant="default">
                <a href={getGoogleAuthUrl()}>Sign in with Google</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
