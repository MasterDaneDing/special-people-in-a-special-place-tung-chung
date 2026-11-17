import React, { useEffect, useRef, useState } from 'react';
import {
  BookCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  Film,
  Home,
  Loader2,
  MapPin,
  Music,
  Pause,
  Pencil,
  Settings,
  UserPlus,
  Volume2,
} from 'lucide-react';
import {
  ADJECTIVES,
  Adjective,
  Character,
  DrawnObject,
  PageState,
  PRONOUNS,
  Pronoun,
  PlacedCharacter,
  PlacedObject,
  StorybookConfig,
} from './types';
import {
  createInitialPages,
  getDefaultConfig,
  getPageSentence,
  speakSentence,
} from './utils/storyHelpers';
import {
  DanceVideoResult,
  downloadStoryBackupHtml,
  postToGoogleAppsScript,
  recordDanceMusicVideo,
  renderAllStoryPages,
} from './utils/canvasExporter';
import { CoverPage } from './components/CoverPage';
import { InteractiveCharacter } from './components/InteractiveCharacter';
import { RollingWheel } from './components/RollingWheel';
import { BackgroundStrip } from './components/BackgroundStrip';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { TeacherModeModal } from './components/TeacherModeModal';
import { DrawObjectModal } from './components/DrawObjectModal';
import { InteractiveProp } from './components/InteractiveProp';

