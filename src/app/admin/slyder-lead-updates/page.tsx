import { AdminShell } from "@/components/admin/admin-shell";
import { SlyderLeadPostManager } from "@/components/admin/slyder-lead-post-manager";
import { getAdminPageContext } from "@/server/admin/admin-page";
import { listAdminSlyderLeadPosts } from "@/modules/leads/services/slyder-lead-post.service";

export const dynamic = "force-dynamic";

export default async function AdminSlyderLeadUpdatesPage() {
  const [{ user, mode }, posts] = await Promise.all([
    getAdminPageContext(),
    listAdminSlyderLeadPosts(),
  ]);
  const devAdminKey = mode === "development" ? process.env.SLYDE_ADMIN_DEV_KEY || "dev-admin-key" : undefined;
  const serialized = posts.map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    imageUrl: post.imageUrl,
    ctaLabel: post.ctaLabel,
    ctaHref: post.ctaHref,
    isPublished: post.isPublished,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  }));

  return (
    <AdminShell
      title="Slyder Lead Updates"
      description="Publish photo posts, promotions, launch updates, and reminders to the Slyder lead dashboard."
      adminName={user.fullName}
      mode={mode}
    >
      <SlyderLeadPostManager posts={serialized} devAdminKey={devAdminKey} />
    </AdminShell>
  );
}
