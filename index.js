// Lambda Function code for Alexa.
const Alexa = require("ask-sdk");
const https = require("https");

const invocationName = "Addey and Stanhope School";

function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],

        // The remaining attributes will be useful after DynamoDB persistence is configured
       "launchCount":0,
       "lastUseTimestamp":0,
       "lastSpeechOutput":{},
       "nextIntent":[]

   };
   return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents

// 1. Intent Handlers =============================================

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'Hello.<break strength="medium"/>' + '  Welcome to the Addey and Stanhope School Alexa skill.<break strength="medium"/>' + ' Say help to hear some options about what you can do.<break strength="medium"/>';

        // let skillTitle = capitalize(invocationName);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./main.json')
            })
            .getResponse();
    },
};



// const LaunchRequest_Handler = {
//   canHandle(handlerInput) {
//     return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
//   },
//   async handle(handlerInput) {
// //   handle(handlerInput) {

//     const speechText = 'Hello World!';
//          const responseBuilder = handlerInput.responseBuilder;


//     console.log("handlerInput",handlerInput)

//     try {
//       await callDirectiveService(handlerInput);

//     } catch (err) {
//     //   if it failed we can continue, just the user will wait longer for first response
//       console.log(DIRECTIVEERRORMESSAGE + err);
//     }


//         return responseBuilder
//           .speak(speechText)
//           .reprompt("dasdsad")
//           .getResponse();
//   },
// };

// function callDirectiveService(handlerInput) {
//   // Call Alexa Directive Service.
//   const requestEnvelope = handlerInput.requestEnvelope;
//   const directiveServiceClient = handlerInput.serviceClientFactory.getDirectiveServiceClient();

//   const requestId = requestEnvelope.request.requestId;
//   const endpoint = requestEnvelope.context.System.apiEndpoint;
//   const token = requestEnvelope.context.System.apiAccessToken;

//   // build the progressive response directive
//   const directive = {
//     header: {
//       requestId,
//     },
//     directive: {
//       type: 'VoicePlayer.Speak',
//       speech: "testing",
//     },

//   };

//   // send directive
//   return directiveServiceClient.enqueue(directive, endpoint, token);

// }




const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        //get the array of custom intents and stored in intents
        let intents = getCustomIntents();

        let sampleIntent = randomElement(intents);

        let say = 'I\'m happy to help!  <break strength="medium"/>';

        say += ' Here\'s an example of what you can ask me. <break strength="strong"/>' +  randomSamples() + '<break strength="strong"/> <emphasis level="reduced"> </emphasis> '
        + randomSamplesTwo();

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withShouldEndSession(false)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./dates.json'),
                datasources: {
                "myDocumentData": {
                "response": say
                }
                },
            })
            .getResponse();
    },
};

function randomSamples() {
    const randomUtterances =
    [
    '<prosody rate="medium" volume="loud" pitch="medium"> When do the easter holidays start for boarders in 2018 ? </prosody>',
    '<prosody rate="medium" volume="loud" pitch="medium"> When the may half term starts ? </prosody>',
    '<prosody rate="medium" volume="loud" pitch="medium"> Tell me the next holiday for boarders ? </prosody>'
    ];

    return randomUtterances[Math.floor(Math.random() * Math.floor(randomUtterances.length))]
}

function randomSamplesTwo() {
    const randomUtterances =
    [
    '<prosody rate="medium" volume="loud" pitch="medium"> Give me the summer term dates for boarders for this year ? </prosody>',
    '<prosody rate="medium" volume="loud" pitch="medium"> Tell me when the october half term is ? </prosody>',
    '<prosody rate="medium" volume="loud" pitch="medium"> Read the next holiday for boarders ? </prosody>'
    ];
    return randomUtterances[Math.floor(Math.random() * Math.floor(randomUtterances.length))]
}

const ReadTermDatesStarter_Handler =  {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name === "ReadTermDates"
        && handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
        .addDelegateDirective()
        .withShouldEndSession(false)
        .getResponse();
    },
};

