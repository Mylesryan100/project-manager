const Project = require("../models/Project");

// This section is to GET /api/projects
// GETS/RETRIEVES all projects for the currently logged in user
async function getProjects(req, res) {
  try {
    const projects = await Project.find({ user: req.user._id }).sort(
      "createdAt"
    );
    return res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return res.status(500).json({ message: "Server error fetching projects." });
  }
}

// this section is to GET /api/projects/:projectId
// Adds the functionality to GET a single project
// and also enforces ownership
async function getProjectById(req, res) {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found.` });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "User does not have authorization to view this project.",
      });
    }

    return res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ message: "Server error fetching project." });
  }
}

// This is for the functionality for POST /api/projects
// This section allows the currently logged in user to create a new project
async function createProject(req, res) {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const newProject = await Project.create({
      name,
      description,
      user: req.user._id,
    });

    return res.status(201).json(newProject);
  } catch (error) {
    console.error("Error creating project:", error);
    return res.status(500).json({ message: "Server error creating project." });
  }
}
// Section and functionality for PUT /api/projects/:projectId
// This section allows the owner/user to edit their project
async function updateProject(req, res) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found.` });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to update this project." });
    }

    project.name = req.body.name ?? project.name;
    project.description = req.body.description ?? project.description;

    const updatedProject = await project.save();
    return res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return res.status(500).json({ message: "Server error updating project." });
  }
}

// This adds functionality to the DELETE /api/projects/:projectId
// Allows only the owner/user to delete their project
async function deleteProject(req, res) {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found.` });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to delete this project." });
    }

    await project.deleteOne();
    return res.json({ message: "Project deleted successfully." });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ message: "Server error deleting project." });
  }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
