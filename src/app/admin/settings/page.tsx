import { AdminShell } from "@/components/admin/admin-shell";
import { SoundTestPanel } from "@/components/admin/sound-test-panel";
import { getAdminPageContext } from "@/server/admin/admin-page";

export default async function AdminSettingsPage() {
  const { user, mode } = await getAdminPageContext();

  return (
    <AdminShell
      title="Admin Settings"
      description="Configure and test dashboard behaviour, alert sounds, and operational preferences."
      adminName={user.fullName}
      mode={mode}
    >
      <div className="grid gap-6 xl:max-w-3xl">
        <SoundTestPanel />
      </div>
    </AdminShell>
  );
}
