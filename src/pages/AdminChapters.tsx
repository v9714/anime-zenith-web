
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminMangaService } from "@/services/adminMangaService";
import { mangaService, MangaDetails, Chapter } from "@/services/mangaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, ArrowLeft, FileText, Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AdminChapters = () => {
    const { mangaId } = useParams();
    const [manga, setManga] = useState<MangaDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        chapterNumber: "",
        title: "",
        pagesCount: "",
    });
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, [mangaId]);

    const fetchData = async () => {
        if (!mangaId) return;
        setLoading(true);
        try {
            const res = await mangaService.getMangaDetails(parseInt(mangaId));
            if (res.success) setManga(res.data);
        } catch (error) {
            toast.error("Failed to fetch chapters");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mangaId || !pdfFile) return;
        setIsSubmitting(true);

        const data = new FormData();
        data.append("chapterNumber", formData.chapterNumber);
        data.append("title", formData.title);
        data.append("pagesCount", formData.pagesCount);
        data.append("chapFile", pdfFile);

        try {
            const res = await adminMangaService.uploadChapter(parseInt(mangaId), data);
            if (res.success) {
                toast.success("Chapter uploaded successfully");
                setIsDialogOpen(false);
                setPdfFile(null);
                setFormData({ chapterNumber: "", title: "", pagesCount: "" });
                fetchData();
            }
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this chapter?")) return;
        try {
            const res = await adminMangaService.deleteChapter(id);
            if (res.success) {
                toast.success("Chapter deleted");
                fetchData();
            }
        } catch (error) {
            toast.error("Failed to delete chapter");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-purple-500 animate-spin" /></div>;
    if (!manga) return <div>Manga not found.</div>;

    return (
        <div className="min-h-screen bg-[#0f0f12] text-white p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/admin/manga">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{manga.title} - Chapters</h1>
                        <p className="text-sm text-muted-foreground">{manga.chapters.length} chapters found</p>
                    </div>
                    <div className="ml-auto">
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-600 hover:bg-purple-700 rounded-xl gap-2">
                                    <Plus className="w-5 h-5" /> Upload Chapter
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-[#1a1a20] border-white/5 text-white">
                                <DialogHeader>
                                    <DialogTitle>Upload New Chapter</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleUpload} className="space-y-6 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Chapter Number</Label>
                                            <Input
                                                type="number" step="0.1"
                                                value={formData.chapterNumber}
                                                onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Pages Count (Optional)</Label>
                                            <Input
                                                type="number"
                                                value={formData.pagesCount}
                                                onChange={(e) => setFormData({ ...formData, pagesCount: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Title (Optional)</Label>
                                        <Input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="bg-white/5 border-white/10"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Chapter PDF File</Label>
                                        <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center hover:bg-white/5 transition-colors cursor-pointer">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                                                accept="application/pdf"
                                                required
                                            />
                                            {pdfFile ? (
                                                <div className="text-center">
                                                    <FileText className="w-10 h-10 mx-auto mb-2 text-purple-400" />
                                                    <span className="text-sm font-medium">{pdfFile.name}</span>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                                                    <span className="text-sm text-muted-foreground">Click to upload PDF grimoire</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12 rounded-xl" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start Upload"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="bg-[#1a1a20] rounded-2xl border border-white/5 overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4">Number</th>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Views</th>
                                <th className="px-6 py-4">Date Added</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {manga.chapters.map((chap) => (
                                <tr key={chap.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-6 py-4 font-bold text-lg text-purple-400">#{chap.chapterNumber}</td>
                                    <td className="px-6 py-4 font-medium">{chap.title || "---"}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{chap.views}</td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(chap.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-full h-9 w-9"
                                            onClick={() => handleDelete(chap.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {manga.chapters.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground">
                                        No chapters uploaded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminChapters;
