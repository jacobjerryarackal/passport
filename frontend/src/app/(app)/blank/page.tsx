import React from "react";

export default function BlankInternalPage() {
  return (
    <div className="w-full space-y-12 py-4">
      {/* Editorial Page Header with Thick Typographic Header & Hairline Divider */}
      <div className="space-y-4 pb-8 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#60CDFF]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#002991] dark:text-[#60CDFF]">
            Control Plane · Internal Template
          </span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-5xl text-black dark:text-white tracking-[-0.02em]">
          Internal Canvas Architecture
        </h1>
        <p className="text-base sm:text-lg text-[#6C7378] dark:text-white/60 max-w-[65ch] font-normal leading-relaxed">
          Consistent global workspace layout across all internal control-plane routes. Built with an off-black obsidian canvas (#09090B), thick typographic headers, and hairline dividers.
        </p>
      </div>

      {/* Full-width Structural Layout Section (No Generic Cards) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between py-2 border-b border-black/10 dark:border-white/10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6C7378] dark:text-white/50">
            System Canvas Properties
          </span>
          <span className="font-mono text-xs text-[#007A56] dark:text-emerald-400 font-semibold">
            [ CANVAS VERIFIED ]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10 pt-2">
          <div className="py-4 md:py-0 md:pr-8 first:md:pl-0 space-y-2">
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/50 uppercase">Dark Theme Canvas</div>
            <div className="font-display font-bold text-2xl text-black dark:text-white">#09090B</div>
            <p className="text-sm text-[#6C7378] dark:text-white/60">
              Deep off-black obsidian foundation for institutional telemetry and dispute evidence ledger.
            </p>
          </div>
          <div className="py-4 md:py-0 md:px-8 space-y-2">
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/50 uppercase">Light Theme Canvas</div>
            <div className="font-display font-bold text-2xl text-black dark:text-white">#F7F5F2</div>
            <p className="text-sm text-[#6C7378] dark:text-white/60">
              Warm white architectural canvas providing high-legibility fintech editorial contrast.
            </p>
          </div>
          <div className="py-4 md:py-0 md:pl-8 space-y-2">
            <div className="text-xs font-mono text-[#6C7378] dark:text-white/50 uppercase">Global Header Anchor</div>
            <div className="font-display font-bold text-2xl text-black dark:text-white">Deep Navy Glass</div>
            <p className="text-sm text-[#6C7378] dark:text-white/60">
              Floating rounded-full navigation with #002991/80 backdrop-blur-xl and active route indicators.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