const ReadTermDatesCompleted_Handler =  {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest"
        && handlerInput.requestEnvelope.request.intent.name === "ReadTermDates"
        && handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
    },
    handle(handlerInput) {

                const request = handlerInput.requestEnvelope.request;
                let slotValues = getSlotValues(request.intent.slots);
                            console.log("slotValues",slotValues);


        let say = '';

            // if (slotValues.season.resolved == 'summer' && slotValues.year.resolved == 'two thousand and eighteen') {
            //     say = '<prosody rate="medium"> The term dates for summer 2018 begins on <emphasis level="moderate"> Wednesday 4th of July </emphasis> and ends on <emphasis level="moderate"> Monday 3rd September </emphasis> <break strength="medium"/>. New pupils are to arrive on <emphasis level="moderate"> Friday 31st of August </emphasis> <break strength="medium"/>. New Year 12 boarders are to arrive on <emphasis level="moderate"> Wednesday 29th of August </emphasis> <break strength="medium"/>. All boarders to arrive on <emphasis level="moderate"> Sunday the 2nd of September. </emphasis> </prosody>';
            // } else if (slotValues.season.resolved == 'christmas' && slotValues.year.resolved == 'two thousand and eighteen') {
            //     say = '<prosody rate="medium"> Christmas holiday in 2018 begins on Friday the 14th of December and ends on Thursday the 3rd of January <break strength="medium"/>. For boarders <break strength="medium"/>, the holiday begins on Friday the 14th of December and ends Wednesday the 2nd of January. </prosody>';
            // } else if (slotValues.season.resolved == 'easter' && slotValues.year.resolved == 'two thousand and eighteen') {
            //     say = '<prosody rate="medium"> The term dates for easter 2018 begin on Thursday 29th of March and ends on Tuesday the 17th of April <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on Thursday 29th of March and ends on Monday 16th of April. </prosody>';
            // } else if (slotValues.season.resolved == 'summer' && slotValues.year.resolved == 'two thousand and nineteen') {
            //     say = '<prosody rate="medium"> The term dates for summer 2019 begins on Wednesday the 3rd of July <break strength="medium"/>. We are yet to announce the term start date. </prosody>';
            // } else if (slotValues.season.resolved == 'christmas' && slotValues.year.resolved == 'two thousand and nineteen') {
            //     say = '<prosody rate="medium"> Christmas holidays in 2019 are yet to be announced <break strength="medium"/>. Please ask me again in the future. </prosody>';
            // } else if (slotValues.season.resolved == 'easter' && slotValues.year.resolved == 'two thousand and nineteen') {
            //     say = '<prosody rate="medium"> The term dates for Easter 2019 begin on <emphasis level="moderate">Thursday the 18th of April</emphasis> and ends on <emphasis level="moderate">Tuesday 23rd of April</emphasis> <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on <emphasis level="moderate">Thursday 18th of April</emphasis> and ends on <emphasis level="moderate">Wednesday 24th of April.</emphasis> </prosody>';
            // } else if (slotValues.season.resolved == '' && slotValues.year.resolved == 'two thousand and nineteen') {
            //     say = '<prosody rate="medium"> season is not available <break strength="medium"/>, please try again';
            // }

                        if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'two thousand and eighteen') {
                say = '<prosody rate="medium"> The term dates for summer 2018 begins on <emphasis level="moderate"> Wednesday 4th of July </emphasis> and ends on <emphasis level="moderate"> Monday 3rd September </emphasis> <break strength="medium"/>. New pupils are to arrive on <emphasis level="moderate"> Friday 31st of August </emphasis> <break strength="medium"/>. New Year 12 boarders are to arrive on <emphasis level="moderate"> Wednesday 29th of August </emphasis> <break strength="medium"/>. All boarders to arrive on <emphasis level="moderate"> Sunday the 2nd of September. </emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == '2018') {
                say = '<prosody rate="medium"> The term dates for summer 2018 begins on <emphasis level="moderate"> Wednesday 4th of July </emphasis> and ends on <emphasis level="moderate"> Monday 3rd September </emphasis> <break strength="medium"/>. New pupils are to arrive on <emphasis level="moderate"> Friday 31st of August </emphasis> <break strength="medium"/>. New Year 12 boarders are to arrive on <emphasis level="moderate"> Wednesday 29th of August </emphasis> <break strength="medium"/>. All boarders to arrive on <emphasis level="moderate"> Sunday the 2nd of September. </emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'twenty eighteen') {
                say = '<prosody rate="medium"> The term dates for summer 2018 begins on <emphasis level="moderate"> Wednesday 4th of July </emphasis> and ends on <emphasis level="moderate"> Monday 3rd September </emphasis> <break strength="medium"/>. New pupils are to arrive on <emphasis level="moderate"> Friday 31st of August </emphasis> <break strength="medium"/>. New Year 12 boarders are to arrive on <emphasis level="moderate"> Wednesday 29th of August </emphasis> <break strength="medium"/>. All boarders to arrive on <emphasis level="moderate"> Sunday the 2nd of September. </emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'last year') {
                say = '<prosody rate="medium"> The term dates for summer 2018 begins on <emphasis level="moderate"> Wednesday 4th of July </emphasis> and ends on <emphasis level="moderate"> Monday 3rd September </emphasis> <break strength="medium"/>. New pupils are to arrive on <emphasis level="moderate"> Friday 31st of August </emphasis> <break strength="medium"/>. New Year 12 boarders are to arrive on <emphasis level="moderate"> Wednesday 29th of August </emphasis> <break strength="medium"/>. All boarders to arrive on <emphasis level="moderate"> Sunday the 2nd of September. </emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'two thousand and eighteen') {
                say = '<prosody rate="medium"> Christmas holiday in 2018 begins on Friday the 14th of December and ends on Thursday the 3rd of January <break strength="medium"/>. For boarders <break strength="medium"/>, the holiday begins on Friday the 14th of December and ends Wednesday the 2nd of January. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == '2018') {
                say = '<prosody rate="medium"> Christmas holiday in 2018 begins on Friday the 14th of December and ends on Thursday the 3rd of January <break strength="medium"/>. For boarders <break strength="medium"/>, the holiday begins on Friday the 14th of December and ends Wednesday the 2nd of January. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'twenty eighteen') {
                say = '<prosody rate="medium"> Christmas holiday in 2018 begins on Friday the 14th of December and ends on Thursday the 3rd of January <break strength="medium"/>. For boarders <break strength="medium"/>, the holiday begins on Friday the 14th of December and ends Wednesday the 2nd of January. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'last year') {
                say = '<prosody rate="medium"> Christmas holiday in 2018 begins on Friday the 14th of December and ends on Thursday the 3rd of January <break strength="medium"/>. For boarders <break strength="medium"/>, the holiday begins on Friday the 14th of December and ends Wednesday the 2nd of January. </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'two thousand and eighteen') {
                say = '<prosody rate="medium"> The term dates for easter 2018 begin on Thursday 29th of March and ends on Tuesday the 17th of April <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on Thursday 29th of March and ends on Monday 16th of April. </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == '2018') {
                say = '<prosody rate="medium"> The term dates for easter 2018 begin on Thursday 29th of March and ends on Tuesday the 17th of April <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on Thursday 29th of March and ends on Monday 16th of April. </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'twenty eighteen') {
                say = '<prosody rate="medium"> The term dates for easter 2018 begin on Thursday 29th of March and ends on Tuesday the 17th of April <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on Thursday 29th of March and ends on Monday 16th of April. </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'last year') {
                say = '<prosody rate="medium"> The term dates for easter 2018 begin on Thursday 29th of March and ends on Tuesday the 17th of April <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on Thursday 29th of March and ends on Monday 16th of April. </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'two thousand and nineteen') {
                say = '<prosody rate="medium"> The term dates for summer 2019 begins on Wednesday the 3rd of July <break strength="medium"/>. We are yet to announce the term start date. </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'twenty nineteen') {
                say = '<prosody rate="medium"> The term dates for summer 2019 begins on Wednesday the 3rd of July <break strength="medium"/>. We are yet to announce the term start date. </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == '2019') {
                say = '<prosody rate="medium"> The term dates for summer 2019 begins on Wednesday the 3rd of July <break strength="medium"/>. We are yet to announce the term start date. </prosody>';
            } else if (slotValues.season.resolved == 'summer' && slotValues.year.heardAs == 'this year') {
                say = '<prosody rate="medium"> The term dates for summer 2019 begins on Wednesday the 3rd of July <break strength="medium"/>. We are yet to announce the term start date. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'two thousand and nineteen') {
                say = '<prosody rate="medium"> Christmas holidays in 2019 are yet to be announced <break strength="medium"/>. Please ask me again in the future. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'twenty nineteen') {
                say = '<prosody rate="medium"> Christmas holidays in 2019 are yet to be announced <break strength="medium"/>. Please ask me again in the future. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == '2019') {
                say = '<prosody rate="medium"> Christmas holidays in 2019 are yet to be announced <break strength="medium"/>. Please ask me again in the future. </prosody>';
            } else if (slotValues.season.resolved == 'christmas' && slotValues.year.heardAs == 'this year') {
                say = '<prosody rate="medium"> Christmas holidays in 2019 are yet to be announced <break strength="medium"/>. Please ask me again in the future. </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'two thousand and nineteen') {
                say = '<prosody rate="medium"> The term dates for Easter 2019 begin on <emphasis level="moderate">Thursday the 18th of April</emphasis> and ends on <emphasis level="moderate">Tuesday 23rd of April</emphasis> <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on <emphasis level="moderate">Thursday 18th of April</emphasis> and ends on <emphasis level="moderate">Wednesday 24th of April.</emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'twenty nineteen') {
                say = '<prosody rate="medium"> The term dates for Easter 2019 begin on <emphasis level="moderate">Thursday the 18th of April</emphasis> and ends on <emphasis level="moderate">Tuesday 23rd of April</emphasis> <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on <emphasis level="moderate">Thursday 18th of April</emphasis> and ends on <emphasis level="moderate">Wednesday 24th of April.</emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == '2019') {
                say = '<prosody rate="medium"> The term dates for Easter 2019 begin on <emphasis level="moderate">Thursday the 18th of April</emphasis> and ends on <emphasis level="moderate">Tuesday 23rd of April</emphasis> <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on <emphasis level="moderate">Thursday 18th of April</emphasis> and ends on <emphasis level="moderate">Wednesday 24th of April.</emphasis> </prosody>';
            } else if (slotValues.season.resolved == 'easter' && slotValues.year.heardAs == 'this year') {
                say = '<prosody rate="medium"> The term dates for Easter 2019 begin on <emphasis level="moderate">Thursday the 18th of April</emphasis> and ends on <emphasis level="moderate">Tuesday 23rd of April</emphasis> <break strength="medium"/>. For boarding schools <break strength="medium"/>, the term starts on <emphasis level="moderate">Thursday 18th of April</emphasis> and ends on <emphasis level="moderate">Wednesday 24th of April.</emphasis> </prosody>';
            } else if (slotValues.season.resolved == '' && slotValues.year.heardAs == 'two thousand and nineteen') {
                say = '<prosody rate="medium"> season is not available <break strength="medium"/>, please try again';
            }


            const attributesManager = handlerInput.attributesManager;
            let sessionAttributes = attributesManager.getSessionAttributes();
            sessionAttributes.lastResponseFromAlexa = say;
            attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./dates.json'),
                datasources: {
                "myDocumentData": {
                "response": say
                }
                },
            })
            .withShouldEndSession(false)
            .getResponse();
    },
};


