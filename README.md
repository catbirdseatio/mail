# Mail

A project that allows users to send emails to other users that belong to the system. The system has capabilities for the sending, viewing, archiving, and replying of messages sent to users that are registered in the the project.

See it live: [email.catbirdseat.io](https://mail.catbirdseat.io)
Video Demo: [YouTube](https://youtu.be/XRWF_US7Ovw)

[![CI/CD Pipeline](https://github.com/catbirdseatio/mail/actions/workflows/mail.yml/badge.svg)](https://github.com/catbirdseatio/mail/actions/workflows/mail.yml)

## .env

This project uses [django-environ](https://django-environ.readthedocs.io/en/latest/), which allows the use of environment variables to set settings. The following settings are expected to be in environment variables or in an .env file:

| Setting       |                                             Description                                              |
| :------------ | :--------------------------------------------------------------------------------------------------: |
| DEBUG         |                     Determines whether the running application is in debug mode.                     |
| SECRET_KEY    |                                 Secret key used for the application.                                 |
| ALLOWED_HOSTS |                           IPs and domains allowed to acces the application                           |
| DATABASE_URL  | The URL used to access the application's database. To use SQLite locally, use `sqlite:///db.sqlite3` |

## Github Actions

These secrets are used to deploy the application on a Linux VPS:

| Name         | Stage | Description                                         |
| ------------ | ----- | --------------------------------------------------- |
| DATABASE_URL | build | The url of the database in the build stage.         |
| SECRET_KEY   | build | The secret key for the app used in the build stage. |
|SERVER_IP|deploy| The IP address of the server.|
SERVER_USERNAME|deploy| The name of the user that can run sudo commands on the server.|
|SSH_KEY|deploy|Private key used to access server.|
|SUDO_PASSWORD|deploy|The password of the SERVER_USERNAME user.|
|TARGET_DIRECTORY|deploy|The directory where the application lives.|

These variables are used:

| Name         | Stage | Description                                         |
| ------------ | ----- | --------------------------------------------------- |
|ALLOWED_HOSTS|build|The domains allowed to access the app in the build stage. Usually set to `127.0.0.1,localhost`.
| PORT | deploy | The SSH port used to access the server. Hardcoded to port 22.|