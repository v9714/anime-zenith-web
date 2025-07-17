
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
import { Link, useLocation } from "react-router-dom";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <ThemeProvider defaultTheme="dark">
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar variant="inset" className="border-r border-sidebar-border">
            <SidebarHeader className="pb-4">
              <div className="flex flex-col gap-1 p-2">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-anime-primary to-anime-secondary p-1.5 rounded-md">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-anime-primary to-anime-secondary bg-clip-text text-transparent">
                    OtakuTV
                  </span>
                </div>
                <span className="text-xs text-muted-foreground pl-2">Admin Panel</span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link to="/admin">
                    <SidebarMenuButton 
                      isActive={currentPath === "/admin"}
                      className={`hover:bg-sidebar-accent/40 ${currentPath === "/admin" ? "bg-sidebar-accent/40 border-l-4 border-primary" : ""}`}
                    >
                      <LayoutDashboard className={`h-5 w-5 ${currentPath === "/admin" ? "text-primary" : ""}`} />
                      <span className={currentPath === "/admin" ? "text-white font-medium" : ""}>Dashboard</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/anime">
                    <SidebarMenuButton 
                      isActive={currentPath === "/admin/anime"}
                      className={`hover:bg-sidebar-accent/40 ${currentPath === "/admin/anime" ? "bg-sidebar-accent/40 border-l-4 border-primary" : ""}`}
                    >
                      <Film className={`h-5 w-5 ${currentPath === "/admin/anime" ? "text-primary" : ""}`} />
                      <span className={currentPath === "/admin/anime" ? "text-white font-medium" : ""}>Anime Management</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/episodes">
                    <SidebarMenuButton 
                      isActive={currentPath === "/admin/episodes"}
                      className={`hover:bg-sidebar-accent/40 ${currentPath === "/admin/episodes" ? "bg-sidebar-accent/40 border-l-4 border-primary" : ""}`}
                    >
                      <ListChecks className={`h-5 w-5 ${currentPath === "/admin/episodes" ? "text-primary" : ""}`} />
                      <span className={currentPath === "/admin/episodes" ? "text-white font-medium" : ""}>Episodes</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/admin/users">
                    <SidebarMenuButton 
                      isActive={currentPath === "/admin/users"}
                      className={`hover:bg-sidebar-accent/40 ${currentPath === "/admin/users" ? "bg-sidebar-accent/40 border-l-4 border-primary" : ""}`}
                    >
                      <Users className={`h-5 w-5 ${currentPath === "/admin/users" ? "text-primary" : ""}`} />
                      <span className={currentPath === "/admin/users" ? "text-white font-medium" : ""}>Users</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link to="/">
                    <SidebarMenuButton className="hover:bg-sidebar-accent/40">
                      <Database className="h-5 w-5" />
                      <span>Back to Site</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm border-b">
              <div className="flex h-14 items-center px-4">
                <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
                  <Link to="/" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Home
                  </Link>
                  <Link to="/admin/anime" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Anime List
                  </Link>
                  <Link to="/admin/episodes" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Episodes
                  </Link>
                  <Link to="/admin/manga" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Manga
                  </Link>
                  <Link to="/admin/contact" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground">
                    Contact
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <main className="p-3 sm:p-6 bg-background">
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
