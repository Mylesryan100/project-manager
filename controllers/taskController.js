const Task = require("../models/Task");
const Project = require("../models/Project");

/**
 * GET /api/projects/:projectId/tasks
 * Get all tasks for a single project (owned by logged-in user)
 */
const getAllTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Find the parent project
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id ${projectId} not found` });
    }

    // Ownership check
    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to view tasks for this project" });
    }

    const tasks = await Task.find({ project: projectId }).sort("createdAt");
    return res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/projects/:projectId/tasks/:taskId
 */
const getTaskById = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id ${projectId} not found.` });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to view this task." });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res
        .status(404)
        .json({ message: `Task with id ${taskId} not found for this project.` });
    }

    return res.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/projects/:projectId/tasks
 * Create a new task for a specific project
 */
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    // Find the parent project
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id ${projectId} not found` });
    }

    // Authorization: only owner can add tasks
    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized to add tasks to this project" });
    }

    // Create task, making sure project field is set
    const task = await Task.create({
      project: projectId,
      title,
      description,
      status: status || "todo",
    });

    // IMPORTANT: send JSON response so frontend can finish
    return res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * PUT /api/projects/:projectId/tasks/:taskId
 */
const updateTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id ${projectId} not found.` });
    }

    // Authorization
    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized!" });
    }

    // make sure task belongs to this project
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found for this project" });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    task.status = req.body.status ?? task.status;

    const updatedTask = await task.save();
    return res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return res.status(400).json({ error: error.message });
  }
};

/**
 * DELETE /api/projects/:projectId/tasks/:taskId
 */
const deleteTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id ${projectId} not found.` });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "User is not authorized!" });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found for this project" });
    }

    await task.deleteOne();
    return res.json({ message: "Task deleted" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};


















// const Task = require('../models/Task');
// const Project = require("../models/Project");



// /**
//  * Get All Tasks
//  */
// const getAllTasks = async (req, res) => {
//     try {
//         const tasks = await Task.find()
//         res.send(tasks)
//     } catch (error) {
//         res.status(500).json({error: error.message})
//     }
// }


// /**
//  * Get a single task by id
//  */
// const getTaskById = async(req, res) => {
//     try {
//         const {taskId} = req.params;
//         const task = await Task.findById(taskId);
//         if (!task) return res.status(404).json({message: "Task not found"})
       

//     // ffind the parent project
//         const project = await Project.findById(task.project);
//         if (!project)return res.status(404).json({ message: "Project of task not found" });

//     // Authorization
    
//     if (project.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "User is not authorized!" });
//     }

//     res.json(task);

//     } catch (error) {
//         res.status(500).json({error: error.message})
//     }
// }


// /**
//  * Post a new task
//  */
// //This declares an asynchronous function called createTask that takes two arguments: req (request object) and res (response object)
// const createTask = async( req,res) => {
//     //  error handling
//     try {
//         //capital T = Task model
//         //Task.create() = method to create new doc in database
//         //req.body contains the data sent by the client in the request body
//         // await is used because Task.create() is an asynchronous operation that returns a Promise, and the code waits for its resolution before proceeding.
//         //the newly created task document is then stored in the task variable w lowercase t.
//         const task = await Task.create(req.body)
//         //successful so send ok  and json(task) send new task obj back to client as json res
//             res.status(200).json(task)

//             // error occurs
//     } catch (error) {
//        res.status(400).json({error: error.message})
//     }
// }



// /**
//  * Put - Update a task
//  */
// const updateTask = async(req, res) => {
//     try {
//         const { taskId } = req.params;
//         const task = await Task.findById(taskId);

//         if (!task) return res.status(404).json({ message: "Task not found" });

//        //checking if task is rom the correct projec
//         const project = await Project.findById(task.project);
//         if (!project) return res.status(404).json({ message: "Project of task not found" });

//         //authorization
//          if (project.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "User is not authorized!" });
//     }
//         const updateTask = await Task.findByIdAndUpdate(taskId, req.body, {
//       new: true,
//     });

        
//         res.json(updateTask)
//     } catch (error) {
//         res.status(400).json({error: error.message})
//     }
// }


// /**
//  * Delete a task
//  */
// const deleteTask = async (req, res) => {
//     try {
//         const {taskId} = req.params;
//         const task = await Task.findById(taskId);
        
//         if (!task) return res.status(404).json({ message: "Task not found" });

//         const project = await Project.findById(task.project);
//         if (!project) return res.status(404).json({ message: "Project of task not found" });

//         if (project.user.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "User is not authorized!" });
//     }
//     await Task.findByIdAndDelete(taskId);
//     res.json({ message: "Task deleted" });

//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };


// module.exports = {createTask, getAllTasks, getTaskById, updateTask, deleteTask}