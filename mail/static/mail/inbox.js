/**
 * Get a cookie's value by name.
 * @param {string} name: name of the cookie value
 * @returns value of the named cookie value.
 */
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

/**
 * Get an object of all the named fields in an HTML form
 * @param {*} form DOM element
 */
const getFields = (form) => {
  const rawFields = Array.from(form.elements).filter(
    (field) => field.name !== ""
  );

  const fields = rawFields.reduce((o, key) => ({ ...o, [key.name]: key }), {});
  return fields;
};

/**
 * Remove invalid messages from the form.
 */
const clearErrorMessages = () => {
  document
    .querySelectorAll(".is-invalid")
    .forEach((element) => element.classList.remove("is-invalid"));
  document
    .querySelectorAll(".invalid-feedback")
    .forEach((element) => element.remove());
};

/**
 * Remove valid messages from the form.
 */
const clearIsValid = () => {
  document
    .querySelectorAll(".is-valid")
    .forEach((element) => element.classList.remove("is-valid"));
};

/**
 *
 * @param {*} form HTML form
 * @returns true if .is-invalid does not appear in form.
 */
const formIsValid = (form) =>
  document.querySelectorAll(".is-invalid").length <= 0;

// VALIDATORS

/**
 * Validate email addresses in recipients.
 * @param {*} field : The field being validated.
 */
const emailAddressValidator = (field) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const recipients = field.value
    .split(",")
    .map((recipient) => recipient.trim())
    .filter((recipient) => recipient.length !== 0);

  recipients.forEach((recipient) => {
    if (re.test(recipient)) {
      field.classList.add("is-valid");
    } else {
      const errorMessage = errorFeedbackWriter(
        field,
        "Recipients must be valid email addresses."
      );
      field.parentElement.append(errorMessage);
    }
  });
};

/**
 * Validate for an input length of minimum of 1.
 * @param {*} field DOM form field
 */
const requiredFieldValidator = field => {
  if (field.value <= 0) {
    const errorMessage = errorFeedbackWriter(
      field,
      "This field is required."
    )
    field.parentElement.append(errorMessage)
  } else {
    field.classList.add("is-valid");
  }
}

// DOM ELEMENT WRITERS

/**
 * Write error feedback and add `is-invalid` class to field.
 * @param {*} field: The DOM element of the field
 * @param {*} message The text to be written
 * @returns a div containing the error message
 */
const errorFeedbackWriter = (field, message) => {
  // remove previous valid/invalid
  field.classList.remove("is-invalid", "is-valid");
  field.classList.add("is-invalid");
  const errorMessage = document.createElement("div");
  errorMessage.classList.add("invalid-feedback");
  errorMessage.innerText = message;
  return errorMessage;
};

// EVENT HANDLERS

/**
 * Handle compose form submission.
 * @param {*} event DOM event
 */
const composeSubmitHander = (event) => {
  event.preventDefault();
  clearErrorMessages();
  clearIsValid();

  const form = event.target;
  const fields = getFields(form);

  requiredFieldValidator(fields.body);
  requiredFieldValidator(fields.subject);
  requiredFieldValidator(fields.recipients);
  emailAddressValidator(fields.recipients);

  if (formIsValid()) console.log(fields);
  else return;
};

document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);

  // Add event handlers
  document
    .querySelector("#compose-form")
    .addEventListener("submit", composeSubmitHander);

  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  const form = document.querySelector("#compose-form");

  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  form.elements["recipients"].value = "";
  form.elements["subject"].value = "";
  form.elements["body"].value = "";
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
}