const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
              let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
              let say ='sorry repeat is not available, please ask the question again';

              if (sessionAttributes.lastResponseFromAlexa) {
                  say = sessionAttributes.lastResponseFromAlexa;
              }

    return handlerInput.responseBuilder
          .speak(say)
          .withShouldEndSession(false)
          .getResponse();
  },
};


const ReadBankHolidays_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ReadBankHolidays' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        // delegate to Alexa to collect all the required slots
        const currentIntent = request.intent;
        if (request.dialogState && request.dialogState !== 'COMPLETED') {
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();

        }

        let say = ' ';

        let slotValues = getSlotValues(request.intent.slots);

        if ("all of them" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> New Years day is on Monday the 1st of January 2019 <break strength="medium"/>. Good Friday is on Friday the 30th of March and Easter Monday is on Monday the 2nd of April <break strength="medium"/>. Early May bank holiday is on Monday the 7th of May <break strength="medium"/>. End of May bank holiday is on Monday the 28th of May <break strength="medium"/>. Summer bank holiday takes place on Monday the 27th of August <break strength="medium"/>.Christmas bank holiday dates are Tuesday the 25th of December and Wednesday the 26th of December <break strength="medium"/>. </prosody>';
        } else if ("next" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> The next bank holiday is the summer bank holiday which takes place on Monday the 27th of August 2018. </prosody>';
        } else if ("may" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> Early May bank holiday is on Monday the 7th of May <break strength="medium"/>. End of May bank holiday is on Monday the 28th of May. </prosody>';
        } else if ("new years day" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> New Years day is on Monday the 1st of January 2019. </prosody>';
        } else if ("christmas" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> Christmas bank holiday dates are Tuesday the 25th of December and Wednesday the 26th of December. </prosody>';
        } else if ("easter" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> Good Friday is on Friday the 30th of March and Easter Monday is on Monday the 2nd of April. </prosody>';
        } else if ("summer" == slotValues.bankseason.resolved) {
            say = '<prosody rate="medium"> Summer bank holiday takes place on Monday the 27th of August. </prosody>';
        } else {
            say = 'no bank holidays available for this season'
        }

        const attributesManager = handlerInput.attributesManager;
        sessionAttributes.lastResponseFromAlexa = say;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./dates.json'),
                datasources: {
                "myDocumentData": {
                "response": say
                }
                },
            })
            .withShouldEndSession(false)
            .getResponse();
    },
};


