import type { Project } from "@/lib/projects";

/**
 * A stylised website preview drawn with plain divs, used until real project
 * screenshots exist. The page is taller than its frame; the card scrolls it on hover.
 */
export function MockSite({ mock }: { mock: Project["mock"] }) {
  const { brand, headline, bg, surface, accent, accent2, ink, layout } = mock;
  const muted = `color-mix(in oklab, ${ink} 45%, transparent)`;
  const faint = `color-mix(in oklab, ${ink} 12%, transparent)`;
  const bar = (w: string, h = 6, c = faint) => (
    <div className="rounded-full" style={{ width: w, height: h, background: c }} />
  );

  return (
    <div className="w-full" style={{ background: bg, color: ink }}>
      {/* nav */}
      <div className="flex items-center justify-between px-[6%] py-[3.5%]">
        <span className="font-display text-[clamp(9px,1.1vw,14px)] font-bold tracking-tight">{brand}</span>
        <div className="flex items-center gap-[6%]" style={{ width: "40%" }}>
          {bar("22%", 4)}
          {bar("22%", 4)}
          {bar("22%", 4)}
          <div className="h-[14px] w-[26%] rounded-full" style={{ background: accent }} />
        </div>
      </div>

      {/* hero */}
      {layout === "dashboard" ? (
        <div className="flex gap-[3%] px-[6%] pb-[6%] pt-[2%]">
          <div className="flex w-[22%] flex-col gap-2 rounded-lg p-[3%]" style={{ background: surface }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[8px] rounded-full" style={{ background: i === 1 ? accent : faint, width: `${60 + (i % 3) * 12}%` }} />
            ))}
          </div>
          <div className="flex-1">
            <p className="font-display text-[clamp(11px,1.6vw,22px)] font-bold leading-tight">{headline}</p>
            <div className="mt-[4%] grid grid-cols-3 gap-[3%]">
              {[accent, accent2, ink].map((c, i) => (
                <div key={i} className="rounded-lg p-[8%]" style={{ background: surface }}>
                  {bar("50%", 4)}
                  <div className="mt-2 h-[12px] w-[70%] rounded" style={{ background: `color-mix(in oklab, ${c} 80%, transparent)` }} />
                </div>
              ))}
            </div>
            <div className="mt-[4%] flex h-[90px] items-end gap-[2%] rounded-lg p-[4%]" style={{ background: surface }}>
              {[40, 65, 45, 80, 60, 95, 70, 88, 55, 100].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${h}%`, background: i % 2 ? accent : accent2, opacity: 0.85 }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : layout === "center" ? (
        <div className="px-[6%] pb-[7%] pt-[5%] text-center">
          <div className="mx-auto mb-[3%] h-[10px] w-[22%] rounded-full" style={{ background: `color-mix(in oklab, ${accent} 25%, transparent)` }} />
          <p className="font-display text-[clamp(14px,2.4vw,34px)] font-bold leading-[1.05] tracking-tight">{headline}</p>
          <div className="mx-auto mt-[3%] flex w-[50%] flex-col items-center gap-2">
            {bar("90%", 5, muted)}
            {bar("70%", 5, muted)}
          </div>
          <div className="mt-[4%] flex justify-center gap-2">
            <div className="h-[16px] w-[18%] rounded-full" style={{ background: accent }} />
            <div className="h-[16px] w-[18%] rounded-full border" style={{ borderColor: faint }} />
          </div>
          <div
            className="mx-auto mt-[6%] aspect-[16/7] w-full rounded-xl"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent2})` }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-[5%] px-[6%] pb-[7%] pt-[4%]">
          <div className="w-[48%]">
            <p className="font-display text-[clamp(14px,2.6vw,36px)] font-bold leading-[1.02] tracking-tight">{headline}</p>
            <div className="mt-[6%] flex flex-col gap-2">
              {bar("95%", 5, muted)}
              {bar("75%", 5, muted)}
            </div>
            <div className="mt-[8%] flex gap-2">
              <div className="h-[16px] w-[38%] rounded-full" style={{ background: accent }} />
              <div className="h-[16px] w-[30%] rounded-full border" style={{ borderColor: faint }} />
            </div>
          </div>
          <div
            className="relative aspect-[4/5] flex-1 overflow-hidden rounded-xl"
            style={{ background: `linear-gradient(160deg, ${accent}, ${accent2})` }}
          >
            <div className="absolute bottom-[8%] left-[8%] right-[8%] rounded-lg p-[6%] backdrop-blur" style={{ background: `color-mix(in oklab, ${surface} 70%, transparent)` }}>
              {bar("60%", 5)}
              <div className="mt-2">{bar("40%", 5, muted)}</div>
            </div>
          </div>
        </div>
      )}

      {/* logos strip */}
      <div className="flex justify-between px-[6%] py-[4%]" style={{ borderTop: `1px solid ${faint}`, borderBottom: `1px solid ${faint}` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>{bar("48px", 6)}</div>
        ))}
      </div>

      {/* cards */}
      <div className="grid grid-cols-3 gap-[3%] px-[6%] py-[6%]">
        {[0, 1, 2].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl" style={{ background: surface }}>
            <div
              className="aspect-[4/3]"
              style={{
                background: `linear-gradient(${120 + i * 40}deg, color-mix(in oklab, ${accent} ${70 - i * 15}%, ${surface}), color-mix(in oklab, ${accent2} 60%, ${surface}))`,
              }}
            />
            <div className="flex flex-col gap-2 p-[10%]">
              {bar("70%", 6, `color-mix(in oklab, ${ink} 70%, transparent)`)}
              {bar("90%", 4, muted)}
              {bar("55%", 4, muted)}
            </div>
          </div>
        ))}
      </div>

      {/* feature band */}
      <div className="mx-[6%] mb-[6%] flex items-center gap-[5%] rounded-2xl p-[5%]" style={{ background: surface }}>
        <div className="aspect-square w-[30%] rounded-xl" style={{ background: `linear-gradient(135deg, ${accent2}, ${accent})` }} />
        <div className="flex flex-1 flex-col gap-2">
          {bar("80%", 8, `color-mix(in oklab, ${ink} 80%, transparent)`)}
          {bar("95%", 4, muted)}
          {bar("85%", 4, muted)}
          {bar("60%", 4, muted)}
        </div>
      </div>

      {/* footer */}
      <div className="flex justify-between px-[6%] py-[5%]" style={{ background: surface }}>
        <span className="font-display text-[clamp(8px,1vw,12px)] font-bold">{brand}</span>
        <div className="flex w-[40%] justify-end gap-[6%]">
          {bar("20%", 4)}
          {bar("20%", 4)}
          {bar("20%", 4)}
        </div>
      </div>
    </div>
  );
}
