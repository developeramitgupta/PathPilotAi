"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Languages,
  MapPin,
  MoonStar,
  Palette,
  Sparkles,
  SunMedium,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useThemePreference } from "@/components/theme/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { defaultOnboardingProfile, type OnboardingProfile } from "@/features/pathpilot/schemas";
import { cn } from "@/lib/utils";
import { usePathPilotStore } from "@/stores/pathpilot-store";

const LANGUAGE_STORAGE_KEY = "pathpilot-language-v1";

const languages = [
  { value: "en-IN", label: "English (India)", documentLanguage: "en" },
  { value: "hi-IN", label: "Hindi (हिन्दी)", documentLanguage: "hi" },
  { value: "hinglish", label: "Hinglish", documentLanguage: "en" },
] as const;

const stages = [
  { value: "class-10", label: "Class 10" },
  { value: "class-11-12", label: "Class 11–12" },
  { value: "college", label: "College student" },
  { value: "graduate", label: "Graduate" },
  { value: "early-career", label: "Early career" },
] as const satisfies ReadonlyArray<{ value: OnboardingProfile["currentStage"]; label: string }>;

type ProfileForm = Pick<OnboardingProfile, "name" | "city" | "currentStage">;
type Language = (typeof languages)[number]["value"];

function getProfileForm(profile: OnboardingProfile): ProfileForm {
  return {
    name: profile.name,
    city: profile.city,
    currentStage: profile.currentStage,
  };
}

