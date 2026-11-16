"use client";

import { at, clamp, Cursor, cursorAt, lerp, PlayToggle, press, ramp, useSceneClock, type CursorKey } from "./SceneClock";

// Looping ARECON walkthrough: click upload, box-select five tender PDFs in the file picker and drag them in,
// analysis runs to 100%, the report charts build, the report is downloaded and its PDF scrolls past, then
// everything shrinks back to the upload button. Every value and line of text shown is synthetic.

const LOOP = 17.8;
const START = 10.6; // still frame under reduced motion: report built, ready to download

// Positions are % of the scene; buttons and tiles are centred on them.
const UPLOAD = { x: 50, y: 48 };
const DROP = { x: 28, y: 50 };
const DOWNLOAD = { x: 70, y: 91 };
// File picker rows (x is the row centre); the box selection catches the five PDFs but not the spreadsheet.
const FILES = ["Tender_pack.pdf", "Specification.pdf", "Drawings.pdf", "Bill_of_quantities.pdf", "Contract_terms.pdf", "Pricing.xlsx"].map((name, i) => ({
  name,
  x: 76,
  y: 28 + i * 10,
}));
const PICKED = FILES.filter((f) => f.name.endsWith(".pdf"));
const MARQUEE = { x: 58, y: 23, from: 2, to: 2.9 }; // box selection starts here and follows the cursor
const GRAB = FILES[2];
const CLICKS = [1, MARQUEE.from, 3.4, 11.3]; // upload, start the box selection, grab the files, download
const CURSOR: CursorKey[] = [
  [0, 86, 96],
  [1, UPLOAD.x, UPLOAD.y],
  [1.3, UPLOAD.x, UPLOAD.y],
  [MARQUEE.from, MARQUEE.x, MARQUEE.y],
  [MARQUEE.to, 95, 72],
  [3.3, GRAB.x, GRAB.y],
  [3.4, GRAB.x, GRAB.y],
  [4.4, DROP.x, DROP.y],
  [4.7, DROP.x, DROP.y],
  [5.8, 84, 80],
  [10.4, 84, 80],
  [11.1, DOWNLOAD.x, DOWNLOAD.y],
  [11.5, DOWNLOAD.x, DOWNLOAD.y],
  [12.2, 92, 97],
];

const BARS = [62, 88, 46, 74, 55];
const SLICES = [
  { share: 48, colour: "#0071fd" },
  { share: 32, colour: "#8db4ff" },
  { share: 20, colour: "#f59e0b" },
].map((slice, i, all) => ({ ...slice, before: all.slice(0, i).reduce((sum, s) => sum + s.share, 0) }));

const Line = ({ w, tone = "bg-line-strong" }: { w: string; tone?: string }) => <span className={`block h-1.5 rounded-full ${tone}`} style={{ width: w }} />;

function FileIcon({ name, className = "size-8 text-[8px]" }: { name: string; className?: string }) {
  const ext = name.split(".").pop()!.toUpperCase();
  return <span className={`flex shrink-0 items-center justify-center rounded font-bold ${className} ${ext === "PDF" ? "bg-sky text-blue" : "bg-emerald-50 text-emerald-700"}`}>{ext}</span>;
}

function BarChart({ t, from }: { t: number; from: number }) {
  return (
    <span className="flex min-h-0 flex-1 items-end gap-1.5 border-b border-line">
      {BARS.map((h, i) => (
        <span key={i} className="flex-1 rounded-t-sm bg-blue" style={{ height: `${h * ramp(t, from + 0.1 * i, from + 0.7 + 0.1 * i)}%` }} />
      ))}
    </span>
  );
}

function Donut({ fill, className }: { fill: number; className: string }) {
  return (
    <svg viewBox="0 0 42 42" className={className}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="7" />
      {/* Circumference is 100, so shares map straight to dash lengths; offset 25 starts at 12 o'clock. */}
      {SLICES.map((s) => (
        <circle
          key={s.colour}
          cx="21"
          cy="21"
          r="15.9155"
          fill="none"
          stroke={s.colour}
          strokeWidth="7"
          strokeDasharray={`${s.share * fill} ${100 - s.share * fill}`}
          strokeDashoffset={25 - s.before * fill}
        />
      ))}
    </svg>
  );
}

