"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, FileVideo, FileImage, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FileUploaderProps {
    onUploadComplete: (urls: string[]) => void;
    folder?: string;
}

export function FileUploader({ onUploadComplete, folder = "requests" }: FileUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [error, setError] = useState("");

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        if (!supabase) {
            setError("Chưa kết nối Supabase. Vui lòng kiểm tra cấu hình.");
            return;
        }

        setUploading(true);
        setError("");
        const files = Array.from(e.target.files);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
                const filePath = `${folder}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('evidence')
                    .upload(filePath, file);

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage.from('evidence').getPublicUrl(filePath);
                newUrls.push(data.publicUrl);
            }

            const updatedUrls = [...uploadedFiles, ...newUrls];
            setUploadedFiles(updatedUrls);
            onUploadComplete(updatedUrls);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error(err);
            setError("Lỗi khi tải lên: " + (err.message || "Không xác định"));
        } finally {
            setUploading(false);
            // Reset input ? Not strictly necessary as we append
        }
    };

    const removeFile = (indexToRemove: number) => {
        const updated = uploadedFiles.filter((_, idx) => idx !== indexToRemove);
        setUploadedFiles(updated);
        onUploadComplete(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={uploading}
                    className="border-dashed border-2 hover:bg-blue-50 dark:hover:bg-slate-900"
                >
                    {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ImagePlus className="mr-2 h-4 w-4" />
                    )}
                    {uploading ? "Đang tải lên..." : "Thêm ảnh / Video"}
                </Button>
                <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
                <span className="text-xs text-muted-foreground">
                    Hỗ trợ: JPG, PNG, MP4 (Max 10MB)
                </span>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((url, idx) => (
                        <div key={idx} className="relative group border rounded-md overflow-hidden bg-slate-100 aspect-square flex items-center justify-center">
                            {url.match(/\.(mp4|webm|mov)$/i) ? (
                                <video src={url} className="w-full h-full object-cover" />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                            )}

                            <button
                                type="button"
                                onClick={() => removeFile(idx)}
                                className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 text-white rounded-full p-1 opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
