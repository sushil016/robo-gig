"use client";

/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE_URL } from "@/config/env";

interface ProductMedia {
  id: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  sortOrder: number;
}

const MAX_MEDIA = 10;

export function ProductMediaManager({ productId, token }: { productId: string; token: string }) {
  const [mediaList, setMediaList] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [addingVideo, setAddingVideo] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media`);
      const json = await res.json();
      if (json.success) setMediaList(json.data);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { void fetchMedia(); }, [fetchMedia]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_MEDIA - mediaList.length;
    const toUpload = files.slice(0, remaining);

    setUploading(true);
    for (const file of toUpload) {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media`, {
        method: "POST",
        headers,
        body,
      });
      const json = await res.json();
      if (!json.success) alert(json.error ?? "Upload failed");
    }
    await fetchMedia();
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleAddVideo() {
    if (!videoUrl.trim()) return;
    setAddingVideo(true);
    const res = await fetch(`${API_BASE_URL}/api/components/${productId}/media/url`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ url: videoUrl.trim(), type: "VIDEO" }),
    });
    const json = await res.json();
    if (json.success) {
      setVideoUrl("");
      setShowVideoForm(false);
      await fetchMedia();
    } else {
      alert(json.error ?? "Failed to add video");
    }
    setAddingVideo(false);
  }

  async function handleDelete(mediaId: string) {
    if (!confirm("Delete this media?")) return;
    await fetch(`${API_BASE_URL}/api/components/${productId}/media/${mediaId}`, {
      method: "DELETE",
      headers,
    });
    await fetchMedia();
  }

  const hasVideo = mediaList.some((m) => m.type === "VIDEO");
  const isFull = mediaList.length >= MAX_MEDIA;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-slate-800">Product Media</p>
          <p className="text-xs text-slate-500">
            {mediaList.length}/{MAX_MEDIA} items · up to 10 images + 1 video
          </p>
        </div>
        <div className="flex gap-2">
          {!hasVideo && !isFull && (
            <button
              type="button"
              onClick={() => setShowVideoForm((v) => !v)}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              + Video URL
            </button>
          )}
          {!isFull && (
            <label className="cursor-pointer rounded-md bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800 transition-colors">
              {uploading ? "Uploading..." : "+ Upload Images"}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Video URL form */}
      {showVideoForm && (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="YouTube or video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            className="admin-input flex-1"
          />
          <button
            type="button"
            onClick={handleAddVideo}
            disabled={addingVideo || !videoUrl.trim()}
            className="rounded-md bg-blue-700 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
          >
            {addingVideo ? "Adding..." : "Add"}
          </button>
          <button type="button" onClick={() => setShowVideoForm(false)} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500">
            Cancel
          </button>
        </div>
      )}

      {/* Media grid */}
      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-md bg-slate-100" />
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 py-8 text-sm text-slate-400">
          No media yet. Upload images or add a video URL.
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {mediaList
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((m) => (
              <div key={m.id} className="group relative aspect-square overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                {m.type === "VIDEO" ? (
                  <div className="flex h-full flex-col items-center justify-center gap-1 bg-slate-900 text-white">
                    <span className="text-2xl">▶</span>
                    <span className="max-w-full truncate px-2 text-[10px] text-slate-400">{m.url}</span>
                  </div>
                ) : (
                  <img src={m.url} alt="" className="h-full w-full object-contain" />
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
                  className="absolute right-1 top-1 hidden rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white group-hover:flex"
                >
                  ✕
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5 text-[9px] font-bold text-white">
                  {m.type === "VIDEO" ? "VIDEO" : `#${m.sortOrder + 1}`}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
