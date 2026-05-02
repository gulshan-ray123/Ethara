import { Router } from "express";
import { createTask, dashboard, deleteTask, listTasks, updateTask } from "../controllers/taskController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { taskIdRule, taskQueryRules, taskRules, taskUpdateRules } from "../validators/taskValidators.js";

const router = Router();

router.use(protect);
router.get("/dashboard", dashboard);
router.get("/", taskQueryRules, validate, listTasks);
router.post("/", authorize("Admin"), taskRules, validate, createTask);
router.put("/:id", taskIdRule, taskUpdateRules, validate, updateTask);
router.delete("/:id", authorize("Admin"), taskIdRule, validate, deleteTask);

export default router;
