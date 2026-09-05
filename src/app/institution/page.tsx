import { RoleWorkspace } from "@/components/workspaces/role-workspace";

export const metadata = { title: "Institution workspace" };

export default async function InstitutionPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; workspace?: string }>;
}) {
  const { name, workspace } = await searchParams;
  return <RoleWorkspace role="institution" displayName={name} workspaceName={workspace} />;
}
