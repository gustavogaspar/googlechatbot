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
      url: 'https://botv2iad1I0100H203896bots-mpaasocimt.botmxp.ocp.oraclecloud.com:443/connectors/v1/tenants/idcs-100b89d671b54afca3069fe360e4bad4/listeners/webhook/channels/2afbdde0-5aa4-44bc-afcf-41768b8d7eb1',
      secret: 'm9XleQmiIfsl8TLIlw310a6iDcomF7A8',
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