/** Chart key: placeholder lines in the app, written labels in the PDF. */
const Legend = ({ labels }: { labels?: string[] }) => (
  <span className="flex flex-1 flex-col gap-1.5">
    {SLICES.map((s, i) => (
      <span key={s.colour} className="flex items-center gap-1.5">
        <span className="size-1.5 shrink-0 rounded-full" style={{ background: s.colour }} />
        {labels ? <span className="text-ink">{labels[i]}</span> : <Line w="70%" />}
      </span>
    ))}
  </span>
);

// Sample report copy: generic tender language, no real client, project or figures.
const FINDINGS = [
  { text: "Contract value and payment terms set out in the pricing schedule", page: 14 },
  { text: "Submission deadline and programme milestones", page: 22 },
  { text: "Insurance and accreditation requirements for bidders", page: 31 },
];

const Heading = ({ children }: { children: string }) => <span className="mt-3 block text-[10px] font-semibold text-navy">{children}</span>;
const Copy = ({ children }: { children: string }) => <span className="mt-1 block leading-snug text-muted-strong">{children}</span>;

/** Two A4 sheets of the downloaded report, scrolled by the viewer. */
function ReportPages() {
  const sheet = "mx-auto min-h-[24rem] w-[84%] rounded-sm bg-paper p-[5%] text-[8.5px] shadow-[0_6px_16px_-8px_rgb(2_33_98/0.5)]";
  return (
    <>
      <div className={sheet}>
        <span className="block text-[7.5px] font-bold uppercase tracking-widest text-blue">ARECON AI</span>
        <span className="mt-1 block text-[16px] font-bold leading-tight text-navy">ARECON AI Tender Analysis Report</span>
        <span className="mt-1 block border-b border-line pb-2 text-muted-strong">Analysis of 5 tender documents · Generated automatically</span>
        <Heading>Executive summary</Heading>
        <Copy>
          This report summarises the tender documents submitted for review. ARECON AI has extracted the estimated costs, programme timeline,
          eligibility criteria, key risks and contractual obligations, and linked every finding to its source page so the bid team can verify
          it quickly.
        </Copy>
        <Heading>Scores by section</Heading>
        <span className="mt-1.5 flex h-16">
          <BarChart t={1} from={0} />
        </span>
        <span className="mt-1 flex justify-between text-muted-strong">
          {["Cost", "Programme", "Eligibility", "Risk", "Obligations"].map((l) => (
            <span key={l}>{l}</span>
          ))}
        </span>
        <Heading>Key findings</Heading>
        {FINDINGS.map((f) => (
          <span key={f.page} className="mt-1 flex items-center gap-2 border-t border-line pt-1">
            <span className="flex-1 text-ink">{f.text}</span>
            <span className="rounded bg-sky px-1 font-semibold text-blue">p. {f.page}</span>
          </span>
        ))}
      </div>
      <div className={`${sheet} mt-3`}>
        <Heading>Risk assessment</Heading>
        <span className="mt-2 flex items-center gap-3">
          <Donut fill={1} className="size-14 shrink-0" />
          <Legend labels={["Commercial", "Programme", "Compliance"]} />
        </span>
        <Copy>
          Most identified risks are commercial, relating to payment terms and price adjustment clauses. Programme risks centre on phased handover
          dates, and compliance risks on accreditation evidence required at submission.
        </Copy>
        <Heading>Obligations</Heading>
        <Copy>
          The contractor must provide monthly progress reports, maintain the specified insurance cover for the full contract term, and comply
          with the client&apos;s health, safety and environmental requirements on site.
        </Copy>
        <Heading>Programme timeline</Heading>
        <Copy>
          Mobilisation is expected shortly after contract award, followed by phased delivery and a defects period after practical completion.
          Milestone dates should be confirmed against the latest addenda.
        </Copy>
      </div>
    </>
  );
}

