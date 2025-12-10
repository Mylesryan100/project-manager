const express = require('express');
const { authMiddleware } = require('../middlewares/auth');
const { createTask, getAllTasks, getTaskById, updateTask, deleteTask } = require('../controllers/taskController');


const taskRouter = express.Router();

// Protects all rotes in this router
taskRouter.use(authMiddleware);

/**
 * GET /api/projects/:projectId/tasks
 */

taskRouter.get("/", getAllTasks );



/**
 * Get /api/projects/:projectId/tasks/:taskId
 */
taskRouter.get("/:taskId", getTaskById)


/**
 * POST /api/projects/:projectId/tasks
 */
taskRouter.post("/", createTask )



/**
 * PUT /api/projects/:projectId/tasks/taskId
 */

taskRouter.put('/:taskId', updateTask)

/**
 * DELETE /api/projects/:projectId/tasks/taskId
 */
taskRouter.delete('/:taskId', deleteTask)

module.exports = taskRouter