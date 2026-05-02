import Project from "../models/Project.js";
import Task from "../models/Task.js";

const canAccessProject = (project, user) =>
  user.role === "Admin" ||
  project.members.some((member) => member._id?.equals?.(user._id) || member.equals?.(user._id));

export const listProjects = async (req, res, next) => {
  try {
    const query =
      req.user.role === "Admin"
        ? {}
        : {
            members: req.user._id
          };

    const projects = await Project.find(query)
      .populate("members", "name email role")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, members = [] } = req.body;
    const uniqueMembers = [...new Set([...members, String(req.user._id)])];

    const project = await Project.create({
      title,
      description,
      members: uniqueMembers,
      createdBy: req.user._id
    });

    const populated = await project.populate("members", "name email role");
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { title, description, members } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    project.title = title ?? project.title;
    project.description = description ?? project.description;
    if (members) project.members = [...new Set([...members, String(req.user._id)])];

    await project.save();
    const populated = await project.populate("members", "name email role");
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (error) {
    next(error);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("members", "name email role")
      .populate("createdBy", "name email");

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (!canAccessProject(project, req.user)) {
      return res.status(403).json({ message: "You do not have access to this project" });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    res.json({ project, tasks });
  } catch (error) {
    next(error);
  }
};
