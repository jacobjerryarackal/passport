import { Router } from "express";
import mandatesRouter from "./mandates";
import purchasesRouter from "./purchases";
import passportsRouter from "./passports";
import disputesRouter from "./disputes";
import evidenceRouter from "./evidence";
import auditRouter from "./audit";
import paypalRouter from "./paypal";
import webhooksRouter from "./webhooks";
import demoRouter from "./demo";
import dashboardRouter from "./dashboard";
import agentRouter from "./agent";

const router = Router();

router.use("/mandates", mandatesRouter);
router.use("/purchases", purchasesRouter);
router.use("/passports", passportsRouter);
router.use("/disputes", disputesRouter);
router.use("/evidence", evidenceRouter);
router.use("/audit", auditRouter);
router.use("/paypal", paypalRouter);
router.use("/webhooks", webhooksRouter);
router.use("/demo", demoRouter);
router.use("/dashboard", dashboardRouter);
router.use("/agent", agentRouter);

export default router;

