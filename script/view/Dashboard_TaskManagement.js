class Dashboard_TaskManagement {
  user_data;
  isScrollingToTask = false;
  _container = document.querySelector(".container");
  _loginContainer = document.querySelector(".login-page");

  constructor() {
    this.init();
    this.currentDate = new Date();
  }

  /**
   * Initialize task management by setting up event listeners
   */
  init() {
    this.controlAllButtonForTaskForm();
    this.refreshPage();
  }

  /**
   * Upload user data and render the dashboard
   * @param {Object} user - User data
   * @param {boolean} isScrolling - Whether to scroll to the task
   */
  uploadUserData(user, isScrolling = false) {
    this.isScrollingToTask = isScrolling;
    this.user_data = user;
    this.renderDashboard();
    this.isScrollingToTask = false;
  }

  /**
   * Render the dashboard with the current user data
   */
  renderDashboard() {
    this.scrollTopMonth();
    this.scrollTime();
    this.renderCurrentMonthDataOnDOM();
    this.renderCurrentTimeDataOnDom();
    this.renderTaskOnDashboard();
    this.renderTaskDashboardContainer();
    this.initTaskContainerScroll();
    this.initTaskContainerDrag();
    this.updateHeaderMonth();
    this.switchMonthOnDashboard();
    if (!this.isScrollingToTask) {
      this.activeContainer();
      this.activeTimeContainer();
    }
    this.updateTaskDashboard();
    this.renderTaskIn_7Days();
    this.renderTaskInCurrentMonth();
  }

  /**
   * Handle task form submission
   * @param {Function} handler - Handler function for task form submission
   */
  handlerTaskForm(handler) {
    this._container.querySelector("#task-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      const data = Object.fromEntries([...formData]);
      handler(data);
    });
  }

  /**
   * Render error message for adding tasks
   * @param {string} message - Error message to display
   */
  renderAddTaskErrorMessage(message = "") {
    const errorContainer = this._container.querySelector(".popup-error");
    const formBtn = this._container.querySelector("#task-form button");
    const markup = `
    <div class="popup-error__container">
    <i class="fa-solid fa-xmark"></i>
    <span>Oops! Error adding new task </span>
    <p>${message}</p>
    <button>Try again</button>
    </div>
    `;
    formBtn.classList.add("hidden");
    errorContainer.classList.remove("hidden");
    errorContainer.insertAdjacentHTML("beforeend", markup);
    const exitBtn = this._container.querySelector(".popup-error__container button");
    exitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      formBtn.classList.remove("hidden");
      errorContainer.classList.add("hidden");
      errorContainer.innerHTML = "";
    });
  }

  /**
   * Render tasks on the dashboard based on user data
   */
  renderTaskOnDashboard() {
    const data = this.user_data;
    const dashbordEmptyContainer = this._container.querySelector(".content-data__empty");
    const dashbordContainer = this._container.querySelector(".content-data__items");
    const indicator = this._container.querySelector(".time-line-indicator");
    if (!data) return;
    if (data.tasks.length === 1) {
      if (dashbordEmptyContainer) dashbordEmptyContainer.classList.add("hidden");
      if (dashbordContainer) dashbordContainer.classList.remove("hidden");
      if (indicator) indicator.style.visibility = "visible";
    }
    if (data.tasks.length > 1) {
      if (dashbordEmptyContainer) dashbordEmptyContainer.classList.add("hidden");
      if (dashbordContainer) dashbordContainer.classList.remove("hidden");
    }
    if (data.tasks.length === 0) {
      if (dashbordContainer) dashbordContainer.classList.add("hidden");
      if (indicator) indicator.style.visibility = "hidden";
      if (dashbordEmptyContainer) dashbordEmptyContainer.classList.remove("hidden");
      this.activeContainer();
      this.activeTimeContainer();
    }
  }

  /**
   * Toggle the visibility of the task form container
   * @param {HTMLElement} container - The task form container element
   */
  toggleContainerVisibility(container) {
    const formTitle = this._container.querySelector("#form-title");
    const form = this._container.querySelector("#task-form");
    const formContainer = this._container.querySelector("#task-form-button");
    const formId = this._container.querySelector("#task-id");
    return function (event) {
      event.preventDefault();
      formTitle.textContent = "Create Task";
      formContainer.textContent = "Add Task";
      formId.value = "";
      form.reset();
      container.classList.toggle("hidden");
    };
  }

  /**
   * Set up event listeners for task form buttons
   */
  controlAllButtonForTaskForm() {
    const container = this._container.querySelector(".background-add-task-popup");
    const addBtnHeader = this._container.querySelector(".content-data__add-task");
    const addBtnDashboard = this._container.querySelector(".empty-dash__add-task");
    const exitTasks = this._container.querySelectorAll(".exit-task");
    addBtnHeader.addEventListener("click", this.toggleContainerVisibility(container));
    exitTasks.forEach((el) => {
      el.addEventListener("click", this.toggleContainerVisibility(container));
    });
    if (addBtnDashboard) {
      addBtnDashboard.addEventListener("click", this.toggleContainerVisibility(container));
    }
  }

  /**
   * Clean and close the task form popup
   */
  cleanAndcloseTaskPopup() {
    const form = this._container.querySelector("#task-form");
    form.reset();
    this._container.querySelector(".background-add-task-popup").classList.toggle("hidden");
  }

  /**
   * Switch to next or preview month
   */
  switchMonthOnDashboard() {
    const nextBtn = this._container.querySelector(".next-month");
    const previewBtn = this._container.querySelector(".preview-month");
    //
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.updateMonth(1);
      console.log("Next");
    });
    //
    previewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.updateMonth(-1);
      console.log("Preview");
    });
  }

  /**
   * Update the current month by a given increment (positive for next month, negative for previous month)
   * @param {number} increment - The increment to update the month by
   */
  updateMonth(increment) {
    this.currentDate.setMonth(this.currentDate.getMonth() + increment);
    this.renderCurrentMonthDataOnDOM();
    this.renderTaskDashboardContainer();
    this.updateHeaderMonth();
    this.updateTaskDashboard();
  }

  /**
   * Get the current month's data
   * @returns {Array} - Array of days in the current month
   */
  getCurrentMonthData() {
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();
    const adjustedDate = new Date(currentYear, currentMonth);
    const currentMonthFull = adjustedDate.toLocaleString("default", { month: "short" });
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
      monthDays.push({ day: day, dayOfWeek: dayOfWeek, month: currentMonthFull });
    }
    return monthDays;
  }

  /**
   * Render the current month's data on the DOM
   */
  renderCurrentMonthDataOnDOM() {
    const monthContainer = this._container.querySelector("#month-container");
    const monthDays = this.getCurrentMonthData();
    monthContainer.innerHTML = monthDays
      .map(
        (day) => `
      <div class="fullday" data-day="${day.day}">
        <p class="week-day">${day.dayOfWeek},</p>
        <p class="calendor-day">${day.day} ${day.month}</p>
      </div>
    `
      )
      .join("");
  }

  /**
   * Update the header with the current month and week number
   */
  updateHeaderMonth() {
    const monthTitle = this._container.querySelector(".content-header__data--year");
    const weekTitle = this._container.querySelector(".content-header__data--week");
    const currentDate = new Date(this.currentDate);
    const year = currentDate.getFullYear();
    const currentDayOfWeek = currentDate.getDay();
    const monthName = currentDate.toLocaleString("default", { month: "long" });
    currentDate.setDate(currentDate.getDate() + (6 - currentDayOfWeek));
    const dayOfYear = Math.floor((currentDate - new Date(year, 0, 0)) / 86400000) + 1;
    const weekNumber = Math.ceil(dayOfYear / 7);
    monthTitle.innerHTML = `${monthName}`;
    weekTitle.innerHTML = `(W${weekNumber})`;
  }

  /**
   * Render the task dashboard container
   */
  renderTaskDashboardContainer() {
    const containerTask = this._container.querySelector(".content-data__items__overflow");
    const timeContainer = this._container.querySelectorAll(".time");
    const countDays = this.getCurrentMonthData();
    const timeContainerHeight = Array.from(timeContainer).reduce((acc, element) => acc + element.offsetHeight, 0);
    //
    containerTask.innerHTML = countDays
      .map(
        (day) => `
      <div class="content-data__items-container" data-day="${day.day} ${day.month}" id="${day.day} ${day.month}" style="height: ${timeContainerHeight}px"></div>
    `
      )
      .join("");
  }

  /**
   * Activate the container for the current day
   */
  activeContainer() {
    if (this.isScrollingToTask) return;
    const monthContainer = this._container.querySelectorAll(".fullday");
    const scrollBarTop = this._container.querySelector("#month-container");
    const day = this.currentDate.getDate();
    // const day = 2;
    let currentContainer;
    monthContainer.forEach((element) => {
      if (+element.dataset.day === day) {
        element.classList.add("active");
        currentContainer = element;
      }
    });
    if (currentContainer) {
      const currentDayWidth = currentContainer.offsetWidth;
      const scrollPostion = (day - 2) * currentDayWidth - 27;
      scrollBarTop.scrollLeft = scrollPostion;
    }
    this.isScrollingToContainer = false;
  }

  /**
   * Render the current time data on the DOM
   */
  renderCurrentTimeDataOnDom() {
    const timeContainer = this._container.querySelector("#time-container");
    const times = this.getTimeInHour();
    timeContainer.innerHTML = times
      .map(
        (time) => `
      <div class="time" data-time="${time}">
        <p class="time__hour">${time}</p>
      </div>
    `
      )
      .join("");
  }

  /**
   * Get time in hourly format
   * @returns {Array} - Array of hourly time strings
   */
  getTimeInHour() {
    const hoursOfDay = [];
    for (let hour = 3; hour < 27; hour++) {
      const time = new Date();
      time.setHours(hour);
      time.setMinutes(0);
      hoursOfDay.push(time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false }));
    }
    return hoursOfDay;
  }

  /**
   * Activate the time container for the current time
   */
  activeTimeContainer() {
    if (this.isScrollingToTask) return;
    const timeContainer = this._container.querySelectorAll(".time");
    if (!timeContainer) return;
    const timeLineIndicator = this._container.querySelector(".time-line-indicator");
    const timeScrollBar = this._container.querySelector(".content-data__time-data");
    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    // const hours = 7;
    // const minutes = 0;
    const totalMinutes = hours * 60 + minutes;
    const startTimeMin = 300;
    const endTimeMin = 1440;
    let scrollStart = 84; // Scrollbar position at 05:00 o'clock -- START (PX)
    let timeContainerheigt = 0;
    timeContainer.forEach((element) => {
      timeContainerheigt += element.offsetHeight;
    });
    const pxPerMin = timeContainerheigt / (timeContainer.length * 60);
    if (totalMinutes >= startTimeMin && totalMinutes < endTimeMin) {
      const minutesPassed = totalMinutes - startTimeMin;
      scrollStart += minutesPassed * pxPerMin;
    } else {
      scrollStart = 84;
    }
    timeScrollBar.scrollTop = scrollStart;
    const rectTimeLine = timeLineIndicator.getBoundingClientRect();
    let closestTimeContainer;
    let closestDistance = rectTimeLine.top + 2.4 - 72; //
    let furthestDistance = 228;
    timeContainer.forEach((timeContainer) => {
      const rectTimeContainer = timeContainer.getBoundingClientRect();
      if (rectTimeContainer.top <= closestDistance && rectTimeContainer.top >= furthestDistance) {
        closestTimeContainer = timeContainer;
      }
    });
    timeContainer.forEach((timeContainer) => {
      timeContainer.classList.remove("active");
    });
    closestTimeContainer.classList.add("active");
    this.isScrollingToTime = false;
  }

  /**
   * Initialize task container scroll behavior
   */
  initTaskContainerScroll() {
    const taskContainer = this._container.querySelector(".content-data__items__overflow");
    let startScrollTop;
    let startScrollLeft;
    taskContainer.addEventListener("scroll", () => {
      const scrollTop = taskContainer.scrollTop;
      const scrollLeft = taskContainer.scrollLeft;
      if (startScrollTop !== undefined && scrollTop !== startScrollTop) {
        const timeContainer = this._container.querySelector("#time-container");
        timeContainer.scrollTop = scrollTop;
      }
      if (startScrollLeft !== undefined && scrollLeft !== startScrollLeft) {
        const monthContainer = this._container.querySelector("#month-container");
        monthContainer.scrollLeft = scrollLeft;
      }
      startScrollTop = scrollTop;
      startScrollLeft = scrollLeft;
    });
  }

  /**
   * Initialize task container drag behavior
   */
  initTaskContainerDrag() {
    const taskContainer = this._container.querySelector(".content-data__items__overflow");
    let isDragging = false;
    let startX;
    let startY;
    let startScrollLeft;
    let startScrollTop;
    const startDragging = (e) => {
      isDragging = true;
      startX = e.pageX - taskContainer.offsetLeft;
      startY = e.pageY - taskContainer.offsetTop;
      startScrollLeft = taskContainer.scrollLeft;
      startScrollTop = taskContainer.scrollTop;
    };
    const handleDragging = (e) => {
      if (!isDragging) return;
      const mouseX = e.pageX - taskContainer.offsetLeft;
      const mouseY = e.pageY - taskContainer.offsetTop;
      const deltaX = mouseX - startX;
      const deltaY = mouseY - startY;
      taskContainer.scrollLeft = startScrollLeft - deltaX;
      taskContainer.scrollTop = startScrollTop - deltaY;
    };
    const stopDragging = () => {
      isDragging = false;
    };
    taskContainer.addEventListener("mousedown", startDragging);
    window.addEventListener("mousemove", handleDragging);
    window.addEventListener("mouseup", stopDragging);
  }

  /**
   * Scroll to the top of the month view
   */
  scrollTopMonth() {
    const monthContainer = this._container.querySelector("#month-container");
    const taskDashboardContainer = this._container.querySelector(".content-data__items__overflow");
    let isMouseDown = false;
    let startX;
    let scrollLeft;
    monthContainer.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      startX = e.pageX - monthContainer.offsetLeft;
      scrollLeft = monthContainer.scrollLeft;
    });
    monthContainer.addEventListener("mouseleave", () => {
      isMouseDown = false;
    });
    monthContainer.addEventListener("mouseup", () => {
      isMouseDown = false;
    });
    monthContainer.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const x = e.pageX - monthContainer.offsetLeft;
      const walk = x - startX;
      monthContainer.scrollLeft = scrollLeft - walk;
    });
    monthContainer.addEventListener("scroll", () => {
      taskDashboardContainer.scrollLeft = monthContainer.scrollLeft;
    });
  }

  /**
   * Scroll to the current time view
   */
  scrollTime() {
    const timeContainer = this._container.querySelector("#time-container");
    const taskDashboardContainer = this._container.querySelector(".content-data__items__overflow");
    let isMouseDown = false;
    let startY;
    let scrollTop;
    timeContainer.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      startY = e.pageY - timeContainer.offsetTop;
      scrollTop = timeContainer.scrollTop;
    });
    timeContainer.addEventListener("mouseleave", () => {
      isMouseDown = false;
    });
    timeContainer.addEventListener("mouseup", () => {
      isMouseDown = false;
    });
    timeContainer.addEventListener("mousemove", (e) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const y = e.pageY - timeContainer.offsetTop;
      const walk = y - startY;
      timeContainer.scrollTop = scrollTop - walk;
    });
    timeContainer.addEventListener("scroll", () => {
      taskDashboardContainer.scrollTop = timeContainer.scrollTop;
    });
  }

  /**
   * Update the task dashboard with current tasks
   */
  updateTaskDashboard() {
    const tasks = this.user_data.tasks;
    const taskContainers = this._container.querySelectorAll(".content-data__items-container");
    taskContainers.forEach((container) => (container.innerHTML = ""));
    tasks.forEach((task) => {
      const date = this.formatDate(task.date);
      const container = Array.from(taskContainers).find((c) => c.id === date);
      if (container) {
        this.addTaskToContainer(container, task);
      }
    });
  }

  /**
   * Add a task to the specified container
   * @param {HTMLElement} container - The container to add the task to
   * @param {Object} task - The task data
   */
  addTaskToContainer(container, task) {
    try {
      const timeSlot = this._container.querySelector(".time");
      if (!timeSlot) throw new Error("Time slot element not found");
      const pxPerMin = timeSlot.offsetHeight / 60;
      const startPosition = 385;
      const { startTime, endTime, startTimeInMinutes, endTimeInMinutes } = this.getTaskTime(task);
      const taskStartPosition = startTimeInMinutes * pxPerMin - startPosition - pxPerMin + 55;
      const taskHeight = (endTimeInMinutes - startTimeInMinutes) * pxPerMin - 5;
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-container");
      taskElement.dataset.id = task.id;
      taskElement.style.top = `${taskStartPosition}px`;
      taskElement.style.height = `${taskHeight}px`;
      taskElement.innerHTML = `
      <div class="task-container__content">
                  <div class="task-container__content--title">
                    <span></span>
                    <h1>${task.title}</h1>
                  </div>

                  <div class="task-container__content--time">
                    <i class="fa-regular fa-clock clock"></i>
                    <p>Duration:</p>
                    <p>${startTime}</p>
                    <i class="fa-solid fa-arrow-right"></i>
                    <p>${endTime}</p>
                  </div>
      </div>
          <div class="task-container__content--description"
                  data-text="${task.description || "Sorry, but we could not find a description for this task."}">
                  <span><i class="fa-solid fa-circle-info"></i></span>
            </div>
            <div class="task-buttons">
              <button class="task-button done">Done</button>
              <button class="task-button edit">Edit</button>
              <button class="task-button delete">Delete</button>
            </div>
      `;
      // Add event listeners for buttons
      taskElement.querySelector(".task-button.done").addEventListener("click", () => this.handleTaskDone(task));
      taskElement.querySelector(".task-button.edit").addEventListener("click", () => this.handleTaskEdit(task));
      taskElement.querySelector(".task-button.delete").addEventListener("click", () => this.handleTaskDelete(task));
      container.appendChild(taskElement);
    } catch (error) {
      console.error("Error adding task to container:", error);
    }
  }

  /**
   * Handle task completion
   * @param {Object} task - The task data
   */
  handleTaskDone(task) {
    const markup = this.renderTaskMessage("Are you sure you have completed the task?");
    this.addConfirmationMessage(task, markup, this.handlerTaskDone.bind(this));
  }

  /**
   * Set the handler for marking tasks as done
   * @param {Function} handler - Handler function
   */
  setDoneTaskHandler(handler) {
    this._doneTaskHandler = handler;
  }

  /**
   * Handler for marking tasks as done
   * @param {Object} task - The task data
   */
  handlerTaskDone(task) {
    this._doneTaskHandler(task.id);
    this.confirmDoneTask(task);
  }

  /**
   * Confirm task completion and update dashboard
   * @param {Object} task - The task data
   */
  confirmDoneTask(task) {
    this.user_data.tasks = this.user_data.tasks.filter((t) => t.id !== task.id);
    this.updateTaskDashboard(this.handleTaskDone.bind(this));
    this.renderTaskOnDashboard();
    this.renderTaskIn_7Days();
    this.renderTaskInCurrentMonth();
  }

  /**
   * Handle task editing
   * @param {Object} task - The task data
   */
  handleTaskEdit(task) {
    this._container.querySelector("#form-title").textContent = "Edit Task";
    this._container.querySelector("#task-id").value = task.id;
    this._container.querySelector("#task-title").value = task.title;
    this._container.querySelector("#task-description").value = task.description;
    this._container.querySelector("#due-date").value = task.date;
    this._container.querySelector("#due-time").value = task.time;
    this._container.querySelector("#duration").value = task.duration;
    this._container.querySelector("#task-form-button").textContent = "Update Task";
    this._container.querySelector(".background-add-task-popup").classList.remove("hidden");
  }

  /**
   * Handle task deletion
   * @param {Object} task - The task data
   */
  handleTaskDelete(task) {
    const markup = this.renderTaskMessage("Are you sure you want to delete this task?");
    this.addConfirmationMessage(task, markup, this.handlerTaskDelete.bind(this));
  }

  /**
   * Set the handler for deleting tasks
   * @param {Function} handler - Handler function
   */
  setDeleteTaskHandler(handler) {
    this._deleteTaskHandler = handler;
  }

  /**
   * Handler for deleting tasks
   * @param {Object} task - The task data
   */
  handlerTaskDelete(task) {
    this._deleteTaskHandler(task.id);
    this.confirmDeleteTask(task);
  }

  /**
   * Confirm task deletion and update dashboard
   * @param {Object} task - The task data
   */
  confirmDeleteTask(task) {
    this.user_data.tasks = this.user_data.tasks.filter((t) => t.id !== task.id);
    this.updateTaskDashboard(this.handleTaskDelete.bind(this));
    this.renderTaskOnDashboard();
    this.renderTaskIn_7Days();
    this.renderTaskInCurrentMonth();
  }

  /**
   * Add a confirmation message for task actions
   * @param {Object} task - The task data
   * @param {string} markup - HTML markup for the message
   * @param {Function} handler - Handler function for confirmation
   */
  addConfirmationMessage(task, markup, handler) {
    const taskElement = this._container.querySelector(`[data-id="${task.id}"]`);
    const existingMessage = taskElement.querySelector(".delete-message");
    if (existingMessage) {
      existingMessage.remove();
    }
    taskElement.insertAdjacentHTML("beforeend", markup);
    taskElement.querySelector(".cancel").addEventListener("click", () => this.cancelRemoveTask(task));
    taskElement.querySelector(".confirm").addEventListener("click", (e) => {
      e.preventDefault();
      handler(task);
    });
  }

  /**
   * Cancel task removal
   * @param {Object} task - The task data
   */
  cancelRemoveTask(task) {
    const taskElement = this._container.querySelector(`[data-id="${task.id}"]`);
    const deleteMessage = taskElement.querySelector(".delete-message");
    if (deleteMessage) {
      deleteMessage.remove();
    }
  }

  /**
   * Render a confirmation message for task actions
   * @param {string} message - Message to display
   * @returns {string} - HTML markup for the message
   */
  renderTaskMessage(message = "") {
    return `
    <div class="delete-message">
      <div class="message-error">
        <span class="error-login-text">${message}</span>
      </div>
      <div class="delete-message__buttons">
        <button class="confirm">Yes</button>
        <button class="cancel">No</button>
        </div>
    </div>
    `;
  }

  /**
   * Scroll to a specific task
   * @param {number} taskId - ID of the task to scroll to
   */
  scrollToTask(taskId) {
    setTimeout(() => {
      this.isScrollingToTask = true;
      const taskElement = this._container.querySelector(`[data-id="${taskId.toString()}"]`);
      if (taskElement) {
        const taskContainer = this._container.querySelector(".content-data__items__overflow");
        const parentContainer = this._container.querySelector(".content-data__items");
        const taskRect = taskElement.getBoundingClientRect();
        const containerRect = parentContainer.getBoundingClientRect();
        const scrollTopPosition = taskContainer.scrollTop + (taskRect.top - containerRect.top) - containerRect.height / 2 + taskRect.height / 2;
        const scrollLeftPosition = taskContainer.scrollLeft + (taskRect.left - containerRect.left) - containerRect.width / 2 + taskRect.width / 2;
        //
        this.smoothScroll(taskContainer, scrollLeftPosition, scrollTopPosition);
        //
        taskElement.style.transition = "background-color 0.5s ease, box-shadow 0.4s ease";
        taskElement.style.backgroundColor = "#e5e9f6";
        setTimeout(() => {
          taskElement.style.transition = "box-shadow 0.4s ease, background-color 0.8s ease";
          taskElement.style.backgroundColor = "";
          this.isScrollingToTask = false;
        }, 2000);
      } else {
        console.error(`Task with ID ${taskIdString} not found.`);
        this.isScrollingToTask = false;
        this.activeContainer();
        this.activeTimeContainer();
      }
    }, 100);
  }

  /**
   * Get task start and end times
   * @param {Object} task - The task data
   * @returns {Object} - Task time information
   */
  getTaskTime(task) {
    const startDateTime = new Date(`${task.date}T${task.time}`);
    const durationInMinutes = parseFloat(task.duration) * 60;
    const endDateTime = new Date(startDateTime.getTime() + durationInMinutes * 60000);
    const formatTime = (date) => date.toTimeString().slice(0, 5);
    const startTimeInMinutes = startDateTime.getHours() * 60 + startDateTime.getMinutes();
    const endTimeInMinutes = endDateTime.getHours() * 60 + endDateTime.getMinutes();
    return {
      startTime: formatTime(startDateTime),
      endTime: formatTime(endDateTime),
      startTimeInMinutes,
      endTimeInMinutes,
    };
  }

  /**
   * Format a date string to a readable format
   * @param {string} dateString - Date string to format
   * @returns {string} - Formatted date
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  }

  /**
   * Smoothly scroll to a specified position within an element
   * @param {HTMLElement} element - Element to scroll
   * @param {number} toLeft - Horizontal scroll position
   * @param {number} toTop - Vertical scroll position
   * @param {number} duration - Duration of the scroll animation
   */
  smoothScroll(element, toLeft, toTop, duration = 500) {
    const startLeft = element.scrollLeft;
    const startTop = element.scrollTop;
    const changeLeft = toLeft - startLeft;
    const changeTop = toTop - startTop;
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
      const ease = easeInOutQuad(progress);

      element.scrollLeft = startLeft + changeLeft * ease;
      element.scrollTop = startTop + changeTop * ease;

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }

  /**
   * Refresh the page when the reload button is clicked
   */
  refreshPage() {
    this._container.querySelector(".content-header__reload").addEventListener("click", () => {
      location.reload();
    });
  }

  /**
   * Render tasks for the current week in the sidebar
   */
  renderTaskIn_7Days() {
    const user = this.user_data;
    const titleCountTasks = this._container.querySelector(".info-menubar__list--item-title-container .number");
    const title = this._container.querySelector(".info-menubar__list--item-title-container p");
    const sidebarContainerList = this._container.querySelector(".info-menubar__list--item-content-container .list");
    // Calculate the start of the year and the current week number
    const startOfYear = new Date(this.currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (this.currentDate - startOfYear) / 86400000;
    const currentWeekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    // Calculate the start and end dates of the current week
    const currentDayOfWeek = this.currentDate.getDay();
    const startOfWeek = new Date(this.currentDate);
    startOfWeek.setDate(this.currentDate.getDate() - currentDayOfWeek + 1);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Create an array of Date objects for each day in the week
    const daysOfWeek = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      daysOfWeek.push(day);
    }

    // Format each day as a string
    const formattedDays = daysOfWeek.map((day) => {
      const dayName = day.toLocaleDateString("en-US", { weekday: "long" });
      const dayNumber = day.getDate();
      const monthName = day.toLocaleDateString("en-US", { month: "long" });
      return `${dayName}, ${dayNumber} ${monthName}`;
    });

    // Count the number of tasks for each day in the week
    const taskCounts = formattedDays.map((dayString) => {
      const dateParts = dayString.split(", ")[1].split(" ");
      const day = parseInt(dateParts[0]);
      const month = new Date(dateParts[1] + " 1, 2020").getMonth(); // Any non-leap year to get month index
      const year = this.currentDate.getFullYear();
      //
      return user.tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
      }).length;
    });

    // Update the title and task count in the sidebar
    const totalTasksForWeek = taskCounts.reduce((total, count) => total + count, 0);
    titleCountTasks.textContent = totalTasksForWeek;
    title.textContent = `Tasks for week (${currentWeekNumber})`;
    sidebarContainerList.innerHTML = formattedDays
      .map((day, index) => {
        return `
      <div class="day">
                <div class="day-title"  data-day="${daysOfWeek[index].toISOString()}">
                  <i class="fa-solid fa-circle-chevron-right"></i>
                  <span>${day}</span>
                </div>
                <div class="day-numbers">
                  <span>${taskCounts[index]}</span>
                </div>
        </div>
      `;
      })
      .join("");

    // Add event listeners to each day to center the selected day when clicked
    const dayTasks = sidebarContainerList.querySelectorAll(".day-title");
    dayTasks.forEach((dayTask) => {
      dayTask.addEventListener("click", (e) => {
        const dayISO = e.currentTarget.dataset.day;
        const dayDate = new Date(dayISO);
        this.centerSelectedDay(dayDate);
      });
    });
  }

  /**
   * Render tasks for the current month in the sidebar
   */
  renderTaskInCurrentMonth() {
    const user = this.user_data;
    const titleCountTasks = this._container.querySelector(".task-for-month .number");
    const title = this._container.querySelector(".task-for-month p");
    const sidebarContainerList = this._container.querySelector(".task-for-month-full-month .list");
    const currentYear = this.currentDate.getFullYear();
    const currentMonth = this.currentDate.getMonth();

    // Calculate the number of days in the current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Create an array of Date objects for each day in the month
    const daysOfMonth = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      daysOfMonth.push(date);
    }

    // Format each day as a string
    const formattedDays = daysOfMonth.map((day) => {
      const dayName = day.toLocaleDateString("en-US", { weekday: "long" });
      const dayNumber = day.getDate();
      const monthName = day.toLocaleDateString("en-US", { month: "long" });
      return `${dayName}, ${dayNumber} ${monthName}`;
    });

    // Count the number of tasks for each day in the month
    const taskCounts = formattedDays.map((dayString) => {
      const dateParts = dayString.split(", ")[1].split(" ");
      const day = parseInt(dateParts[0]);
      const month = new Date(dateParts[1] + " 1, 2020").getMonth();
      const year = this.currentDate.getFullYear();
      return user.tasks.filter((task) => {
        const taskDate = new Date(task.date);
        return taskDate.getFullYear() === year && taskDate.getMonth() === month && taskDate.getDate() === day;
      }).length;
    });

    // Update the title and task count in the sidebar
    const totalTasksForMonth = taskCounts.reduce((total, count) => total + count, 0);
    titleCountTasks.textContent = totalTasksForMonth;
    title.textContent = `Tasks for ${this.currentDate.toLocaleString("default", { month: "long" })}`;
    sidebarContainerList.innerHTML = formattedDays
      .map((day, index) => {
        return `
      <div class="day">
        <div class="day-title" data-day="${daysOfMonth[index].toISOString()}">
          <i class="fa-solid fa-circle-chevron-right"></i>
          <span>${day}</span>
        </div>
        <div class="day-numbers">
          <span>${taskCounts[index]}</span>
        </div>
      </div>
    `;
      })
      .join("");

    // Add event listeners to each day to center the selected day in the view
    const dayTasks = sidebarContainerList.querySelectorAll(".day-title");
    dayTasks.forEach((dayTask) => {
      dayTask.addEventListener("click", (e) => {
        const dayISO = e.currentTarget.dataset.day;
        const dayDate = new Date(dayISO);
        this.centerSelectedDay(dayDate);
      });
    });
  }

  /**
   * Center the selected day in the month view
   * @param {Date} dayDate - The date to center
   */
  centerSelectedDay(dayDate) {
    const currentMonth = this.currentDate.getMonth();
    const selectedMonth = dayDate.getMonth();
    // If the selected day is in a different month, update the month and render the data
    if (currentMonth !== selectedMonth) {
      this.currentDate.setMonth(selectedMonth);
      this.renderCurrentMonthDataOnDOM();
      this.renderTaskDashboardContainer();
      this.updateHeaderMonth();
      this.updateTaskDashboard();
    }
    const day = dayDate.getDate();
    const month = dayDate.toLocaleString("default", { month: "short" });
    const monthContainer = this._container.querySelectorAll(".fullday");
    const scrollBarTop = this._container.querySelector("#month-container");
    let currentContainer;
    monthContainer.forEach((element) => {
      if (+element.dataset.day === day) {
        element.classList.add("active");
        currentContainer = element;
      } else {
        element.classList.remove("active");
      }
    });

    if (currentContainer) {
      // Center the selected day in the scroll view
      const currentDayWidth = currentContainer.offsetWidth;
      const scrollPosition = (day - 2) * currentDayWidth - 25;
      scrollBarTop.scrollLeft = scrollPosition;
      const taskContainer = this._container.querySelector(`.content-data__items-container[data-day="${day} ${month}"]`);
      console.log(taskContainer);
      if (taskContainer) {
        taskContainer.style.transition = "background-color 0.5s ease";
        taskContainer.style.background = "#e5e9f6";

        setTimeout(() => {
          taskContainer.style.transition = "background-color 0.8s ease";
          taskContainer.style.background = "";
        }, 1000);
      }
    }
  }
}

export default new Dashboard_TaskManagement();
