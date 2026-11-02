"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { TrustPassportCredential } from "@/components/passports/trust-passport-credential";
import { StateBoundary } from "@/components/ui/state-boundary";
import { FintechButton } from "@/components/ui/fintech-button";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function PassportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPassport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/passports/${params.id}`);
      const json = await res.json();
      if (json.passport) {
        setData(json);
      } else {
        setError(json.error || "Trust Passport record not found.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load Trust Passport.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchPassport();
    }
  }, [params.id]);

  return (
    <>
      <AppHeader
        title={data?.passport ? `Trust Passport: ${data.passport.passportNumber}` : "Trust Passport Attestation"}
        subtitle="Verifiable cryptographic credential tying mandate authorization to PayPal transaction execution."
      />

      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <Link href="/passports">
            <FintechButton variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5" />
              All Passports
            </FintechButton>
          </Link>

          <button
            onClick={fetchPassport}
            className="p-2 rounded-lg border border-border bg-card hover:bg-zinc-800 text-muted-foreground hover:text-foreground transition-colors"
            title="Refresh Credential"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <StateBoundary type="loading" message="Verifying ECDSA signature and assembling attestation facets..." />
        ) : error || !data?.passport ? (
          <StateBoundary
            type="error"
            title="Passport Not Found"
            message={error || "The requested Trust Passport attestation does not exist."}
            actionLabel="Return to Passports"
            onAction={() => router.push("/passports")}
          />
        ) : (
          <TrustPassportCredential
            passport={data.passport}
            verification={data.verification}
          />
        )}
      </div>
    </>
  );
}