const ReadHalfTerm_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ReadHalfTerm' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        const currentIntent = request.intent;
        if (request.dialogState && request.dialogState !== 'COMPLETED') {
            return handlerInput.responseBuilder
                .addDelegateDirective(currentIntent)
                .getResponse();

        }
        let say = ' ';

        let slotValues = getSlotValues(request.intent.slots);

        if ("all of them" == slotValues.halftermseason.resolved) {
            say = '<prosody rate="medium"> February half term takes place from Monday the 18th of February until Friday the 22nd of February 2019 <break strength="medium"/>. May half term takes place from Monday the 27th of May until Friday the 31st of May 2019. October half term takes place from Monday the 22nd of October until Friday the 2nd of November 2018. </prosody>';
        } else if ("next" == slotValues.halftermseason.resolved) {
            say = '<prosody rate="medium"> The next half term is the October half term which takes place on Monday the 22nd of October and ends on Friday the 2nd of November 2018. </prosody>';
        } else if ("october" == slotValues.halftermseason.resolved) {
            say = '<prosody rate="medium"> October half term takes place from Monday the 22nd of October until Friday the 2nd of November 2018. </prosody>';
        } else if ("february" == slotValues.halftermseason.resolved) {
            say = '<prosody rate="medium"> February half term takes place from Monday the 18th of February until Friday the 22nd of February 2019. </prosody>';
        } else if ("may" == slotValues.halftermseason.resolved) {
            say = '<prosody rate="medium"> May half term takes place from Monday the 27th of May until Friday the 31st of May 2019. </prosody>';
        } else {
            say = 'no half term available for this season'
        }

        const attributesManager = handlerInput.attributesManager;
        sessionAttributes.lastResponseFromAlexa = say;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./dates.json'),
                datasources: {
                "myDocumentData": {
                "response": say
                }
                },
            })
            .withShouldEndSession(false)
            .getResponse();
    },
};

