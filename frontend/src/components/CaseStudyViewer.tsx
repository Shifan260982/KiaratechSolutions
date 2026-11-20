"use client";

import { useRef } from "react";
import type { CaseStudy } from "@/content/caseStudies";
import { ArrowIcon, buttonClass } from "./ui";

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
    <article className="flex flex-col rounded-xl border border-line bg-paper p-6">
      <span className="text-sm font-semibold text-blue">Case study</span>
      <h3 className="mt-2 text-heading font-semibold text-navy">
        {study.name}: {study.title}
      </h3>
      <p className="mt-3 flex-1 leading-relaxed text-muted-strong">{study.summary}</p>
      <button type="button" onClick={open} className={`${buttonClass("secondary")} mt-5 self-start`}>
        Read the case study
        <ArrowIcon />
      </button>

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
