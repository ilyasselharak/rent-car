"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, X, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ value, onChange, maxFiles = 10 }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      return fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        body: formData,
      }).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new ApiError(res.status, json?.code || "UPLOAD_ERROR", json?.message || "Upload failed");
        return json;
      });
    },
    onSuccess: (data: any) => {
      const files = Array.isArray(data) ? data : data.data || [];
      const urls = files.map((d: any) => d.url);
      onChange([...value, ...urls]);
      setPreviews([]);
      toast.success(`${files.length} image(s) uploaded`);
    },
    onError: (err: ApiError) => toast.error(err.message),
  });

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (value.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...newPreviews]);
    uploadMutation.mutate(files);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div key={i} className="relative group h-24 w-24 rounded-lg overflow-hidden border">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {previews.map((preview, i) => (
          <div key={`p-${i}`} className="relative h-24 w-24 rounded-lg overflow-hidden border">
            <img src={preview} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          </div>
        ))}
        {value.length + previews.length < maxFiles && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/60 transition-colors bg-muted/20"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Upload</span>
              </div>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={handleSelect}
      />
      <p className="text-xs text-muted-foreground">
        Supported: JPEG, PNG, WebP, AVIF &middot; Max 5MB each &middot; Up to {maxFiles} images
      </p>
    </div>
  );
}