const ReadNextHoliday_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ReadNextHoliday' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The next holiday for boarders is the summer holidays which begins on Wednesday the 4th of July. The holiday ends for New Year 12 boarders on Wednesday 29th of August. The holiday ends for all boarders on Sunday the 2nd of September 2018. ';

        const attributesManager = handlerInput.attributesManager;
        sessionAttributes.lastResponseFromAlexa = say;
        attributesManager.setSessionAttributes(sessionAttributes);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
                        .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: require('./dates.json'),
                datasources: {
                "myDocumentData": {
                "response": say
                }
                },
            })
            .withShouldEndSession(false)
            .getResponse();
    },
};

const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};


const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_MoreIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.MoreIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.MoreIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NavigateSettingsIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateSettingsIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateSettingsIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_NextIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NextIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NextIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PageUpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageUpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PageUpIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PageDownIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PageDownIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PageDownIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_PreviousIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PreviousIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PreviousIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollRightIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollRightIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollRightIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollDownIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollDownIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollDownIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollLeftIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollLeftIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollLeftIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_ScrollUpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.ScrollUpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.ScrollUpIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};


const OurFallbackIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'OurFallbackIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let historyOfAllIntents = handlerInput.requestEnvelope.session.attributes.history;
        let lastIntent = historyOfAllIntents[historyOfAllIntents.length - 1];
        const intentRequestName = lastIntent.IntentRequest

        let say = 'I didn\'t quite get that - could you say that again or ask for more help to hear some options.';

        if (intentRequestName == 'ReadTermDates') {
            say = 'please try again, ask me when the summer, christmas and easter holidays are for boarders';
        } else if (intentRequestName == 'ReadBankHolidays') {
            say = 'Im sorry, I didnt understand that, you can ask me when the bank holidays may, easter, summer, christmas term dates start and end';
        } else if (intentRequestName == 'ReadHalfTerm') {
            say = 'please try again, ask me when the october, february and may holidays are for boarders';
        } else if (intentRequestName == 'ReadNextHoliday') {
            say = 'The next holiday for boarders is the summer holidays which begins on Wednesday the 4th of July. The holiday ends for New Year 12 boarders on Wednesday 29th of August. The holiday ends for all boarders on Sunday the 2nd of September 2018. ';
        }

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('Sorry, an error occurred.  Please say again.')
            .reprompt('Sorry, an error occurred.  Please say again.')
            .getResponse();
    }
};


// 2. Constants ===========================================================================

    // Here you can define static data, to be used elsewhere in your code.  For example:
    //    const myString = "Hello World";
        // const myArray  = [ "orange", "grape", "strawberry" ];
    //    const myObject = { "city": "Boston",  "state":"Massachusetts" };

const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}


