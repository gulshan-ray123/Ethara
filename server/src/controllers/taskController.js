import Project from "../models/Project.js";
import Task from "../models/Task.js";

const isProjectMember = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;
  return project.members.some((member) => member.equals(userId)) ? project : false;
};

export const listTasks = async (req, res, next) => {
  try {
    const { status, assignedTo, dueDate, projectId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (projectId) query.projectId = projectId;
    if (dueDate) {
      const start = new Date(dueDate);
      const end = new Date(dueDate);
      end.setDate(end.getDate() + 1);
      query.dueDate = { $gte: start, $lt: end };
    }

    if (req.user.role !== "Admin") {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("projectId", "title")
      .sort({ dueDate: 1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, description, projectId, assignedTo, status, dueDate } = req.body;
    const project = await Project.findById(projectId);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!project.members.some((member) => member.equals(assignedTo))) {
      return res.status(400).json({ message: "Assigned user must be a project member" });
    }

    const task = await Task.create({ title, description, projectId, assignedTo, status, dueDate });
    const populated = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "projectId", select: "title" }
    ]);

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role !== "Admin") {
      const isAssignee = task.assignedTo.equals(req.user._id);
      const allowedMemberFields = Object.keys(req.body).every((field) => field === "status");
      if (!isAssignee || !allowedMemberFields) {
        return res.status(403).json({ message: "Members can only update their own task status" });
      }
    }

    const nextProject = req.body.projectId ?? task.projectId;
    const nextAssignee = req.body.assignedTo ?? task.assignedTo;

    if (req.user.role === "Admin" && (req.body.projectId || req.body.assignedTo)) {
      const project = await Project.findById(nextProject);
      if (!project) return res.status(404).json({ message: "Project not found" });
      if (!project.members.some((member) => member.equals(nextAssignee))) {
        return res.status(400).json({ message: "Assigned user must be a project member" });
      }
    }

    Object.assign(task, {
      title: req.body.title ?? task.title,
      description: req.body.description ?? task.description,
      projectId: nextProject,
      assignedTo: nextAssignee,
      status: req.body.status ?? task.status,
      dueDate: req.body.dueDate ?? task.dueDate
    });

    await task.save();
    const populated = await task.populate([
      { path: "assignedTo", select: "name email" },
      { path: "projectId", select: "title" }
    ]);

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};

export const dashboard = async (req, res, next) => {
  try {
    const query = req.user.role === "Admin" ? {} : { assignedTo: req.user._id };
    const now = new Date();
    const [total, completed, pending, overdue, assignedTasks] = await Promise.all([
      Task.countDocuments(query),
      Task.countDocuments({ ...query, status: "Completed" }),
      Task.countDocuments({ ...query, status: { $ne: "Completed" } }),
      Task.countDocuments({ ...query, status: { $ne: "Completed" }, dueDate: { $lt: now } }),
      Task.find({ assignedTo: req.user._id })
        .populate("projectId", "title")
        .populate("assignedTo", "name email")
        .sort({ dueDate: 1 })
        .limit(8)
    ]);

    res.json({ total, completed, pending, overdue, assignedTasks });
  } catch (error) {
    next(error);
  }
};
