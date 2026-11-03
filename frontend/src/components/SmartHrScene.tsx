"use client";

import { at, clamp, Cursor, cursorAt, lerp, PlayToggle, press, ramp, useSceneClock, type CursorKey } from "./SceneClock";

// Looping Smart HR walkthrough: pick a role, scan the mailbox for applications, fetch the attached resumes,
// match them against the role, shortlist two candidates and send each an email. Every value shown is synthetic.

const LOOP = 19.4;
const START = 12.9; // still frame under reduced motion: four reports matched, two shortlisted

const ROLES = [
  { title: "AI Software Engineer", x: 28 },
  { title: ".NET Developer", x: 72 },
];
const ROLE_Y = 48;
const SCAN = { x: 50, y: 52, click: 3.6 };
const SEND = { x: 50, y: 92, clicks: [15, 17.1] };
const CLICKS = [1.6, SCAN.click, ...SEND.clicks];
const CURSOR: CursorKey[] = [
  [0, 88, 96],
  [1.4, ROLES[0].x, ROLE_Y],
  [1.8, ROLES[0].x, ROLE_Y],
  [3.3, SCAN.x, SCAN.y],
  [3.7, SCAN.x, SCAN.y],
  [4.6, 90, 80],
  [14.4, 90, 80],
  [14.9, SEND.x, SEND.y],
  [15.2, SEND.x, SEND.y],
  [15.9, 88, 80],
  [16.6, 88, 80],
  [17, SEND.x, SEND.y],
  [17.3, SEND.x, SEND.y],
  [18, 90, 97],
];

// Inbox rows (y is % of the work area); rows with a resume attached are fetched.
const MAIL = [true, true, false, true, true, false].map((resume, i) => ({ resume, y: 4 + i * 15 }));
const TRAY = { x: 80, y: 42 };
const RESUMES = MAIL.filter((m) => m.resume);

// Requirement matches per candidate (1 = met). The first two meet most, not all, and are shortlisted.
const CANDIDATES = [
  { initials: "AK", checks: [1, 1, 1, 0, 1], shortlisted: true },
  { initials: "RM", checks: [1, 0, 1, 1, 1], shortlisted: true },
  { initials: "JS", checks: [0, 1, 0, 0, 1], shortlisted: false },
  { initials: "PD", checks: [1, 0, 0, 1, 0], shortlisted: false },
];
const LINE_WIDTHS = ["78%", "64%", "86%", "58%", "70%"];

type Rect = [left: number, top: number, width: number, height: number];
const GRID: Rect[] = [
  [0, 0, 49, 48],
  [51, 0, 49, 48],
  [0, 52, 49, 48],
  [51, 52, 49, 48],
];
const FRONT: Rect = [20, 11, 60, 72];
const BACK: Rect = [25, 0, 50, 72];
const mix = (a: Rect, b: Rect, s: number) => a.map((v, i) => lerp(v, b[i], s)) as Rect;

function Mark({ ok }: { ok: boolean }) {
  return (
    <span className={`flex size-3 shrink-0 items-center justify-center rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`}>
      <svg viewBox="0 0 12 12" className="size-2" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d={ok ? "M3 6.2 5 8l4-4.5" : "M4 4l4 4M8 4 4 8"} />
      </svg>
    </span>
  );
}

const MailIcon = ({ className }: { className: string }) => (
  <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
    <rect x="2" y="3.5" width="12" height="9" rx="1.5" />
    <path d="m2.5 4.5 5.5 4.5 5.5-4.5" />
  </svg>
);

const Pdf = () => <span className="flex h-4 w-6 items-center justify-center rounded-sm bg-sky text-[7px] font-bold text-blue ring-1 ring-blue/30">PDF</span>;

function CandidateCard({ c, t, reveal, verdict }: { c: (typeof CANDIDATES)[number]; t: number; reveal: number; verdict: number }) {
  const score = c.checks.reduce((a, b) => a + b, 0);
  return (
    <div className="flex h-full flex-col rounded-md border border-line bg-paper p-2 shadow-sm">
      <span className="flex items-center gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-sky text-[8px] font-bold text-blue">{c.initials}</span>
        <span className="flex flex-1 flex-col gap-1">
          <span className="block h-1.5 w-[55%] rounded-full bg-line-strong" />
          <span className="text-[9px] text-muted-strong tabular-nums">{score}/5 requirements met</span>
        </span>
        {c.shortlisted && (
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700" style={{ opacity: verdict }}>
            Shortlisted
          </span>
        )}
      </span>
      <span className="mt-auto flex flex-col gap-1.5 pt-2">
        {c.checks.map((ok, r) => {
          const s = ramp(t, reveal + 0.12 * r, reveal + 0.3 + 0.12 * r);
          return (
            <span key={r} className="flex items-center gap-1.5" style={{ opacity: s }}>
              <Mark ok={ok === 1} />
              <span className="h-1.5 rounded-full" style={{ width: LINE_WIDTHS[r], background: ok ? "#34d399" : "#f87171" }} />
            </span>
          );
        })}
      </span>
    </div>
  );
}

