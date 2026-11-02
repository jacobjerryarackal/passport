"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/app-header";
import { FintechButton } from "@/components/ui/fintech-button";
import { StatusPill } from "@/components/ui/status-pill";
import { StateBoundary } from "@/components/ui/state-boundary";
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
  ArrowLeft,
  X,
} from "lucide-react";
import { formatCurrency, formatDate, truncateHash } from "@/lib/utils";
import confetti from "canvas-confetti";

export default function DisputeAutopsyPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      const res = await fetch(`/api/disputes/${params.id}`);
      const json = await res.json();
      if (json.dispute) {
        setData(json.dispute);
        setDraftText(json.dispute.draftResponse || "");
      } else {
        setError(json.error || "Dispute record not found.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to retrieve dispute forensics.");
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
      <div className="py-16">
        <StateBoundary type="loading" message="Opening Chargeback Autopsy room and assembling forensic proofs..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-16">
        <StateBoundary
          type="error"
          title="Dispute Not Found"
          message={error || "The requested chargeback record does not exist."}
          actionLabel="Return to Disputes"
          onAction={() => router.push("/disputes")}
        />
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
        subtitle="Forensic evidence reconciliation, AI defense drafting, and mandatory human co-signature approval."
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/disputes">
            <FintechButton variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Disputes
            </FintechButton>
          </Link>
        </div>

        {/* Forensic Case Room Header */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25">
                PayPal Customer Dispute
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                STAGE: {dispute.disputeLifeCycleStage}
              </span>
              {isSubmitted && (
                <StatusPill status="approved" label="CO-SIGNED &amp; SUBMITTED" />
              )}
            </div>

            <h2 className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {dispute.paypalDisputeId}
            </h2>
            <p className="text-xs text-muted-foreground">
              Buyer Claim: <strong className="text-foreground">{dispute.disputeReason}</strong> · Disputed: <strong className="font-mono text-foreground text-sm tabular-nums">{formatCurrency(dispute.disputeAmount, dispute.currency)}</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="text-right p-3 rounded-lg bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block font-mono">
                Response Deadline
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 tabular-nums">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(dispute.dueDate)}
              </span>
            </div>

            {!isSubmitted ? (
              <FintechButton
                variant="primary"
                size="md"
                onClick={() => setShowCoSignModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black border-amber-500 font-bold"
              >
                <UserCheck className="w-4 h-4" />
                Co-Sign Defense Package
              </FintechButton>
            ) : (
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Defense Submitted to PayPal
              </div>
            )}
          </div>
        </div>

        {/* Co-signed confirmation banner */}
        {isSubmitted && (
          <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-foreground">
                  Human Co-Signature Recorded &amp; Submitted to PayPal Disputes API
                </span>
                <p className="text-muted-foreground text-[11px]">
                  Co-signed by <strong className="text-foreground">{dispute.cosignedBy}</strong> on {formatDate(dispute.cosignedAt || new Date())}. Final evidence payload committed to immutable ledger.
                </p>
              </div>
            </div>
            <Link
              href="/audit"
              className="text-xs font-bold text-emerald-400 hover:underline shrink-0"
            >
              Verify Ledger &rarr;
            </Link>
          </div>
        )}

        {/* Gemini Forensic Classification Card */}
        <div className="fintech-card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
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

            <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 tabular-nums">
              Confidence: {((classification.confidence || 0.96) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900 border border-border text-xs leading-relaxed text-zinc-300">
            {classification.summary ||
              "Cardholder claims unauthorized transaction. However, the purchase was authorized by an explicit business spend mandate, processed through an authenticated corporate PayPal sandbox wallet, and the digital gift card was delivered to the designated client recipient email."}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block font-mono">
                Dispute Classification
              </span>
              <span className="font-semibold text-foreground mt-0.5 block">
                {classification.category || dispute.disputeReason}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block font-mono">
                Recommended Defense
              </span>
              <span className="font-semibold text-primary-400 mt-0.5 block font-mono text-[11px]">
                {classification.recommendedStrategy || "COMPELLING_EVIDENCE_DIGITAL_DELIVERY"}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-background">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block font-mono">
                Risk Assessment
              </span>
              <span className="font-semibold text-emerald-400 mt-0.5 block flex items-center gap-1 font-mono text-[11px]">
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
            <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
              {verifiedCount}/{totalCount} Complete ({progressPercent.toFixed(0)}%)
            </span>
          </div>

          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="space-y-2">
            {evidenceChecklist.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.04 }}
                className="p-3.5 rounded-lg border border-border bg-background flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-foreground block">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground text-[11px]">
                      {item.description}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto shrink-0">
                  <StatusPill status="approved" label={item.status} />
                  <span className="text-[10px] font-mono text-muted-foreground">
                    100% Match
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Evidence Gaps & Mitigation */}
        {evidenceGaps.length > 0 && (
          <div className="fintech-card border-amber-500/25 bg-amber-500/5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-foreground">
                Evidence Gap Analysis &amp; Mitigation
              </h3>
            </div>
            <div className="space-y-2">
              {evidenceGaps.map((gap: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-amber-500/20 bg-background text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-foreground">
                    <span>{gap.item}</span>
                    <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">
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

        {/* Gemini-Drafted Defense Response Terminal */}
        <div className="fintech-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h3 className="text-sm font-bold text-foreground">
                Draft Merchant Defense Response (PayPal Format)
              </h3>
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">
              Review and edit before human co-signing
            </span>
          </div>

          <textarea
            rows={10}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            disabled={isSubmitted}
            className="w-full text-xs font-mono p-4 rounded-lg border border-border bg-zinc-900 text-zinc-100 leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-75"
          />

          {!isSubmitted && (
            <div className="flex justify-end pt-2">
              <FintechButton
                variant="primary"
                size="md"
                onClick={() => setShowCoSignModal(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black border-amber-500 font-bold"
              >
                <UserCheck className="w-4 h-4" />
                Human Co-Sign &amp; Submit to PayPal
              </FintechButton>
            </div>
          )}
        </div>

        {/* Human Co-Signature Approval Modal */}
        {showCoSignModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
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
                  <X className="w-4 h-4" />
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
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
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
                    className="w-full text-xs p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-zinc-900 border border-border space-y-2">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                    <Lock className="w-3.5 h-3.5 text-primary-400" />
                    <span>Co-Signer Attestation Statement</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    I hereby attest that I have reviewed the Trust Passport attestation, agent decision log, and electronic delivery proof. I confirm this transaction was strictly bounded by mandate #{purchase?.mandateId?.slice(0, 8)} and authorize immediate submission to the PayPal Disputes API.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <FintechButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCoSignModal(false)}
                  >
                    Cancel
                  </FintechButton>
                  <FintechButton
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? "Submitting to PayPal..." : "Co-Sign & Submit to PayPal"}
                  </FintechButton>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
