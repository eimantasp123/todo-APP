let db;
let dbInitializedCallback;

/**
 * Initialize the database
 */
const initDatabase = () => {
  const request = indexedDB.open("userDataDb", 1);
  request.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("users", { keyPath: "email" });
    objectStore.createIndex("name", "name", { unique: false });
  };
  request.onsuccess = function (event) {
    db = event.target.result;
    if (dbInitializedCallback) {
      dbInitializedCallback();
    }
  };
  request.onerror = function (event) {
    console.error("Database error: " + event.target.errorCode);
  };
};

// Initialize the database
initDatabase();

/**
 * Register callback to be called once database is initialized
 * @param {Function} callback - Callback function
 */
export const onDatabaseInitialized = (callback) => {
  dbInitializedCallback = callback;
};

/**
 * Perform database operations with provided mode and action
 */
const performDatabseOperation = async (operation) => {
  try {
    if (!db) throw new Error("Database is not initialized");
    const transaction = db.transaction(["users"], operation.mode);
    const objectStore = transaction.objectStore("users");
    return await operation.action(objectStore);
  } catch (error) {
    console.error("Database operation error: " + error.message);
    throw error;
  }
};
/**
 * Save user data to the database
 * @param {Object} user - User data to be saved
 */
export const saveUserData = async (user) => {
  try {
    await performDatabseOperation({
      mode: "readwrite",
      action: (objectStore) => objectStore.add(user),
    });
  } catch (err) {
    console.error("Error adding user to databse." + err.message);
  }
};

/**
 * Check if an email exists in the database
 * @param {string} email - Email to be checked
 */
export const isEmailExists = async (email) => {
  return new Promise(async (resolve, reject) => {
    const user = await performDatabseOperation({
      mode: "readonly",
      action: (objectStore) => objectStore.get(email),
    });
    user.onsuccess = (event) => {
      const user = event.target.result;
      resolve(user !== undefined);
    };
    user.onerror = (event) => {
      console.error("Error checking email existence in database: " + event.target.error);
      reject(event.target.error);
    };
  });
};

/**
 * Check login credentials in the database
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<boolean>} - Resolves to true if credentials are valid
 */
export const checkLoginFieldsInDatabase = async (email, password) => {
  return new Promise((resolve, reject) => {
    performDatabseOperation({
      mode: "readonly",
      action: (objectStore) => {
        const request = objectStore.get(email);
        request.onsuccess = (event) => {
          const user = event.target.result;
          if (user && user.password === password) {
            resolve(true);
          } else if (user && user.password !== password) {
            reject(new Error("Incorrect password. Please check your password"));
          } else {
            reject(new Error("We could not find your user. Please try checking the fields!"));
          }
        };
      },
    });
  });
};

/**
 * Find the logged-in user in the database
 * @returns {Promise<Object|null>} - Resolves to the logged-in user object or null if not found
 */
export const findLoggedInUser = function () {
  return new Promise((resolve, reject) => {
    performDatabseOperation({
      mode: "readonly",
      action: (objectStore) => {
        const request = objectStore.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            const user = cursor.value;
            if (user.loginSuccess === true) {
              resolve(user);
            } else {
              cursor.continue();
            }
          } else {
            resolve(null);
          }
        };
        request.onerror = (event) => {
          reject("We could not find your user. Please try checking the fields!" + event.target.error);
        };
      },
    });
  });
};

/**
 * Update user data in the database
 * @param {string} oldEmail - User's old email
 * @param {string} newEmail - User's new email (if changed)
 * @param {Object} updateUserData - Updated user data
 * @returns {Promise<Object>} - Resolves to the updated user data
 */
export const updateUserInDB = async (oldEmail, newEmail, updateUserData) => {
  return new Promise((resolve, reject) => {
    try {
      performDatabseOperation({
        mode: "readwrite",
        action: async (objectStore) => {
          const request = objectStore.get(oldEmail);
          request.onsuccess = async (event) => {
            const userDB = event.target.result;
            if (userDB) {
              if (newEmail) {
                await objectStore.delete(oldEmail);
                await objectStore.add({ ...updateUserData, email: newEmail });
              } else {
                await objectStore.put({ ...userDB, ...updateUserData });
              }
              resolve(updateUserData);
            } else {
              reject(new Error("User not found in database"));
            }
          };
        },
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Find if a task ID exists in the database
 * @param {string} email - User's email
 * @param {number} id - Task ID to be checked
 * @returns {Promise<boolean>} - Resolves to true if task ID exists, otherwise false
 */
export const findExistTaskId = async (email, id) => {
  return new Promise((resolve, reject) => {
    performDatabseOperation({
      mode: "readonly",
      action: (objectStore) => {
        const request = objectStore.get(email);
        request.onsuccess = (event) => {
          const user = event.target.result;
          if (user) {
            const task = user.tasks.find((task) => task.id === id);
            if (task) {
              resolve(true);
            }
            if (!task) {
              resolve(false);
            }
          } else {
            reject();
          }
        };
      },
    });
  });
};

/**
 * Update user object in the database
 * @param {string} email - User's email
 * @param {string} key - Key to update (tasks, deleteTask, completedTask, loginSuccess)
 * @param {any} data - data to update
 * @returns {Promise<Object>} - Resolves to the updated user data
 */
export const updateUserObjectByKeyInDB = async (email, key, data) => {
  return new Promise((resolve, reject) => {
    performDatabseOperation({
      mode: "readwrite",
      action: (objectStore) => {
        const request = objectStore.get(email);
        request.onsuccess = (event) => {
          const userDb = event.target.result;
          if (userDb) {
            userDb[key] = data;
            objectStore.put(userDb).onsuccess = () => resolve(userDb);
          } else {
            reject(new Error("User not found in database"));
          }
        };
      },
    });
  });
};
