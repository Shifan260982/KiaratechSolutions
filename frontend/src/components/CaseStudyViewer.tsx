"use client";

import { useRef } from "react";
import type { CaseStudy } from "@/content/caseStudies";
import { ArrowIcon } from "./ui";

/** Card that opens a case study PDF in an on-page dialog, using the browser's built-in PDF viewer. */
export function CaseStudyViewer({ study }: { study: CaseStudy & { pdf: string } }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = `case-study-${study.slug}`;

  // Phones (and browsers with no inline PDF viewer) can't show the PDF in the dialog, so download it instead.
  const open = () => {
    if (navigator.pdfViewerEnabled && !window.matchMedia("(max-width: 767px)").matches) {
      dialog.current?.showModal();
      return;
    }
    const link = document.createElement("a");
    link.href = study.pdf;
    link.download = "";
    link.click();
  };

  return (
    <article className="group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-2xl bg-navy text-paper shadow-[0_24px_48px_-28px_rgb(2_33_98/0.6)] sm:min-h-[30rem]">
      {study.pdfCover && (
        // Decorative backdrop: the heading and summary carry the content.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={study.pdfCover}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover object-[82%_center] transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]"
        />
      )}
      {/* Navy scrim keeps the text readable and hides the illustration's on-screen lettering. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-navy/95 from-20% via-navy/55 via-50% to-transparent"
      />

      {/* Soft shadow keeps the text legible where the lighter fade lets the image through. */}
      <div className="p-6 [text-shadow:0_1px_12px_rgb(2_33_98/0.7)] sm:p-8">
        <h3 className="max-w-md text-2xl font-semibold leading-tight text-balance">
          <span className="block text-base font-semibold text-blue-soft">{study.name}</span>
          {study.title}
        </h3>
        <p className="mt-3 max-w-md leading-relaxed text-white/85">{study.summary}</p>
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/20 pt-5">
          <button
            type="button"
            onClick={open}
            className="inline-flex min-h-11 items-center gap-2 font-semibold text-paper after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-blue-soft focus-visible:after:ring-inset"
          >
            Read the case study
            <ArrowIcon className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </button>
          <span className="text-sm text-white/70">PDF</span>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // Close when the backdrop (the dialog element itself) is clicked.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto h-[92dvh] w-[min(64rem,94vw)] max-w-none rounded-xl bg-paper p-0 shadow-2xl backdrop:bg-navy/70"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <h2 id={titleId} className="font-semibold text-navy">
              {study.name} case study
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-11 items-center justify-center rounded-sm text-navy hover:bg-sky"
            >
              <span className="sr-only">Close</span>
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          <iframe src={`${study.pdf}#view=FitH&navpanes=0`} title={`${study.name} case study (PDF)`} className="min-h-0 flex-1 bg-mist" />
        </div>
      </dialog>
    </article>
  );
}
