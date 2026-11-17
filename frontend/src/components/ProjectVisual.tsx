import type { ReactNode } from "react";
import type { ProjectVisual as Variant } from "@/content/caseStudies";
import { AreconScene } from "./AreconScene";
import { DigitalTwinScene } from "./DigitalTwinScene";
import { SmartHrScene } from "./SmartHrScene";

// Illustrative product mockups, drawn in code until approved screenshots are supplied.
// They contain no real client data; every value shown is synthetic.

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-paper text-[10px] leading-tight text-ink shadow-[0_10px_30px_-15px_rgb(2_33_98/0.35)] sm:text-[11px]">
      <div className="flex items-center justify-between border-b border-line bg-paper px-3 py-2">
        <span className="font-semibold text-navy">{title}</span>
        <span className="rounded-full bg-sky px-2 py-0.5 text-[11px] font-medium text-blue-deep">Illustrative mockup</span>
      </div>
      <div className="min-h-0 flex-1 bg-mist p-3">{children}</div>
    </div>
  );
}

const Bar = ({ w, tone = "bg-line-strong" }: { w: string; tone?: string }) => (
  <span className={`block h-1.5 rounded-full ${tone}`} style={{ width: w }} />
);

function AreconMockup() {
  return (
    <Frame title="ARECON AI · Tender report">
      <AreconScene />
    </Frame>
  );
}

function DigitalTwinMockup() {
  return (
    <Frame title="FactoryPall · Factory floor (live)">
      <div className="relative h-full">
        <DigitalTwinScene />
        <div className="absolute left-0 top-0 rounded-md border border-line bg-paper px-2 py-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-navy">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            Parcel tracking
          </span>
          <span className="mt-1 block w-20">
            <Bar w="100%" />
          </span>
        </div>
      </div>
    </Frame>
  );
}

function SmartHrMockup() {
  return (
    <Frame title="Smart HR · Hiring pipeline">
      <SmartHrScene />
    </Frame>
  );
}

export function ProjectVisual({ variant }: { variant: Variant }) {
  if (variant === "arecon") return <AreconMockup />;
  if (variant === "digital-twin") return <DigitalTwinMockup />;
  return <SmartHrMockup />;
}
