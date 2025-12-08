const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const Task = require("../models/Task");
const Project = require("../models/Project");

const taskRouter = express.Router({ mergeParams: true });

// Protects all routes in this router
taskRouter.use(authMiddleware);

// This section ensures that the project belongs to the currently logged in owner/user
async function getOwnedProject(projectId, userId) {
  return Project.findOne({ _id: projectId, user: userId });
}

// GET /api/projects/:projectId/tasks
// This section GETS all the tasks for a specific project thats only owned by the current user
taskRouter.get("/", async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const tasks = await Task.find({ project: projectId }).sort("createdAt");
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error fetching tasks." });
  }
});

// GET /api/projects/:projectId/tasks/:taskId
// This section allows a single task that the currently logged-in user owns to be retrieved
taskRouter.get("/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({
        message: `Task with id: ${taskId} not found in this project.`,
      });
    }

    res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).json({ message: "Server error fetching task." });
  }
});

// POST /api/projects/:projectId/tasks
// This section allows the current user to create a task within a project
taskRouter.post("/", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const newTask = await Task.create({
      project: projectId,
      title,
      description,
      status,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error creating task." });
  }
});

// PUT /api/projects/:projectId/tasks/:taskId
// This section allows the current user to update a task within a owned project
taskRouter.put("/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({
        message: `Task with id: ${taskId} not found in this project.`,
      });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error updating task." });
  }
});

// DELETE /api/projects/:projectId/tasks/:taskId
// This section allows the currently logged in user to DELETE a task within a project
taskRouter.delete("/:taskId", async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await getOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res.status(404).json({
        message: `Task with id: ${taskId} not found in this project.`,
      });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error deleting task." });
  }
});

module.exports = taskRouter;
