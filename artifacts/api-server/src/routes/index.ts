import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import tagsRouter from "./tags";
import mediaRouter from "./media";
import operatorRouter from "./operator";
import vaultRouter from "./vault";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(tagsRouter);
router.use(mediaRouter);
router.use(operatorRouter);
router.use(vaultRouter);
router.use(adminRouter);
router.use(dashboardRouter);

export default router;
