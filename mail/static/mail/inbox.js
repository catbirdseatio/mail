/**
 * Object containing the fields for an all new email message.
 */
const BLANK_EMAIL = {
  recipients: "",
  subject: "",
  body: "",
};

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
 * @param {*} form: DOM element containing a form
 */
const getFields = (form) => {
  const rawFields = Array.from(form.elements).filter(
    (field) => field.name !== ""
  );

  const fields = rawFields.reduce((o, key) => ({ ...o, [key.name]: key }), {});
  return fields;
};

/**
 * Retrieve an object with fields as keys and the field values as values
 * @param {*} fields
 * @returns Object with the named fields as keys and the field values as the values
 */
const getFormValues = (fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [key, val.value])
  );

/**
 * Add a new email in the API.
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
 * Add a new email in the API.
 * @param {*} values: Form field values
 * @returns a promise
 */
const updateEmail = (emailId, values) =>
  fetch(`/emails/${emailId}`, {
    method: "PUT",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify(values),
  }).then((response) => {
    if (!response.ok) {
      // create error object and reject if not a 2xx response code
      let err = new Error(response.statusText);
      err.response = response;
      err.status = response.status;
      err.message = response.statusText;
      throw err;
    } else return response;
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

const inboxMessageWriter = (container, email, mailbox) => {
  const emailDiv = document.createElement("div");
  emailDiv.classList.add("email");
  emailDiv.dataset.id = email.id;
  emailDiv.dataset.sent = mailbox === "sent" ? 1 : 0;
  emailDiv.addEventListener("click", emailClickHandler);

  const leftDiv = document.createElement("div");
  const rightDiv = document.createElement("div");
  rightDiv.classList.add("right-div");
  leftDiv.classList.add("left-div");

  const senderSpan = document.createElement("span");
  senderSpan.classList.add("sender");
  senderSpan.innerText = email.sender;

  const subjectSpan = document.createElement("span");
  subjectSpan.classList.add("subject");
  subjectSpan.innerText = email.subject;

  rightDiv.innerText = email.timestamp;

  if (email.read) {
    emailDiv.classList.add("bg-light");
    rightDiv.classList.add("text-secondary");
  } else {
    emailDiv.classList.add("bg-white");
    rightDiv.classList.add("text-muted");
  }

  leftDiv.appendChild(senderSpan);
  leftDiv.appendChild(subjectSpan);

  emailDiv.appendChild(leftDiv);
  emailDiv.appendChild(rightDiv);
  container.appendChild(emailDiv);
};

const flash = (message, tag) => {
  console.log(`${tag}: ${message}`);
};

/**
 * Write an DOM container for an email message
 * @param {*} message: an object representing an email message
 */
const messageWriter = (email, sentMailbox = false) => {
  const emailDiv = document.createElement("div");
  emailDiv.classList.add("email-display");

  const emailHeader = document.createElement("div");
  emailHeader.classList.add("email-display-header");

  emailHeader.innerHTML = `<p><strong>From:</strong> ${email.sender}</p>
  <p><strong>To:</strong> ${email.recipients}</p>
  <p><strong>Subject:</strong> ${email.subject}</p>
  <p><strong>Timestamp:</strong> ${email.timestamp}</p>`;

  const replyButton = document.createElement("button");
  replyButton.setAttribute("id", "reply");
  replyButton.innerText = "Reply";
  replyButton.classList.add("btn", "btn-outline-primary");
  emailHeader.appendChild(replyButton);

  // If the mailbox is not sent, add the archive button
  if (!sentMailbox) {
    const archiveButton = document.createElement("button");
    archiveButton.setAttribute("id", "archive");
    const isArchived = email.archived ? 1 : 0;
    archiveButton.dataset.archived = isArchived;
    archiveButton.dataset.id = email.id;
    const buttonClass = isArchived ? "btn-outline-danger" : "btn-outline-info";
    archiveButton.innerText = isArchived ? "Unarchive" : "Archive";
    archiveButton.classList.add("btn", buttonClass, "mx-2");
    emailHeader.appendChild(archiveButton);
  }

  emailHeader.innerHTML += "<hr>";

  const emailBody = document.createElement("div");
  emailBody.classList.add("email-display-body");
  emailBody.innerText = email.body;

  emailDiv.appendChild(emailHeader);
  emailDiv.appendChild(emailBody);
  return emailDiv;
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
        if (error.status === 400) {
          const errorMessage = errorFeedbackWriter(
            fields.recipients,
            "The user cannot be found in the system."
          );
          fields.recipients.parentElement.appendChild(errorMessage);
        } else console.log(error);
      });

    load_mailbox("inbox");
  } else return;
};

const emailClickHandler = (event) => {
  const target = getEmailDiv(event.target);
  const { id: emailId, sent } = target.dataset;
  const isSent = parseInt(sent);
  updateEmail(emailId, { read: true })
    // .then((data) => console.log(data))
    .catch((error) => console.log("An error has occurred."));
  return load_message(emailId, isSent);
};

const replyButtonHandler = (event, email) => {
  const subject = `Re: ${email.subject}`;
  const recipients = email.sender;
  const body = `On ${email.timestamp}, ${recipients} said:"${email.body}"`;
  const fields = { recipients, body, subject };
  compose_email(event, fields);
};

const archiveButtonHandler = (event) => {
  const button = event.target;
  const { id: emailID, archived: isArchived } = button.dataset;
  console.log("IS ARCHIVED: ", isArchived);
  const archived = parseInt(isArchived) ? false : true;
  console.log(archived);
  const body = JSON.stringify({ archived });
  fetch(`/emails/${emailID}`, {
    method: "PUT",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body,
  })
    .then((response) => {
      if (!response.ok) throw new Error(response.errorMessage);
      else {
        button.dataset.archived = archived;
        button.classList.toggle("btn-outline-danger");
        button.classList.toggle("btn-outline-info");
        button.innerText = archived ? "Unarchive" : "Archive";
      }
    })
    .catch((error) => console.log(error));
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

/**
 * Display and fill out the fields of a form.
 * @param {*} event: An event object.
 * @param {*} message An object containing the fields for a valid email.
 */
function compose_email(event, message = BLANK_EMAIL) {
  const form = document.querySelector("#compose-form");

  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  console.log(message);
  // Clear out composition fields
  Object.keys(message).forEach((field) => {
    form.elements[field].value = "";
    form.elements[field].value = message[field];
  });
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
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => inboxMessageWriter(content, email, mailbox));
    });
}

/**
 * Load a message into the UI
 * @param {*} emailId: id of the email to load.
 */
function load_message(emailId, isSent) {
  const sent = isSent ? true : false;
  
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  const content = document.querySelector("#emails-view");

  // clear content div
  content.innerHTML = "";

  fetch(`/emails/${emailId}`)
    .then((response) => response.json())
    .then((email) => {
      let emailMessage = email;
      content.appendChild(messageWriter(emailMessage, sent));
      const archiveButton = document.querySelector("#archive")

      // EventListeners added after the content is mounted.
      // Reply handler is called by callback function to pass
      // an email message
      document
        .querySelector("#reply")
        .addEventListener("click", (event) =>
          replyButtonHandler(event, emailMessage)
        );
      if (archiveButton) archiveButton.addEventListener("click", archiveButtonHandler);
    })
    .catch((error) => console.log(error.message));
}
