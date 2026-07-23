import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2, ArrowLeft, ArrowRight, Plus, FileText } from "lucide-react";
import { adminMangaService } from "@/services/adminMangaService";
import { Chapter } from "@/services/mangaService";
import { getImageUrl } from "@/utils/commanFunction";
import { MANGA_API_URL } from "@/utils/constants";

interface PageItem {
    id: string;
    type: 'existing' | 'new';
    name?: string;
    file?: File;
    previewUrl: string;
}

interface EditChapterDialogProps {
    mangaId: number;
    chapter: Chapter | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export const EditChapterDialog: React.FC<EditChapterDialogProps> = ({
    chapter, open, onOpenChange, onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        chapterNumber: "",
        title: "",
    });
    
    const [pages, setPages] = useState<PageItem[]>([]);
    const [chapterType, setChapterType] = useState<'pdf' | 'images' | 'none'>('none');
    const [newPdfFile, setNewPdfFile] = useState<File | null>(null);

    useEffect(() => {
        if (open && chapter) {
            setFormData({
                chapterNumber: chapter.chapterNumber.toString(),
                title: chapter.title || "",
            });
            fetchPages();
        } else {
            setPages([]);
            setNewPdfFile(null);
            setChapterType('none');
        }
    }, [open, chapter]);

    const fetchPages = async () => {
        if (!chapter) return;
        setLoading(true);
        try {
            const res = await adminMangaService.getChapterPages(chapter.id);
            if (res.success) {
                setChapterType(res.data.type as any);
                if (res.data.type === 'images') {
                    const baseUrl = getImageUrl(chapter.pdfUrl, MANGA_API_URL);
                    const formattedPages: PageItem[] = res.data.pages.map(name => ({
                        id: `existing-${name}`,
                        type: 'existing',
                        name,
                        previewUrl: `${baseUrl}/${name}`
                    }));
                    setPages(formattedPages);
                }
            }
        } catch (error) {
            toast.error("Failed to load chapter pages");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (chapterType === 'pdf') {
            if (files[0].type === 'application/pdf') {
                setNewPdfFile(files[0]);
            } else {
                toast.error("Please select a PDF file");
            }
            return;
        }

        // For images
        const newPages: PageItem[] = files.map(file => ({
            id: `new-${Date.now()}-${file.name}`,
            type: 'new',
            file,
            previewUrl: URL.createObjectURL(file)
        }));
        
        setPages(prev => [...prev, ...newPages]);
        if (chapterType === 'none') setChapterType('images');
    };

    const removePage = (index: number) => {
        setPages(prev => {
            const newPages = [...prev];
            // Don't revoke URL for existing pages
            if (newPages[index].type === 'new') {
                URL.revokeObjectURL(newPages[index].previewUrl);
            }
            newPages.splice(index, 1);
            return newPages;
        });
    };

    const movePage = (index: number, direction: 'left' | 'right') => {
        setPages(prev => {
            if (direction === 'left' && index === 0) return prev;
            if (direction === 'right' && index === prev.length - 1) return prev;
            
            const newPages = [...prev];
            const targetIndex = direction === 'left' ? index - 1 : index + 1;
            
            const temp = newPages[index];
            newPages[index] = newPages[targetIndex];
            newPages[targetIndex] = temp;
            
            return newPages;
        });
    };

    const handleSave = async () => {
        if (!chapter) return;
        setSaving(true);
        try {
            const data = new FormData();
            data.append("chapterNumber", formData.chapterNumber);
            data.append("title", formData.title);
            
            if (chapterType === 'pdf') {
                if (newPdfFile) {
                    data.append("chapFile", newPdfFile);
                }
            } else if (chapterType === 'images') {
                const pagesOrder = pages.map(p => {
                    if (p.type === 'existing') return { type: 'existing', name: p.name };
                    return { type: 'new' }; // fileIndex will be filled below
                });
                
                let newFileIndex = 0;
                pages.forEach(p => {
                    if (p.type === 'new' && p.file) {
                        data.append("images", p.file);
                        
                        // Find this item in pagesOrder and set its fileIndex
                        const orderItem = pagesOrder.find(o => o.type === 'new' && (o as any).fileIndex === undefined);
                        if (orderItem) {
                            (orderItem as any).fileIndex = newFileIndex++;
                        }
                    }
                });
                
                data.append("pagesOrder", JSON.stringify(pagesOrder));
                data.append("pagesCount", pages.length.toString());
            }
            
            const res = await adminMangaService.updateChapter(chapter.id, data);
            if (res.success) {
                toast.success("Chapter updated successfully");
                onOpenChange(false);
                onSuccess();
            }
        } catch (error) {
            toast.error("Failed to update chapter");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-[#1a1a20] border-white/5 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Chapter {chapter?.chapterNumber}</DialogTitle>
                </DialogHeader>
                
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-purple-500 animate-spin" /></div>
                ) : (
                    <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Chapter Number</Label>
                                <Input
                                    type="number" step="0.1"
                                    value={formData.chapterNumber}
                                    onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Title (Optional)</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>

                        {chapterType === 'pdf' ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-4">
                                    <FileText className="w-8 h-8 text-purple-400" />
                                    <div>
                                        <div className="font-medium">Current PDF</div>
                                        <div className="text-xs text-muted-foreground">{chapter?.pdfUrl.split('/').pop()}</div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Replace PDF File (Optional)</Label>
                                    <Input 
                                        type="file" 
                                        accept="application/pdf"
                                        onChange={handleFileSelect}
                                        className="bg-white/5 border-white/10"
                                    />
                                    {newPdfFile && (
                                        <p className="text-sm text-green-400">Selected new file: {newPdfFile.name}</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label>Chapter Pages ({pages.length})</Label>
                                    <div>
                                        <input
                                            type="file"
                                            id="add-pages"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />
                                        <Label htmlFor="add-pages" className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                                            <Plus className="w-4 h-4" /> Add Pages
                                        </Label>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                    {pages.map((page, index) => (
                                        <div key={page.id} className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/40 aspect-[2/3]">
                                            <img 
                                                src={page.previewUrl} 
                                                alt={`Page ${index + 1}`} 
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    // Simple fallback for existing images
                                                    if (page.type === 'existing' && !e.currentTarget.src.endsWith('.jpg')) {
                                                        e.currentTarget.src = e.currentTarget.src.replace(/\.[^/.]+$/, "") + ".jpg";
                                                    }
                                                }}
                                            />
                                            <div className="absolute top-1 left-1 bg-black/60 px-2 py-0.5 rounded text-xs font-medium">
                                                {index + 1}
                                            </div>
                                            
                                            {/* Overlay Controls */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                                <div className="flex justify-end">
                                                    <button 
                                                        onClick={() => removePage(index)}
                                                        className="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-md text-white transition-colors"
                                                        title="Remove Page"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="flex justify-between gap-1">
                                                    <button 
                                                        onClick={() => movePage(index, 'left')}
                                                        disabled={index === 0}
                                                        className="p-1.5 flex-1 bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded-md flex justify-center text-white transition-colors"
                                                        title="Move Left"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => movePage(index, 'right')}
                                                        disabled={index === pages.length - 1}
                                                        className="p-1.5 flex-1 bg-white/20 hover:bg-white/40 disabled:opacity-30 rounded-md flex justify-center text-white transition-colors"
                                                        title="Move Right"
                                                    >
                                                        <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            {page.type === 'new' && (
                                                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500" title="New image to upload" />
                                            )}
                                        </div>
                                    ))}
                                    
                                    {pages.length === 0 && (
                                        <div className="col-span-full py-10 text-center text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
                                            No pages found. Add some pages to get started.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button 
                                onClick={handleSave} 
                                disabled={saving}
                                className="bg-purple-600 hover:bg-purple-700 min-w-[100px]"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
