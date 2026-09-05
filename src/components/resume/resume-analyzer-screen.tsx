"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, CheckCircle2, FileText, LoaderCircle, Sparkles, Upload, X } from "lucide-react";
import Link from "next/link";

import type { ResumeAnalysis } from "@/features/resume/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AnalysisResponse = { resumeId: string; filename: string; mode: "ai" | "needs-ai-key"; analysis: ResumeAnalysis };
type SavedAnalysisResponse = { resume: { id: string; mode: "ai" | "needs-ai-key"; analysis: ResumeAnalysis | null } | null };

const allowed = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/png", "image/webp"];

function Score({ label, value }: { label: string; value: number }) {
  return <div><div className="mb-2 flex justify-between text-sm"><span>{label}</span><span className="font-data font-semibold">{value}/100</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} /></div></div>;
}

export function ResumeAnalyzerScreen() {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function loadLatestAnalysis() {
      try {
        const response = await fetch("/api/resume/analyze", { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json() as SavedAnalysisResponse;
        if (payload.resume?.analysis) {
          setResult({
            resumeId: payload.resume.id,
            filename: "Previously analyzed resume",
            mode: payload.resume.mode,
            analysis: payload.resume.analysis,
          });
        }
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) setError("");
      }
    }
    void loadLatestAnalysis();
    return () => controller.abort();
  }, []);

  function chooseFile(candidate: File | undefined) {
    setError("");
    if (!candidate) return;
    if (!allowed.includes(candidate.type) || candidate.size > 5 * 1024 * 1024) {
      setError("Use a PDF, DOCX, JPG, PNG, or WEBP file up to 5 MB.");
      return;
    }
    setFile(candidate);
  }

  async function openCamera() {
    setCameraError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOpen(true);
    } catch {
      setCameraError("Camera access was unavailable. Upload a clear photo of your resume instead.");
    }
  }

  function closeCamera() {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
  }

  function captureResume() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) chooseFile(new File([blob], `resume-scan-${Date.now()}.jpg`, { type: "image/jpeg" }));
      closeCamera();
    }, "image/jpeg", 0.92);
  }

  async function analyze() {
    if (!file) { setError("Choose a file or capture your resume first."); return; }
    setError(""); setLoading(true); setProfileSaved(false);
    try {
      const form = new FormData(); form.set("file", file); form.set("targetRole", targetRole);
      const response = await fetch("/api/resume/analyze", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "The resume could not be analyzed.");
      setResult(payload);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "The resume could not be analyzed."); }
    finally { setLoading(false); }
  }

  async function applySkills() {
    if (!result?.analysis.suggestedProfileSkills.length) return;
    setError("");
    try {
      const response = await fetch("/api/resume/apply-profile", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ resumeId: result.resumeId, skills: result.analysis.suggestedProfileSkills }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not update your profile.");
      setProfileSaved(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your profile."); }
  }

  return <div className="mx-auto max-w-6xl pb-12">
    <Button asChild variant="ghost" size="sm" className="-ml-3 mb-5"><Link href="/dashboard"><ArrowLeft /> Dashboard</Link></Button>
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><Badge variant="success">Resume intelligence</Badge><h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Turn your resume into your next best move.</h1><p className="mt-3 max-w-2xl leading-7 text-muted-foreground">Upload a PDF, DOCX, or image—or capture it with your camera. PathPilot stores the original privately and uses AI to produce evidence-based, personalised feedback.</p></div>{result ? <Badge>{result.mode === "ai" ? "AI analysis complete" : "Saved — AI key needed"}</Badge> : null}</div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card className="p-6 sm:p-8"><h2 className="text-lg font-semibold">Add your resume</h2><p className="mt-1 text-sm text-muted-foreground">Only you can access the uploaded original. Maximum 5 MB.</p>
        <input ref={fileRef} type="file" className="sr-only" accept=".pdf,.docx,image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} />
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-6 text-left transition hover:border-primary hover:bg-primary/10"><Upload className="size-6 text-primary" /><p className="mt-5 font-medium">Upload a resume</p><p className="mt-1 text-sm text-muted-foreground">PDF, DOCX, JPG, PNG or WEBP</p></button><button type="button" onClick={openCamera} className="rounded-xl border border-dashed border-border p-6 text-left transition hover:border-primary/40 hover:bg-accent"><Camera className="size-6 text-primary" /><p className="mt-5 font-medium">Scan with camera</p><p className="mt-1 text-sm text-muted-foreground">Capture a clear, flat image</p></button></div>
        {cameraOpen ? <div className="relative mt-5 overflow-hidden rounded-xl border bg-black"><video ref={videoRef} autoPlay playsInline className="max-h-96 w-full object-contain" /><div className="absolute inset-x-3 bottom-3 flex justify-between gap-2"><Button variant="secondary" onClick={closeCamera}><X /> Cancel</Button><Button onClick={captureResume}><Camera /> Capture page</Button></div></div> : null}
        {cameraError ? <p className="mt-3 text-sm text-destructive">{cameraError}</p> : null}
        {file ? <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-muted/35 p-4"><FileText className="size-5 text-primary" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{file.name}</p><p className="text-xs text-muted-foreground">{Math.ceil(file.size / 1024)} KB · ready for private analysis</p></div><button aria-label="Remove selected file" onClick={() => setFile(null)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button></div> : null}
        <label className="mt-6 block text-sm font-medium">Target role <span className="font-normal text-muted-foreground">(optional)</span><input value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="e.g. Data analyst intern" maxLength={120} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary" /></label>
        {error ? <p role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
        <Button className="mt-6 w-full" size="lg" onClick={analyze} disabled={!file || loading}>{loading ? <><LoaderCircle className="animate-spin" /> Analyzing securely…</> : <><Sparkles /> Analyze my resume</>}</Button>
      </Card>
      <Card className="h-fit p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">How it works</p><ol className="mt-5 grid gap-5 text-sm"><li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-data text-xs text-primary">1</span><span><strong className="block">Private upload</strong><span className="text-muted-foreground">Your file is saved in your private resume storage.</span></span></li><li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-data text-xs text-primary">2</span><span><strong className="block">AI evidence review</strong><span className="text-muted-foreground">The model reads what is present; it does not invent achievements.</span></span></li><li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 font-data text-xs text-primary">3</span><span><strong className="block">You choose profile updates</strong><span className="text-muted-foreground">Suggested skills are never added without your confirmation.</span></span></li></ol></Card>
    </div>

    {result ? <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"><Card className="p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold">{result.analysis.headline}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{result.analysis.summary}</p></div><div className="grid size-20 place-items-center rounded-full border-4 border-primary/20 text-center"><strong className="font-data text-2xl">{result.analysis.overallScore}</strong><span className="-mt-3 text-[10px] text-muted-foreground">SCORE</span></div></div><div className="mt-8 grid gap-5 sm:grid-cols-2"><Score label="Format" value={result.analysis.formattingScore} /><Score label="Keywords" value={result.analysis.keywordScore} /><Score label="Grammar" value={result.analysis.grammarScore} /><Score label="Impact" value={result.analysis.impactScore} /></div><div className="mt-8 grid gap-6 md:grid-cols-2"><div><h3 className="font-semibold">What already works</h3><ul className="mt-3 grid gap-2 text-sm text-muted-foreground">{result.analysis.strengths.map((item) => <li className="flex gap-2" key={item}><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />{item}</li>)}</ul></div><div><h3 className="font-semibold">Highest-impact fixes</h3><ol className="mt-3 grid gap-2 text-sm text-muted-foreground">{result.analysis.topFixes.map((item, index) => <li className="flex gap-2" key={item}><span className="font-data text-primary">{index + 1}.</span>{item}</li>)}</ol></div></div></Card><div className="grid h-fit gap-6"><Card className="p-6"><h3 className="font-semibold">Personal directions</h3><div className="mt-4 grid gap-4">{result.analysis.careerDirections.map((direction) => <div className="rounded-lg border border-border p-4" key={direction.role}><div className="flex justify-between gap-3"><strong className="text-sm">{direction.role}</strong><span className="font-data text-sm text-primary">{direction.fit}% fit</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{direction.why}</p><p className="mt-3 text-xs font-medium">Next: {direction.nextAction}</p></div>)}</div></Card><Card className="p-6"><h3 className="font-semibold">Profile skills found in your resume</h3>{result.analysis.suggestedProfileSkills.length ? <><div className="mt-3 flex flex-wrap gap-2">{result.analysis.suggestedProfileSkills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div><Button className="mt-5 w-full" variant={profileSaved ? "secondary" : "default"} onClick={applySkills} disabled={profileSaved}>{profileSaved ? <><CheckCircle2 /> Added to profile</> : "Add these skills to my profile"}</Button></> : <p className="mt-3 text-sm text-muted-foreground">No verified skills were found to add automatically.</p>}</Card></div></div> : null}
  </div>;
}
