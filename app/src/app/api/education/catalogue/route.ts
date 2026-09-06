import { NextResponse } from "next/server";

import { getEducationCatalogue, type EducationCatalogueKind } from "@/features/verified-data/server/education-catalogue";
import { normalizeStudentJourney } from "@/features/pathpilot/schemas";
import { pathPilotApiError } from "@/features/pathpilot/server/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "courses" ? "courses" : "degrees" satisfies EducationCatalogueKind;
    const list = (key: string) => searchParams.get(key)?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];
    const limit = Number(searchParams.get("limit") ?? "12");
    return NextResponse.json({
      result: getEducationCatalogue({
        kind: type,
        query: searchParams.get("q") ?? undefined,
        level: searchParams.get("level") ?? undefined,
        stream: searchParams.get("stream") ?? undefined,
        interests: list("interests"),
        favoriteSubjects: list("subjects"),
        strengths: list("strengths"),
        careerName: searchParams.get("career") ?? undefined,
        journey: normalizeStudentJourney(searchParams.get("journey")),
        limit: Number.isFinite(limit) ? limit : 12,
      }),
      disclaimer: "Programme titles are catalogued from the supplied UGC/AISHE-aligned sources. Availability, entry requirements, fees, and approvals vary by institution and academic year; open the source and verify with the institution before applying.",
    });
  } catch (error) {
    return pathPilotApiError(error);
  }
}
