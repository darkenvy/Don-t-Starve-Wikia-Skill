/**
 * This simple sample has no external dependencies or session management, and shows the most basic
 * example of how to create a Lambda function for handling Alexa Skill requests.
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Space Geek for a space fact"
 *  Alexa: "Here's your space fact: ..."
 */
var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var AlexaSkill = require('./AlexaSkill');
var AWS = require("aws-sdk");
var request = require('request');
var AllItems = require('./ItemsObj');
// var dynamodb = new AWS.DynamoDB();
// var dynamodb = new AWS.DynamoDB.DocumentClient();
var Fact = function () {
  AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
Fact.prototype = Object.create(AlexaSkill.prototype);
Fact.prototype.constructor = Fact;
Fact.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  // any initialization logic goes here //console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
};
Fact.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  // evalStatement(response);
  if ("request" in response) {
    evalStatement(response); //console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  } else {
    response.ask('Make your jokes. I\'ll be seeing you soon. Go ahead, ask your question.')
  }
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //

/**
 * Overridden to show that a subclass can override this function to teardown session state.
 */
Fact.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  // any cleanup logic goes here
};

Fact.prototype.intentHandlers = {
  "GetNewFactIntent": function (intent, session, response) {
    evalStatement(response, intent);
  },
  "AMAZON.HelpIntent": function (intent, session, response) {
    response.ask('Ask me something like: "Tell me about the box thing", or for a faster response say: "Alexa, ask Charlie about beehives"')
    // response.ask("You can ask me: \"What is the price of Bitcoin\", or \"How much is Litecoin worth in Bitcoin\". You can even ask me bluntly: \"Price of Etherium\"");
  },
  "AMAZON.StopIntent": function (intent, session, response) {
    var speechOutput = "Goodbye";
    response.tell(speechOutput);
  },
  "AMAZON.CancelIntent": function (intent, session, response) {
    var speechOutput = "Goodbye";
    response.tell(speechOutput);
  }
};

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //





function evalStatement(response, intent) {
  var item = intent.slots.Item.value;
  var url = 'http://dontstarve.wikia.com/api/v1/Articles/AsSimpleJson?id=';
  var data = {};
  var total = url + AllItems[item];
  console.log('NEWURL: ', total, item);

  var cb = (err, res, body) => {
    var json = JSON.parse(body);
    var text = 'Could not find';
    try {
      text = json.sections[0].content[0].text;
      text = text.replace(/\\/, ''); // Why isn't this working?!
    } catch (e) {
      console.log('+++ ERROR +++', e);
    }

    response.tell(text);
  }

  // If its not an error, then do the API call
  if (total != undefined) {
    request.get(total, data, cb);
  } else {
    response.tell('The item was undefined.' + item )
  }
  // --------------------- Response --------------------- //


}


// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––– //

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
  // Create an instance of the SpaceGeek skill.
  var fact = new Fact();
  fact.execute(event, context);
};