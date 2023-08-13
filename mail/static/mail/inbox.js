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
 * A recursive function to return an 'email' element
 * @param {*} element: an 'email' element or an element contained by an 'email' element.
 * @returns an email element
 */
const getEmailDiv = (element) =>
  element.classList.contains("email")
    ? element
    : getEmailDiv(element.parentElement);

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
 *
 * @param {*} fields
 * @returns Object with the named fields as keys and the field values as the values
 */
const getFormValues = (fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [key, val.value])
  );

/**
 *
 * @param {*} values: Form field values
 * @returns a promise
 */
const postEmail = (values) =>
  fetch("/emails", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify(values),
  }).then((response) => {
    if (response.ok) return response.json();
    else {
      // create error object and reject if not a 2xx response code
      let err = new Error(response.statusText);
      err.response = response;
      err.status = response.status;
      err.message = response.statusText;
      throw err;
    }
  });

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
const requiredFieldValidator = (field) => {
  if (field.value <= 0) {
    const errorMessage = errorFeedbackWriter(field, "This field is required.");
    field.parentElement.append(errorMessage);
  } else {
    field.classList.add("is-valid");
  }
};

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

const inboxMessageWriter = (container, email) => {
  console.log(email);
  const emailDiv = document.createElement("div");
  emailDiv.classList.add("email");
  emailDiv.dataset.id = email.id;
  emailDiv.addEventListener("click", emailClickEvent);
  if (email.read) emailDiv.classList.add("bg-light");

  const leftDiv = document.createElement("div");
  const rightDiv = document.createElement("div");

  const senderSpan = document.createElement("span");
  senderSpan.innerText = email.sender;

  const subjectSpan = document.createElement("span");
  subjectSpan.innerText = email.subject;

  rightDiv.innerText = email.timestamp;

  leftDiv.appendChild(senderSpan);
  leftDiv.appendChild(subjectSpan);

  emailDiv.appendChild(leftDiv);
  emailDiv.appendChild(rightDiv);
  container.appendChild(emailDiv);
};

const flash = (message, tag) => {
  console.log(`${tag}: ${message}`);
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

  if (formIsValid()) {
    // Create an array of form values
    const values = getFormValues(fields);
    postEmail(values)
      .then((data) => flash(data.message, "success"))
      .catch((error) => {
        if (error.status === 400)
          flash("User does not exist in system.", "danger");
        else console.log(error);
      });
  } else return;
};

const emailClickEvent = (event) => {
  const target = getEmailDiv(event.target);
  console.log(target.dataset.id);
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

  const content = document.querySelector("#emails-view");
  // Show the mailbox name
  content.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // get the data
  fetch("/emails/inbox")
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => inboxMessageWriter(content, email));

      // ... do something else with emails ...
    });
}
