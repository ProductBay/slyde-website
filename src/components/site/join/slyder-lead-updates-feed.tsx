"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Copy, ExternalLink, Maximize2, MessageCircle, Share2, X } from "lucide-react";

type LeadUpdatePost = {
  id: string;
  title: string;
  body: string;
  category: string;
  imageUrl: string | null;
  imageCropX: number;
  imageCropY: number;
  ctaLabel: string | null;
  ctaHref: string | null;
  isFeatured: boolean;
};

type SlyderLeadUpdatesFeedProps = {
  leadId: string;
  posts: LeadUpdatePost[];
};

function buildShareText(post: LeadUpdatePost) {
  return `${post.title}\n\n${post.body}`;
}

function getAbsoluteShareUrl(leadId: string, postId: string) {
  const path = `/join/slyder/status?leadId=${encodeURIComponent(leadId)}&post=${encodeURIComponent(postId)}#slyde-update-${postId}`;
  if (typeof window === "undefined") return path;
  return new URL(path, window.location.origin).toString();
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14 8.2V6.9c0-.7.5-.9 1-.9h1.8V3.1c-.3 0-1.4-.1-2.7-.1-2.7 0-4.5 1.6-4.5 4.6v.6H6.8v3.2h2.8V21H13v-9.6h2.7l.4-3.2H14Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.4" />
      <circle cx="16.8" cy="7.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M15.4 3c.3 2.2 1.6 3.7 3.8 3.9v3.1c-1.3.1-2.5-.3-3.7-1v5.7c0 3.9-2.5 6.3-6.1 6.3-3 0-5.3-2-5.3-4.9 0-3.3 2.7-5.4 6.2-4.8v3.3c-1.5-.5-2.8.2-2.8 1.4 0 1 .8 1.7 1.9 1.7 1.5 0 2.4-.9 2.4-2.8V3h3.6Z" />
    </svg>
  );
}

