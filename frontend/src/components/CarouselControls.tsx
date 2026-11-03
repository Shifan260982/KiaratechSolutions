"use client";

/** Slide dots plus a pause/play toggle, centred at the bottom of a full-bleed slider. */
export function CarouselControls({
  labels,
  index,
  onSelect,
  autoplayOn,
  onToggle,
  controlsId,
}: {
  labels: string[];
  index: number;
  onSelect: (i: number) => void;
  autoplayOn: boolean;
  onToggle: () => void;
  controlsId: string;
}) {
  return (
    <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-3 md:bottom-8">
      <ul className="flex items-center gap-1 rounded-full bg-navy/45 px-2 py-1 backdrop-blur-sm">
        {labels.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              aria-controls={controlsId}
              aria-current={i === index ? "true" : undefined}
              aria-label={`Show slide ${i + 1}: ${label}`}
              onClick={() => onSelect(i)}
              className="group flex h-8 items-center px-1.5"
            >
              <span
                aria-hidden="true"
                className={`block h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === index ? "w-8 bg-paper" : "w-1.5 bg-paper/50 group-hover:bg-paper/80"
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onToggle}
        aria-label={autoplayOn ? "Pause slideshow" : "Play slideshow"}
        className="flex size-10 items-center justify-center rounded-full bg-navy/45 text-paper backdrop-blur-sm transition-colors hover:bg-navy/70"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5" fill="currentColor">
          {autoplayOn ? <path d="M4 3h3v10H4zM9 3h3v10H9z" /> : <path d="M5 3l8 5-8 5z" />}
        </svg>
      </button>
    </div>
  );
}
