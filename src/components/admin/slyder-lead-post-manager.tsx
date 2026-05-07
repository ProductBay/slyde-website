"use client";

import type { ChangeEvent } from "react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Megaphone, Plus, Star, Trash2, Upload, X } from "lucide-react";

type Post = {
  id: string;
  title: string;
  body: string;
  category: string;
  imageUrl: string | null;
  imageCropX: number;
  imageCropY: number;
  ctaLabel: string | null;
  ctaHref: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
};

const categories = [
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "LAUNCH_UPDATE", label: "Launch update" },
  { value: "REMINDER", label: "Reminder" },
  { value: "EDUCATION", label: "Education" },
];

export function SlyderLeadPostManager({ posts, devAdminKey }: { posts: Post[]; devAdminKey?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("ANNOUNCEMENT");
  const [imageUrl, setImageUrl] = useState("");
  const [imageCropX, setImageCropX] = useState(50);
  const [imageCropY, setImageCropY] = useState(50);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headers = {
    "Content-Type": "application/json",
    ...(devAdminKey ? { "x-slyde-admin-key": devAdminKey } : {}),
  };

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError(null);
    setMessage(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2 MB for the lead dashboard.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
        setMessage("Image ready.");
      }
    };
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  }

  function resetForm() {
    setTitle("");
    setBody("");
    setCategory("ANNOUNCEMENT");
    setImageUrl("");
    setImageCropX(50);
    setImageCropY(50);
    setCtaLabel("");
    setCtaHref("");
    setIsPublished(true);
    setIsFeatured(false);
  }

  function createPost() {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch("/api/admin/slyder-lead-posts", {
        method: "POST",
        headers,
        body: JSON.stringify({ title, body, category, imageUrl, imageCropX, imageCropY, ctaLabel, ctaHref, isPublished, isFeatured }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error || "Could not create post.");
        return;
      }
      resetForm();
      setMessage("Post created.");
      router.refresh();
    });
  }

  function patchPost(id: string, input: Partial<Post>) {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/slyder-lead-posts/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        setError("Could not update post.");
        return;
      }
      setMessage("Post updated.");
      router.refresh();
    });
  }

  function deletePost(id: string) {
    startTransition(async () => {
      setError(null);
      setMessage(null);
      const response = await fetch(`/api/admin/slyder-lead-posts/${id}`, { method: "DELETE", headers });
      if (!response.ok) {
        setError("Could not delete post.");
        return;
      }
      setMessage("Post deleted.");
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="surface-panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Create post</p>
            <h2 className="text-xl font-semibold text-slate-950">Slyder lead update</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <input className="field-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" />
          <select className="field-input" value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
          <textarea
            className="field-input min-h-32 resize-y"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Post details, promotion, launch update, or reminder"
          />
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Post image</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Best fit: 1600 x 700 for featured posts, 1200 x 675 for standard posts. Keep it under 2 MB.</p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-sky-200 hover:bg-sky-50">
                <Upload className="h-4 w-4" />
                Choose image
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleImageUpload} className="sr-only" />
              </label>
            </div>
            {imageUrl ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className={isFeatured ? "aspect-[16/7] overflow-hidden bg-slate-100" : "aspect-[16/9] overflow-hidden bg-slate-100"}>
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${imageCropX}% ${imageCropY}%` }} />
                </div>
                <div className="grid gap-3 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-slate-600">
                      Crop preview: {isFeatured ? "featured 1600 x 700" : "standard 1200 x 675"}
                    </p>
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Horizontal focus
                    <input type="range" min="0" max="100" value={imageCropX} onChange={(event) => setImageCropX(Number(event.target.value))} />
                  </label>
                  <label className="grid gap-1 text-xs font-semibold text-slate-600">
                    Vertical focus
                    <input type="range" min="0" max="100" value={imageCropY} onChange={(event) => setImageCropY(Number(event.target.value))} />
                  </label>
                  <p className="text-xs leading-5 text-slate-500">Move the focus until the important part of the image is visible in the preview.</p>
                </div>
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field-input" value={ctaLabel} onChange={(event) => setCtaLabel(event.target.value)} placeholder="CTA label, optional" />
            <input className="field-input" value={ctaHref} onChange={(event) => setCtaHref(event.target.value)} placeholder="CTA URL, optional" />
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-slate-700">
            <label className="inline-flex items-center gap-2">
              <input className="field-checkbox" type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
              Publish now
            </label>
            <label className="inline-flex items-center gap-2">
              <input className="field-checkbox" type="checkbox" checked={isFeatured} onChange={(event) => setIsFeatured(event.target.checked)} />
              Feature post
            </label>
          </div>
          <button
            type="button"
            onClick={createPost}
            disabled={isPending || title.trim().length < 3 || body.trim().length < 8}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add update
          </button>
          {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
          {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}
        </div>
      </section>

      <section className="grid gap-4">
        {posts.length ? posts.map((post) => (
          <article key={post.id} className="surface-panel overflow-hidden p-0">
            {post.imageUrl ? (
              <div className="aspect-[16/7] overflow-hidden bg-slate-100">
                <img src={post.imageUrl} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${post.imageCropX}% ${post.imageCropY}%` }} />
              </div>
            ) : null}
            <div className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{post.category.replace(/_/g, " ")}</span>
                    {post.isPublished ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Published</span> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Draft</span>}
                    {post.isFeatured ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Featured</span> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{post.body}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => patchPost(post.id, { isPublished: !post.isPublished })} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    {post.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button type="button" onClick={() => patchPost(post.id, { isFeatured: !post.isFeatured })} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Star className="h-3.5 w-3.5" />
                    {post.isFeatured ? "Unfeature" : "Feature"}
                  </button>
                  <button type="button" onClick={() => deletePost(post.id)} className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700">
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
              {post.ctaLabel && post.ctaHref ? <p className="mt-4 text-xs font-semibold text-sky-700">CTA: {post.ctaLabel} to {post.ctaHref}</p> : null}
            </div>
          </article>
        )) : (
          <div className="surface-panel p-8 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-950">No posts yet</p>
            <p className="mt-1 text-sm text-slate-600">Create the first update for Slyder leads waiting in the dashboard.</p>
          </div>
        )}
      </section>
    </div>
  );
}
