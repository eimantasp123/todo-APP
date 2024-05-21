import LoginPage from "./view/loginPage.js";
import * as BusinessLogic from "./BusinessLogic.js";
import Dashboard from "./view/Dashboard.js";
import Dashboard_TaskManagement from "./view/Dashboard_TaskManagement.js";

/**
 * Control Login System
 * Handles user login process, updates login status, and redirects user upon successful login.
 */
const controlLoginSystem = () => {
  LoginPage._signInHandler(async (email, password) => {
    try {
      const success = await BusinessLogic.CheckLogin(email, password);
      if (success) {
        await BusinessLogic.UpdateUserLoginStatusInDB(email, true);
        LoginPage._cleanSignInInputs();
        handleUserLogin();
      }
    } catch (error) {
      console.error(`LOGIN ERROR -- ${error}`);
      LoginPage._renderMessage(error, "SignIn", "");
    }
  });
};

/**
 * Control Registration System
 * Handles user registration process, validates data, and registers the user.
 */
const controlRegistrationSystem = () => {
  LoginPage._registrationHandler(async (name, email, password) => {
    try {
      const success = await BusinessLogic.RegisterUser(name, email, password);
      if (success) {
        LoginPage._cleanRegistrationsInputs();
        LoginPage._switchLoginOverlay();
        setTimeout(() => {
          LoginPage._renderMessage("Registration successful. You can now log in.", "SignIn", "success");
        }, 1000);
      }
    } catch (error) {
      console.error(`REGISTRATION ERROR -- ${error}`);
      LoginPage._renderMessage(error, "SignUp", "");
    }
  });
};

/**
 * Handle User Login
 * Checks if a user is logged in and redirects to the dashboard. Otherwise, shows the login page.
 */
const handleUserLogin = async () => {
  try {
    const user = await BusinessLogic.findLoggedInUserInDB();
    if (user) {
      handelDashboard(user);
    } else {
      LoginPage._render();
      controlLoginSystem();
      controlRegistrationSystem();
    }
  } catch (error) {
    console.error(`HANDLE USER LOGIN ERROR -- ${error.message}`);
  }
};

/**
 * Handle User Logout
 * Logs out the current user and redirects to the login page.
 */
const signOutHandler = async () => {
  try {
    const user = await BusinessLogic.findLoggedInUserInDB();
    if (user) {
      await BusinessLogic.UpdateUserLoginStatusInDB(user.email, false);
      handleUserLogin();
    }
  } catch (error) {
    console.error(`SIGN OUT ERROR -- ${error.message}`);
  }
};

/**
 * Handle User Dashboard
 * Renders the user dashboard and sets up event handlers.
 */
const handelDashboard = async (user) => {
  try {
    Dashboard.uploadUserData(user);
    Dashboard_TaskManagement.uploadUserData(user);
    Dashboard.singOutHandler(signOutHandler);
  } catch (errorMessage) {
    console.error(`HANDLE DASHBOARD ERROR -- ${errorMessage}`);
  }
};

/**
 * Update User Account Details
 * Updates user account details and handles the response.
 */
const handleUserAccountDetails = async (data) => {
  try {
    const newUserData = await BusinessLogic.UpdateUserAccData(data);
    Dashboard.renderButtonSpiner();
    setTimeout(() => {
      Dashboard.removeButtonSpiner();
      Dashboard.uploadUserData(newUserData);
    }, 2000);
  } catch (error) {
    console.error(`UPDATE USER ACCOUNT ERROR -- ${error.message}`);
    Dashboard.renderAccountErrorMessage(error.message);
  }
};

/**
 * Update User Account Image
 * Updates the user's profile image.
 */
const handleUserAccountDetailsImage = async (imgData) => {
  try {
    const newUserImg = await BusinessLogic.UpdateUserAccImage(imgData);
    Dashboard.renderImageSpiner();
    setTimeout(() => {
      Dashboard.renderImageSpinerDone();
      Dashboard.uploadUserData(newUserImg);
    }, 2500);
  } catch (error) {
    console.error(`UPDATE USER IMAGE ERROR -- ${error.message}`);
  }
};

/**
 * Handle Task Form Submission
 * Handles the submission of the task form, updating or creating tasks.
 */
const handlerTaskForm = async (TaskFormData) => {
  try {
    let newUserData;
    let taskId;
    if (TaskFormData.id) {
      newUserData = await BusinessLogic.updateTaskInDB(TaskFormData);
      taskId = TaskFormData.id;
    } else {
      newUserData = await BusinessLogic.uploadUserTasks(TaskFormData);
      taskId = newUserData.tasks.find((task) => task.title === TaskFormData.title && task.date === TaskFormData.date).id;
    }
    if (newUserData) {
      const taskDate = new Date(TaskFormData.date);
      const isCurrentMonth = taskDate.getFullYear() === Dashboard_TaskManagement.currentDate.getFullYear() && taskDate.getMonth() === Dashboard_TaskManagement.currentDate.getMonth();
      if (!isCurrentMonth) {
        const increment = (taskDate.getFullYear() - Dashboard_TaskManagement.currentDate.getFullYear()) * 12 + (taskDate.getMonth() - Dashboard_TaskManagement.currentDate.getMonth());
        Dashboard_TaskManagement.updateMonth(increment);
      }
      Dashboard_TaskManagement.uploadUserData(newUserData, true);
      Dashboard_TaskManagement.scrollToTask(taskId);
      Dashboard_TaskManagement.cleanAndcloseTaskPopup();
    }
  } catch (error) {
    console.error(`HANDLE TASK FORM ERROR -- ${error.message}`);
    Dashboard_TaskManagement.renderAddTaskErrorMessage(error.message);
  }
};

/**
 * Handle Task Deletion
 * Deletes a specified task and handles any errors.
 */
const handleTaskDelete = async (taskDelete) => {
  try {
    await BusinessLogic.deleteTask(taskDelete);
  } catch (error) {
    console.error(`DELETE TASK ERROR -- ${error.message}`);
  }
};

/**
 * Handle Task Completion
 * Marks a specified task as completed and handles any errors.
 */
const handleTaskDone = async (taskDone) => {
  try {
    await BusinessLogic.doneTask(taskDone);
  } catch (error) {
    console.error(`TASK COMPLETION ERROR -- ${error.message}`);
  }
};

/**
 * Initialize Application
 * Starts the application by setting up handlers and loading user data.
 */
const init = function () {
  handleUserLogin();
  Dashboard.singOutHandler(signOutHandler);
  Dashboard.updateUserAccoutnDetails(handleUserAccountDetails);
  Dashboard.updateUserAccountImage(handleUserAccountDetailsImage);
  Dashboard_TaskManagement.handlerTaskForm(handlerTaskForm);
  Dashboard_TaskManagement.setDeleteTaskHandler(handleTaskDelete);
  Dashboard_TaskManagement.setDoneTaskHandler(handleTaskDone);
};

/**
 * Initialize Database
 * Sets up the database and calls the provided callback function upon initialization.
 */
const initController = function () {
  BusinessLogic.DatabseInitialized(init);
};

// Attach Initialization Handler to DOM
LoginPage._addHandlerRender(initController);
