/* eslint-disable  func-names */
/* eslint-disable  no-console */

'use strict';

const Alexa = require('ask-sdk');
const https = require('https');

const questions = {
  "questionOne": 5,
  "questionTwo": 6,
  "questionThree": 7,
  "questionFour": 8
};

//messages
const SKILL_NAME = 'Word Press Site';
const HELP_MESSAGE = 'You can ask me a question, or, you can say exit... What would you like to do?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const MESSAGES = ['<emphasis level="reduced">Hello</emphasis>. What would you like me to find for you today?', '<emphasis level="reduced">Hello</emphasis>. How can I help you today?'];
const WELCOME_MESSAGE = MESSAGES[Math.floor(Math.random() * Math.floor(3))];

const ERROR_MESSAGES = ['Sorry, an error occurred.', 'Sorry I cant help you at the moment', 'Sorry you have an error'];
const ERROR_RESPONSE = ERROR_MESSAGES[Math.floor(Math.random() * Math.floor(3))];


//user opens the alexa skill
const OpenSiteHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechOutput = WELCOME_MESSAGE;
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
      .getResponse();
  },
};

const AnswerHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name in questions);
  },
  async handle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    var answerID = questions[request.intent.name];

    console.log(answerID);
    const speechOutputtest = await httpGet(answerID);
    console.log(speechOutputtest);
    return handlerInput.responseBuilder
    .speak(speechOutputtest.content.rendered)
    .reprompt('is there anything else i can help you with')
    .getResponse();
  }
};

//user asks for help
const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

//user asks to exit skill
const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

//how skill reacts once ended
const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};

//handle errors with skill
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);
    return handlerInput.responseBuilder
      // .speak('Sorry, an error occurred.')
      // .reprompt('Sorry, an error occurred.')
      .speak(ERROR_RESPONSE)
      .reprompt(ERROR_RESPONSE)
      .getResponse();
  },
};


const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    OpenSiteHandler,
    AnswerHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

function httpGet(id) {
  return new Promise(((resolve, reject) => {
    var options = {
        host: 'voice.wearefx.uk',
        path: '/wp-json/wp/v2/question/' + id,
        method: 'GET',
    };

    const request = https.request(options, (response) => {
      response.setEncoding('utf8');
      let returnData = '';

      response.on('data', (chunk) => {
        returnData += chunk;
      });

      response.on('end', () => {
        resolve(JSON.parse(returnData));
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
    request.end();
  }));
}
