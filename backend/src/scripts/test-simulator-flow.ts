import dotenv from "dotenv";
dotenv.config({ override: true });

import prisma from "../db/prisma";
import express from "express";
import agentRouter from "../routes/agent";
import purchasesRouter from "../routes/purchases";

async function verifySimulatorFlow() {
  console.log("=============================================================");
  console.log("   TEST SIMULATOR FLOW & PAYPAL APPROVAL REDIRECT            ");
  console.log("=============================================================");

  const app = express();
  app.use(express.json());
  app.use("/api/agent", agentRouter);
  app.use("/api/purchases", purchasesRouter);

  async function callApi(routerHandler: any, method: string, path: string, body?: any) {
    return new Promise<{ status: number; body: any }>((resolve) => {
      const req: any = {
        method,
        url: path,
        headers: { "content-type": "application/json" },
        body: body || {},
      };
      let statusCode = 200;
      const res: any = {
        status(code: number) {
          statusCode = code;
          return this;
        },
        json(data: any) {
          resolve({ status: statusCode, body: data });
        },
        setHeader() {
          return this;
        },
      };

      routerHandler.handle(req, res);
    });
  }

  // Find the $80 and $50 mandates
  const mandate80 = await prisma.mandate.findFirst({
    where: { maxAmount: 80, status: "ACTIVE" },
  });
  const mandate50 = await prisma.mandate.findFirst({
    where: { maxAmount: 50, status: "ACTIVE" },
  });

  if (!mandate80) throw new Error("Could not find active $80 mandate in database");
  console.log(`[1] Selected $80 Mandate: "${mandate80.title}" (ID: ${mandate80.id}, Cap: $${mandate80.maxAmount})`);
  if (mandate50) {
    console.log(`[1b] Found $50 Mandate: "${mandate50.title}" (ID: ${mandate50.id}, Cap: $${mandate50.maxAmount})`);
  }

  // Step 1: Agent Trigger Generation
  console.log("\n[Step 1] Simulating Inbound Business Trigger with $80 Mandate...");
  const triggerRes = await callApi(app, "POST", "/api/agent/trigger", {
    triggerText: "We just closed a deal with Acme. Please send a thank-you gift, max $80.",
    mandateId: mandate80.id,
  });

  if (triggerRes.status !== 200 || !triggerRes.body.proposal) {
    throw new Error(`Trigger generation failed: ${JSON.stringify(triggerRes.body)}`);
  }
  const prop = triggerRes.body.proposal;
  console.log(`✓ Agent synthesized proposal: "${prop.itemName}" for $${prop.amount.toFixed(2)} (${prop.category})`);

  // Step 2: Policy Gate Evaluation against $80 Mandate (Should be APPROVED)
  console.log("\n[Step 2] Sending Proposal to Policy Gate under $80 Mandate...");
  const proposeRes = await callApi(app, "POST", "/api/purchases/propose", {
    mandateId: mandate80.id,
    userPrompt: "We just closed a deal with Acme. Please send a thank-you gift, max $80.",
    proposal: prop,
  });

  if (proposeRes.status !== 200 || !proposeRes.body.validation) {
    throw new Error(`Policy evaluation failed: ${JSON.stringify(proposeRes.body)}`);
  }
  const val = proposeRes.body.validation;
  console.log(`Policy Decision: ${val.status} (Outcome: ${val.outcome})`);
  console.log(`Violation Reason: ${val.violationReason}`);
  console.log(`Checks:`, JSON.stringify(val.checks, null, 2));
  if (val.status !== "APPROVED" && val.outcome !== "ALLOW") {
    throw new Error(`Expected APPROVED, got ${val.status}`);
  }
  console.log(`  Reason: Amount ($${prop.amount.toFixed(2)}) <= $${mandate80.maxAmount.toFixed(2)} cap.`);
  const savedProposal = proposeRes.body.proposal;
  console.log(`  Saved Proposal ID: ${savedProposal.id}`);

  // Step 3: Execute PayPal Checkout (Creates order and returns approveUrl)
  console.log("\n[Step 3] Executing 'Execute PayPal Checkout' Button Flow...");
  const execRes = await callApi(app, "POST", "/api/purchases/execute", {
    proposalId: savedProposal.id,
    merchantName: prop.merchant,
    stepUpApproved: false,
  });

  if (execRes.status !== 200 || !execRes.body.approveUrl) {
    throw new Error(`PayPal execute failed: ${JSON.stringify(execRes.body)}`);
  }
  console.log(`✓ PayPal Order Created: ${execRes.body.orderId}`);
  console.log(`✓ Approval URL returned for redirection:`);
  console.log(`  ${execRes.body.approveUrl}`);

  // Step 4: Verify Policy Gate BLOCKED when testing against $50 mandate
  if (mandate50) {
    console.log("\n[Step 4] Verifying Policy Gate BLOCKED under $50 Mandate...");
    const blockedRes = await callApi(app, "POST", "/api/purchases/propose", {
      mandateId: mandate50.id,
      userPrompt: "We just closed a deal with Acme. Please send a thank-you gift, max $80.",
      proposal: prop, // $75 proposal
    });

    const blockVal = blockedRes.body.validation;
    console.log(`✓ Under $50 Mandate, Policy Decision: ${blockVal.status} (Outcome: ${blockVal.outcome})`);
    console.log(`  Violation: ${blockVal.violationReason}`);
    if (blockVal.status !== "BLOCKED") {
      throw new Error(`Expected BLOCKED under $50 mandate, got ${blockVal.status}`);
    }
  }

  console.log("\n=============================================================");
  console.log("   SIMULATOR WORKFLOW & PAYPAL CHECKOUT VERIFIED (SUCCESS)   ");
  console.log("=============================================================\n");
}

verifySimulatorFlow()
  .catch((err) => {
    console.error("SIMULATOR VERIFICATION FAILED:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
