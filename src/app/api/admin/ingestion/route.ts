import { NextResponse } from "next/server";

import { pathPilotApiError } from "@/features/pathpilot/server/api";
import { requirePathPilotAdmin } from "@/features/pathpilot/server/auth";
import { listAdminIngestionOverview } from "@/features/verified-data/server/ingestion";

export async function GET() {
  try {
    await requirePathPilotAdmin();
    return NextResponse.json(await listAdminIngestionOverview());
  } catch (error) {
    return pathPilotApiError(error);
  }
}
