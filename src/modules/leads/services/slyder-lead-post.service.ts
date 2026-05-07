import { prisma } from "@/server/db/prisma";
import type { CreateSlyderLeadPostInput, UpdateSlyderLeadPostInput } from "@/modules/leads/schemas/slyder-lead-post.schema";
import { notifySlyderLeadSubscribersForPost } from "@/modules/leads/services/slyder-lead-push.service";

function cleanOptional(value: string | undefined | null) {
  const cleaned = value?.trim();
  return cleaned ? cleaned : null;
}

function toPostData(input: CreateSlyderLeadPostInput | UpdateSlyderLeadPostInput) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.body !== undefined ? { body: input.body } : {}),
    ...(input.category !== undefined ? { category: input.category } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: cleanOptional(input.imageUrl) } : {}),
    ...(input.imageCropX !== undefined ? { imageCropX: input.imageCropX } : {}),
    ...(input.imageCropY !== undefined ? { imageCropY: input.imageCropY } : {}),
    ...(input.ctaLabel !== undefined ? { ctaLabel: cleanOptional(input.ctaLabel) } : {}),
    ...(input.ctaHref !== undefined ? { ctaHref: cleanOptional(input.ctaHref) } : {}),
    ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
    ...(input.isPublished !== undefined
      ? {
          isPublished: input.isPublished,
          publishedAt: input.isPublished ? new Date() : null,
        }
      : {}),
  };
}

export async function listAdminSlyderLeadPosts() {
  return prisma.slyderLeadPost.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
}

export async function listPublishedSlyderLeadPosts(limit = 6) {
  return prisma.slyderLeadPost.findMany({
    where: { isPublished: true },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function createSlyderLeadPost(input: CreateSlyderLeadPostInput) {
  const post = await prisma.slyderLeadPost.create({
    data: toPostData(input) as CreateSlyderLeadPostInput & { publishedAt?: Date | null },
  });
  await notifySlyderLeadSubscribersForPost(post).catch((error) => {
    console.error("[slyder-lead-post] push notification failed", {
      postId: post.id,
      error: error instanceof Error ? error.message : String(error),
    });
  });
  return post;
}

export async function updateSlyderLeadPost(id: string, input: UpdateSlyderLeadPostInput) {
  const existing = await prisma.slyderLeadPost.findUnique({ where: { id } });
  const post = await prisma.slyderLeadPost.update({
    where: { id },
    data: toPostData(input),
  });
  if (input.isPublished === true && existing?.isPublished === false) {
    await notifySlyderLeadSubscribersForPost(post).catch((error) => {
      console.error("[slyder-lead-post] push notification failed", {
        postId: post.id,
        error: error instanceof Error ? error.message : String(error),
      });
    });
  }
  return post;
}

export async function deleteSlyderLeadPost(id: string) {
  return prisma.slyderLeadPost.delete({ where: { id } });
}
