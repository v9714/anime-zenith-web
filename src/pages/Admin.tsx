
import { AdminRoute } from "@/components/layout/AdminRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Film, ListChecks, Users, TrendingUp, Activity, Eye, Calendar, Bell, Settings, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  
  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-8 animate-fade-in">
          {/* Welcome Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, {currentUser?.displayName}! 👋
              </h1>
              <p className="text-muted-foreground text-lg">
                Here's what's happening with your anime platform today.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Anime</CardTitle>
                <div className="rounded-full bg-primary/20 p-2 group-hover:bg-primary/30 transition-colors">
                  <Film className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  250+
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-secondary/10 via-secondary/5 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Episodes</CardTitle>
                <div className="rounded-full bg-secondary/20 p-2 group-hover:bg-secondary/30 transition-colors">
                  <ListChecks className="h-4 w-4 text-secondary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                  5,200+
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  +180 this week
                </p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <div className="rounded-full bg-accent/20 p-2 group-hover:bg-accent/30 transition-colors">
                  <Users className="h-4 w-4 text-accent" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
                  3,500+
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  +24% engagement
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/10 via-accent/5 to-transparent backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-muted-foreground">Watch Time</CardTitle>
                <div className="rounded-full bg-primary/20 p-2 group-hover:bg-primary/30 transition-colors">
                  <BarChart3 className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  1.2M
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  hours this month
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-3">
            <Link to="/admin/anime">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Film className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Manage Anime</CardTitle>
                  <CardDescription>Add, edit, and organize anime content</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/admin/episodes">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ListChecks className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">Manage Episodes</CardTitle>
                  <CardDescription>Upload and organize episode content</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link to="/admin/users">
              <Card className="group cursor-pointer border-0 bg-gradient-to-br from-card via-card/90 to-card/70 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold">User Management</CardTitle>
                  <CardDescription>Monitor and manage user accounts</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>

          {/* Recent Activity & Analytics */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform activity and user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "user", action: "New user registered", time: "12 minutes ago", icon: Users, color: "text-green-500" },
                    { type: "anime", action: "New anime added", time: "1 hour ago", icon: Film, color: "text-primary" },
                    { type: "episode", action: "Episode uploaded", time: "2 hours ago", icon: ListChecks, color: "text-secondary" },
                    { type: "user", action: "Premium subscription", time: "3 hours ago", icon: TrendingUp, color: "text-accent" }
                  ].map((activity, i) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                        <div className="h-10 w-10 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-secondary" />
                  Popular Content
                </CardTitle>
                <CardDescription>Most watched anime this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "Attack on Titan: Final Season", views: "45.2K", trend: "+15%", rank: 1 },
                    { title: "Demon Slayer: Hashira Training", views: "38.7K", trend: "+8%", rank: 2 },
                    { title: "Jujutsu Kaisen Season 2", views: "32.1K", trend: "+12%", rank: 3 },
                    { title: "One Piece: Egghead Arc", views: "28.9K", trend: "+5%", rank: 4 }
                  ].map((anime, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group">
                      <div className="h-12 w-12 rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                        #{anime.rank}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{anime.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">{anime.views} views</span>
                          <span className="text-xs text-green-500 font-medium">{anime.trend}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminDashboard;
