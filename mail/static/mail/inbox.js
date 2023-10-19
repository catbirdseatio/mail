/**
 * An empty email object.
 */
const BLANK_EMAIL = {
  recipients: "",
  subject: "",
  body: "",
};

/**
 * Retrieve the value of a cookie.
 * @param {string} name Name of the cookie
 * @returns cookie value
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
 * Returns a DOM element with the class name `email`.
 * This function is recursive.
 * @param {*} element A DOM element
 * @returns DOM element with the class name "email"
 */
const getEmailDiv = (element) =>
  element.classList.contains("email")
    ? element
    : getEmailDiv(element.parentElement);

/**
 * Retrieve field data from a form
 * @param {} form
 * @returns an object containing the fields of a form
 */
const getFields = (form) => {
  const rawFields = Array.from(form.elements).filter(
    (field) => field.name !== ""
  );
  const fields = rawFields.reduce((o, key) => ({ ...o, [key.name]: key }), {});
  return fields;
};

/**
 * Get an object containing form values, given a fields object.
 * @param {*} fields A object containing form fields.
 * @returns An object containing form values.
 */
const getFormValues = (fields) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [key, val.value])
  );

/**
 * Send a POST request to the `/emails` endpoint.
 * @param {*} values An object containing the email values.
 * @returns a promise for further processing.
 */
const postEmail = (values) =>
  fetch("/emails", {
    method: "POST",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify(values),
  }).then((response) => {
    if (response.ok) return response.json();
    else {
      let err = new Error(response.statusText);
      err.response = response;
      err.status = response.status;
      err.message = response.statusText;
      throw err;
    }
  });

/**
 * Send a PUT request to the `emails/:id` endpoint.
 * @param {*} emailId ID of the email to update.
 * @param {*} values Object containing the values to be updated.
 * @returns a promise for further processing.
 */
const updateEmail = (emailId, values) =>
  fetch(`/emails/${emailId}`, {
    method: "PUT",
    headers: { "X-CSRFToken": getCookie("csrftoken") },
    body: JSON.stringify(values),
  }).then((response) => {
    if (!response.ok) {
      let err = new Error(response.statusText);
      err.response = response;
      err.status = response.status;
      err.message = response.statusText;
      throw err;
    } else return response;
  });

/**
 * Remove all error messages from the page.
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
 * Clear the `is-valid` class from the page.
 */
const clearIsValid = () => {
  document
    .querySelectorAll(".is-valid")
    .forEach((element) => element.classList.remove("is-valid"));
};

/**
 * Validate the form
 * @param {*} form A form DOM element.
 * @returns true if there are no errors, false if not.
 */
const formIsValid = (form) =>
  document.querySelectorAll(".is-invalid").length <= 0;

/**
 * Validate the email field; if valid set the the field to `is-valid`, else write an error message.
 * @param {*} field A form field DOM element that requires an email input.
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
 * Validate a field that is required.
 * @param {*} field A field DOM element that is required.
 */
const requiredFieldValidator = (field) => {
  if (field.value.trim() <= 0) {
    const errorMessage = errorFeedbackWriter(field, "This field is required.");
    field.parentElement.append(errorMessage);
  } else {
    field.classList.add("is-valid");
  }
};

/**
 * Write a error feedback message to the DOM.
 * @param {*} field A form field DOM
 * @param {*} message An error message to be added to the field.
 * @returns a DOM element containing the error message.
 */
const errorFeedbackWriter = (field, message) => {
  field.classList.remove("is-invalid", "is-valid");
  field.classList.add("is-invalid");
  const errorMessage = document.createElement("div");
  errorMessage.classList.add("invalid-feedback");
  errorMessage.innerText = message;
  return errorMessage;
};

/**
 * Write an inbox message to the page.
 * @param {*} container A DOM element that contains the email messages.
 * @param {*} email Email to be written to the container.
 * @param {*} mailbox The mailbox that the email belongs to.
 */
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

  // Add inner divs and spans to message div
  leftDiv.appendChild(senderSpan);
  leftDiv.appendChild(subjectSpan);
  emailDiv.appendChild(leftDiv);
  emailDiv.appendChild(rightDiv);

  // Add to the container.
  container.appendChild(emailDiv);
};

/**
 * Write a flash message to the screen for 3 seconds.
 * @param {*} message The flash message to be displayed.
 * @param {*} tag Type of tag that is being displayed.
 */
