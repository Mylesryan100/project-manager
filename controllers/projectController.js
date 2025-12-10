const Project = require("../models/Project");

/**
 * GET projects
 */
const getAllProjects = async (req, res) => {
  try {
    const userProjects = await Project.find({ user: req.user._id });
    res.json(userProjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET project by id
 */
const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with id: ${projectId} not found!` });
    }

    // Authorization
    console.log(req.user._id);
    console.log(project.user);
    
    if (project.user.toString() !== req.user._id) {
      return res.status(403).json({ message: "User is not authorized!" });
    }

    res.json(project);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST project
 */
const createProject = async(req, res) => {
  try {
    const newProject = await Project.create({
      ...req.body,
      user: req.user._id,
    });


    res.status(201).json(newProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


/**
 * PUT - update project by id
 */
const updateProject =  async(req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if(!project){
        return res.status(404).json({message: `Project with id: ${projectId} not found!`});
    }
    //authorization
    if(project.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({message: "User is not authorized!"});
    }

    //update
    const updatedProject = await Project.findByIdAndUpdate(projectId,req.body,{ new:true });
    res.send(updatedProject);
  } catch (error) {
    console.log(error);
    res.status(500).json({error: error.message});

  }
};


/**
 * DELETE product
 */
const deleteProject = async (req, res) => {
  try {
    const {projectId} = req.params; //--> checks what ID of the project will be updated and grabs it from the url
    const project = await Project.findById(projectId); 

    if(!project){
        return res.status(404).json({message: `Project with id ${projectId} not found!`})
    }

    //authorization
     if(project.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({message: "User is not authorized!"});
    }

    await Project.findByIdAndDelete(projectId);

    res.json({message:"Project deleted."});

  } catch (error) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
};




module.exports = {getAllProjects, getProjectById, createProject, updateProject, deleteProject}