function ThemeOption({
  active,
  description,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  description: string;
  icon: typeof MoonStar;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Use ${label.toLowerCase()} theme`}
      onClick={onClick}
      className={cn(
        "flex min-h-24 flex-1 items-start gap-3 rounded-xl border p-4 text-left transition-[border-color,background-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        active
          ? "border-primary/45 bg-primary/10 shadow-[0_10px_30px_rgba(124,92,252,0.14)]"
          : "border-border bg-background/45 hover:border-primary/25 hover:bg-accent/55",
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg border", active ? "border-primary/30 bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground")}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span>
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {label}
          {active ? <CheckCircle2 className="size-3.5 text-success" aria-label="Selected" /> : null}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

export function SettingsScreen() {
  const storedProfile = usePathPilotStore((state) => state.profile);
  const updateProfile = usePathPilotStore((state) => state.updateProfile);
  const { theme, setTheme } = useThemePreference();
  const baseProfile = storedProfile ?? defaultOnboardingProfile;
  const [profile, setProfile] = useState<ProfileForm>(() => getProfileForm(baseProfile));
  const [language, setLanguage] = useState<Language>("en-IN");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);
  const [languageSaved, setLanguageSaved] = useState(false);

  useEffect(() => {
    setProfile(getProfileForm(storedProfile ?? defaultOnboardingProfile));
  }, [storedProfile]);

  useEffect(() => {
    try {
      const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const storedOption = languages.find((item) => item.value === storedLanguage);
      if (storedOption) {
        setLanguage(storedOption.value);
        document.documentElement.lang = storedOption.documentLanguage;
      }
    } catch {
      // English remains the safe default when storage is unavailable.
    }
  }, []);

  function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = profile.name.trim();
    const city = profile.city.trim();

    if (name.length < 2 || city.length < 2) {
      setProfileSaved(false);
      setProfileError("Add a name and city with at least two characters each.");
      return;
    }

    updateProfile({ ...baseProfile, ...profile, name, city });
    setProfileError(null);
    setProfileSaved(true);
  }

  function saveLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setLanguageSaved(true);
    const option = languages.find((item) => item.value === nextLanguage);
    if (option) document.documentElement.lang = option.documentLanguage;
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    } catch {
      // The selected language remains active for this session.
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="mx-auto max-w-6xl">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card/72 px-5 py-6 shadow-[var(--shadow-card)] sm:px-8 sm:py-8"
          aria-labelledby="settings-title"
        >
          <div className="pointer-events-none absolute -right-14 -top-20 size-64 rounded-full bg-primary/12 blur-3xl" />
          <div className="relative">
            <Badge variant="default"><Sparkles className="size-3" /> Personal workspace</Badge>
            <h1 id="settings-title" className="mt-4 font-display text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Settings that stay in step with you.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Update your profile, tailor the interface, and keep PathPilot comfortable across every study session.</p>
          </div>
        </motion.section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.35 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><Palette className="size-4.5" aria-hidden="true" /></span>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription className="mt-1">Choose the contrast that works best for you. Your choice applies everywhere.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="Color theme">
                  <ThemeOption active={theme === "dark"} label="Dark mode" description="Focused, low-glare workspace." icon={MoonStar} onClick={() => setTheme("dark")} />
                  <ThemeOption active={theme === "light"} label="Light mode" description="Bright, calm reading surface." icon={SunMedium} onClick={() => setTheme("light")} />
                </div>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">Theme preference is saved securely in this browser.</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.35 }}>
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="grid size-10 place-items-center rounded-xl border border-success/20 bg-success/10 text-success"><Languages className="size-4.5" aria-hidden="true" /></span>
                  <div>
                    <CardTitle>Language</CardTitle>
                    <CardDescription className="mt-1">Set the language preference for your PathPilot experience.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <label htmlFor="language" className="text-sm font-medium text-foreground">Preferred language</label>
                <div className="mt-2"><Select id="language" value={language} onChange={(event) => saveLanguage(event.target.value as Language)}><option value="en-IN">English (India)</option><option value="hi-IN">Hindi (हिन्दी)</option><option value="hinglish">Hinglish</option></Select></div>
                <div aria-live="polite" className="mt-4 rounded-lg border border-border bg-background/45 p-3 text-xs leading-5 text-muted-foreground">
                  <span className="font-medium text-foreground">{languageSaved ? "Preference saved." : "Translation-ready."}</span> The hackathon MVP currently displays interface content in English while this preference is stored for the multilingual rollout.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.35 }} className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary"><UserRound className="size-4.5" aria-hidden="true" /></span>
                <div>
                  <CardTitle>Edit profile</CardTitle>
                  <CardDescription className="mt-1">Keep the essentials current so every plan feels personal.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-5" onSubmit={saveProfile} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2"><label htmlFor="profile-name" className="text-sm font-medium">Name</label><Input id="profile-name" autoComplete="name" value={profile.name} onChange={(event) => { setProfile((current) => ({ ...current, name: event.target.value })); setProfileSaved(false); }} /></div>
                  <div className="grid gap-2"><label htmlFor="profile-city" className="text-sm font-medium">Home city</label><Input id="profile-city" autoComplete="address-level2" value={profile.city} onChange={(event) => { setProfile((current) => ({ ...current, city: event.target.value })); setProfileSaved(false); }} /></div>
                  <div className="grid gap-2 sm:col-span-2"><label htmlFor="profile-stage" className="text-sm font-medium">Current stage</label><Select id="profile-stage" value={profile.currentStage} onChange={(event) => { setProfile((current) => ({ ...current, currentStage: event.target.value as OnboardingProfile["currentStage"] })); setProfileSaved(false); }}>{stages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}</Select></div>
                </div>
                {profileError ? <p role="alert" className="text-sm text-destructive">{profileError}</p> : null}
                <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p aria-live="polite" className="text-xs leading-5 text-muted-foreground">{profileSaved ? <span className="inline-flex items-center gap-1.5 text-success"><CheckCircle2 className="size-3.5" /> Profile saved to this workspace.</span> : "Career recommendations keep their current evidence until you run a fresh discovery."}</p>
                  <Button type="submit" className="w-full sm:w-auto">Save profile</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl border border-warning/20 bg-warning/10 text-warning"><Globe2 className="size-4.5" aria-hidden="true" /></span>
                <div><CardTitle>Guidance controls</CardTitle><CardDescription className="mt-1">Review the signals PathPilot uses to keep guidance accountable.</CardDescription></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/settings/decisions" className="group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-background/35 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-foreground">Decision history</span><span className="mt-0.5 block text-xs text-muted-foreground">Review choices that shaped your plan.</span></span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </Link>
              <Link href="/student-stage?mode=switch" className="group flex min-h-16 items-center gap-3 rounded-xl border border-border bg-background/35 p-3 transition-colors hover:border-primary/25 hover:bg-primary/5">
                <span className="grid size-9 place-items-center rounded-lg bg-success/10 text-success"><MapPin className="size-4" aria-hidden="true" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-foreground">Change student stage</span><span className="mt-0.5 block text-xs text-muted-foreground">Keep shared answers and tailor the next assessment.</span></span>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
