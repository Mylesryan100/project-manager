const express = require("express");
const { authMiddleware } = require("../middlewares/auth");
const { getAllProjects, getProjectById, createProject, updateProject, deleteProject } = require("../controllers/projectController");
const Task = require("../models/Task");


const projectRouter = express.Router();

// Protects all rotes in this router
projectRouter.use(authMiddleware);

/**
 * GET /api/projects
 */
projectRouter.get("/", getAllProjects)

/**
 * GET /api/projects/:projectId
 */
projectRouter.get("/:projectId", getProjectById)
    

/**
 * POST /api/projects
 */
projectRouter.post("/", createProject) 


/**
 * PUT /api/projects/projectId
 */
projectRouter.put("/:projectId", updateProject )


/**
 * DELETE /api/projects/projectId
 */
projectRouter.delete("/:projectId", deleteProject ) 

projectRouter.post('/:projectId/tasks', async() => {
  try {
    const {projectId} = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.json({ message: "project not found" })

    if (req.user.username !== project.user)
      return resizeBy.json({message: "User not allowed to create task"})

    const newTask = await new Task.create({
      ...req.body,
      project: projectId
    })
    console.log(newTask)
    resizeBy.status(201).json(newTask)
  } catch (error) {
    
  }
})

module.exports = projectRouter;