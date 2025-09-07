import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Users, Shield, MessageSquare } from "lucide-react";
import { userService, AdminUser } from "@/services/userService";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        toast({
          id: String(Date.now()),
          title: "Error",
          description: response.message || "Failed to load users",
        });
      }
    } catch (error) {
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to load users. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdating(userId);
      const response = await userService.updateUser(userId, {
        isBlocked: !currentStatus
      });
      
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, isBlocked: !currentStatus }
            : user
        ));
        toast({
          id: String(Date.now()),
          title: "Success",
          description: `User ${!currentStatus ? 'blocked' : 'unblocked'} successfully`,
        });
      } else {
        toast({
          id: String(Date.now()),
          title: "Error",
          description: response.message || "Failed to update user status",
        });
      }
    } catch (error) {
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to update user status. Please try again.",
      });
    } finally {
      setUpdating(null);
    }
  };

  const handleToggleComments = async (userId: string, currentCanComment: boolean) => {
    try {
      setUpdating(userId);
      const response = await userService.updateUser(userId, {
        canComment: !currentCanComment
      });
      
      if (response.success) {
        setUsers(users.map(user => 
          user.id === userId 
            ? { ...user, canComment: !currentCanComment }
            : user
        ));
        toast({
          id: String(Date.now()),
          title: "Success",
          description: `Comments ${!currentCanComment ? 'enabled' : 'disabled'} for user`,
        });
      } else {
        toast({
          id: String(Date.now()),
          title: "Error",
          description: response.message || "Failed to update comment permissions",
        });
      }
    } catch (error) {
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to update comment permissions. Please try again.",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Loading users...</span>
            </div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage user accounts, status, and permissions
              </p>
            </div>
            <Button onClick={loadUsers} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => !user.isBlocked).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Can Comment</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.canComment).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Can Comment</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">
                          {user.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isBlocked ? "destructive" : "default"}>
                            {user.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.canComment ? "default" : "secondary"}>
                            {user.canComment ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Block:</span>
                              <Switch
                                checked={user.isBlocked}
                                disabled={updating === user.id}
                                onCheckedChange={() => handleToggleStatus(user.id, user.isBlocked)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Comments:</span>
                              <Switch
                                checked={user.canComment}
                                disabled={updating === user.id}
                                onCheckedChange={() => handleToggleComments(user.id, user.canComment)}
                              />
                            </div>
                            {updating === user.id && (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge variant={user.isBlocked ? "destructive" : "default"}>
                            {user.isBlocked ? "Blocked" : "Active"}
                          </Badge>
                          <Badge variant={user.canComment ? "default" : "secondary"}>
                            Comments: {user.canComment ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>

                        <div className="flex flex-col gap-3 pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Block User</span>
                            <Switch
                              checked={user.isBlocked}
                              disabled={updating === user.id}
                              onCheckedChange={() => handleToggleStatus(user.id, user.isBlocked)}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Allow Comments</span>
                            <Switch
                              checked={user.canComment}
                              disabled={updating === user.id}
                              onCheckedChange={() => handleToggleComments(user.id, user.canComment)}
                            />
                          </div>
                          {updating === user.id && (
                            <div className="flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}