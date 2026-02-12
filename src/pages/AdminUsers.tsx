import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Users, Shield, MessageSquare, ShieldCheck } from "lucide-react";
import { userService, AdminUser } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();

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

  const handleToggleAdmin = async (userId: string, currentIsAdmin: boolean) => {
    if (userId === String(currentUser?.id) && currentIsAdmin) {
      toast({
        id: String(Date.now()),
        title: "Action Restricted",
        description: "You cannot demote yourself from admin status.",
      });

      return;
    }

    try {
      setUpdating(userId);
      const response = await userService.updateUser(userId, {
        isAdmin: !currentIsAdmin
      });

      if (response.success) {
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, isAdmin: !currentIsAdmin }
            : user
        ));
        toast({
          id: String(Date.now()),
          title: "Success",
          description: `User ${!currentIsAdmin ? 'promoted to admin' : 'removed from admin'} successfully`,
        });
      } else {
        toast({
          id: String(Date.now()),
          title: "Error",
          description: response.message || "Failed to update admin status",
        });
      }
    } catch (error) {
      toast({
        id: String(Date.now()),
        title: "Error",
        description: "Failed to update admin status. Please try again.",
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

  const UserTable = ({ data }: { data: AdminUser[] }) => (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-mono text-sm">{user.id}</TableCell>
                <TableCell className="font-medium">{user.displayName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant={user.isBlocked ? "destructive" : "default"} className="w-fit">
                      {user.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                    <Badge variant={user.canComment ? "outline" : "secondary"} className="w-fit text-[10px] h-4">
                      {user.canComment ? "Can Comment" : "Muted"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                    {user.isAdmin ? "Admin" : "User"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold w-12 text-muted-foreground">Admin:</span>
                        <Switch
                          checked={user.isAdmin}
                          disabled={updating === user.id}
                          onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold w-12 text-muted-foreground">Block:</span>
                        <Switch
                          checked={user.isBlocked}
                          disabled={updating === user.id}
                          onCheckedChange={() => handleToggleStatus(user.id, user.isBlocked)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold w-12 text-muted-foreground">Mute:</span>
                        <Switch
                          checked={!user.canComment}
                          disabled={updating === user.id}
                          onCheckedChange={() => handleToggleComments(user.id, user.canComment)}
                        />
                      </div>
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
        {data.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{user.displayName}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <Badge variant={user.isAdmin ? "destructive" : "secondary"}>
                    {user.isAdmin ? "Admin" : "User"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Badge variant={user.isBlocked ? "destructive" : "default"}>
                    {user.isBlocked ? "Blocked" : "Active"}
                  </Badge>
                  <Badge variant={user.canComment ? "default" : "secondary"}>
                    Comments: {user.canComment ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Admin Role</span>
                    <Switch
                      checked={user.isAdmin}
                      disabled={updating === user.id}
                      onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Block Access</span>
                    <Switch
                      checked={user.isBlocked}
                      disabled={updating === user.id}
                      onCheckedChange={() => handleToggleStatus(user.id, user.isBlocked)}
                    />
                  </div>
                  <div className="flex items-center justify-between col-span-2">
                    <span className="font-medium">Allow Comments</span>
                    <Switch
                      checked={user.canComment}
                      disabled={updating === user.id}
                      onCheckedChange={() => handleToggleComments(user.id, user.canComment)}
                    />
                  </div>
                  {updating === user.id && (
                    <div className="flex items-center justify-center col-span-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found</p>
        </div>
      )}
    </div>
  );

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User & Admin Management</h1>
              <p className="text-muted-foreground mt-2">
                Manage accounts, promote admins, and control permissions
              </p>
            </div>
            <Button onClick={loadUsers} variant="outline">
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Admins</CardTitle>
                <ShieldCheck className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.filter(u => u.isAdmin).length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active</CardTitle>
                <Shield className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => !user.isBlocked).length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Comments</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.canComment).length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full md:w-max grid-cols-2 mb-4">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                All Users
              </TabsTrigger>
              <TabsTrigger value="admins" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Manage Admins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>All Registered Users</CardTitle>
                  <CardDescription>View and manage all user accounts in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable data={users} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admins">
              <Card border-destructive>
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Admin Privileges
                  </CardTitle>
                  <CardDescription>Users with administrative access. Be careful when promoting users.</CardDescription>
                </CardHeader>
                <CardContent>
                  <UserTable data={users.filter(u => u.isAdmin)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}