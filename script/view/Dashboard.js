class Dashboard {
  user_data;

  constructor() {
    this._container = document.querySelector(".container");
    this._loginContainer = document.querySelector(".login-page");
    this.initialize();
  }

  /**
   * Initialize dashboard by setting up event listeners
   */
  initialize() {
    this.openAccountProfile();
    this.showHidePassword();
  }

  /**
   * Upload user data and render the dashboard
   * @param {Object} user - User data
   */
  uploadUserData(user) {
    this.user_data = user;
    this._render();
    this._renderHeaderTitle();
    this.userAccountData();
  }

  /**
   * Set the sign out handler
   * @param {Function} handler - Handler function for sign out
   */
  singOutHandler(handler) {
    const signOutBtn = this._container.querySelector(".content-header__logout");
    signOutBtn.addEventListener("click", handler);
  }

  /**
   * Render the dashboard and hide the login page
   */
  _render() {
    const dashboard = this._container;
    const loginPage = this._loginContainer;
    if (loginPage && dashboard) {
      dashboard.classList.remove("hidden");
      loginPage.classList.add("hidden");
    } else {
      console.error("Dashboard element not found");
    }
  }

  /**
   * Render the header title with the user's first name
   */
  _renderHeaderTitle() {
    const headerTitle = this._container.querySelector(".content-header__title");
    if (this.user_data) {
      headerTitle.innerHTML = `Hello, ${this.user_data.firstname}`;
    }
  }

  /**
   * Toggle the visibility of the account profile
   */
  openAccountProfile() {
    const accBtn = this._container.querySelector(".sidebar-bottom img");
    const exitForm = this._container.querySelector(".exit-profile");
    const container = this._container.querySelector(".background-popup");
    [accBtn, exitForm].forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        container.classList.toggle("hidden");
      });
    });
  }

  /**
   * Toggle password visibility
   * @param {HTMLElement} container_password - The password field element
   */
  togglePasswordVisibility(container_password) {
    return function (event) {
      event.preventDefault();
      if (container_password.type !== "password") {
        container_password.type = "password";
      } else {
        container_password.type = "text";
      }
    };
  }

  /**
   * Set up event listener for showing/hiding password
   */
  showHidePassword() {
    const VisibilityBtn = this._container.querySelector(".user-acc-password-show");
    const password_field = this._container.querySelector(".user-password #password");
    VisibilityBtn.addEventListener("click", this.togglePasswordVisibility(password_field));
  }

  /**
   * Update the user account image
   * @param {Function} handler - Handler function for updating the image
   */
  updateUserAccountImage(handler) {
    const profileImageInput = this._container.querySelector("#profile-image");
    const uploadLabel = this._container.querySelector(".image-upload-btn");
    const previewImage = this._container.querySelector("#preview-image");
    const fileName = this._container.querySelector(".file-name");
    const handleFileInputChange = (event) => {
      const file = event.target.files[0];
      if (!file) return;
      fileName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result; // Base64 encoded image data
        handler({ img: imageData });
      };
      reader.readAsDataURL(file);
    };

    // Attach event listener for file input change event
    if (!profileImageInput.fileInputListenerAttached) {
      profileImageInput.fileInputListenerAttached = true;
      profileImageInput.addEventListener("change", handleFileInputChange);
    }

    // Attach event listener for clicking on upload label
    if (!uploadLabel.clickListenerAttached) {
      uploadLabel.clickListenerAttached = true;
      uploadLabel.addEventListener("click", (e) => {
        e.preventDefault();
        profileImageInput.click();
      });
    }

    // Attach event listener for clicking on preview image
    if (!previewImage.clickListenerAttached) {
      previewImage.clickListenerAttached = true;
      previewImage.addEventListener("click", (e) => {
        e.preventDefault();
        profileImageInput.click();
      });
    }
  }

  /**
   * Render a loading spinner for the image upload
   */
  renderImageSpiner() {
    this._container.querySelector(".image-loader").classList.toggle("loader");
    const fileName = this._container.querySelector(".file-name");
    fileName.textContent = "Loading...";
    setTimeout(() => {
      fileName.textContent = "Photo changed successfully!";
      setTimeout(() => {
        fileName.textContent = "";
      }, 2200);
    }, 2500);
  }

  /**
   * Hide the image loading spinner
   */
  renderImageSpinerDone() {
    this._container.querySelector(".image-loader").classList.toggle("loader");
  }

  /**
   * Update user account details on form submission
   * @param {Function} handler - Handler function to update account details
   */
  updateUserAccoutnDetails(handler) {
    this._container.querySelector("#user-form").addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)];
      const data = Object.fromEntries(dataArr);
      handler(data);
    });
  }

  /**
   * Render a loading spinner on the submit button
   */
  renderButtonSpiner() {
    const submitButton = this._container.querySelector(".submit-acc-details");
    submitButton.disabled = true;
    this._container.querySelector(".submit-acc-details").classList.toggle("button--loading");
    this._container.querySelectorAll(".load-input").forEach((el) => {
      el.classList.toggle("active");
    });
  }

  /**
   * Remove the loading spinner from the submit button
   */
  removeButtonSpiner() {
    const submitButton = this._container.querySelector(".submit-acc-details");
    const buttonText = this._container.querySelector(".submit-acc-details span");
    this._container.querySelector(".submit-acc-details").classList.toggle("button--loading");
    this._container.querySelectorAll(".load-input").forEach((el) => {
      el.classList.toggle("active");
    });
    buttonText.textContent = "Done!";
    setTimeout(() => {
      buttonText.textContent = "Update Personal Info";
      submitButton.disabled = false;
    }, 1000);
  }

  /**
   * Render an error message for the account section
   * @param {string} message - The error message to be displayed
   */
  renderAccountErrorMessage(message = "") {
    const container = this._container.querySelector(".image-upload");
    const errorContainer = this._container.querySelector(".error-account-message");
    if (errorContainer) {
      errorContainer.remove();
      clearTimeout(this._errorMessageTimeout);
    }
    const markup = `
    <div class="error-account-message">
              <div class="icon">
                <i class="fa-solid fa-exclamation"></i>
              </div>
              <div class="message-error">
                <span class="error-login-text">${message}</span>
              </div>
            </div>
    `;
    container.insertAdjacentHTML("beforeend", markup);

    this._errorMessageTimeout = setTimeout(() => {
      const errorContainer = this._container.querySelector(".error-account-message");
      if (errorContainer) {
        errorContainer.remove();
        this._errorMessageTimeout = null;
      }
    }, 4000);
  }

  /**
   * Update user account data on the dashboard
   */
  userAccountData() {
    if (!this.user_data) return;
    const userDataBase = this.user_data;
    const userImg = this._container.querySelector(".preview-image");
    const userImgSidebar = this._container.querySelector(".sidebar-bottom img");
    const firstName = this._container.querySelector("#first-name");
    const lastName = this._container.querySelector("#last-name");
    const email = this._container.querySelector("#email");
    const birthday = this._container.querySelector("#birt-data");
    const phone = this._container.querySelector("#tel");
    const password = this._container.querySelector("#password");
    if (userDataBase.img !== undefined) {
      userImg.src = userDataBase.img;
      userImgSidebar.src = userDataBase.img;
    }
    if (userDataBase.firstname !== "") firstName.value = userDataBase.firstname;
    if (userDataBase.lastname !== "") lastName.value = userDataBase.lastname;
    if (userDataBase.email !== "") email.value = userDataBase.email;
    if (userDataBase.birthday !== undefined) birthday.value = userDataBase.birthday;
    if (userDataBase.phone !== undefined) phone.value = userDataBase.phone;
    if (userDataBase.password !== "") password.value = userDataBase.password;
  }
}

export default new Dashboard();
