import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import accomplishmentsRouter from "./accomplishments";
import insightsRouter from "./insights";
import storageRouter from "./storage";
import channelRouter from "./channel";
import transcribeRouter from "./transcribe";
import visitsRouter from "./visits";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(accomplishmentsRouter);
router.use(insightsRouter);
router.use(storageRouter);
router.use(channelRouter);
router.use(transcribeRouter);
router.use(visitsRouter);

export default router;