export default function App() {
  const [config, setConfig] = useState<StorybookConfig>(() => getDefaultConfig());
  const [showCover, setShowCover] = useState(true);
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [pages, setPages] = useState<PageState[]>(() =>
    createInitialPages(getDefaultConfig().places)
  );
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  const [drawnObjects, setDrawnObjects] = useState<DrawnObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [drawObjectOpen, setDrawObjectOpen] = useState(false);

  // Modals & Popovers
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [creatorTargetPage, setCreatorTargetPage] = useState(1);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [teacherOpen, setTeacherOpen] = useState(false);
  const [placesStripOpen, setPlacesStripOpen] = useState(false);
  const [editingPlaceName, setEditingPlaceName] = useState(false);

  // Toast for double-tap background switching
  const [bgToast, setBgToast] = useState<string | null>(null);
  const lastBgTapRef = useRef<number>(0);
  const toastTimerRef = useRef<number | null>(null);

  // Page 12 Dance Audio
  const danceAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Export States (Save Story & Save Music Video)
  const [storySaving, setStorySaving] = useState(false);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyBanner, setStoryBanner] = useState<string | null>(null);
  const [storyBackup, setStoryBackup] = useState<{
    studentName: string;
    pagePngs: string[];
    sentences: string[];
  } | null>(null);

  const [videoRecording, setVideoRecording] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoTimeLabel, setVideoTimeLabel] = useState('');
  const [videoBanner, setVideoBanner] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<DanceVideoResult | null>(null);
  const recordAbortRef = useRef<AbortController | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);

  const currentPage = pages[currentPageNum - 1];
  const activePlace =
    config.places.find((p) => p.id === currentPage.bgPlaceId) || config.places[0];

  const studentName =
    characters.find((c) => c.createdOnPage === 1)?.name ||
    pages[0]?.friendName ||
    'Student';

  // Sync character updates to page friendName if edited in modal
  const updatePage = (pageNum: number, patch: Partial<PageState>) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNum ? { ...p, ...patch } : p))
    );
  };

  // Manage Page 12 Dance Music autoplay & cleanup
  useEffect(() => {
    const audio = danceAudioRef.current;
    if (!audio) return;

    if (!showCover && currentPageNum === 12 && !videoRecording) {
      audio.loop = true;
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
    } else {
      audio.pause();
      audio.currentTime = 0;
      setIsMusicPlaying(false);
    }
  }, [showCover, currentPageNum, videoRecording, config.danceSongUrl]);

  const toggleDanceMusic = () => {
    const audio = danceAudioRef.current;
    if (!audio) return;
    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
    } else {
      audio.loop = true;
      audio
        .play()
        .then(() => setIsMusicPlaying(true))
        .catch(() => setIsMusicPlaying(false));
    }
  };

  const navigateToPage = (targetNum: number) => {
    const clamped = Math.max(1, Math.min(12, targetNum));
    setSelectedCharId(null);
    setSelectedObjectId(null);
    setPlacesStripOpen(false);
    setEditingPlaceName(false);

    setPages((prevPages) => {
      const target = prevPages[clamped - 1];
      let nextPlaced = [...target.placed];

      if (clamped === 12) {
        // Bring all created characters onto Page 12 Dance Party!
        const existingIds = new Set(nextPlaced.map((pc) => pc.charId));
        const missingChars = characters.filter((c) => !existingIds.has(c.id));
        if (missingChars.length > 0) {
          const total = characters.length;
          missingChars.forEach((char, idx) => {
            const globalIdx = characters.findIndex((c) => c.id === char.id);
            const row = globalIdx < 6 ? 0 : 1;
            const colsInRow = row === 0 ? Math.min(6, total) : Math.max(1, total - 6);
            const colIdx = row === 0 ? globalIdx : globalIdx - 6;
            const x = (colIdx + 1) / (colsInRow + 1);
            const y = total <= 6 ? 0.62 : row === 0 ? 0.5 : 0.72;
            nextPlaced.push({
              charId: char.id,
              x: Math.max(0.1, Math.min(0.9, x)),
              y,
              scale: total > 6 ? 0.85 : 1.0,
              flipX: idx % 2 === 1,
              zIndex: globalIdx + 1,
            });
          });
        }
      } else if (clamped >= 2 && clamped <= 11) {
        // Carry forward previous page's cast if this page hasn't been populated yet
        if (nextPlaced.length === 0) {
          const prevPage = prevPages[clamped - 2];
          const prevCast = prevPage?.placed || [];
          const existingIds = new Set(prevCast.map((p) => p.charId));
          // Include any earlier characters too
          nextPlaced = prevCast.map((p) => ({ ...p }));
          characters
            .filter((c) => c.createdOnPage < clamped && !existingIds.has(c.id))
            .forEach((c, idx) => {
              nextPlaced.push({
                charId: c.id,
                x: 0.2 + ((idx * 0.14) % 0.6),
                y: 0.62,
                scale: 0.95,
                flipX: false,
                zIndex: nextPlaced.length + 1,
              });
            });
        }
      }

      return prevPages.map((p) =>
        p.pageNumber === clamped ? { ...p, placed: nextPlaced } : p
      );
    });

    setCurrentPageNum(clamped);

    // Prompt Character Creator if this page (1..11) doesn't have its character yet
    if (clamped >= 1 && clamped <= 11) {
      const hasPageChar = characters.some((c) => c.createdOnPage === clamped);
      if (!hasPageChar) {
        setEditingCharacter(null);
        setCreatorTargetPage(clamped);
        setCreatorOpen(true);
      }
    }
  };

  const handleStartBook = () => {
    setShowCover(false);
    setCurrentPageNum(1);
    const hasMe = characters.some((c) => c.createdOnPage === 1);
    if (!hasMe) {
      setEditingCharacter(null);
      setCreatorTargetPage(1);
      setCreatorOpen(true);
    }
  };

  const handleCharacterComplete = (char: Character) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === char.id);
      if (exists) {
        return prev.map((c) => (c.id === char.id ? char : c));
      }
      return [...prev, char];
    });

    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== char.createdOnPage && p.pageNumber !== 12) {
          return p;
        }
        const alreadyPlaced = p.placed.some((pc) => pc.charId === char.id);
        const updatedFriendName =
          p.pageNumber === char.createdOnPage ? char.name : p.friendName;
        if (alreadyPlaced) {
          return { ...p, friendName: updatedFriendName };
        }
        const count = p.placed.length;
        const xPos =
          char.createdOnPage === 1
            ? 0.5
            : Math.max(0.15, Math.min(0.85, 0.25 + ((count * 0.17) % 0.6)));
        const yPos = 0.6;
        const newPlaced: PlacedCharacter = {
          charId: char.id,
          x: xPos,
          y: yPos,
          scale: 1.05,
          flipX: false,
          zIndex: count + 1,
        };
        return {
          ...p,
          friendName: updatedFriendName,
          placed: [...p.placed, newPlaced],
        };
      })
    );

    setCreatorOpen(false);
    setEditingCharacter(null);
    setSelectedCharId(char.id);
  };

  const handlePlacedChange = (
    charId: string,
    patch: Partial<PlacedCharacter>
  ) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        return {
          ...p,
          placed: p.placed.map((pc) =>
            pc.charId === charId ? { ...pc, ...patch } : pc
          ),
        };
      })
    );
  };

  const bringCharacterForward = (charId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        const maxZ = p.placed.reduce((m, c) => Math.max(m, c.zIndex), 1);
        return {
          ...p,
          placed: p.placed.map((pc) =>
            pc.charId === charId ? { ...pc, zIndex: maxZ + 1 } : pc
          ),
        };
      })
    );
  };

  const placeObjectOnCurrentPage = (obj: DrawnObject) => {
    setDrawObjectOpen(false);
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        const objects = p.objects || [];
        const maxZ = Math.max(
          objects.reduce((m, o) => Math.max(m, o.zIndex), 0),
          p.placed.reduce((m, c) => Math.max(m, c.zIndex), 0)
        );
        const count = objects.length;
        const newPlaced: PlacedObject = {
          instanceId: `inst-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          objectId: obj.id,
          x: Math.max(0.2, Math.min(0.8, 0.42 + ((count * 0.1) % 0.3))),
          y: 0.55,
          scale: 1,
          flipX: false,
          zIndex: maxZ + 1,
        };
        return { ...p, objects: [...objects, newPlaced] };
      })
    );
    setSelectedCharId(null);
    setSelectedObjectId(null);
  };

  const handleObjectChange = (instanceId: string, patch: Partial<PlacedObject>) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        return {
          ...p,
          objects: (p.objects || []).map((o) =>
            o.instanceId === instanceId ? { ...o, ...patch } : o
          ),
        };
      })
    );
  };

  const bringObjectForward = (instanceId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        const objects = p.objects || [];
        const maxZ = Math.max(
          objects.reduce((m, o) => Math.max(m, o.zIndex), 1),
          p.placed.reduce((m, c) => Math.max(m, c.zIndex), 1)
        );
        return {
          ...p,
          objects: objects.map((o) =>
            o.instanceId === instanceId ? { ...o, zIndex: maxZ + 1 } : o
          ),
        };
      })
    );
  };

  const removeObjectFromPage = (instanceId: string) => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.pageNumber !== currentPageNum) return p;
        return {
          ...p,
          objects: (p.objects || []).filter((o) => o.instanceId !== instanceId),
        };
      })
    );
    setSelectedObjectId((curr) => (curr === instanceId ? null : curr));
  };

  const cycleBackground = () => {
    if (config.places.length <= 1) return;
    const idx = config.places.findIndex((p) => p.id === currentPage.bgPlaceId);
    const nextPlace = config.places[(idx + 1) % config.places.length];
    updatePage(currentPageNum, { bgPlaceId: nextPlace.id });

    setBgToast(nextPlace.name);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setBgToast(null), 1600);
  };

  const handleStagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only trigger when tapping background directly (character handlers call stopPropagation)
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.bgLayer) {
      return;
    }
    setSelectedCharId(null);
    setSelectedObjectId(null);
    const now = Date.now();
    if (now - lastBgTapRef.current < 320) {
      lastBgTapRef.current = 0;
      cycleBackground();
    } else {
      lastBgTapRef.current = now;
    }
  };

  const handleSaveStory = async () => {
    if (storySaving) return;
    setStorySaving(true);
    setStoryProgress(0);
    setStoryBanner(null);

    try {
      const rendered = await renderAllStoryPages(
        pages,
        characters,
        config.places,
        drawnObjects,
        (pct) => setStoryProgress(pct)
      );

      setStoryBackup({
        studentName,
        pagePngs: rendered.pagePngs,
        sentences: rendered.sentences,
      });

      await postToGoogleAppsScript(config.googleAppsScriptUrl, {
        type: 'story',
        studentName,
        storyText: rendered.storyText,
        pages: rendered.pagePngs,
      });

      setStoryBanner(
        `Awesome, ${studentName}! Your 12-page storybook was sent to Google Drive!`
      );
    } catch (err) {
      console.error(err);
      setStoryBanner(
        'Could not reach Google Drive right now, but your local backup copy is ready below!'
      );
    } finally {
      setStorySaving(false);
    }
  };

  const handleSaveMusicVideo = async () => {
    if (videoRecording) return;
    const audio = danceAudioRef.current;
    if (audio) {
      audio.pause();
      setIsMusicPlaying(false);
    }

    setVideoRecording(true);
    setVideoProgress(0);
    setVideoTimeLabel('Starting...');
    setVideoBanner(null);

    const controller = new AbortController();
    recordAbortRef.current = controller;

    try {
      const result = await recordDanceMusicVideo({
        page12: pages[11],
        characters,
        places: config.places,
        danceSongUrl: config.danceSongUrl,
        drawnObjects,
        signal: controller.signal,
        onProgress: (pct, elapsed, total) => {
          setVideoProgress(pct);
          setVideoTimeLabel(`${Math.round(elapsed)}s / ${Math.round(total)}s`);
        },
      });

      setVideoResult(result);

      await postToGoogleAppsScript(config.googleAppsScriptUrl, {
        type: 'video',
        studentName,
        mimeType: result.mimeType,
        videoBase64: result.videoBase64,
      });

      setVideoBanner(
        `Hooray, ${studentName}! Your Tung Chung dance music video was sent to Google Drive!`
      );
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        setVideoBanner('Music video recording cancelled.');
      } else {
        console.error(err);
        setVideoBanner(
          'Could not record or upload the music video. Check Teacher Setup Mode audio settings.'
        );
      }
    } finally {
      setVideoRecording(false);
      recordAbortRef.current = null;
    }
  };

  const currentSentence = getPageSentence(currentPage, characters);
  const pageCharacter = characters.find(
    (c) => c.createdOnPage === currentPageNum
  );

  // Render inline interactive narrative sentence with Rolling Wheels & Name inputs
  const renderNarrativeBuilder = () => {
    const p = currentPageNum;

    if (p === 12) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xl sm:text-3xl font-bold text-[#3a2e28] text-center">
          <span>
            We are special people in a special place:{' '}
            <span className="text-[#dc2626]">Tung Chung!</span>
          </span>
        </div>
      );
    }

    if (p === 1) {
      return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-lg sm:text-2xl font-bold text-[#3a2e28] leading-snug">
          <span>This is me! I live in</span>

          {editingPlaceName ? (
            <input
              type="text"
              autoFocus
              value={currentPage.placeName}
              onChange={(e) => updatePage(1, { placeName: e.target.value })}
              onBlur={() => {
                if (!currentPage.placeName.trim()) {
                  updatePage(1, { placeName: 'Tung Chung' });
                }
                setEditingPlaceName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingPlaceName(false);
              }}
              className="min-h-[48px] w-44 px-3 rounded-xl border-[3px] border-[#3a2e28] bg-white text-[#dc2626] text-xl font-bold text-center"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingPlaceName(true)}
              title="Tap to change place name"
              className="px-3 py-1.5 min-h-[48px] rounded-xl border-[2.5px] border-dashed border-[#dc2626] bg-[#fee2e2]/70 text-[#dc2626] font-bold hover:bg-[#fee2e2] transition-colors"
            >
              {currentPage.placeName || 'Tung Chung'}
            </button>
          )}

          <span>! I am a</span>

          <RollingWheel
            items={ADJECTIVES}
            value={currentPage.adjective}
            onChange={(val) => updatePage(1, { adjective: val as Adjective })}
            ariaLabel="personality word"
            accentBg="bg-[#ffd93d]"
            minWidthClass="min-w-[154px]"
          />

          <span>person.</span>
        </div>
      );
    }

    const nameInput = (
      <input
        type="text"
        value={currentPage.friendName}
        onChange={(e) => {
          const val = e.target.value;
          updatePage(p, { friendName: val });
          if (pageCharacter) {
            setCharacters((prev) =>
              prev.map((c) =>
                c.id === pageCharacter.id ? { ...c, name: val } : c
              )
            );
          }
        }}
        placeholder={`Friend ${p}`}
        aria-label={`Friend ${p} name`}
        className="min-h-[50px] w-36 sm:w-44 px-3 rounded-2xl border-[3px] border-[#3a2e28] bg-white text-[#ff5946] text-lg sm:text-xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-[#ffd93d]"
      />
    );

    const pronounWheel = (
      <RollingWheel
        items={PRONOUNS}
        value={currentPage.pronoun}
        onChange={(val) => updatePage(p, { pronoun: val as Pronoun })}
        ariaLabel="pronoun"
        accentBg="bg-[#bae6fd]"
        minWidthClass="min-w-[116px]"
      />
    );

    const adjWheel = (
      <RollingWheel
        items={ADJECTIVES}
        value={currentPage.adjective}
        onChange={(val) => updatePage(p, { adjective: val as Adjective })}
        ariaLabel="personality word"
        accentBg="bg-[#ffd93d]"
        minWidthClass="min-w-[152px]"
      />
    );

    const lowerPronounWheel = (
      <RollingWheel
        items={PRONOUNS}
        value={currentPage.pronoun}
        onChange={(val) => updatePage(p, { pronoun: val as Pronoun })}
        ariaLabel="pronoun"
        accentBg="bg-[#bae6fd]"
        minWidthClass="min-w-[116px]"
      />
    );

    switch (p) {
      case 2:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Oh look! It is</span>
            {nameInput}
            <span>.</span>
            {pronounWheel}
            <span>is</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Now I can see</span>
            {nameInput}
            <span>.</span>
            {pronounWheel}
            <span>is</span>
            {adjWheel}
            <span>!</span>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Oh, hey look! It&apos;s</span>
            {nameInput}
            <span>.</span>
            {pronounWheel}
            <span>really is</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 5:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Over there is</span>
            {nameInput}
            <span>! Everyone knows</span>
            {lowerPronounWheel}
            <span>is</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 6:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Look who is in Tung Chung! It&apos;s</span>
            {nameInput}
            <span>, and</span>
            {lowerPronounWheel}
            <span>is very</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Here comes</span>
            {nameInput}
            <span>with a big smile!</span>
            {pronounWheel}
            <span>is so</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 8:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Guess who I met today? It is</span>
            {nameInput}
            <span>, and</span>
            {lowerPronounWheel}
            <span>is</span>
            {adjWheel}
            <span>!</span>
          </div>
        );
      case 9:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Wave hello to</span>
            {nameInput}
            <span>!</span>
            {pronounWheel}
            <span>is always</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 10:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>Wait—is that</span>
            {nameInput}
            <span>over by the trees? Yes!</span>
            {pronounWheel}
            <span>is super</span>
            {adjWheel}
            <span>.</span>
          </div>
        );
      case 11:
      default:
        return (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-lg sm:text-2xl font-bold text-[#3a2e28]">
            <span>And here is</span>
            {nameInput}
            <span>, ready to play!</span>
            {pronounWheel}
            <span>is wonderfully</span>
            {adjWheel}
            <span>!</span>
          </div>
        );
    }
  };

  if (showCover) {
    return (
      <>
        <CoverPage
          places={config.places}
          bodies={config.bodies}
          onStartBook={handleStartBook}
          onOpenTeacherMode={() => setTeacherOpen(true)}
        />
        <TeacherModeModal
          isOpen={teacherOpen}
          config={config}
          onUpdateConfig={setConfig}
          onResetDefaults={() => setConfig(getDefaultConfig())}
          onClose={() => setTeacherOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#fff5e1] flex flex-col items-center px-2.5 py-2.5 sm:px-5 sm:py-4 gap-3">
      {/* Hidden Audio Element for Page 12 */}
      <audio ref={danceAudioRef} src={config.danceSongUrl} preload="auto" />

      {/* Top Navigation & Page Strip */}
      <header className="w-full max-w-6xl flex flex-wrap items-center justify-between gap-2 bg-[#fffaf0] rounded-3xl border-[3px] border-[#3a2e28] shadow-[0_4px_0_#3a2e28] px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCover(true)}
            aria-label="Back to Cover"
            className="storybook-btn px-3.5 rounded-2xl bg-[#ffd93d] text-base font-bold text-[#3a2e28] flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Cover</span>
          </button>

          <button
            type="button"
            disabled={currentPageNum <= 1}
            onClick={() => navigateToPage(currentPageNum - 1)}
            aria-label="Previous page"
            className="storybook-btn w-12 rounded-2xl bg-white flex items-center justify-center text-[#3a2e28] shrink-0"
          >
            <ChevronLeft className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Pages 1..12 Quick Stepper */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {pages.map((p) => {
            const active = p.pageNumber === currentPageNum;
            const hasChar =
              p.pageNumber === 12 ||
              characters.some((c) => c.createdOnPage === p.pageNumber);
            return (
              <button
                key={p.pageNumber}
                type="button"
                onClick={() => navigateToPage(p.pageNumber)}
                className={`min-w-[42px] h-[44px] px-2 rounded-xl border-[2.5px] border-[#3a2e28] font-bold text-base tabular-nums transition-transform active:scale-95 shrink-0 ${
                  active
                    ? 'bg-[#ff5946] text-white shadow-[0_3px_0_#3a2e28]'
                    : hasChar
                    ? 'bg-[#dcfce7] text-[#3a2e28]'
                    : 'bg-white text-[#3a2e28]/80'
                }`}
              >
                {p.pageNumber === 12 ? '12 ♪' : p.pageNumber}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPageNum >= 12}
            onClick={() => navigateToPage(currentPageNum + 1)}
            aria-label="Next page"
            className="storybook-btn px-3.5 rounded-2xl bg-[#4ade80] text-base font-bold text-[#3a2e28] flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-6 h-6 stroke-[3]" />
          </button>

          <button
            type="button"
            onClick={() => setTeacherOpen(true)}
            aria-label="Teacher Setup Mode"
            title="Teacher Setup Mode"
            className="storybook-btn w-12 rounded-2xl bg-white flex items-center justify-center text-[#3a2e28] shrink-0"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Interactive Storybook Stage */}
      <main className="w-full max-w-6xl flex flex-col gap-3">
        <div
          ref={stageRef}
          onPointerDown={handleStagePointerDown}
          onDoubleClick={(e) => {
            if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.bgLayer) {
              cycleBackground();
            }
          }}
          className="relative w-full aspect-[16/9] min-h-[340px] max-h-[60vh] rounded-[30px] border-[4px] border-[#3a2e28] shadow-[0_7px_0_#3a2e28] overflow-hidden bg-[#bae6fd] select-none"
        >
          {/* Background Image with smooth crossfade */}
          {activePlace && (
            <img
              key={activePlace.id}
              data-bg-layer="true"
              src={activePlace.src}
              alt={activePlace.name}
              referrerPolicy="no-referrer"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
            />
          )}

          {/* Top Stage Action Controls */}
          <div
            className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none"
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                type="button"
                onClick={() => setPlacesStripOpen((o) => !o)}
                className="storybook-btn px-4 rounded-2xl bg-[#fffaf0]/95 text-sm sm:text-base font-bold text-[#3a2e28] flex items-center gap-2"
              >
                <MapPin className="w-5 h-5 text-[#ff5946]" />
                <span>Places</span>
              </button>

              {currentPageNum <= 11 && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCharacter(pageCharacter || null);
                    setCreatorTargetPage(currentPageNum);
                    setCreatorOpen(true);
                  }}
                  className="storybook-btn px-4 rounded-2xl bg-[#ffd93d] text-sm sm:text-base font-bold text-[#3a2e28] flex items-center gap-2"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>
                    {pageCharacter
                      ? currentPageNum === 1
                        ? 'Edit Myself'
                        : `Edit Friend #${currentPageNum}`
                      : currentPageNum === 1
                      ? 'Create Myself!'
                      : `Add Friend #${currentPageNum}`}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setDrawObjectOpen(true)}
                className="storybook-btn px-4 rounded-2xl bg-[#4ade80] text-sm sm:text-base font-bold text-[#3a2e28] flex items-center gap-2"
              >
                <Pencil className="w-5 h-5" />
                <span>Draw Thing!</span>
              </button>

              {currentPageNum === 12 && (
                <button
                  type="button"
                  onClick={toggleDanceMusic}
                  className="storybook-btn px-4 rounded-2xl bg-[#ffd93d] text-sm sm:text-base font-bold text-[#3a2e28] flex items-center gap-2"
                >
                  {isMusicPlaying ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>Pause Song</span>
                    </>
                  ) : (
                    <>
                      <Music className="w-5 h-5" />
                      <span>Play Song</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="pointer-events-none hidden md:block">
              <span className="px-3.5 py-2 rounded-2xl border-2 border-[#3a2e28] bg-[#fffaf0]/90 text-xs sm:text-sm font-bold text-[#3a2e28]">
                Double-tap sky to switch place · Drag or pinch friends
              </span>
            </div>
          </div>

          {/* Visual Place Selector Strip */}
          <BackgroundStrip
            places={config.places}
            activePlaceId={currentPage.bgPlaceId}
            isOpen={placesStripOpen}
            onSelectPlace={(id) => {
              updatePage(currentPageNum, { bgPlaceId: id });
            }}
            onClose={() => setPlacesStripOpen(false)}
          />

          {/* Background Cycle Toast */}
          {bgToast && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-5 py-2 rounded-2xl border-[3px] border-[#3a2e28] bg-[#ffd93d] text-lg font-bold text-[#3a2e28] shadow-[0_4px_0_#3a2e28] pointer-events-none">
              {bgToast}
            </div>
          )}

          {/* Placed Interactive Characters */}
          {currentPage.placed.map((pc, idx) => {
            const char = characters.find((c) => c.id === pc.charId);
            if (!char) return null;
            return (
              <InteractiveCharacter
                key={pc.charId}
                character={char}
                placed={pc}
                stageRef={stageRef}
                isSelected={selectedCharId === pc.charId}
                danceMode={currentPageNum === 12}
                animIndex={idx}
                onSelect={() => {
                  setSelectedCharId(pc.charId);
                  setSelectedObjectId(null);
                  bringCharacterForward(pc.charId);
                }}
                onChange={(patch) => handlePlacedChange(pc.charId, patch)}
              />
            );
          })}

          {/* Placed Interactive Drawn Objects */}
          {(currentPage.objects || []).map((po, idx) => {
            const obj = drawnObjects.find((o) => o.id === po.objectId);
            if (!obj) return null;
            return (
              <InteractiveProp
                key={po.instanceId}
                object={obj}
                placed={po}
                stageRef={stageRef}
                isSelected={selectedObjectId === po.instanceId}
                danceMode={currentPageNum === 12}
                animIndex={idx}
                onSelect={() => {
                  setSelectedObjectId(po.instanceId);
                  setSelectedCharId(null);
                  bringObjectForward(po.instanceId);
                }}
                onChange={(patch) => handleObjectChange(po.instanceId, patch)}
                onRemove={() => removeObjectFromPage(po.instanceId)}
              />
            );
          })}

          {/* Empty stage prompt if student hasn't created character yet */}
          {currentPageNum <= 11 && !pageCharacter && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                type="button"
                onClick={() => {
                  setEditingCharacter(null);
                  setCreatorTargetPage(currentPageNum);
                  setCreatorOpen(true);
                }}
                className="pointer-events-auto storybook-btn px-7 py-4 rounded-3xl bg-[#ff5946] text-white text-xl sm:text-2xl font-bold flex items-center gap-3 shadow-[0_6px_0_#3a2e28]"
              >
                <UserPlus className="w-7 h-7" />
                <span>
                  {currentPageNum === 1
                    ? 'Tap to Create Yourself!'
                    : `Tap to Add Friend #${currentPageNum}!`}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Narrative Panel with Rolling Wheels & Read Aloud */}
        <section className="w-full rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_6px_0_#3a2e28] p-4 sm:p-5 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
            <span className="px-3.5 py-1.5 rounded-2xl border-[2.5px] border-[#3a2e28] bg-[#ffd93d] text-base sm:text-lg font-bold text-[#3a2e28] tabular-nums">
              Page {currentPageNum} / 12
            </span>
          </div>

          <div className="flex-1 w-full flex items-center justify-center">
            {renderNarrativeBuilder()}
          </div>

          <button
            type="button"
            onClick={() => speakSentence(currentSentence)}
            className="storybook-btn px-6 py-3 rounded-2xl bg-[#38bdf8] text-[#3a2e28] text-lg font-bold flex items-center justify-center gap-2 shrink-0 w-full lg:w-auto"
          >
            <Volume2 className="w-6 h-6" />
            <span>Read Aloud</span>
          </button>
        </section>

        {/* Page 12 Grand Finale Export Actions */}
        {currentPageNum === 12 && (
          <section className="w-full rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fff4dd] shadow-[0_6px_0_#3a2e28] p-5 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#3a2e28]">
                Finish &amp; Share Your Tung Chung Storybook!
              </h2>
              <p className="text-base font-medium text-[#3a2e28]/80">
                Save all 12 illustrated pages and record your dancing music video with Tung Chung.mp3.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Save My Story Card */}
              <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-white p-4 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={storySaving}
                  onClick={handleSaveStory}
                  className="storybook-btn w-full px-6 py-4 rounded-2xl bg-[#4ade80] text-[#3a2e28] text-xl font-bold flex items-center justify-center gap-2.5"
                >
                  {storySaving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Rendering Pages... {storyProgress}%</span>
                    </>
                  ) : (
                    <>
                      <BookCheck className="w-7 h-7" />
                      <span>Save My Story</span>
                    </>
                  )}
                </button>

                {storyBanner && (
                  <div className="rounded-2xl border-2 border-[#3a2e28] bg-[#dcfce7] px-4 py-2.5 text-sm sm:text-base font-bold text-[#3a2e28]">
                    {storyBanner}
                  </div>
                )}

                {storyBackup && (
                  <button
                    type="button"
                    onClick={() =>
                      downloadStoryBackupHtml(
                        storyBackup.studentName,
                        storyBackup.pagePngs,
                        storyBackup.sentences
                      )
                    }
                    className="storybook-btn w-full px-4 py-2.5 rounded-2xl bg-[#fff4dd] text-base font-bold text-[#3a2e28] flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download Backup Storybook</span>
                  </button>
                )}
              </div>

              {/* Save My Music Video Card */}
              <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-white p-4 flex flex-col gap-3">
                {!videoRecording ? (
                  <button
                    type="button"
                    onClick={handleSaveMusicVideo}
                    className="storybook-btn w-full px-6 py-4 rounded-2xl bg-[#ff5946] text-white text-xl font-bold flex items-center justify-center gap-2.5"
                  >
                    <Film className="w-7 h-7" />
                    <span>Save My Music Video</span>
                  </button>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-base font-bold text-[#3a2e28]">
                      <span>Recording Dance Video...</span>
                      <span className="tabular-nums">
                        {videoProgress}% ({videoTimeLabel})
                      </span>
                    </div>
                    <div className="w-full h-6 rounded-full border-[3px] border-[#3a2e28] bg-[#fff4dd] overflow-hidden">
                      <div
                        className="h-full bg-[#ff5946] transition-all duration-150"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => recordAbortRef.current?.abort()}
                      className="storybook-btn w-full px-4 py-2 rounded-2xl bg-white text-base font-bold text-[#3a2e28]"
                    >
                      Cancel Recording
                    </button>
                  </div>
                )}

                {videoBanner && (
                  <div className="rounded-2xl border-2 border-[#3a2e28] bg-[#dcfce7] px-4 py-2.5 text-sm sm:text-base font-bold text-[#3a2e28]">
                    {videoBanner}
                  </div>
                )}

                {videoResult && (
                  <a
                    href={videoResult.objectUrl}
                    download={`Tung-Chung-Dance-${studentName.replace(/\s+/g, '_')}.${
                      videoResult.mimeType.includes('mp4') ? 'mp4' : 'webm'
                    }`}
                    className="storybook-btn w-full px-4 py-2.5 rounded-2xl bg-[#ffd93d] text-base font-bold text-[#3a2e28] flex items-center justify-center gap-2 no-underline"
                  >
                    <Download className="w-5 h-5" />
                    <span>Save Video to iPad</span>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={creatorOpen}
        pageNumber={creatorTargetPage}
        defaultName={
          creatorTargetPage === 1
            ? 'Me'
            : pages[creatorTargetPage - 1]?.friendName || `Friend ${creatorTargetPage}`
        }
        bodies={config.bodies}
        initialCharacter={editingCharacter}
        onClose={() => {
          setCreatorOpen(false);
          setEditingCharacter(null);
        }}
        onComplete={handleCharacterComplete}
      />

      {/* Teacher Setup Mode Modal */}
      <TeacherModeModal
        isOpen={teacherOpen}
        config={config}
        onUpdateConfig={setConfig}
        onResetDefaults={() => setConfig(getDefaultConfig())}
        onClose={() => setTeacherOpen(false)}
      />

      <DrawObjectModal
        isOpen={drawObjectOpen}
        existingObjects={drawnObjects}
        onClose={() => setDrawObjectOpen(false)}
        onAddNewObject={(newObj) => {
          setDrawnObjects((prev) => [...prev, newObj]);
          placeObjectOnCurrentPage(newObj);
        }}
        onReuseObject={(obj) => {
          placeObjectOnCurrentPage(obj);
        }}
      />
    </div>
  );
}