function SendButton({ t, click, opacity, shift }: { t: number; click: number; opacity: number; shift: number }) {
  const sent = t >= click + 0.1;
  const fly = ramp(t, click + 0.1, click + 0.8);
  return (
    <>
      <span
        className={`absolute z-10 flex items-center gap-1 whitespace-nowrap rounded px-3 py-1 font-semibold text-paper ${sent ? "bg-emerald-600" : "bg-blue"}`}
        style={{ ...at(SEND.x + shift, SEND.y, `scale(${1 - 0.08 * press(t, click - 0.05, click + 0.25)})`), opacity }}
      >
        <MailIcon className="size-3" />
        {sent ? "Email sent ✓" : "Send email"}
      </span>
      {fly > 0 && fly < 1 && (
        <span className="absolute z-10 text-blue" style={{ ...at(lerp(SEND.x, 96, fly), lerp(SEND.y, 4, fly), `scale(${lerp(1, 0.6, fly)}) rotate(-18deg)`), opacity: 1 - fly * fly }}>
          <MailIcon className="size-5" />
        </span>
      )}
    </>
  );
}

export function SmartHrScene() {
  const { ref, t: clock, playing, toggle } = useSceneClock<HTMLDivElement>(START);
  const t = clock % LOOP;

  const reset = ramp(t, 18.2, 18.7);
  const pickedRole = t >= 1.6;
  const docked = ramp(t, 2.1, 2.7); // selected role moves up into the header strip
  const otherRole = 1 - ramp(t, 1.8, 2.1);
  const scanIn = ramp(t, 2.7, 3) * (1 - ramp(t, 3.7, 3.95));
  const inboxIn = ramp(t, 3.8, 4.1) * (1 - ramp(t, 7.2, 7.5));
  const scanY = clamp((t - 4.1) / 1.5) * 100;
  const trayIn = ramp(t, 5.6, 5.9) * (1 - ramp(t, 7.2, 7.5));
  const fetch = RESUMES.map((_, j) => ramp(t, 5.9 + 0.2 * j, 6.5 + 0.2 * j));
  const fetched = fetch.filter((f) => f >= 1).length;
  const matchIn = ramp(t, 7.4, 7.7) * (1 - ramp(t, 9.7, 10));
  const progress = clamp((t - 7.7) / 2);
  const verdict = ramp(t, 12.2, 12.7);
  const stack = ramp(t, 13, 13.8);
  const exit = [ramp(t, 15.4, 16), ramp(t, 17.5, 18.1)];
  const promote = ramp(t, 15.8, 16.3);
  const [cx, cy] = cursorAt(CURSOR, t);
  const cursorOpacity = Math.min(ramp(t, 0, 0.3), 1 - ramp(t, 18, 18.4));

  return (
    <div className="relative h-full">
      <div
        ref={ref}
        role="img"
        aria-label="Animated walkthrough: the AI Software Engineer role is selected, the mailbox is scanned for applications, four resumes are fetched and matched against the role, two candidates are shortlisted and each is sent an email"
        className="relative h-full overflow-hidden"
      >
        <div aria-hidden="true">
          <span className="absolute font-semibold text-navy" style={{ ...at(50, 24), opacity: ramp(t, 0.1, 0.4) * otherRole }}>
            Select a role to review applications
          </span>
          {ROLES.map((role, i) => {
            const picked = i === 0;
            const appear = ramp(t, 0.2 + 0.2 * i, 0.6 + 0.2 * i);
            const d = picked ? docked : 0;
            return (
              <span
                key={role.title}
                className={`absolute flex items-center gap-2 rounded-md border bg-paper px-2.5 shadow-sm ${picked && pickedRole ? "border-blue ring-2 ring-blue/30" : "border-line"}`}
                style={{
                  left: `${lerp(role.x, 50, d)}%`,
                  top: `${lerp(ROLE_Y, 0, d)}%`,
                  width: `${lerp(40, 100, d)}%`,
                  height: lerp(64, 36, d),
                  transform: `translate(-50%, ${lerp(-50, 0, d)}%) scale(${(1 - 0.04 * press(t, 1.55, 1.85) * (picked ? 1 : 0)) * lerp(0.94, 1, appear)})`,
                  opacity: appear * (picked ? 1 - reset : otherRole),
                }}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded bg-sky text-blue">
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
                    <rect x="2" y="5" width="12" height="8.5" rx="1.5" />
                    <path d="M5.5 5V3.5h5V5" />
                  </svg>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-navy">{role.title}</span>
                  <span className="block text-[9px] text-muted-strong">{picked && docked > 0.5 ? "Applications" : "Open role"}</span>
                </span>
              </span>
            );
          })}

          <span
            className="absolute flex items-center gap-1.5 whitespace-nowrap rounded-md bg-blue px-4 py-2 text-[11px] font-semibold text-paper shadow-[0_8px_20px_-8px_rgb(21_94_239/0.7)]"
            style={{ ...at(SCAN.x, SCAN.y, `scale(${lerp(0.9, 1, scanIn) * (1 - 0.08 * press(t, SCAN.click - 0.05, SCAN.click + 0.25))})`), opacity: scanIn }}
          >
            <MailIcon className="size-3.5" />
            Scan mail for new applications
          </span>

          {/* Work area below the role header. */}
          <div className="absolute inset-x-0 bottom-0 top-[2.75rem]">
            <div className="absolute bottom-0 left-0 top-0 w-[60%] overflow-hidden rounded-md border border-line bg-paper" style={{ opacity: inboxIn }}>
              <span className="absolute inset-x-0 h-6 bg-linear-to-b from-transparent via-blue/25 to-transparent" style={{ top: `calc(${scanY}% - 0.75rem)` }} />
            </div>
            {MAIL.map((m, i) => {
              const scanned = scanY > m.y + 6;
              const j = RESUMES.indexOf(m);
              const f = j >= 0 ? fetch[j] : 0;
              return (
                <span key={i} style={{ opacity: inboxIn }}>
                  <span
                    className={`absolute left-[1.5%] flex h-[12%] w-[57%] items-center gap-2 rounded px-2 ${scanned && m.resume ? "bg-sky/70" : ""}`}
                    style={{ top: `${m.y}%` }}
                  >
                    <MailIcon className={`size-3.5 shrink-0 ${scanned && m.resume ? "text-blue" : "text-muted-strong"}`} />
                    <span className="flex flex-1 flex-col gap-1">
                      <span className="block h-1.5 w-[45%] rounded-full bg-line-strong" />
                      <span className="block h-1.5 w-[75%] rounded-full bg-line" />
                    </span>
                  </span>
                  {m.resume && scanned && f < 1 && (
                    <span className="absolute z-10" style={{ ...at(lerp(52, TRAY.x, f), lerp(m.y + 6, TRAY.y, f), `scale(${lerp(1, 0.7, f)})`) }}>
                      <Pdf />
                    </span>
                  )}
                </span>
              );
            })}
            <span className="absolute flex w-[32%] flex-col items-center gap-1 rounded-md border border-line bg-paper p-2 text-center shadow-sm" style={{ ...at(TRAY.x, TRAY.y), opacity: trayIn }}>
              <span className="flex size-8 items-center justify-center rounded bg-sky text-blue">
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round">
                  <path d="M2 4.5h4l1.5 1.5H14v6.5H2z" />
                </svg>
              </span>
              <span className="font-semibold text-navy">Resumes</span>
              <span className="text-[9px] text-muted-strong tabular-nums">{fetched} of 4 fetched</span>
            </span>

            <span className="absolute w-[70%] rounded-md border border-line bg-paper p-2.5 shadow-sm" style={{ ...at(50, 42), opacity: matchIn }}>
              <span className="flex items-center justify-between gap-2">
                <span className="font-semibold text-navy">Matching resumes to role requirements</span>
                <span className="font-medium text-muted-strong tabular-nums">{Math.round(progress * 100)}%</span>
              </span>
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-line">
                <span className="block h-full rounded-full bg-blue" style={{ width: `${progress * 100}%` }} />
              </span>
            </span>

            {CANDIDATES.map((c, i) => {
              const appear = ramp(t, 10 + 0.12 * i, 10.4 + 0.12 * i);
              const out = 1 - ramp(t, 18.2, 18.6);
              let rect = GRID[i];
              let opacity = appear * (c.shortlisted ? 1 : lerp(1, 0.35, verdict) * (1 - stack));
              let transform = `translateY(${(1 - appear) * 8}px)`;
              let z = 1;
              if (i === 0) {
                rect = mix(GRID[0], FRONT, stack);
                opacity *= 1 - clamp((exit[0] - 0.5) / 0.5); // slide clear of the next card before fading
                transform += ` translateX(${exit[0] * 120}%) rotate(${exit[0] * 8}deg)`;
                z = 3;
              } else if (i === 1) {
                rect = mix(mix(GRID[1], BACK, stack), FRONT, promote);
                opacity *= (1 - clamp((exit[1] - 0.5) / 0.5)) * out;
                transform += ` translateX(${exit[1] * 120}%) rotate(${exit[1] * 8}deg)`;
                z = 2;
              }
              const [left, top, width, height] = rect;
              return (
                <div key={c.initials} className="absolute" style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%`, opacity, transform, zIndex: z }}>
                  <CandidateCard c={c} t={t} reveal={10.3 + 0.12 * i} verdict={verdict} />
                </div>
              );
            })}
          </div>

          <SendButton t={t} click={SEND.clicks[0]} opacity={ramp(t, 13.9, 14.2) * (1 - exit[0])} shift={exit[0] * 20} />
          <SendButton t={t} click={SEND.clicks[1]} opacity={ramp(t, 16.3, 16.6) * (1 - exit[1])} shift={exit[1] * 20} />
        </div>

        <Cursor t={t} x={cx} y={cy} opacity={cursorOpacity} clicks={CLICKS} />
      </div>
      <PlayToggle playing={playing} onToggle={toggle} />
    </div>
  );
}
