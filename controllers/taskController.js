const Task = require("../models/Task");
const Project = require("../models/Project");

// This sections helps the user/owner find their currently owned project
async function findOwnedProject(projectId, userId) {
  return Project.findOne({ _id: projectId, user: userId });
}

// This section is for GET /api/projects/:projectId/tasks
// Gets/retrieves all tasks for a specific project owned by the current user
async function getTasks(req, res) {
  try {
    const { projectId } = req.params;

    const project = await findOwnedProject(projectId, req.user._id);
    if (!project) {
      return res.status(404).json({
        message: `Project with id: ${projectId} not found or not authorized.`,
      });
    }

    const tasks = await Task.find({ project: projectId }).sort("createdAt");
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Server error fetching tasks." });
  }
}

// This section is for GET /api/projects/:projectId/tasks/:taskId
// GETS/RETRIEVES a single task thats within the owned project by the current user
async function getTaskById(req, res) {
  try {
    const { projectId, taskId } = req.params;

    const project = await findOwnedProject(projectId, req.user._id);
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

    return res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({ message: "Server error fetching task." });
  }
}

// This section is for POST /api/projects/:projectId/tasks
// Allows the owner of a project to create a new task in that project
async function createTask(req, res) {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const project = await findOwnedProject(projectId, req.user._id);
    if (!project) {
      return res
        .status(404)
        .json({
          message: `Project with id: ${projectId} not found or not authorized.`,
        });
    }

    const newTask = await Task.create({
      project: projectId,
      title,
      description,
      status,
    });

    return res.status(201).json(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Server error creating task." });
  }
}

// This section is for PUT /api/projects/:projectId/tasks/:taskId
// Allows the owner of a project to update a task within that project
async function updateTask(req, res) {
  try {
    const { projectId, taskId } = req.params;

    const project = await findOwnedProject(projectId, req.user._id);
    if (!project) {
      return res
        .status(404)
        .json({
          message: `Project with id: ${projectId} not found or not authorized.`,
        });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res
        .status(404)
        .json({
          message: `Task with id: ${taskId} not found in this project.`,
        });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;

    const updatedTask = await task.save();
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(500).json({ message: "Server error updating task." });
  }
}

// This section is for DELETE /api/projects/:projectId/tasks/:taskId
// Allows only the owner of the project to delete a task in that project
async function deleteTask(req, res) {
  try {
    const { projectId, taskId } = req.params;

    const project = await findOwnedProject(projectId, req.user._id);
    if (!project) {
      return res
        .status(404)
        .json({
          message: `Project with id: ${projectId} not found or not authorized.`,
        });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });

    if (!task) {
      return res
        .status(404)
        .json({
          message: `Task with id: ${taskId} not found in this project.`,
        });
    }

    await task.deleteOne();
    return res.json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Server error deleting task." });
  }
}

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};