/** Office location map: a keyless Google Maps embed pinned on the address, so nothing secret ships. */
export function OfficeMap({ region, address }: { region: string; address: string }) {
  const src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=16&output=embed`;

  return (
    <div className="aspect-[16/10] overflow-hidden rounded-lg border border-white/20 bg-blue-deep/40">
      {/* Lazy: the maps sit near the bottom of the page, so Google loads only as visitors scroll towards them. */}
      <iframe src={src} title={`Map of the ${region} office: ${address}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className="size-full" />
    </div>
  );
}
