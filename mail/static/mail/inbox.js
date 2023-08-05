const composeSubmitHander = (event) => {
  event.preventDefault();

  console.log(event);
  console.log("HELLO WORLD!");
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
