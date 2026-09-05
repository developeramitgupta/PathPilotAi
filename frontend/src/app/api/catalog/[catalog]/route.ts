import { NextResponse } from "next/server";

import {
  isCatalogueName,
  listVerifiedCatalogue,
} from "@/features/verified-data/server/catalogue";
import { serviceAvailability } from "@/lib/env";

export async function GET(
  request: Request,
  context: { params: Promise<{ catalog: string }> },
) {
  const { catalog } = await context.params;
  if (!isCatalogueName(catalog)) {
    return NextResponse.json({ error: "Unknown catalogue." }, { status: 404 });
  }
  if (!serviceAvailability.database) {
    return NextResponse.json({
      records: [],
      source: "not-configured",
      message: "Verified data will appear after the production database is connected.",
    });
  }

  const { searchParams } = new URL(request.url);
  const parsedLimit = Number(searchParams.get("limit") ?? "24");
  const limit = Number.isFinite(parsedLimit) ? parsedLimit : 24;
  const records = await listVerifiedCatalogue(catalog, limit);
  return NextResponse.json({ records, source: "verified" });
}
