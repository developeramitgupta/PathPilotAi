import type { StudentJourney } from "@/features/student-journey/config";
import { studentJourneyConfig, type JourneyNavigationGroup, type JourneyNavigationItem } from "@/features/student-journey/config";

export type NavigationItem = JourneyNavigationItem;
export type NavigationGroup = JourneyNavigationGroup;

export function getNavigationGroups(journey: StudentJourney | null | undefined): NavigationGroup[] {
  return studentJourneyConfig[journey ?? "education-planner"].navigation;
}

export function getMobilePrimary(journey: StudentJourney | null | undefined): NavigationItem[] {
  return studentJourneyConfig[journey ?? "education-planner"].mobileNavigation;
}
