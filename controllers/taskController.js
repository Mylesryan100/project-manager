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
      return res
        .status(404)
        .json({
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

async function getTaskById(req, res) {
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

    return res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({ message: "Server error fetching task." });
  }
}
