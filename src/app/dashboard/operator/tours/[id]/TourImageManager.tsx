"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/upload/ImageUpload";

interface TourImageManagerProps {
  tourId: string;
  initialImages: Array<{ id: string; image_url: string; sort_order: number }>;
}

export function TourImageManager({ tourId, initialImages }: TourImageManagerProps) {
  const [images, setImages] = useState(initialImages);

  function handleUpload(image: { id: string; image_url: string; sort_order: number }) {
    setImages((prev) => [...prev, image]);
  }

  function handleDelete(imageId: string) {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <ImageUpload
      tourId={tourId}
      images={images}
      onUpload={handleUpload}
      onDelete={handleDelete}
    />
  );
}
