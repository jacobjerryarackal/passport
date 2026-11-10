"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export interface AuditLogItem {
  id: string;
  mandateId?: string;
  action: string;
  actor: string;
  actorModel?: string;
  details: string;
  eventHash: string;
  parentHash?: string;
  simulated?: boolean;
  timestamp: string;
}

export interface AuditDetailCellRendererProps {
  data?: AuditLogItem | null;
  onClose?: () => void;
}

/**
 * Audit Detail Component displaying pretty-printed JSON in premium code editor/terminal style.
 * Accepts { data } directly for drawer rendering.
 */
export const AuditDetailCellRenderer: React.FC<AuditDetailCellRendererProps> = ({
  data,
}) => {
  const [copied, setCopied] = useState(false);

  if (!data) {
    return (
      <div className="w-full h-full p-6 bg-[#0A0D14] text-white/50 font-mono text-xs flex items-center justify-center rounded-2xl border border-white/10">
        No event payload selected.
      </div>
    );
  }

  let parsedDetails: any = data.details;
  if (typeof data.details === "string") {
    try {
      parsedDetails = JSON.parse(data.details);
    } catch {
      parsedDetails = data.details;
    }
  }

  const payload = {
    eventId: data.id,
    action: data.action,
    actor: data.actor,
    actorModel: data.actorModel || "system-guard",
    mandateId: data.mandateId || null,
    timestamp: data.timestamp,
    merkleIntegrity: {
      eventHash: data.eventHash,
      parentHash: data.parentHash || "0x0000000000000000000000000000000000000000",
      isTampered: Boolean(data.eventHash?.startsWith("TAMPERED_")),
      isSimulated: Boolean(data.simulated),
    },
    payload: parsedDetails,
  };

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full p-4 bg-[#0A0D14] border border-white/10 rounded-2xl text-[#E6EDF3] font-mono text-xs overflow-hidden flex flex-col shadow-2xl">
      {/* Code Editor Header Bar */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
          </div>
          <span className="text-[11px] text-white/60 tracking-wider">
            audit_event_{data.id ? data.id.slice(0, 8) : "entry"}.json
          </span>
          <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase text-[#60CDFF] bg-[#60CDFF]/10 border border-[#60CDFF]/20">
            {data.action || "LOG_ENTRY"}
          </span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-[0.97]"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-white/60" />
              <span>Copy JSON</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body with Pre-formatted JSON */}
      <div className="flex-1 overflow-auto max-h-[calc(100vh-220px)] font-mono text-xs leading-relaxed select-text pr-2">
        <pre className="text-xs font-mono text-[#60CDFF] whitespace-pre leading-5">
          {jsonString}
        </pre>
      </div>
    </div>
  );
};

export default AuditDetailCellRenderer;
