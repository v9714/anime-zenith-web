import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { userService } from "@/services/userService";
import { UserProfile } from "@/services/userService";
import { Loader2, User, Image as ImageIcon, Upload, X, Link as LinkIcon } from "lucide-react";
import { getImageUrl } from "@/utils/commanFunction";

const profileSchema = z.object({
    displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be less than 50 characters"),
    avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal(""))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
    currentUser: UserProfile;
    onUpdate: () => Promise<void>;
}

export function ProfileEditForm({ currentUser, onUpdate }: ProfileEditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string>(getImageUrl(currentUser.avatarUrl || undefined));
    const [uploadMethod, setUploadMethod] = useState<"url" | "upload">("url");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Update form when currentUser changes (after refresh)
    useEffect(() => {
        form.reset({
            displayName: currentUser.displayName,
            avatarUrl: "" // Don't populate URL field with uploaded image paths
        });
        setAvatarPreview(getImageUrl(currentUser.avatarUrl || undefined));
    }, [currentUser]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            displayName: currentUser.displayName,
            avatarUrl: "" // Keep URL field empty by default
        }
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    id: String(Date.now()),
                    title: "File too large",
                    description: "Please select an image smaller than 5MB"
                });
                return;
            }

            // Store the file and create preview
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            form.setValue("avatarUrl", ""); // Clear URL field when uploading file
        }
    };

    const handleUrlChange = (url: string) => {
        form.setValue("avatarUrl", url);
        setAvatarPreview(getImageUrl(url || undefined));
    };

    const handleDeleteAvatar = () => {
        setAvatarPreview("");
        setUploadedFile(null);
        form.setValue("avatarUrl", "");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        setIsSubmitting(true);
        try {
            let response;

            // If user uploaded a file, send as FormData
            if (uploadedFile) {
                response = await userService.updateProfileWithFile(currentUser.id, {
                    displayName: values.displayName,
                    avatarFile: uploadedFile
                });
            } else {
                // If user provided URL, send as JSON
                response = await userService.updateProfile(currentUser.id, {
                    displayName: values.displayName,
                    avatarUrl: values.avatarUrl || undefined
                });
            }

            if (response.success) {
                await onUpdate();
                setUploadedFile(null);
                setAvatarPreview(getImageUrl(response.data.avatarUrl || undefined));
                toast({
                    id: String(Date.now()),
                    title: "Profile updated",
                    description: "Your profile has been updated successfully"
                });
            }
        } catch (error: any) {
            toast({
                id: String(Date.now()),
                title: "Update failed",
                description: error.response?.data?.message || "Failed to update profile"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Edit Profile
                </CardTitle>
                <CardDescription>Update your display name and avatar</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="space-y-4">
                        <Label>Profile Picture</Label>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-2 border-border">
                                    <AvatarImage src={avatarPreview} alt={currentUser.displayName} />
                                    <AvatarFallback className="text-2xl">
                                        {currentUser.displayName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {avatarPreview && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                        onClick={handleDeleteAvatar}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex-1 w-full">
                                <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "url" | "upload")} className="w-full">
                                    <TabsList className="grid w-full grid-cols-2 mb-4">
                                        <TabsTrigger value="upload" className="flex items-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            Upload
                                        </TabsTrigger>
                                        <TabsTrigger value="url" className="flex items-center gap-2">
                                            <LinkIcon className="h-4 w-4" />
                                            URL
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="upload" className="space-y-2">
                                        <Input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG or GIF (max. 5MB)
                                        </p>
                                    </TabsContent>

                                    <TabsContent value="url" className="space-y-2">
                                        <Input
                                            placeholder="https://example.com/avatar.jpg"
                                            value={form.watch("avatarUrl")}
                                            onChange={(e) => handleUrlChange(e.target.value)}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Enter a URL to your profile picture
                                        </p>
                                    </TabsContent>
                                </Tabs>
                                {form.formState.errors.avatarUrl && (
                                    <p className="text-sm text-destructive mt-2">{form.formState.errors.avatarUrl.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Display Name */}
                    <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                            id="displayName"
                            {...form.register("displayName")}
                            placeholder="Enter your display name"
                        />
                        {form.formState.errors.displayName && (
                            <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
                        )}
                    </div>

                    {/* Email (Read-only) */}
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={currentUser.email} disabled className="bg-muted" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
