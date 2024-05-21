import * as Database from "./Database.js";

/**
 * Initialize database and start application
 * @param {Function} callback - Callback function to be called after database initialization
 */
export const DatabseInitialized = function (callback) {
  Database.onDatabaseInitialized(callback);
};

// Utility function to validate email
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}
// Validate registration fields
const checkRegistrationFields = async (name, email, password) => {
  const errors = [];
  if (!password && !name && !email) throw new Error("All fields are empty. Please fill in everything");
  if (name.length <= 2) errors.push("Please enter at least 2 characters for name field.");
  if (email.length <= 5 || !validateEmail(email)) errors.push("Email is too short or incorrect.");
  if (password.length <= 8) errors.push("Please enter at least 9 characters for passwrord field.");
  if (errors.length > 0) throw new Error(errors.join("\n"));
};

/**
 * Register new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {boolean} - Returns true if registration is successful
 * @throws {string} - Error message if registration fails
 */
export const RegisterUser = async function (name, email, password) {
  try {
    const emailExists = await Database.isEmailExists(email);
    if (emailExists) throw new Error("Email already exists. Please use a different email address.");
    await checkRegistrationFields(name, email, password);
    const user = {
      id: null,
      img: "img/nouser.png",
      firstname: name,
      lastname: "",
      email: email,
      password: password,
      phone: "",
      birthday: "",
      loginSuccess: false,
      tasks: [],
      completedTask: [],
      deleteTask: [],
    };
    Database.saveUserData(user);
    return true;
  } catch (error) {
    throw error.message;
  }
};

/**
 * Check login
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {boolean} - Returns true if login is successful
 * @throws {string} - Error message if login fails
 */
export const CheckLogin = async (email, password) => {
  try {
    const loginValid = await Database.checkLoginFieldsInDatabase(email, password);
    if (loginValid) {
      console.log("1working");
      await Database.updateUserObjectByKeyInDB(email, "loginSuccess", true);
      console.log("2working");
      return true;
    }
  } catch (err) {
    throw err.message;
  }
};

/**
 * Update user login status
 * @param {string} email - User's email
 * @param {boolean} loginStatus - Login status to be updated (true/false)
 */
export const UpdateUserLoginStatusInDB = async (email, loginStatus) => {
  try {
    console.log("3working");
    await Database.updateUserObjectByKeyInDB(email, "loginSuccess", loginStatus);
    console.log("4working");
  } catch (error) {
    console.error("Error updating user login status" + error.message);
    throw error;
  }
};

/**
 * Find logged-in user
 * @returns {Object} - Logged-in user data
 */
export const findLoggedInUserInDB = async () => {
  try {
    return await Database.findLoggedInUser();
  } catch (error) {
    throw error;
  }
};

// Validate user profile fields
const checkUserProfileFields = async (name, email, password) => {
  let errors = [];
  if (name.length <= 2) errors.push("Please enter at least 2 characters for name field.");
  if (email.length <= 5 || !validateEmail(email)) errors.push("Email is too short or incorrect.");
  if (password.length <= 8) errors.push("Please enter at least 9 characters for passwrord field.");
  if (errors.length > 0) throw new Error(errors.join("\n"));
};

/**
 * Update user data
 * @param {Object} formData - Form data with user details
 * @returns {Object} - Updated user data
 */
