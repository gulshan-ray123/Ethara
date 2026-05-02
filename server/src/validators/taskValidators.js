import { body, param, query } from "express-validator";

export const taskIdRule = [param("id").isMongoId().withMessage("Invalid task id")];

export const taskRules = [
  body("title").trim().isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),
  body("description").trim().isLength({ min: 3 }).withMessage("Description is required"),
  body("projectId").isMongoId().withMessage("Project is required"),
  body("assignedTo").isMongoId().withMessage("Assigned user is required"),
  body("status").optional().isIn(["To Do", "In Progress", "Completed"]).withMessage("Invalid status"),
  body("dueDate").isISO8601().withMessage("Due date is required")
];

export const taskUpdateRules = [
  body("title").optional().trim().isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),
  body("description").optional().trim().isLength({ min: 3 }).withMessage("Description is required"),
  body("projectId").optional().isMongoId().withMessage("Project must be valid"),
  body("assignedTo").optional().isMongoId().withMessage("Assigned user must be valid"),
  body("status").optional().isIn(["To Do", "In Progress", "Completed"]).withMessage("Invalid status"),
  body("dueDate").optional().isISO8601().withMessage("Due date must be valid")
];

export const taskQueryRules = [
  query("status").optional().isIn(["To Do", "In Progress", "Completed"]).withMessage("Invalid status"),
  query("assignedTo").optional().isMongoId().withMessage("Assigned user must be valid"),
  query("projectId").optional().isMongoId().withMessage("Project must be valid"),
  query("dueDate").optional().isISO8601().withMessage("Due date must be valid")
];
