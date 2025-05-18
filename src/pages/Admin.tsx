
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Film, ListChecks, Users } from "lucide-react";

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your anime database, episodes, and user content.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-t-4 border-t-anime-primary overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anime Titles</CardTitle>
              <div className="rounded-full bg-primary/10 p-2">
                <Film className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent">
                250+
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total anime in database
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-anime-secondary overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Episodes</CardTitle>
              <div className="rounded-full bg-secondary/10 p-2">
                <ListChecks className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-anime-secondary to-anime-accent bg-clip-text text-transparent">
                5,200+
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Episodes available
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-anime-accent overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <div className="rounded-full bg-accent/10 p-2">
                <Users className="h-4 w-4 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-anime-accent to-anime-highlight bg-clip-text text-transparent">
                3,500+
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Registered users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Overview of recent user activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">User registered</p>
                      <p className="text-xs text-muted-foreground">12 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>New Anime</CardTitle>
              <CardDescription>Recently added titles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-12 w-12 rounded-md bg-primary/20 flex items-center justify-center overflow-hidden">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Demon Slayer Season 3</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Action</span>
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">Fantasy</span>
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
  );
};

export default AdminDashboard;