export const UpdateUserAccData = async (formData) => {
  try {
    const loggedInUser = await Database.findLoggedInUser();
    if (!loggedInUser) throw new Error("Logged-in user not found.");
    if (loggedInUser.password !== formData.password || loggedInUser.email !== formData.email || loggedInUser.firstname !== formData.firstname) {
      await checkUserProfileFields(formData.firstname, formData.email, formData.password);
    }
    if (loggedInUser.email !== formData.email && (await Database.isEmailExists(formData.email))) {
      throw new Error("Email already exists. Please use a different email address.");
    }
    const updatedUserData = { ...loggedInUser, ...formData };
    let newUser;
    if (loggedInUser.email !== formData.email) {
      newUser = await Database.updateUserInDB(loggedInUser.email, formData.email, updatedUserData);
    } else {
      newUser = await Database.updateUserInDB(loggedInUser.email, false, updatedUserData);
    }
    return newUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile image
 * @param {Object} image - Image data to be updated
 * @returns {Object} - Updated user data
 */
export const UpdateUserAccImage = async (image) => {
  try {
    const loggedInUser = await Database.findLoggedInUser();
    if (!loggedInUser) throw new Error("Logged-in user not found.");
    // Update the user data with the form data
    const updatedUserData = { ...loggedInUser, ...image };
    // Update the user data in IndexedDB
    const newUser = await Database.updateUserInDB(loggedInUser.email, false, updatedUserData);
    return newUser;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
};

/**
 * Generate unique ID for tasks
 * @returns {number} - Generated ID
 */
function generateId() {
  return Math.floor(Math.random() * 100000);
}

/**
 * Check for task time conflicts
 * @param {Object} newTask - New task data
 * @param {Array} existingTasks - Existing tasks array
 */
const checkTimeConflict = (newTask, existingTasks) => {
  const time_5 = 300;
  const time_23 = 1380;
  const [hoursStr, minutesStr] = newTask.time.split(":");
  const duration = +newTask.duration * 60;
  const newTaskStart = parseInt(hoursStr, 10) * 60 + parseInt(minutesStr, 10);
  const newTaskEnd = newTaskStart + duration;
  if (newTaskStart < time_5 || newTaskEnd > time_23) {
    throw new Error("Tasks can only be added between 05:00 and 23:00");
  }
  const conflictingTask = existingTasks.find((task) => {
    const [taskHoursStr, taskMinutesStr] = task.time.split(":");
    const taskStart = parseInt(taskHoursStr, 10) * 60 + parseInt(taskMinutesStr, 10);
    const taskEnd = taskStart + +task.duration * 60;
    const isSameDate = task.date === newTask.date;
    const isConflict = isSameDate && newTaskStart < taskEnd && newTaskEnd > taskStart;
    return isConflict;
  });
  if (conflictingTask) {
    throw new Error(`The time slot you selected conflicts with: 
      TITLE -- (${conflictingTask.title}) 
      COMPLETION TIME -- (${conflictingTask.time}) 
      DATE -- (${conflictingTask.date}).`);
  }
};

/**
 * Upload user tasks
 * @param {Object} data - Task data to be uploaded
 * @returns {Object} - Updated user data
 */
export const uploadUserTasks = async (data) => {
  try {
    const loggedInUser = await Database.findLoggedInUser();
    if (!loggedInUser) throw new Error("Logged-in user not found.");
    checkTimeConflict(data, loggedInUser.tasks);
    let id;
    do {
      id = generateId();
    } while (await Database.findExistTaskId(loggedInUser.email, id));
    //
    const updateUserData = { ...data, id: id };
    loggedInUser.tasks.push(updateUserData);
    return await Database.updateUserObjectByKeyInDB(loggedInUser.email, "tasks", loggedInUser.tasks);
  } catch (error) {
    throw error;
  }
};

/**
 * Update task in DB
 * @param {Object} updatedTask - Updated task data
 * @returns {Object} - Updated user data
 */
export const updateTaskInDB = async (updatedTask) => {
  try {
    const loggedInUser = await Database.findLoggedInUser();
    if (!loggedInUser) throw new Error("Logged-in user not found.");
    //
    const taskExcludingUpdated = loggedInUser.tasks.filter((task) => +task.id !== +updatedTask.id);
    checkTimeConflict(updatedTask, taskExcludingUpdated);
    //
    const userTasks = loggedInUser.tasks.map((task) => {
      if (+task.id === +updatedTask.id) {
        return { ...task, ...updatedTask };
      }
      return task;
    });
    //
    return await Database.updateUserObjectByKeyInDB(loggedInUser.email, "tasks", userTasks);
  } catch (error) {
    throw error;
  }
};

/**
 * Modify tasks in user object based on action type
 * @param {number} taskId - ID of the task to be modified
 * @param {string} key - Data key name on userobject
 * @returns {Object} - Updated user object
 */
const taskAction = async (taskId, key) => {
  try {
    const loggedInUser = await Database.findLoggedInUser();
    if (!loggedInUser) throw new Error("Logged-in user not found.");
    //
    const currentTask = loggedInUser.tasks.find((task) => +task.id === +taskId);
    if (!currentTask) throw new Error("Task not found.");
    //
    loggedInUser[key] = loggedInUser[key] || [];
    loggedInUser[key].push(currentTask);
    loggedInUser.tasks = loggedInUser.tasks.filter((task) => +task.id !== +taskId);
    return loggedInUser;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete task
 * @param {number} taskDelete - ID of the task to be deleted
 */
export const deleteTask = async (taskDelete) => {
  try {
    const newUser = await taskAction(taskDelete, "deleteTask");
    if (newUser) {
      await Database.updateUserObjectByKeyInDB(newUser.email, "tasks", newUser.tasks);
      return await Database.updateUserObjectByKeyInDB(newUser.email, "deleteTask", newUser.deleteTask);
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Mark task as done
 * @param {number} taskDone - ID of the task to be marked as done
 */
export const doneTask = async (taskDone) => {
  try {
    const newUser = await taskAction(taskDone, "completedTask");
    if (newUser) {
      await Database.updateUserObjectByKeyInDB(newUser.email, "tasks", newUser.tasks);
      return await Database.updateUserObjectByKeyInDB(newUser.email, "completedTask", newUser.completedTask);
    }
  } catch (error) {
    throw error;
  }
};
