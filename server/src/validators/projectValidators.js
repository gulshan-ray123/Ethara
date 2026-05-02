import { body, param } from "express-validator";

export const projectIdRule = [param("id").isMongoId().withMessage("Invalid project id")];

export const projectRules = [
  body("title").trim().isLength({ min: 2 }).withMessage("Title must be at least 2 characters"),
  body("description").trim().isLength({ min: 3 }).withMessage("Description is required"),
  body("members").optional().isArray().withMessage("Members must be an array"),
  body("members.*").optional().isMongoId().withMessage("Member ids must be valid")
];