export function SlyderLeadUpdatesFeed({ leadId, posts }: SlyderLeadUpdatesFeedProps) {
  const [selectedPost, setSelectedPost] = useState<LeadUpdatePost | null>(null);
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedShareUrl = useMemo(
    () => (selectedPost ? getAbsoluteShareUrl(leadId, selectedPost.id) : ""),
    [leadId, selectedPost],
  );

  useEffect(() => {
    if (!selectedPost) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedPost(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedPost]);

  function sharePost(post: LeadUpdatePost) {
    startTransition(async () => {
      const url = getAbsoluteShareUrl(leadId, post.id);
      const text = buildShareText(post);
      if (navigator.share) {
        await navigator.share({ title: post.title, text, url }).catch(() => null);
        return;
      }

      await navigator.clipboard?.writeText(`${text}\n\n${url}`).catch(() => null);
      setCopiedPostId(post.id);
      window.setTimeout(() => setCopiedPostId(null), 2200);
    });
  }

  function copyPost(post: LeadUpdatePost) {
    startTransition(async () => {
      const url = getAbsoluteShareUrl(leadId, post.id);
      await navigator.clipboard?.writeText(`${buildShareText(post)}\n\n${url}`).catch(() => null);
      setCopiedPostId(post.id);
      window.setTimeout(() => setCopiedPostId(null), 2200);
    });
  }

  function shareUrls(post: LeadUpdatePost) {
    const url = getAbsoluteShareUrl(leadId, post.id);
    const text = buildShareText(post);
    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      instagram: "https://www.instagram.com/",
      tiktok: "https://www.tiktok.com/upload",
    };
  }

  if (!posts.length) return null;

  return (
    <>
      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">SLYDE updates</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Promotions and launch updates</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Follow the latest SLYDE announcements while your Slyder path moves through review.
          </p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {posts.map((post, index) => {
            const urls = shareUrls(post);
            const isFeaturedLayout = index === 0 && post.isFeatured;

            return (
              <article
                id={`slyde-update-${post.id}`}
                key={post.id}
                className={isFeaturedLayout ? "overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white shadow-soft lg:col-span-2" : "overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-soft"}
              >
                {post.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className={isFeaturedLayout ? "group relative block aspect-[16/7] w-full overflow-hidden bg-slate-100 text-left" : "group relative block aspect-[16/9] w-full overflow-hidden bg-slate-100 text-left"}
                    aria-label={`Open full image for ${post.title}`}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      style={{ objectPosition: `${post.imageCropX}% ${post.imageCropY}%` }}
                    />
                    <span className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-950/80 text-white shadow-soft backdrop-blur transition group-hover:scale-105">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </button>
                ) : null}
                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{post.category.replace(/_/g, " ")}</span>
                    {post.isFeatured ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Featured</span> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-950">{post.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{post.body}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {post.ctaLabel && post.ctaHref ? (
                      <Link
                        href={post.ctaHref}
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        {post.ctaLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => sharePost(post)}
                      disabled={isPending}
                      className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5"
                    >
                      <Share2 className="h-4 w-4" />
                      Share now
                    </button>
                    <a href={urls.whatsapp} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700" aria-label="Share on WhatsApp">
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    <a href={urls.facebook} target="_blank" rel="noreferrer" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-100 bg-sky-50 text-sky-700" aria-label="Share on Facebook">
                      <FacebookIcon className="h-4 w-4" />
                    </a>
                    <a href={urls.instagram} target="_blank" rel="noreferrer" onClick={() => copyPost(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-pink-700" aria-label="Open Instagram and copy share text">
                      <InstagramIcon className="h-4 w-4" />
                    </a>
                    <a href={urls.tiktok} target="_blank" rel="noreferrer" onClick={() => copyPost(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-900" aria-label="Open TikTok and copy share text">
                      <TikTokIcon className="h-4 w-4" />
                    </a>
                    <button type="button" onClick={() => copyPost(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700" aria-label="Copy share text">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {copiedPostId === post.id ? <p className="mt-2 text-xs font-semibold text-emerald-700">Share text copied.</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {selectedPost ? (
        <div
          className="fixed inset-0 z-[10000] flex h-[100dvh] items-center justify-center overflow-hidden bg-slate-950/95 p-2 backdrop-blur-sm sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedPost.title} full image`}
        >
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close full image" onClick={() => setSelectedPost(null)} />
          <div className="relative grid h-[calc(100dvh-1rem)] w-full max-w-[min(96vw,1280px)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[1rem] bg-white shadow-2xl sm:h-[calc(100dvh-2rem)] sm:rounded-[1.5rem]">
            <div className="flex min-h-0 items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 sm:px-4 sm:py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 sm:text-xs">{selectedPost.category.replace(/_/g, " ")}</p>
                <h3 className="truncate text-sm font-semibold text-slate-950 sm:text-lg">{selectedPost.title}</h3>
              </div>
              <button type="button" onClick={() => setSelectedPost(null)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-50 sm:h-10 sm:w-10" aria-label="Close full image">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="min-h-0 overflow-hidden bg-slate-950">
              {selectedPost.imageUrl ? (
                <div className="flex h-full w-full items-center justify-center p-2 sm:p-4">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.title}
                    className="block h-full max-h-full w-full max-w-full object-contain"
                  />
                </div>
              ) : null}
            </div>
            <div className="grid min-h-0 gap-2 border-t border-slate-200 p-3 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-4 sm:p-4">
              <p className="max-h-16 overflow-y-auto pr-1 text-xs leading-5 text-slate-600 sm:max-h-20 sm:text-sm sm:leading-6">{selectedPost.body}</p>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <button type="button" onClick={() => sharePost(selectedPost)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:flex-none">
                  <Share2 className="h-4 w-4" />
                  Share now
                </button>
                <a href={selectedShareUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 sm:flex-none">
                  <ExternalLink className="h-4 w-4" />
                  Open post
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
