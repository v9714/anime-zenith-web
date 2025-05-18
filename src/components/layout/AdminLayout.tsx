
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
import { Database, Film, ListChecks, PlusCircle, Settings, Users } from "lucide-react";
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
            <SidebarHeader className="pb-0">
              <div className="flex items-center gap-2 px-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-lg font-bold">Admin Panel</h1>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <Link to="/admin">
                    <SidebarMenuButton>
                      <Database className="h-5 w-5" />
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
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <div className="flex-1 flex flex-col">
            <div className="pt-16">
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