export function AreconScene() {
  const { ref, t: clock, playing, toggle } = useSceneClock<HTMLDivElement>(START);
  const t = clock % LOOP;

  const reset = ramp(t, 15.8, 16.6); // everything shrinks back into the upload button
  const uploadIn = t < 8 ? 1 - ramp(t, 4.5, 4.8) : ramp(t, 16.6, 17.2);
  const buttonIn = t < 8 ? 1 - ramp(t, 1.1, 1.4) : uploadIn;
  const pickerIn = ramp(t, 1.1, 1.5) * (1 - ramp(t, 4.5, 4.9));
  const [cx, cy] = cursorAt(CURSOR, t);
  const selecting = t >= MARQUEE.from && t < MARQUEE.to + 0.05;
  const selectedTo = t < MARQUEE.from ? -1 : t < MARQUEE.to ? cy : 72; // lowest point the box has reached
  const dragging = t >= 3.4 && t < 4.6;
  const dropHover = t >= 3.9 && t < 4.7;
  const fileIn = ramp(t, 4.5, 4.9);
  const progress = clamp((t - 5) / 3); // 0 to 100% in 3 s
  const docked = ramp(t, 8.2, 8.8); // file card moves from centre to the top
  const reportIn = ramp(t, 8.6, 9.1);
  const downloadIn = ramp(t, 10, 10.4);
  const pdfIn = ramp(t, 11.6, 12.1);
  const scroll = ramp(t, 12.4, 15.2);
  const cursorOpacity = Math.min(ramp(t, 0, 0.3), 1 - ramp(t, 15.4, 15.8));

  return (
    <div className="relative h-full">
      <div
        ref={ref}
        role="img"
        aria-label="Animated walkthrough: five tender PDFs are selected in a file picker and dragged into ARECON AI together, analysed to 100%, the report charts are built, and the downloaded ARECON AI Tender Analysis Report PDF scrolls past"
        className="relative h-full overflow-hidden"
      >
        <div
          aria-hidden="true"
          className={`absolute inset-[6%] rounded-lg border-2 border-dashed transition-colors ${dropHover ? "border-blue bg-sky/60" : "border-line-strong"}`}
          style={{ opacity: uploadIn }}
        />
        <span aria-hidden="true" className="absolute whitespace-nowrap text-muted-strong" style={{ ...at(UPLOAD.x, UPLOAD.y + 15), opacity: buttonIn }}>
          Drop tender documents here
        </span>
        <span
          aria-hidden="true"
          className="absolute flex items-center gap-1.5 whitespace-nowrap rounded-md bg-blue px-4 py-2 text-[11px] font-semibold text-paper shadow-[0_8px_20px_-8px_rgb(0_113_253/0.7)]"
          style={{ ...at(UPLOAD.x, UPLOAD.y, `scale(${lerp(0.7, 1, buttonIn) * (1 - 0.08 * press(t, 0.95, 1.25))})`), opacity: buttonIn }}
        >
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 11V3M4.5 6.5 8 3l3.5 3.5M3 13h10" />
          </svg>
          Upload tender
        </span>

        {/* File picker: five PDFs are box-selected, then dragged together onto the drop zone. */}
        <div aria-hidden="true" style={{ opacity: pickerIn }}>
          <div
            className="absolute bottom-[8%] left-[55%] right-[3%] top-[10%] origin-top-left rounded-lg border border-line bg-paper shadow-[0_16px_40px_-16px_rgb(2_33_98/0.5)]"
            style={{ transform: `scale(${lerp(0.92, 1, pickerIn)})` }}
          >
            <span className="flex items-center gap-1 border-b border-line px-2 py-1.5">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 rounded-full bg-line-strong" />
              ))}
              <span className="ml-1.5 font-semibold text-navy">Select files</span>
            </span>
          </div>
          {FILES.map((f) => {
            const selected = PICKED.includes(f) && selectedTo >= f.y - 4;
            return (
              <span
                key={f.name}
                className={`absolute flex w-[38%] items-center gap-1.5 rounded px-1.5 py-1 ${selected ? "bg-sky ring-1 ring-blue/40" : ""}`}
                style={{ ...at(f.x, f.y), opacity: selected && dragging ? 0.4 : 1 }}
              >
                <FileIcon name={f.name} className="size-5 text-[6px]" />
                <span className="truncate text-ink">{f.name}</span>
              </span>
            );
          })}
          {selecting && (
            <span
              className="absolute border border-blue bg-blue/10"
              style={{ left: `${MARQUEE.x}%`, top: `${MARQUEE.y}%`, width: `${cx - MARQUEE.x}%`, height: `${cy - MARQUEE.y}%` }}
            />
          )}
        </div>
        {dragging && (
          <span
            aria-hidden="true"
            className="absolute z-10"
            style={{ left: `${cx}%`, top: `${cy}%`, transform: `translate(-14%, -55%) rotate(-3deg) scale(${1 - 0.2 * ramp(t, 4.4, 4.6)})` }}
          >
            {/* Two offset sheets behind the front card read as a stack of files. */}
            <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md border border-blue/30 bg-paper" />
            <span className="absolute inset-0 translate-x-0.75 translate-y-0.75 rounded-md border border-blue/30 bg-paper" />
            <span className="relative flex items-center gap-1.5 rounded-md border border-blue/40 bg-paper px-2 py-1.5 shadow-[0_10px_24px_-10px_rgb(2_33_98/0.6)]">
              <FileIcon name={GRAB.name} />
              <span className="whitespace-nowrap font-semibold text-navy">{PICKED.length} PDF files</span>
            </span>
            <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-blue text-[8px] font-bold text-paper">{PICKED.length}</span>
          </span>
        )}

        <div aria-hidden="true" className="absolute inset-0 origin-[50%_48%]" style={{ opacity: 1 - reset, transform: `scale(${1 - 0.7 * reset})` }}>
          <div
            className="absolute left-1/2 flex h-[3.25rem] items-center gap-2.5 rounded-md border border-line bg-paper px-2.5 shadow-sm"
            style={{
              top: `${lerp(UPLOAD.y, 0, docked)}%`,
              width: `${lerp(72, 100, docked)}%`,
              transform: `translate(-50%, calc(${lerp(-50, 0, docked)}% + ${(1 - fileIn) * 8}px)) scale(${lerp(0.9, 1, fileIn)})`,
              opacity: fileIn,
            }}
          >
            <FileIcon name={GRAB.name} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-navy">{PICKED.length} tender documents</span>
                <span className={`shrink-0 font-medium tabular-nums ${progress < 1 ? "text-muted-strong" : "text-emerald-700"}`}>
                  {progress < 1 ? `Analysing… ${Math.round(progress * 100)}%` : "Analysis complete ✓"}
                </span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-blue" style={{ width: `${progress * 100}%` }} />
              </span>
            </span>
          </div>

          <div
            className="absolute inset-x-0 bottom-[19%] top-[3.75rem] flex flex-col rounded-md border border-line bg-paper p-2.5"
            style={{ opacity: reportIn, transform: `translateY(${(1 - reportIn) * 12}px)` }}
          >
            <span className="font-semibold text-navy">Tender report</span>
            <div className="mt-2 grid min-h-0 flex-1 grid-cols-2 gap-3">
              <div className="flex min-h-0 flex-col rounded-md border border-line p-2">
                <span className="font-medium text-muted-strong">Scores by section</span>
                <span className="mt-2 flex min-h-0 flex-1">
                  <BarChart t={t} from={9} />
                </span>
              </div>
              <div className="flex min-h-0 flex-col rounded-md border border-line p-2">
                <span className="font-medium text-muted-strong">Risk profile</span>
                <span className="flex min-h-0 flex-1 items-center gap-2">
                  <Donut fill={ramp(t, 9.2, 10.2)} className="h-full max-h-20 min-h-0 w-auto" />
                  <Legend />
                </span>
              </div>
            </div>
          </div>

          <span
            className="absolute flex items-center gap-1 whitespace-nowrap rounded bg-blue px-2.5 py-1 font-semibold text-paper"
            style={{ ...at(DOWNLOAD.x, DOWNLOAD.y, `scale(${1 - 0.08 * press(t, 11.25, 11.55)})`), opacity: downloadIn }}
          >
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v8M4.5 7.5 8 11l3.5-3.5M3 13h10" />
            </svg>
            Download report
          </span>

          {/* PDF viewer for the downloaded report, scrolling from page 1 into page 2. */}
          <div
            className="absolute inset-x-[3%] bottom-0 top-[3%] flex flex-col overflow-hidden rounded-t-md border border-line bg-line shadow-[0_-10px_30px_-12px_rgb(2_33_98/0.35)]"
            style={{ opacity: pdfIn, transform: `translateY(${(1 - pdfIn) * 40}px)` }}
          >
            <span className="flex items-center justify-between bg-navy px-2.5 py-1.5 text-paper">
              <span className="truncate font-medium">ARECON_AI_Tender_Analysis_Report.pdf</span>
              <span className="shrink-0 text-[9px] text-sky/80 tabular-nums">Page {scroll < 0.55 ? 1 : 2} / 2</span>
            </span>
            <div className="relative min-h-0 flex-1 overflow-hidden">
              <div className="pt-3" style={{ transform: `translateY(-${scroll * 58}%)` }}>
                <ReportPages />
              </div>
              <span className="absolute right-1 top-2 h-1/4 w-1 rounded-full bg-navy/30" style={{ transform: `translateY(${scroll * 290}%)` }} />
            </div>
          </div>
        </div>

        <Cursor t={t} x={cx} y={cy} opacity={cursorOpacity} clicks={CLICKS} />
      </div>
      <PlayToggle playing={playing} onToggle={toggle} />
    </div>
  );
}
