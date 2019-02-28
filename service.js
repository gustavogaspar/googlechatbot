const OracleBot = require('@oracle/bots-node-sdk');
const { WebhookClient, WebhookEvent } = OracleBot.Middleware;
const bodyParser = require('body-parser')
const { dialogflow } = require('actions-on-google');
const googleAssistant = dialogflow();

module.exports = (app) => {
  const logger = console;
  OracleBot.init(app, {
    logger,
  });

  const webhook = new WebhookClient({
    channel: {
      url: process.env.BOT_WEBHOOK_URL,
      secret: process.env.BOT_WEBHOOK_SECRET,
    }
  });

  webhook
    .on(WebhookEvent.ERROR, err => logger.error('Error:', err.message))
    .on(WebhookEvent.MESSAGE_SENT, message => logger.info('Message to Digital Assistant:', message))
    .on(WebhookEvent.MESSAGE_RECEIVED, message => logger.info('Message from Digital Assistant:', message))

  googleAssistant.intent('Default Fallback Intent', (conv) => {
    const promise = new Promise(function (resolve) {
      const MessageModel = webhook.MessageModel();
      const message = {
        userId: 'Google Home',
        messagePayload: MessageModel.textConversationMessage(conv.query)
      };

      webhook.send(message);

      webhook.on(WebhookEvent.MESSAGE_RECEIVED, message => {
        resolve(message);
      });
    })
      .then(function (result) {
          conv.ask(result.messagePayload.text);
        })
    return promise;
  })
  
  app.post('/bot/message', webhook.receiver());
 
  app.use('/bot/action',bodyParser.json(),googleAssistant);
  app.post('/bot/action', googleAssistant );
}