const flash = (message, tag) => {
  const flashContainer = document.querySelector(".flash-container");
  const flashMessage = document.createElement("div");
  flashMessage.classList.add("alert", `alert-${tag}`, "fade-in");
  flashMessage.innerText = message;
  flashContainer.appendChild(flashMessage);
  flashMessage.classList.add("fade-out");
  setTimeout(() => {
    flashContainer.removeChild(flashMessage);
  }, 3000);
};

/**
 * Write an individual email message to the screen.
 * @param {*} email An individual email message
 * @param {*} sentMailbox Message is from the sent mailbox. Default is false.
 * @returns a div containing the message.
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

/**
 * Event handler for email submission to the API. It validates the data
 * then calls the API
 * @param {Event} event A DOM Event
 */
const composeSubmitHander = (event) => {
  
  event.preventDefault();
  // Remove all feedback
  clearErrorMessages();
  clearIsValid();

  const form = event.target;
  const fields = getFields(form);
  requiredFieldValidator(fields.body);
  requiredFieldValidator(fields.subject);
  requiredFieldValidator(fields.recipients);
  emailAddressValidator(fields.recipients);

  if (formIsValid()) {
    const values = getFormValues(fields);
    postEmail(values)
      .then((data) => {
        flash(data.message, "success");
        load_mailbox("inbox");
      })
      .catch((error) => {
        if (error.status === 400) {
          const errorMessage = errorFeedbackWriter(
            fields.recipients,
            "The user cannot be found in the system."
          );
          fields.recipients.parentElement.appendChild(errorMessage);
          return;
        } else console.log(error);
      });
  } else return;
};

/**
 * Handle the clicking of an individual email.
 * @param {Event} event A DOM event.
 * calls load_message function.
 */
const emailClickHandler = (event) => {
  const target = getEmailDiv(event.target);
  const { id: emailId, sent } = target.dataset;
  const isSent = parseInt(sent);
  updateEmail(emailId, { read: true }).catch((error) =>
    console.log("An error has occurred.")
  );
  return load_message(emailId, isSent);
};

/**
 * Handle the clicking of a reply button.
 * @param {Event} event A DOM event.
 * @param {Object} email An object containing the email to respond to.
 */
const replyButtonHandler = (event, email) => {
  const subject = `Re: ${email.subject}`;
  const recipients = email.sender;
  const body = `On ${email.timestamp}, ${recipients} said:"${email.body}"`;
  const fields = { recipients, body, subject };
  
  compose_email(event, fields);
};

/**
 * Handle the click of an archive button.
 * @param {Event} event A DOM event.
 */
const archiveButtonHandler = (event) => {
  const button = event.target;
  const { id: emailID, archived: isArchived } = button.dataset;
  const archived = parseInt(isArchived) ? false : true;
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
        flash(flashMessage, "info");
      }
    })
    .catch((error) => console.log(error));
};

/**
 * Add event listeners to buttons and load the inbox mailbox when the DOM
 * content is loaded.
 */
document.addEventListener("DOMContentLoaded", function () {
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
  document
    .querySelector("#compose-form")
    .addEventListener("submit", composeSubmitHander);
  load_mailbox("inbox");
});

/**
 * 
 * @param {*} event 
 * @param {*} message 
 */
function compose_email(event, message = BLANK_EMAIL) {
  clearErrorMessages();
  clearIsValid();
  const form = document.querySelector("#compose-form");
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";
  Object.keys(message).forEach((field) => {
    form.elements[field].value = "";
    form.elements[field].value = message[field];
  });
}

/**
 * Load mailbox content onto the page.
 * @param {string} mailbox The name of the mailbox to be loaded.
 */
function load_mailbox(mailbox) {
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  const content = document.querySelector("#emails-view");
  content.innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => inboxMessageWriter(content, email, mailbox));
    });
}

/**
 * Load an individual message onto the screen.
 * @param {*} emailId ID of the email to load.
 * @param {boolean} isSent A boolean that determines if the email has been sent.
 */
function load_message(emailId, isSent) {
  const sent = isSent ? true : false;
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  
  const content = document.querySelector("#emails-view");
  content.innerHTML = "";

  // Get an email message.
  fetch(`/emails/${emailId}`)
    .then((response) => response.json())
    .then((email) => {
      let emailMessage = email;
      content.appendChild(messageWriter(emailMessage, sent));
      const archiveButton = document.querySelector("#archive");
      document
        .querySelector("#reply")
        .addEventListener("click", (event) =>
          replyButtonHandler(event, emailMessage)
        );
      if (archiveButton)
        archiveButton.addEventListener("click", archiveButtonHandler);
    })
    .catch((error) => console.log(error.message));
}