function randomElement(myArray) {
    return(myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return(str.replace('<speak>', '').replace('</speak>', ''));
}




function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name  = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        ERstatus: 'ER_SUCCESS_MATCH'
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: '',
                        ERstatus: 'ER_SUCCESS_NO_MATCH'
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                heardAs: filledSlots[item].value,
                resolved: '',
                ERstatus: ''
            };
        }
    }, this);

    return slotValues;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }


    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function(element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}


const welcomeCardImg = {
       smallImageUrl: "https://s3-eu-west-1.amazonaws.com/berkhamstedschoolsmallimage/download.jpeg",
    // smallImageUrl: "https://s3-eu-west-1.amazonaws.com/berkhamstedschoolsmallimage/Berkhamsted_School_Logo.png",
    // largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"
};

// const DisplayImg1 = {
//     title: 'Jet Plane',
//     url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
// };
// const DisplayImg2 = {
//     title: 'Starry Sky',
//     url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'
// };

function getCustomIntents() {
    //get all the intents as an array and store in modelIntents
    const modelIntents = model.interactionModel.languageModel.intents;

    //an empty array stored in customIntents
    let customIntents = [];

    //loop throught based on the number of built in and custom intents available
    for (let i = 0; i < modelIntents.length; i++) {

        //for each one if it is not a built in intent and not launchRequest then push the custom intent in an empty array
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" && modelIntents[i].name !== "OurFallbackIntent") {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

function getSampleUtterance(intent) {

    return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }

}

function getPreviousSpeechOutput(attrs) {

    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }

}

function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc" : ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}


const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if(handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if(Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest' ) {

            let slots = [];

            IntentRequest = {
                'IntentRequest' : thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest' : thisRequest.intent.name,
                    'slots' : slots
                };

            }

        } else {
            IntentRequest = {'IntentRequest' : thisRequest.type};
        }
        if(history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};




const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if(handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                    .then((sessionAttributes) => {
                        sessionAttributes = sessionAttributes || {};


                        sessionAttributes['launchCount'] += 1;

                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.savePersistentAttributes()
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

            });

        } // end session['new']
    }
};


const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech":responseOutput.outputSpeech.ssml,
            "reprompt":responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            });

        }

    }
};

const seasonResponse = (slotValues, seasonType, heardAs) => {
      let arrayForAllSynonyms = [];
      var selectedSynonym = '';

    //map through the season type and only push into an array
   seasonType.values.map(data => {
       if (typeof data.name.synonyms !== 'undefined') {

           const selectSynonyms = data.name.synonyms;
           selectSynonyms.map( synonym => {
               arrayForAllSynonyms.push(synonym);
           } );

       }
   });

       //check season type response from user with the array of responses. if there is a match then return the value
      for (let i = 0; i < arrayForAllSynonyms.length; i++) {
    //   if (slotValues.season.heardAs.toLowerCase() == arrayForAllSynonyms[i]) {
         if (heardAs.toLowerCase() == arrayForAllSynonyms[i]) {
            selectedSynonym = arrayForAllSynonyms[i];
          break;
      }
  }

return selectedSynonym;
};




// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
// const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler,
        AMAZON_HelpIntent_Handler,
        AMAZON_StopIntent_Handler,
        ReadTermDatesStarter_Handler,
        ReadTermDatesCompleted_Handler,
        AMAZON_MoreIntent_Handler,
        AMAZON_NavigateHomeIntent_Handler,
        AMAZON_NavigateSettingsIntent_Handler,
        AMAZON_NextIntent_Handler,
        AMAZON_PageUpIntent_Handler,
        AMAZON_PageDownIntent_Handler,
        AMAZON_PreviousIntent_Handler,
        AMAZON_ScrollRightIntent_Handler,
        AMAZON_ScrollDownIntent_Handler,
        AMAZON_ScrollLeftIntent_Handler,
        AMAZON_ScrollUpIntent_Handler,
        RepeatHandler,
        ReadBankHolidays_Handler,
        ReadHalfTerm_Handler,
        ReadNextHoliday_Handler,
        OurFallbackIntent_Handler,
        LaunchRequest_Handler,
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
        // .withApiClient(new Alexa.DefaultApiClient())
    // .addRequestInterceptors(InitMemoryAttributesInterceptor)
    // .addRequestInterceptors(RequestHistoryInterceptor)

   // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

 // .addRequestInterceptors(RequestPersistenceInterceptor)
 // .addResponseInterceptors(ResponsePersistenceInterceptor)

 // .withTableName("askMemorySkillTable")
 // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const model = {
  "interactionModel": {
    "languageModel": {
      "invocationName": "berkhamsted school",
      "intents": [
        {
          "name": "AMAZON.CancelIntent",
          "samples": []
        },
        {
          "name": "AMAZON.HelpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.StopIntent",
          "samples": []
        },
        {
          "name": "ReadTermDates",
          "slots": [
            {
              "name": "season",
              "type": "season",
              "samples": [
                "{season}"
              ]
            },
            {
              "name": "year",
              "type": "year",
              "samples": [
                "{year}"
              ]
            }
          ],
          "samples": [
            "when do the {season} holidays start for boarders in {year}",
            "{season} term dates for boarders in {year}",
            "whens the {season} holidays for boarders in {year}",
            "{year} {season} dates for boarders",
            "read the {season} term dates for boarders for {year}",
            "the {season} term dates for boarders in {year}",
            "give me the {season} term dates for boarders for {year}",
            "tell me the {season} term dates for boarders for {year}",
            "{season} {year} for boarders",
            "read the {season} holiday dates for boarders",
            "tell me the {season} holiday dates for boarders",
            "give me the {season} holiday dates for boarders",
            "the {season} holiday dates for boarders",
            "{season} holidays for boarders",
            "{season} term dates for boarders",
            "when do the {season} holidays start for boarders",
            "the term dates for {season} {year}",
            "read the term dates for {season} {year}",
            "what are the term dates for {season} {year}",
            "tell me the term dates for {season} {year}",
            "give me the term dates for {season} {year}",
            "dates for {season} {year}",
            "what are the dates for {season} holidays",
            "give me the term dates for {season} holidays",
            "when do the {season} holidays start",
            "{season} holidays",
            "the term dates for {season} holidays",
            "the term dates for {season} {year} for boarders",
            "the term dates for {season} for boarders",
            "the term dates for {season} holidays {year}",
            "read term dates"
          ]
        },
        {
          "name": "AMAZON.MoreIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateHomeIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NavigateSettingsIntent",
          "samples": []
        },
        {
          "name": "AMAZON.NextIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PageUpIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PageDownIntent",
          "samples": []
        },
        {
          "name": "AMAZON.PreviousIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollRightIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollDownIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollLeftIntent",
          "samples": []
        },
        {
          "name": "AMAZON.ScrollUpIntent",
          "samples": []
        },
        {
          "name": "ReadBankHolidays",
          "slots": [
            {
              "name": "bankseason",
              "type": "season",
              "samples": [
                "{bankseason}"
              ]
            }
          ],
          "samples": [
            "when the {bankseason} bank holiday starts",
            "what the {bankseason} bank holiday is",
            "when the {bankseason} bank holiday is",
            "whats the {bankseason} bank holiday",
            "what is the {bankseason} bank holiday",
            "tell me when the {bankseason} bank holiday is",
            "when is the {bankseason} bank holiday",
            "{bankseason} bank holiday",
            "bank holidays"
          ]
        },
        {
          "name": "ReadHalfTerm",
          "slots": [
            {
              "name": "halftermseason",
              "type": "season"
            }
          ],
          "samples": [
            "when the {halftermseason} half term starts",
            "when the {halftermseason} half term is",
            "what the {halftermseason} half term is",
            "give me the dates for the {halftermseason} half term",
            "tell me when the {halftermseason} half term is",
            "What is the {halftermseason} half term",
            "when is the {halftermseason} half term",
            "whens the {halftermseason} half term",
            "can you give me the term dates for half term",
            "half term dates",
            "dates for half term",
            "gives me the dates for half term",
            "tell me when half term is",
            "when is half term",
            "{halftermseason} half term",
            "half term"
          ]
        },
        {
          "name": "ReadNextHoliday",
          "slots": [],
          "samples": [
            "tell me the next holiday for boarders",
            "give me the next holiday for boarders",
            "read the next holiday for boarders",
            "tell me when the next holiday is for boarders is",
            "whats the next holiday for boarders",
            "boarders next holiday",
            "what is the next holiday",
            "when the next holiday starts",
            "give me the dates for the next holiday",
            "tell me when the next holiday is",
            "whats the next holiday",
            "whens the next holiday",
            "when is the next holiday",
            "next holiday"
          ]
        },
        {
          "name": "OurFallbackIntent",
          "slots": [
            {
              "name": "gumpf",
              "type": "AMAZON.GB_FIRST_NAME"
            }
          ],
          "samples": [
            "{gumpf}"
          ]
        },
        {
          "name": "LaunchRequest"
        }
      ],
      "types": [
        {
          "name": "season",
          "values": [
            {
              "id": "ALLOFTHEM",
              "name": {
                "value": "all of them",
                "synonyms": [
                  "all of them"
                ]
              }
            },
            {
              "id": "NEXT",
              "name": {
                "value": "next",
                "synonyms": [
                  "next"
                ]
              }
            },
            {
              "id": "october",
              "name": {
                "value": "october",
                "synonyms": [
                  "october"
                ]
              }
            },
            {
              "id": "february",
              "name": {
                "value": "february",
                "synonyms": [
                  "february"
                ]
              }
            },
            {
              "id": "may",
              "name": {
                "value": "may",
                "synonyms": [
                  "may",
                  "end of may",
                  "spring bank holiday",
                  "early may"
                ]
              }
            },
            {
              "id": "nyd",
              "name": {
                "value": "new years day",
                "synonyms": [
                  "new years day"
                ]
              }
            },
            {
              "id": "christmas",
              "name": {
                "value": "christmas",
                "synonyms": [
                  "christmas",
                  "boxing day"
                ]
              }
            },
            {
              "id": "easter",
              "name": {
                "value": "easter",
                "synonyms": [
                  "easter",
                  "good friday"
                ]
              }
            },
            {
              "id": "summer",
              "name": {
                "value": "summer",
                "synonyms": [
                  "summer"
                ]
              }
            }
          ]
        },
        {
          "name": "year",
          "values": [
            {
              "id": "2019",
              "name": {
                "value": "2019",
                "synonyms": [
                  "next year",
                  "2019"
                ]
              }
            },
            {
              "id": "2018",
              "name": {
                "value": "2018",
                "synonyms": [
                  "this year",
                  "2018"
                ]
              }
            }
          ]
        },
        {
          "name": "AMAZON.GB_FIRST_NAME",
          "values": [
            {
              "name": {
                "value": "hio dkhd"
              }
            },
            {
              "name": {
                "value": "hello "
              }
            },
            {
              "name": {
                "value": "dolk hhsh"
              }
            },
            {
              "name": {
                "value": "sdfsd"
              }
            },
            {
              "name": {
                "value": "sdfkjsdjklfs"
              }
            },
            {
              "name": {
                "value": "uhjd flisd gh jhsdl fsdif f"
              }
            }
          ]
        }
      ]
    },
    "dialog": {
      "intents": [
        {
          "name": "ReadTermDates",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "season",
              "type": "season",
              "confirmationRequired": false,
              "elicitationRequired": true,
              "prompts": {
                "elicitation": "Elicit.Slot.469535160799.1188150204176"
              }
            },
            {
              "name": "year",
              "type": "year",
              "confirmationRequired": false,
              "elicitationRequired": true,
              "prompts": {
                "elicitation": "Elicit.Slot.469535160799.148984959586"
              }
            }
          ]
        },
        {
          "name": "ReadBankHolidays",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "bankseason",
              "type": "season",
              "confirmationRequired": false,
              "elicitationRequired": true,
              "prompts": {
                "elicitation": "Elicit.Slot.1500272900839.1424085487941"
              }
            }
          ]
        },
        {
          "name": "ReadHalfTerm",
          "confirmationRequired": false,
          "prompts": {},
          "slots": [
            {
              "name": "halftermseason",
              "type": "season",
              "confirmationRequired": false,
              "elicitationRequired": true,
              "prompts": {
                "elicitation": "Elicit.Slot.874670845004.293741582139"
              }
            }
          ]
        }
      ]
    },
    "prompts": [
      {
        "id": "Elicit.Slot.1149138038719.964474289198",
        "variations": [
          {
            "type": "PlainText",
            "value": "Sorry did you say start, half or end?"
          }
        ]
      },
      {
        "id": "Elicit.Slot.469535160799.1188150204176",
        "variations": [
          {
            "type": "PlainText",
            "value": "Alexa prompts for season"
          }
        ]
      },
      {
        "id": "Elicit.Slot.469535160799.148984959586",
        "variations": [
          {
            "type": "PlainText",
            "value": "Great, what year?"
          },
          {
            "type": "PlainText",
            "value": "Okay, what year?"
          },
          {
            "type": "PlainText",
            "value": "Fantastic, what year?"
          }
        ]
      },
      {
        "id": "Elicit.Slot.1500272900839.1424085487941",
        "variations": [
          {
            "type": "PlainText",
            "value": "Is there a particular bank holiday you require"
          }
        ]
      },
      {
        "id": "Elicit.Slot.874670845004.293741582139",
        "variations": [
          {
            "type": "PlainText",
            "value": "Which half term are you looking for, February half term, May half term, Or October half term?"
          }
        ]
      }
    ]
  }
};
