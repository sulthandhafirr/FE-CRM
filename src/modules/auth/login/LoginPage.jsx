import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import LoginForm from "./LoginForm";

const CAROUSEL_LENGTH = 4;
const SHEET_PEEK_PX = 36;
const SNAP_THRESHOLD = 0.55;

function MobileBottomSheet() {
  const sheetRef = useRef(null);
  const cleanupTimerRef = useRef(null);
  const dragStateRef = useRef({
    active: false,
    startY: 0,
    startTranslate: 0,
    translate: 0,
  });
  const [sheetMode, setSheetMode] = useState("collapsed");

  const getCollapsedTranslate = () => {
    const node = sheetRef.current;

    if (!node) {
      return 0;
    }

    return Math.max(0, node.getBoundingClientRect().height - SHEET_PEEK_PX);
  };

  const handlePointerMove = (event) => {
    if (!dragStateRef.current.active) {
      return;
    }

    const node = sheetRef.current;

    if (!node) {
      return;
    }

    const collapsedTranslate = getCollapsedTranslate();
    const nextTranslate = Math.min(
      collapsedTranslate,
      Math.max(
        0,
        dragStateRef.current.startTranslate +
          (event.clientY - dragStateRef.current.startY),
      ),
    );

    dragStateRef.current.translate = nextTranslate;
    node.style.transform = `translate3d(0, ${nextTranslate}px, 0)`;
  };

  const endDrag = () => {
    const node = sheetRef.current;

    if (!node || !dragStateRef.current.active) {
      return;
    }

    const collapsedTranslate = getCollapsedTranslate();
    const currentTranslate = dragStateRef.current.translate;
    const dragDistance = currentTranslate - dragStateRef.current.startTranslate;
    let nextMode = sheetMode;

    if (Math.abs(dragDistance) >= 24) {
      nextMode =
        currentTranslate <= collapsedTranslate * SNAP_THRESHOLD
          ? "expanded"
          : "collapsed";
    }

    const targetTranslate = nextMode === "expanded" ? 0 : collapsedTranslate;

    dragStateRef.current.active = false;
    node.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)";
    node.style.transform = `translate3d(0, ${targetTranslate}px, 0)`;
    setSheetMode(nextMode);

    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
    }

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", endDrag);
    window.removeEventListener("pointercancel", endDrag);

    cleanupTimerRef.current = window.setTimeout(() => {
      if (sheetRef.current) {
        sheetRef.current.style.transition = "";
        sheetRef.current.style.transform = "";
      }
    }, 280);
  };

  const startDrag = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    const node = sheetRef.current;

    if (!node) {
      return;
    }

    if (cleanupTimerRef.current) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    const collapsedTranslate = getCollapsedTranslate();

    dragStateRef.current = {
      active: true,
      startY: event.clientY,
      startTranslate: sheetMode === "expanded" ? 0 : collapsedTranslate,
      translate: sheetMode === "expanded" ? 0 : collapsedTranslate,
    };

    node.style.transition = "none";
    node.style.willChange = "transform";

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  useEffect(() => {
    const node = sheetRef.current;

    if (!node) {
      return undefined;
    }

    const applySnap = () => {
      if (dragStateRef.current.active) {
        return;
      }

      const collapsedTranslate = getCollapsedTranslate();
      node.style.transform = `translate3d(0, ${
        sheetMode === "expanded" ? 0 : collapsedTranslate
      }px, 0)`;
    };

    applySnap();

    window.addEventListener("resize", applySnap);
    window.visualViewport?.addEventListener("resize", applySnap);

    return () => {
      window.removeEventListener("resize", applySnap);
      window.visualViewport?.removeEventListener("resize", applySnap);
    };
  }, [sheetMode]);

  return (
    <>
      <button
        type="button"
        onClick={() => setSheetMode("expanded")}
        aria-label="Expand login form"
        className={`fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white/90 text-[#132440] shadow-[0_10px_24px_rgba(0,0,0,0.2)] backdrop-blur transition-all duration-200 md:hidden ${
          sheetMode === "expanded"
            ? "pointer-events-none translate-y-2 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        <ChevronUp size={22} strokeWidth={2.5} />
      </button>

      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-40 h-[66dvh] max-h-[calc(100dvh-0.5rem)] rounded-t-4xl border border-white/60 bg-white/95 shadow-[0_-24px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl transition-transform duration-300 ease-out md:hidden ${
          sheetMode === "expanded"
            ? "translate-y-0"
            : "translate-y-[calc(100%-4.25rem)]"
        }`}
        style={{ touchAction: "pan-y" }}
      >
        <div className="flex h-full flex-col overflow-hidden px-5 pb-[calc(1.15rem+env(safe-area-inset-bottom))] pt-2">
          <div className="relative mb-5 flex items-center justify-center min-h-[48px]">
            <button
              type="button"
              onPointerDown={startDrag}
              aria-label="Drag bottom sheet"
              className="absolute top-0 left-1/2 h-8 w-24 -translate-x-1/2 cursor-grab active:cursor-grabbing"
            />
            <button
              type="button"
              onClick={() => setSheetMode("collapsed")}
              aria-label="Collapse login form"
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 shadow-sm transition md:hidden ${
                sheetMode === "expanded"
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            >
              <ChevronDown size={18} strokeWidth={2.5} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    {
      title: t("pages.login.carousel.aiAssistant"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.monitoringDashboard"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.ticketClassification"),
      version: t("pages.login.version"),
    },
    {
      title: t("pages.login.carousel.duplicateDetection"),
      version: t("pages.login.version"),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_LENGTH);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_LENGTH);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + CAROUSEL_LENGTH) % CAROUSEL_LENGTH,
    );
  };

  const currentImage = images[currentImageIndex];

  return (
    <>
      <div className="relative min-h-dvh overflow-hidden bg-[#FF8040] text-white md:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(19,36,64,0.18),transparent_28%)]" />

        <div className="relative flex min-h-dvh flex-col px-8 pb-44 pt-10">
          <div className="absolute left-5 top-5 z-20 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#132440_0%,#BF092F_100%)] text-lg font-bold shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
              C
            </div>
            <div>
              <div className="text-base font-semibold tracking-[0.3em]">
                {t("pages.login.brand.crm")}
              </div>
              <div className="text-[10px] font-medium tracking-[0.3em] text-white/80">
                {t("pages.login.brand.system")}
              </div>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center text-center">
            <div className="flex max-w-[20rem] flex-col items-center gap-4 px-2">
              <h1 className="text-3xl font-semibold uppercase tracking-[0.18em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
                {currentImage.title}
              </h1>
              <p
                className="w-25 rounded-full px-5 py-2 text-xs font-semibold tracking-widest text-white whitespace-nowrap"
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
              >
                {t("pages.login.versionLabel")} {currentImage.version}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={prevImage}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
          >
            <ChevronLeft size={18} strokeWidth={2.75} />
          </button>

          <button
            type="button"
            onClick={nextImage}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
          >
            <ChevronRight size={18} strokeWidth={2.75} />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentImageIndex === idx ? "w-8 bg-white" : "w-2 bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        <MobileBottomSheet />
      </div>

      <div className="hidden min-h-dvh w-full overflow-hidden bg-white md:flex">
        <div className="relative flex flex-1 overflow-hidden bg-[#FF8040] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(19,36,64,0.18),transparent_28%)]" />

          <div className="relative flex h-full w-full flex-col px-12 pt-12 pb-8">
            <div className="absolute left-5 top-5 z-20 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#132440_0%,#BF092F_100%)] text-xl font-bold shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
                C
              </div>
              <div>
                <div className="text-xl font-semibold tracking-[0.35em]">
                  {t("pages.login.brand.crm")}
                </div>
                <div className="text-[10px] font-medium tracking-[0.35em] text-white/80">
                  {t("pages.login.brand.system")}
                </div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-center text-center">
              <div className="flex max-w-xl flex-col items-center gap-5 px-6">
                <h1 className="text-4xl font-semibold uppercase tracking-[0.18em] drop-shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
                  {currentImage.title}
                </h1>
                <p
                  className="w-30 rounded-full px-6 py-2.5 text-sm font-semibold tracking-widest text-white whitespace-nowrap"
                  style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                >
                  {t("pages.login.versionLabel")} {currentImage.version}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
            >
              <ChevronLeft size={18} strokeWidth={2.75} />
            </button>

            <button
              type="button"
              onClick={nextImage}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20"
            >
              <ChevronRight size={18} strokeWidth={2.75} />
            </button>

            <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    currentImageIndex === idx ? "w-8 bg-white" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center overflow-hidden bg-white px-8 py-12">
          <LoginForm />
        </div>
      </div>
    </>
  );
}