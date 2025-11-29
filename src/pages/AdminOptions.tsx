import { useState } from "react";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Settings2 } from "lucide-react";
import { useOptions } from "@/hooks/useOptions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_LABELS: Record<string, string> = {
  AnimeStatus: "Anime Status",
  MediaType: "Media Type",
  Season: "Season",
};

const AdminOptions = () => {
  const { options, isLoading, addOption, deleteOption, isAddingOption, isDeletingOption } = useOptions();
  const [newCategory, setNewCategory] = useState("");
  const [newValue, setNewValue] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ category: string; value: string } | null>(null);

  const handleAddOption = () => {
    const categoryToUse = newCategory === "custom" ? customCategory : newCategory;
    if (!categoryToUse || !newValue.trim()) return;

    addOption(
      { category: categoryToUse, value: newValue.trim() },
      {
        onSuccess: () => {
          setNewCategory("");
          setNewValue("");
          setCustomCategory("");
          setIsAddDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteOption = (category: string, value: string) => {
    setDeletingItem({ category, value });
    deleteOption(
      { category, value },
      {
        onSettled: () => {
          setDeletingItem(null);
        },
      }
    );
  };

  const categories = options ? Object.keys(options) : [];

  if (isLoading) {
    return (
      <AdminRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Settings2 className="h-8 w-8 text-primary" />
                Options Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage anime status, media types, seasons, and other dropdown options
              </p>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Option
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Option</DialogTitle>
                  <DialogDescription>
                    Add a new value to an existing category or create a new category
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {CATEGORY_LABELS[cat] || cat}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">+ Create New Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newCategory === "custom" && (
                    <div className="space-y-2">
                      <Label>New Category Name</Label>
                      <Input
                        placeholder="e.g., Rating, Source"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input
                      placeholder="Enter option value"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddOption();
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddOption}
                    disabled={
                      isAddingOption ||
                      !newValue.trim() ||
                      (!newCategory || (newCategory === "custom" && !customCategory.trim()))
                    }
                  >
                    {isAddingOption ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Adding...
                      </>
                    ) : (
                      "Add Option"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Options Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card key={category} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-secondary" />
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{CATEGORY_LABELS[category] || category}</span>
                    <Badge variant="secondary">{options?.[category]?.length || 0}</Badge>
                  </CardTitle>
                  <CardDescription>Manage {(CATEGORY_LABELS[category] || category).toLowerCase()} options</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {options?.[category]?.map((value) => (
                      <div
                        key={value}
                        className="group flex items-center gap-1 bg-muted/50 rounded-md px-3 py-1.5 transition-colors hover:bg-muted"
                      >
                        <span className="text-sm">{value}</span>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Option</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{value}" from {CATEGORY_LABELS[category] || category}?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteOption(category, value)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={isDeletingOption && deletingItem?.category === category && deletingItem?.value === value}
                              >
                                {isDeletingOption && deletingItem?.category === category && deletingItem?.value === value ? (
                                  <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                  </>
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                    {(!options?.[category] || options[category].length === 0) && (
                      <p className="text-sm text-muted-foreground">No options available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <Card className="py-12">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Settings2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Options Found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first option category
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Option
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminOptions;
