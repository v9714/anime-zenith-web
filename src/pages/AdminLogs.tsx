import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { logsService, LogFile } from "@/services/logsService";
import { FileText, Eye, Trash2, RefreshCw, X, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function AdminLogs() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const fetchLogFiles = async () => {
    setLoading(true);
    try {
      const response = await logsService.getLogFiles();
      if (response.success) {
        setLogFiles(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch log files",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogFiles();
  }, []);

  const handleViewLog = async (filename: string) => {
    setSelectedLog(filename);
    setContentLoading(true);
    try {
      const response = await logsService.getLogContent(filename);
      if (response.success) {
        setLogContent(response.data.content);
        setIsTruncated(response.data.truncated);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch log content",
      });
      setSelectedLog(null);
    } finally {
      setContentLoading(false);
    }
  };

  const handleDeleteClick = (filename: string) => {
    setFileToDelete(filename);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;
    
    setDeleting(true);
    try {
      const response = await logsService.deleteLogFile(fileToDelete);
      if (response.success) {
        toast({
          title: "Success",
          description: "Log file deleted successfully",
        });
        setLogFiles((prev) => prev.filter((f) => f.name !== fileToDelete));
        if (selectedLog === fileToDelete) {
          setSelectedLog(null);
          setLogContent("");
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete log file",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return dateString;
    }
  };

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Logs</h1>
              <p className="text-muted-foreground">
                View and manage server log files
              </p>
            </div>
            <Button onClick={fetchLogFiles} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Log Files List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Log Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : logFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No log files found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {logFiles.map((file) => (
                      <div
                        key={file.name}
                        className={`p-3 rounded-lg border transition-colors ${
                          selectedLog === file.name
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.size} • {formatDate(file.mtime)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleViewLog(file.name)}
                              title="View log"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleDeleteClick(file.name)}
                              className="text-destructive hover:text-destructive"
                              title="Delete log"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Log Content Viewer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    {selectedLog ? selectedLog : "Log Viewer"}
                  </CardTitle>
                  {selectedLog && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSelectedLog(null);
                        setLogContent("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isTruncated && selectedLog && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Log truncated to last 1MB for performance</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedLog ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Select a log file to view its content</p>
                  </div>
                ) : contentLoading ? (
                  <div className="space-y-2">
                    {[...Array(15)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : (
                  <ScrollArea className="h-[500px] rounded-md border bg-muted/30">
                    <pre className="p-4 text-xs font-mono whitespace-pre-wrap break-all">
                      {logContent || "No content available"}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Log File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{fileToDelete}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminRoute>
  );
}
