"use client";

import React, { useState, useRef, useTransition } from "react";
import {
  QURAN_SURAHS,
  JUZ_NAMES,
  getSurahsForJuz,
  calculateJuzProgress,
  QuranSurah,
} from "@/lib/quran-data";
import { saveTahfizProgressAction } from "@/lib/actions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  AlertCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export interface TahfizRecordItem {
  id: string;
  studentId: string;
  juzNumber: number;
  surahNumber: number;
  surahName: string;
  surahNameAr?: string | null;
  startAyah: number;
  endAyah: number;
  totalAyahs: number;
  status: "COMPLETED" | "IN_PROGRESS" | "REVISION_NEEDED";
  quality: "MUMTAZ" | "JAYYID_JIDDAN" | "JAYYID" | "MAQBOOL";
  voiceNote?: string | null;
  audioDuration?: number | null;
  teacherNote?: string | null;
  evaluatedAt: string;
}

interface TahfizProgressMapProps {
  studentId: string;
  studentName: string;
  records: TahfizRecordItem[];
  canEdit?: boolean;
}

export function TahfizProgressMap({
  studentId,
  studentName,
  records,
  canEdit = false,
}: TahfizProgressMapProps) {
  const [selectedJuz, setSelectedJuz] = useState<number>(30); // Default to Juz 'Amma
  const [activeAudioId, setActiveAudioId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Evaluation & Voice Recorder Modal State
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [evalSurah, setEvalSurah] = useState<QuranSurah>(QURAN_SURAHS[77]); // An-Naba
  const [evalStatus, setEvalStatus] = useState<"COMPLETED" | "IN_PROGRESS" | "REVISION_NEEDED">("COMPLETED");
  const [evalQuality, setEvalQuality] = useState<"MUMTAZ" | "JAYYID_JIDDAN" | "JAYYID" | "MAQBOOL">("MUMTAZ");
  const [evalStartAyah, setEvalStartAyah] = useState<number>(1);
  const [evalEndAyah, setEvalEndAyah] = useState<number>(40);
  const [evalTeacherNote, setEvalTeacherNote] = useState<string>("");

  // In-Browser Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPending, startTransition] = useTransition();

  // Create lookup map of records by surahNumber
  const recordMap = new Map<number, TahfizRecordItem>();
  records.forEach((r) => recordMap.set(r.surahNumber, r));

  const completedSurahs = records
    .filter((r) => r.status === "COMPLETED")
    .map((r) => r.surahNumber);

  const currentJuzSurahs = getSurahsForJuz(selectedJuz);
  const currentJuzStats = calculateJuzProgress(selectedJuz, completedSurahs);

  // Overall Quran Stats
  const totalCompletedCount = completedSurahs.length;
  const overallPercentage = Math.round((totalCompletedCount / 114) * 100);

  // Handle Audio Playback
  const togglePlayAudio = (recordId: string, audioDataUrl: string) => {
    if (activeAudioId === recordId) {
      audioPlayerRef.current?.pause();
      setActiveAudioId(null);
    } else {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      const audio = new Audio(audioDataUrl);
      audioPlayerRef.current = audio;
      setActiveAudioId(recordId);

      audio.play().catch(() => {
        toast.error("Unable to play audio");
        setActiveAudioId(null);
      });

      audio.onended = () => {
        setActiveAudioId(null);
      };
    }
  };

  // Start Mic Recording
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      toast.error("Microphone access denied or not supported on this browser.");
    }
  };

  // Stop Mic Recording
  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Open Evaluation Modal
  const handleOpenEvaluate = (surah: QuranSurah) => {
    const existing = recordMap.get(surah.number);
    setEvalSurah(surah);
    setEvalStatus(existing?.status || "COMPLETED");
    setEvalQuality(existing?.quality || "MUMTAZ");
    setEvalStartAyah(existing?.startAyah || 1);
    setEvalEndAyah(existing?.endAyah || surah.numberOfAyahs);
    setEvalTeacherNote(existing?.teacherNote || "");
    setRecordedAudioUrl(existing?.voiceNote || null);
    setRecordDuration(existing?.audioDuration || 0);
    setIsEvalModalOpen(true);
  };

  // Save Tahfiz Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        const res = await saveTahfizProgressAction({
          studentId,
          juzNumber: selectedJuz,
          surahNumber: evalSurah.number,
          surahName: evalSurah.name,
          surahNameAr: evalSurah.nameArabic,
          startAyah: Number(evalStartAyah),
          endAyah: Number(evalEndAyah),
          totalAyahs: evalSurah.numberOfAyahs,
          status: evalStatus,
          quality: evalQuality,
          voiceNote: recordedAudioUrl,
          audioDuration: recordDuration,
          teacherNote: evalTeacherNote,
        });

        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success(`Saved Tahfiz progress for Surah ${evalSurah.name}!`);
          setIsEvalModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to save evaluation");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Quran Memorization Executive Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-2xl shadow-glass border border-emerald-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-800/90 border border-emerald-500/40 flex items-center justify-center text-amber-300 text-lg">
                📖
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Quran & Tahfiz Progress Tracker
                </h3>
                <p className="text-xs text-emerald-300 font-medium">
                  Student: <strong className="text-white">{studentName}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-emerald-900/60 p-3 rounded-xl border border-emerald-700/40">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Quran Memorized</span>
              <span className="text-sm sm:text-base font-black text-amber-300">
                {totalCompletedCount} / 114 Surahs ({overallPercentage}%)
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-800 border-2 border-amber-400 flex items-center justify-center font-bold text-xs text-amber-300">
              {overallPercentage}%
            </div>
          </div>
        </div>
      </div>

      {/* JUZ 1–30 VISUAL HORIZONTAL SELECTOR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Select Juz (1 – 30)</span>
          </h4>
          <span className="text-xs text-slate-500 font-medium">
            Currently Viewing: <strong className="text-emerald-800">Juz {selectedJuz}</strong> ({JUZ_NAMES[selectedJuz]?.name})
          </span>
        </div>

        {/* Scrollable Juz Pill Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-200">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const stats = calculateJuzProgress(juzNum, completedSurahs);
            const isSelected = selectedJuz === juzNum;
            const isFinished = stats.percentage === 100 && stats.totalSurahs > 0;

            return (
              <button
                key={juzNum}
                onClick={() => setSelectedJuz(juzNum)}
                type="button"
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? "bg-emerald-800 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/50 scale-102"
                    : isFinished
                    ? "bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                    : stats.percentage > 0
                    ? "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold font-mono">Juz {juzNum}</span>
                  <span className={`text-[10px] font-serif ${isSelected ? "text-amber-300" : "text-emerald-700"}`}>
                    {JUZ_NAMES[juzNum]?.nameArabic}
                  </span>
                </div>
                <div className="text-[10px] mt-1 font-medium opacity-90 truncate max-w-[100px]">
                  {JUZ_NAMES[juzNum]?.name}
                </div>
                {/* Progress bar inside pill */}
                <div className="w-full bg-slate-200/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full ${
                      isFinished ? "bg-amber-400" : isSelected ? "bg-amber-300" : "bg-emerald-600"
                    }`}
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED JUZ DETAIL CARD & SURAH ROSTER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-4 sm:p-6">
        {/* Juz Banner Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/80 rounded-xl border border-emerald-200">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="islamic">Juz {selectedJuz}</Badge>
              <h4 className="font-bold text-emerald-950 text-base">
                {JUZ_NAMES[selectedJuz]?.name} ({JUZ_NAMES[selectedJuz]?.nameArabic})
              </h4>
            </div>
            <p className="text-xs text-emerald-800 mt-1">
              Contains {currentJuzSurahs.length} Surahs &bull; {currentJuzStats.completedCount} Completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Juz Mastery</span>
              <span className="text-sm font-bold text-emerald-900">{currentJuzStats.percentage}% Completed</span>
            </div>
            <div className="w-24 bg-emerald-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-700 h-full rounded-full transition-all"
                style={{ width: `${currentJuzStats.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Surahs Grid in this Juz */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentJuzSurahs.map((surah) => {
            const record = recordMap.get(surah.number);
            const isCompleted = record?.status === "COMPLETED";
            const isInProgress = record?.status === "IN_PROGRESS";
            const isRevision = record?.status === "REVISION_NEEDED";
            const hasAudio = Boolean(record?.voiceNote);

            return (
              <div
                key={surah.number}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  isCompleted
                    ? "bg-emerald-50/40 border-emerald-200 hover:border-emerald-400"
                    : isInProgress
                    ? "bg-amber-50/40 border-amber-200 hover:border-amber-400"
                    : isRevision
                    ? "bg-rose-50/40 border-rose-200 hover:border-rose-400"
                    : "bg-slate-50/50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-bold text-xs flex items-center justify-center">
                      {surah.number}
                    </span>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm leading-tight">{surah.name}</h5>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {surah.numberOfAyahs} Ayahs &bull; {surah.type}
                      </span>
                    </div>
                  </div>
                  <span className="text-base font-serif text-emerald-900 font-bold">{surah.nameArabic}</span>
                </div>

                {/* Status & Evaluation Details */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div>
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Mumtaz ({record.quality})</span>
                      </span>
                    )}
                    {isInProgress && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3" />
                        <span>In Progress (Ayah {record?.startAyah}–{record?.endAyah})</span>
                      </span>
                    )}
                    {isRevision && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                        <AlertCircle className="w-3 h-3" />
                        <span>Revision Needed</span>
                      </span>
                    )}
                    {!record && (
                      <span className="text-[10px] text-slate-400 font-medium">Not Started</span>
                    )}
                  </div>

                  {/* Audio Voice Note Play Trigger */}
                  {hasAudio && (
                    <button
                      type="button"
                      onClick={() => togglePlayAudio(record!.id, record!.voiceNote!)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                        activeAudioId === record!.id
                          ? "bg-amber-500 text-white border-amber-600 animate-pulse"
                          : "bg-emerald-700 text-white border-emerald-800 hover:bg-emerald-600"
                      }`}
                    >
                      {activeAudioId === record!.id ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Playing</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Voice Note ({record!.audioDuration || 0}s)</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Teacher Feedback Note (If Present) */}
                {record?.teacherNote && (
                  <p className="text-[11px] text-slate-600 italic bg-white/80 p-2 rounded-lg border border-slate-100">
                    "{record.teacherNote}"
                  </p>
                )}

                {/* Ustadh Action Button */}
                {canEdit && (
                  <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                    <Button
                      onClick={() => handleOpenEvaluate(surah)}
                      variant="outline"
                      size="sm"
                      className="text-[11px] py-1 px-2.5 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{record ? "Update Assessment" : "Assess Surah"}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* EVALUATION & AUDIO RECORDER MODAL */}
      <Modal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        title={`Assess Surah ${evalSurah.name} (${evalSurah.nameArabic})`}
        subtitle={`Student: ${studentName} • ${evalSurah.numberOfAyahs} Total Verses`}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveEvaluation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Memorization Status
              </label>
              <select
                value={evalStatus}
                onChange={(e) => setEvalStatus(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
              >
                <option value="COMPLETED">Completed (Hifz Done)</option>
                <option value="IN_PROGRESS">In Progress (Currently Memorizing)</option>
                <option value="REVISION_NEEDED">Revision Needed (Muraja'ah)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recitation Quality Rating
              </label>
              <select
                value={evalQuality}
                onChange={(e) => setEvalQuality(e.target.value as any)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-900"
              >
                <option value="MUMTAZ">Mumtaz (Excellent / Flawless)</option>
                <option value="JAYYID_JIDDAN">Jayyid Jiddan (Very Good)</option>
                <option value="JAYYID">Jayyid (Good)</option>
                <option value="MAQBOOL">Maqbool (Acceptable / Needs Work)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                From Ayah
              </label>
              <input
                type="number"
                min={1}
                max={evalSurah.numberOfAyahs}
                value={evalStartAyah}
                onChange={(e) => setEvalStartAyah(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                To Ayah
              </label>
              <input
                type="number"
                min={1}
                max={evalSurah.numberOfAyahs}
                value={evalEndAyah}
                onChange={(e) => setEvalEndAyah(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* IN-BROWSER AUDIO VOICE NOTE RECORDER */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-700" />
                <span>Ustadh Recitation Voice Note (Optional)</span>
              </label>
              {isRecording && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-rose-600 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                  <span>Recording: {recordDuration}s</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startAudioRecording}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Mic className="w-4 h-4" />
                  <span>{recordedAudioUrl ? "Re-Record Voice Note" : "Record Voice Note"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopAudioRecording}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all animate-pulse"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Stop Recording</span>
                </button>
              )}

              {recordedAudioUrl && !isRecording && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const audio = new Audio(recordedAudioUrl);
                      audio.play();
                    }}
                    className="px-3 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Preview Audio ({recordDuration}s)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRecordedAudioUrl(null);
                      setRecordDuration(0);
                    }}
                    className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                    title="Remove audio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-[10px] text-emerald-800">
              Record a brief feedback clip or recitation correction so parents can listen at home.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ustadh Notes & Tajweed Feedback
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Excellent Makharij. Pay attention to Ghunnah on Noon Mushaddad in Ayah 12."
              value={evalTeacherNote}
              onChange={(e) => setEvalTeacherNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsEvalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={isPending}>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Tahfiz Progress</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
