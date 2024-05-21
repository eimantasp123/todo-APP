// Login page DOM content
class LoginPage {
  _dashboard = document.querySelector(".container");
  _container = document.querySelector(".login-page");
  _loginEmail;
  _loginPassword;
  _RegistrationName;
  _RegistrationEmail;
  _RegistrationPassword;
  _errorMessage;

  constructor() {
    this._errorMessage = "We could not your user. Please try to check fields!";
    this._addEventListeners();
  }

  /**
   * Render the login page and hide the dashboard
   */
  _render() {
    const dashboard = this._dashboard;
    const loginPage = this._container;
    if (dashboard && loginPage) {
      loginPage.classList.remove("hidden");
      dashboard.classList.add("hidden");
    } else {
      console.error("Login page not found");
    }
  }

  /**
   * Add event listener to render the page when DOM is loaded
   * @param {Function} handler - The handler function to be called
   */
  _addHandlerRender(handler) {
    ["DOMContentLoaded", "load"].forEach((e) => window.addEventListener(e, handler));
  }

  /**
   * Add event listeners for various elements
   */
  _addEventListeners() {
    this._passwordVisibility();
    this._loginRegisterSwitcher();
  }

  /**
   * Add event handler for sign-in button and input fields
   * @param {Function} handler - The handler function to be called on sign-in
   */
  _signInHandler(handler) {
    const signInBtn = this._container.querySelector("#SignIn");
    this._loginEmail = this._container.querySelector(".login-email");
    this._loginPassword = this._container.querySelector(".login-email").closest(".form").querySelector(".password_field");
    signInBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handler(this._loginEmail.value.trim(), this._loginPassword.value.trim());
    });
    [this._loginEmail, this._loginPassword].forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          signInBtn.click();
        }
      });
    });
  }

  /**
   * Add event handler for registration button and input fields
   * @param {Function} handler - The handler function to be called on registration
   */
  _registrationHandler(handler) {
    const signUpBtn = this._container.querySelector("#SignUp");
    this._RegistrationName = this._container.querySelector(".register-name");
    this._RegistrationEmail = this._container.querySelector(".register-email");
    this._RegistrationPassword = this._container.querySelector(".register-email").closest(".form").querySelector(".password_field");
    signUpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handler(this._RegistrationName.value.trim(), this._RegistrationEmail.value.trim(), this._RegistrationPassword.value.trim());
    });
    [this._RegistrationEmail, this._RegistrationName, this._RegistrationPassword].forEach((input) => {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          signUpBtn.click();
        }
      });
    });
  }

  /**
   * Clear registration form inputs
   */
  _cleanRegistrationsInputs() {
    this._RegistrationName.value = "";
    this._RegistrationEmail.value = "";
    this._RegistrationPassword.value = "";
  }

  /**
   * Clear sign-in form inputs
   */
  _cleanSignInInputs() {
    this._loginEmail.value = "";
    this._loginPassword.value = "";
  }

  /**
   * Show the dashboard and hide the login page
   */
  _showDashboard() {
    this._container.querySelector(".login-page").classList.add("hidden");
    this._container.querySelector(".container").classList.remove("hidden");
  }

  /**
   * Switch from registration overlay to sign-in overlay
   */
  _switchLoginOverlay() {
    this._cleanFormMessage();
    setTimeout(() => {
      const trigger = this._container.querySelector("#signUpButton");
      trigger.dispatchEvent(new Event("click"));
    }, 300);
  }

  /**
   * Clean any form messages displayed
   */
  _cleanFormMessage() {
    const errorContainer = this._container.querySelector("form .form-message");
    if (errorContainer) errorContainer.remove();
  }

  /**
   * Toggle password visibility
   */
  _passwordVisibility() {
    this.passwordVisibilityBtn = this._container.querySelectorAll(".password-visible-sign");
    this.passwordVisibilityBtn.forEach((button) => {
      button.addEventListener("click", function (e) {
        e.preventDefault();
        this.password_field = this.closest(".input-password").querySelector(".password_field");
        if (this.password_field.type === "password") {
          this.password_field.type = "text";
        } else {
          this.password_field.type = "password";
        }
      });
    });
  }

  /**
   * Switch between login and registration forms
   */
  _loginRegisterSwitcher() {
    this.signIn_Btn = this._container.querySelector("#signInButton");
    this.signUp_Btn = this._container.querySelector("#signUpButton");
    this.overlay_container = this._container.querySelector(".container-login .overlay-container");
    this.overlay = this._container.querySelector(".container-login .overlay-container .overlay");
    this.singUPForm = this._container.querySelector(".sign-up-form");
    this.singInForm = this._container.querySelector(".sign-in-form");
    this.inputs = this._container.querySelectorAll(".login-page input");

    this.signIn_Btn.addEventListener("click", (e) => {
      e.preventDefault();
      this._cleanFormMessage();
      this.overlay_container.style.transform = "translateX(100%)";
      this.overlay.style.transform = "translateX(-50%)";
      this.singInForm.classList.remove("active");
      this.inputs.forEach((e) => {
        e.value = "";
      });
      this.singUPForm.classList.add("active");
    });
    this.signUp_Btn.addEventListener("click", (e) => {
      e.preventDefault();
      this._cleanFormMessage();
      this.overlay_container.style.transform = "translateX(0)";
      this.overlay.style.transform = "translateX(0)";
      this.singUPForm.classList.remove("active");
      this.inputs.forEach((e) => {
        e.value = "";
      });
      this.singInForm.classList.add("active");
    });
  }

  /**
   * Render a message on the form
   * @param {string} message - The message to be displayed
   * @param {string} activeButton - The button identifier
   * @param {string} className - The CSS class for the message
   */
  _renderMessage(message = "", activebutton = "", classe = "") {
    const form = this._container.querySelector(`#${activebutton}`).closest("form");
    if (!form) return;
    const errorContainer = form.querySelector(".form-message");
    if (errorContainer) {
      errorContainer.remove();
      clearTimeout(this._errorMessageTimeout);
    }
    const markup = `
    <div class="form-message ${classe}">
                    <div class="icon">
                    <i class="fa-solid fa-exclamation"></i>
                    </div>
                    <div class="message-error">
                    <span class="error-login-text">${message}</span>
                    </div>
        </div>
    `;

    form.insertAdjacentHTML("beforeend", markup);

    this._errorMessageTimeout = setTimeout(() => {
      const errorContainer = form.querySelector(".form-message");
      if (errorContainer) {
        errorContainer.remove();
        this._errorMessageTimeout = null;
      }
    }, 4000);
  }
}

export default new LoginPage();
