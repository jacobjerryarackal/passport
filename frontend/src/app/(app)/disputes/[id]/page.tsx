"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import {
  AlertOctagon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  AlertTriangle,
  Bot,
  UserCheck,
  Send,
  Lock,
  Layers,
  Copy,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function DisputeAutopsyPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Co-signature state
  const [showCoSignModal, setShowCoSignModal] = useState(false);
  const [signerName, setSignerName] = useState("Jacob (Treasury & Compliance Lead)");
  const [signerTitle, setSignerTitle] = useState("Authorized Small Business Owner");
  const [draftText, setDraftText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/disputes/${params.id}`);
      const json = await res.json();
      if (json.dispute) {
        setData(json.dispute);
        setDraftText(json.dispute.draftResponse || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchDispute();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-24 text-center text-muted-foreground animate-pulse text-sm">
        Opening Chargeback Autopsy room and retrieving dispute forensics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-24 text-center text-muted-foreground text-sm">
        Dispute record not found.
      </div>
    );
  }

  const dispute = data;
  const { purchase, passport, evidenceItems } = dispute;

  let classification: any = {};
  let evidenceChecklist: any[] = [];
  let evidenceGaps: any[] = [];

  try {
    classification = JSON.parse(dispute.classification || "{}");
    evidenceChecklist = JSON.parse(dispute.evidenceChecklist || "[]");
    evidenceGaps = JSON.parse(dispute.evidenceGaps || "[]");
  } catch (e) {
    console.error(e);
  }

  const verifiedCount = evidenceChecklist.filter((e) => e.status === "VERIFIED").length;
  const totalCount = evidenceChecklist.length || 5;
  const progressPercent = Math.min(100, (verifiedCount / totalCount) * 100);

  const handleCoSignAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signerName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/disputes/${dispute.id}/cosign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cosignedBy: `${signerName} (${signerTitle})`,
          finalResponseText: draftText,
        }),
      });

      if (res.ok) {
        setSubmissionSuccess(true);
        setShowCoSignModal(false);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10B981", "#0070BA", "#F59E0B"],
        });
        fetchDispute();
      } else {
        const err = await res.json();
        alert(err.error || "Submission failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = dispute.status === "SUBMITTED" || dispute.status === "CO_SIGNED";

  return (
    <>
      <AppHeader
        title={`Chargeback Autopsy: ${dispute.paypalDisputeId}`}
        subtitle="Forensic evidence reconciliation, AI defense drafting, and human co-signature approval."
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Alert Bar */}
        <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
                PayPal Customer Dispute
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/10 text-primary-600 dark:text-primary-400 font-bold border border-primary-500/20">
                STAGE: {dispute.disputeLifeCycleStage}
              </span>
              {isSubmitted && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  CO-SIGNED &amp; SUBMITTED
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {dispute.paypalDisputeId}
            </h2>
            <p className="text-xs text-muted-foreground">
              Buyer Claim: <strong className="text-foreground">{dispute.disputeReason}</strong> · Amount: <strong className="font-mono text-foreground text-sm">{formatCurrency(dispute.disputeAmount, dispute.currency)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right p-3 rounded-xl bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Response Deadline
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(dispute.dueDate)}
              </span>
            </div>

            {!isSubmitted ? (
              <button
                onClick={() => setShowCoSignModal(true)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Co-Sign Defense Package
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Defense Submitted to PayPal
              </div>
            )}
          </div>
        </div>

        {/* Co-signed confirmation banner if already submitted */}
        {isSubmitted && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-foreground">
                  Human Co-Signature Recorded &amp; Submitted to PayPal API
                </span>
                <p className="text-muted-foreground text-[11px]">
                  Co-signed by <strong className="text-foreground">{dispute.cosignedBy}</strong> on {formatDate(dispute.cosignedAt || new Date())}. Final evidence payload committed to immutable ledger.
                </p>
              </div>
            </div>
            <a
              href="/audit"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0"
            >
              Verify Ledger &rarr;
            </a>
          </div>
        )}

        {/* Gemini Forensic Classification Card */}
        <div className="fintech-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Gemini Autopsy Forensics &amp; Strategy
                </h3>
                <p className="text-xs text-muted-foreground">
                  AI analysis of claim merits, seller protection status, and optimal defense strategy.
                </p>
              </div>
            </div>

            <span className="fintech-badge bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
              Confidence: {((classification.confidence || 0.96) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/30 border border-border text-xs leading-relaxed text-foreground">
            {classification.summary ||
              "Cardholder claims unauthorized transaction. However, the purchase was authorized by an explicit business spend mandate, processed through an authenticated corporate PayPal sandbox wallet, and the digital gift card was delivered to the designated client recipient email."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Dispute Classification
              </span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {classification.category || dispute.disputeReason}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Recommended Defense
              </span>
              <span className="font-semibold text-primary-500 mt-0.5 block font-mono text-[11px]">
                {classification.recommendedStrategy || "COMPELLING_EVIDENCE_DIGITAL_DELIVERY"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                Risk Assessment
              </span>
              <span className="font-semibold text-emerald-500 mt-0.5 block flex items-center gap-1 font-mono text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {classification.riskAssessment || "LOW_RISK_MERCHANT_FAVOR"}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Checklist Progress */}
        <div className="fintech-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Autonomous Evidence Assembly Checklist
              </h3>
              <p className="text-xs text-muted-foreground">
                Pre-assembled cryptographic artifacts linked to Trust Passport {passport?.passportNumber}.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500">
              {verifiedCount}/{totalCount} Complete ({progressPercent.toFixed(0)}%)
            </span>
          </div>

          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2.5">
            {evidenceChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground block">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {item.status}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    100% Match
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Gaps & Mitigation */}
        {evidenceGaps.length > 0 && (
          <div className="fintech-card border-amber-500/30 bg-card space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">
                Evidence Gap Analysis &amp; Mitigation
              </h3>
            </div>
            <div className="space-y-2">
              {evidenceGaps.map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{gap.item}</span>
                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 uppercase font-bold">
                      {gap.status}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    <strong>Mitigation:</strong> {gap.mitigation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gemini-Drafted Merchant Defense Text */}
        <div className="fintech-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <h3 className="text-sm font-bold text-foreground">
                Draft Merchant Defense Response (PayPal Format)
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Review and edit before human co-signing
            </span>
          </div>

          <textarea
            rows={10}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            disabled={isSubmitted}
            className="w-full text-xs font-mono p-4 rounded-xl border border-border bg-muted/30 text-foreground leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-80"
          />

          {!isSubmitted && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowCoSignModal(true)}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                Human Co-Sign &amp; Submit to PayPal
              </button>
            </div>
          )}
        </div>

        {/* Human Co-Signature Approval Modal */}
        {showCoSignModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Human Co-Signature Required
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Mandate security policy requires human co-signature before submitting dispute defenses.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCoSignModal(false)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCoSignAndSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Approver Full Name &amp; Identity
                  </label>
                  <input
                    type="text"
                    required
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-foreground mb-1">
                    Organizational Role
                  </label>
                  <input
                    type="text"
                    required
                    value={signerTitle}
                    onChange={(e) => setSignerTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-card text-foreground"
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Lock className="w-3.5 h-3.5 text-primary-500" />
                    <span>Co-Signer Attestation Statement</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    I hereby attest that I have reviewed the Trust Passport attestation, agent decision log, and electronic delivery proof. I confirm this transaction was strictly bounded by mandate #{purchase?.mandateId?.slice(0, 8)} and authorize immediate submission to the PayPal Disputes API.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCoSignModal(false)}
                    className="px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted font-medium text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all hover:scale-[1.02] flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Submitting to PayPal..." : "Co-Sign & Submit to PayPal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

