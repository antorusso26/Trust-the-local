"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  tourId: string;
  images: Array<{ id: string; image_url: string; sort_order: number }>;
  onUpload: (image: { id: string; image_url: string; sort_order: number }) => void;
  onDelete: (imageId: string) => void;
}

export function ImageUpload({ tourId, images, onUpload, onDelete }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/tours/${tourId}/images`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Upload fallito");
      return;
    }

    onUpload(data.image);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleDelete(imageId: string) {
    const res = await fetch(`/api/tours/${tourId}/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    if (res.ok) onDelete(imageId);
  }

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {sorted.map((img, index) => (
          <div key={img.id} className="relative w-24 h-24 rounded-xl overflow-hidden group">
            <Image src={img.image_url} alt={`Foto ${index + 1}`} fill className="object-cover" />
            {index === 0 && (
              <span className="absolute top-1 left-1 bg-[#D4A843] text-white text-xs px-1.5 py-0.5 rounded-full">Cover</span>
            )}
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {images.length < 5 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-[#D4A843] hover:text-[#D4A843] transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs">Aggiungi</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-gray-400 text-xs">Max 5 foto · JPG, PNG, WebP · Max 5MB ciascuna</p>
    </div>
  );
}
