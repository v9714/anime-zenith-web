import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
import { logsService, LogFile, HealthMetric } from "@/services/logsService";
import {
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  X,
  AlertTriangle,
  Activity,
  Server
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminLogs() {
  const [logFiles, setLogFiles] = useState<LogFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<"LOG" | "METRIC" | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"server" | "health">("server");
  const [selectedService, setSelectedService] = useState<string>("all");
  const { toast } = useToast();

  const serverLogs = useMemo(() =>
    logFiles.filter((f) => f.type === "LOG"),
    [logFiles]
  );

  const healthFiles = useMemo(() =>
    logFiles.filter((f) => f.type === "METRIC"),
    [logFiles]
  );

  const availableServices = useMemo(() => {
    return Array.from(new Set(healthMetrics.map(m => m.service))).sort();
  }, [healthMetrics]);

  const filteredMetrics = useMemo(() => {
    if (selectedService === "all") return healthMetrics;
    return healthMetrics.filter(m => m.service === selectedService);
  }, [healthMetrics, selectedService]);

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

  const handleViewFile = async (filename: string, type: "LOG" | "METRIC") => {
    setSelectedFile(filename);
    setSelectedFileType(type);
    setContentLoading(true);
    setLogContent("");
    setHealthMetrics([]);

    try {
      const response = await logsService.getLogContent(filename);
      if (response.success) {
        setIsTruncated(response.data.truncated);

        if (type === "METRIC") {
          const metrics = logsService.parseHealthMetrics(response.data.content);
          setHealthMetrics(metrics);
        } else {
          setLogContent(response.data.content);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch file content",
      });
      setSelectedFile(null);
      setSelectedFileType(null);
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
          description: "File deleted successfully",
        });
        setLogFiles((prev) => prev.filter((f) => f.name !== fileToDelete));
        if (selectedFile === fileToDelete) {
          setSelectedFile(null);
          setSelectedFileType(null);
          setLogContent("");
          setHealthMetrics([]);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file",
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

  const formatChartTime = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "MM/dd HH:mm");
    } catch {
      return timestamp;
    }
  };

  const clearViewer = () => {
    setSelectedFile(null);
    setSelectedFileType(null);
    setLogContent("");
    setHealthMetrics([]);
  };

  const FileListItem = ({ file }: { file: LogFile }) => (
    <div
      className={`p-3 rounded-lg border transition-colors ${selectedFile === file.name
        ? "border-primary bg-primary/5"
        : "border-border hover:border-primary/50"
        }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium truncate text-sm">
            {file.name.split('/').pop()}
          </p>
          <p className="text-xs text-muted-foreground">
            {file.size} • {formatDate(file.mtime)}
          </p>
        </div>
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleViewFile(file.name, file.type)}
            title="View file"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteClick(file.name)}
            className="text-destructive hover:text-destructive"
            title="Delete file"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  const EmptyState = ({ icon: Icon, message }: { icon: React.ElementType; message: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <Icon className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p>{message}</p>
    </div>
  );

  const LoadingSkeleton = ({ count = 5 }: { count?: number }) => (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Logs & Health</h1>
              <p className="text-muted-foreground">
                View server logs and monitor health metrics
              </p>
            </div>
            <Button onClick={fetchLogFiles} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Files List with Tabs */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Files
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "server" | "health")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="server" className="flex items-center gap-1.5">
                      <Server className="h-4 w-4" />
                      Server
                      {serverLogs.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {serverLogs.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="health" className="flex items-center gap-1.5">
                      <Activity className="h-4 w-4" />
                      Health
                      {healthFiles.length > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                          {healthFiles.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="server" className="mt-0">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : serverLogs.length === 0 ? (
                      <EmptyState icon={Server} message="No server logs found" />
                    ) : (
                      <ScrollArea className="h-[400px] pr-3">
                        <div className="space-y-2">
                          {serverLogs.map((file) => (
                            <FileListItem key={file.name} file={file} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  <TabsContent value="health" className="mt-0">
                    {loading ? (
                      <LoadingSkeleton />
                    ) : healthFiles.length === 0 ? (
                      <EmptyState icon={Activity} message="No health metrics found" />
                    ) : (
                      <ScrollArea className="h-[400px] pr-3">
                        <div className="space-y-2">
                          {healthFiles.map((file) => (
                            <FileListItem key={file.name} file={file} />
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Content Viewer */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {selectedFileType === "METRIC" ? (
                      <Activity className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                    {selectedFile ? selectedFile.split('/').pop() : "Viewer"}
                    {selectedFileType && (
                      <Badge variant={selectedFileType === "METRIC" ? "default" : "secondary"}>
                        {selectedFileType === "METRIC" ? "Health" : "Log"}
                      </Badge>
                    )}
                  </CardTitle>
                  {selectedFile && (
                    <Button size="icon" variant="ghost" onClick={clearViewer}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {isTruncated && selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span>File truncated to last 2MB for performance</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!selectedFile ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Eye className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg">Select a file to view its content</p>
                  </div>
                ) : contentLoading ? (
                  <div className="space-y-2">
                    {[...Array(15)].map((_, i) => (
                      <Skeleton key={i} className="h-4 w-full" />
                    ))}
                  </div>
                ) : selectedFileType === "METRIC" ? (
                  <div className="space-y-6">
                    {healthMetrics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No metrics data available</p>
                      </div>
                    ) : (
                      <>
                        {/* Service Filter */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium">Service:</label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={selectedService === "all" ? "default" : "outline"}
                              onClick={() => setSelectedService("all")}
                            >
                              All
                            </Button>
                            {availableServices.map(service => (
                              <Button
                                key={service}
                                size="sm"
                                variant={selectedService === service ? "default" : "outline"}
                                onClick={() => setSelectedService(service)}
                              >
                                {service}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Memory Usage Chart */}
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium">Memory Usage (MB)</h3>
                            <Badge variant="outline">
                              {selectedService === "all" ? "Combined View" : selectedService}
                            </Badge>
                          </div>
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={filteredMetrics}>
                              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                              <XAxis
                                dataKey="timestamp"
                                tickFormatter={formatChartTime}
                                tick={{ fontSize: 11 }}
                                interval="preserveStartEnd"
                              />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip
                                labelFormatter={(label) => formatDate(label as string)}
                                contentStyle={{
                                  backgroundColor: 'hsl(var(--card))',
                                  border: '1px solid hsl(var(--border))',
                                  borderRadius: '8px'
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="heapUsed"
                                stroke="hsl(var(--primary))"
                                name="Heap Used"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="heapTotal"
                                stroke="hsl(var(--chart-2))"
                                name="Heap Total"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="rss"
                                stroke="hsl(var(--chart-3))"
                                name="RSS"
                                dot={false}
                                strokeWidth={2}
                              />
                              <Line
                                type="monotone"
                                dataKey="external"
                                stroke="hsl(var(--chart-4))"
                                name="External"
                                dot={false}
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Latest Heap Used</p>
                            <p className="text-2xl font-bold">
                              {filteredMetrics[filteredMetrics.length - 1]?.heapUsed || 0} MB
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Latest RSS</p>
                            <p className="text-2xl font-bold">
                              {filteredMetrics[filteredMetrics.length - 1]?.rss || 0} MB
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Data Points</p>
                            <p className="text-2xl font-bold">{filteredMetrics.length}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/50 border">
                            <p className="text-xs text-muted-foreground">Services</p>
                            <p className="text-2xl font-bold">
                              {new Set(filteredMetrics.map(m => m.service)).size}
                            </p>
                          </div>
                        </div>

                        {/* Metrics Table */}
                        <div>
                          <h3 className="text-sm font-medium mb-3">Recent Entries</h3>
                          <ScrollArea className="h-[200px] rounded-md border">
                            <div className="p-4">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Timestamp</th>
                                    <th className="text-left py-2 font-medium">Service</th>
                                    <th className="text-right py-2 font-medium">Heap</th>
                                    <th className="text-right py-2 font-medium">RSS</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredMetrics.slice(-20).reverse().map((metric, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                      <td className="py-2">{formatDate(metric.timestamp)}</td>
                                      <td className="py-2">
                                        <Badge variant="outline" className="text-xs">
                                          {metric.service}
                                        </Badge>
                                      </td>
                                      <td className="text-right py-2">{metric.heapUsed} MB</td>
                                      <td className="text-right py-2">{metric.rss} MB</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </ScrollArea>
                        </div>
                      </>
                    )}
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
              <AlertDialogTitle>Delete File</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{fileToDelete?.split('/').pop()}"? This action cannot be undone.
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
