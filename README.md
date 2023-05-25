# My Voice Assistant Project

This project is a simple voice assistant using Node.js, Google Cloud Speech-to-Text API, and OpenAI GPT-3.5-turbo for processing voice commands.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your local machine. If you do not have these, you can install them [here](https://nodejs.org/en/download/).

The project uses the following Node.js packages which need to be installed:

- `express`
- `multer`
- `@google-cloud/speech`
- `@google-cloud/text-to-speech`
- `openai`
- `cors`
- `dotenv`

You can install these packages using npm with the command:

```
npm install express multer @google-cloud/speech @google-cloud/text-to-speech openai cors dotenv
```


### Configuration

You will need to set up Google Cloud Speech-to-Text and Text-to-Speech APIs, and OpenAI API.

1. **Google Cloud APIs**

    - Follow Google Cloud's guide to [create a new project](https://cloud.google.com/resource-manager/docs/creating-managing-projects).
    - Enable the [Speech-to-Text API](https://cloud.google.com/speech-to-text/docs/quickstart-client-libraries) and [Text-to-Speech API](https://cloud.google.com/text-to-speech/docs/quickstart-client-libraries) for your project.
    - Create a service account and download the JSON key file. Remember the location of this file.

2. **OpenAI API**

    - [Create an account](https://beta.openai.com/signup/) with OpenAI.
    - Retrieve your API key from the OpenAI dashboard.

### Environment Variables

Create a `.env` file in the root directory of the project. This file should contain the following environment variables:

```
API_KEY=your_openai_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_your_google_cloud_keyfile.json
```


Replace `your_openai_api_key` with your OpenAI API key, and `path_to_your_google_cloud_keyfile.json` with the path to your Google Cloud JSON key file.

## Running the Server

To start the server, navigate to the project directory in your terminal and run the following command:

```
node record.js
```

