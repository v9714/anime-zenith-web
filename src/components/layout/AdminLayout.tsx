
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ThemeProvider } from "@/lib/ThemeProvider";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarProvider, 
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Database, Film, ListChecks, LayoutDashboard, Users, Settings } from "lucide-react";
import { Link } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider>
        <div className="min-h-screen flex">
          <Sidebar>
            <SidebarHeader className="pb-2">
              <div className="flex items-center gap-2 px-2">
                <Settings className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Admin Panel</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link to="/admin">
                    <SidebarMenuButton>
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/anime">
                    <SidebarMenuButton>
                      <Film className="h-5 w-5" />
                      <span>Anime Management</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/episodes">
                    <SidebarMenuButton>
                      <ListChecks className="h-5 w-5" />
                      <span>Episodes</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/users">
                    <SidebarMenuButton>
                      <Users className="h-5 w-5" />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/">
                    <SidebarMenuButton>
                      <Database className="h-5 w-5" />
                      <span>Back to Site</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <Header />
            <div className="flex-1 pt-16">
              <main className="p-6 bg-background">
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
