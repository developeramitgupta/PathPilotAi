import { RoleWorkspace } from "@/components/workspaces/role-workspace";

export const metadata = { title: "Industry workspace" };

export default async function IndustryPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string; workspace?: string }>;
}) {
  const { name, workspace } = await searchParams;
  return <RoleWorkspace role="industry" displayName={name} workspaceName={workspace} />;
}
