const Project = require("../models/Project");

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
      return res
        .status(403)
        .json({
          message: "User does not have authorization to view this project.",
        });
    }

    return res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({ message: "Server error fetching project." });
  }
}
