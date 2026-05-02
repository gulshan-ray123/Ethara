import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { projectIdRule, projectRules } from "../validators/projectValidators.js";

const router = Router();

router.use(protect);
router.get("/", listProjects);
router.get("/:id", projectIdRule, validate, getProject);
router.post("/", authorize("Admin"), projectRules, validate, createProject);
router.put("/:id", authorize("Admin"), projectIdRule, projectRules, validate, updateProject);
router.delete("/:id", authorize("Admin"), projectIdRule, validate, deleteProject);

export default router;
