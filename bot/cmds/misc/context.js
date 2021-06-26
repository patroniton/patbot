const Commando = require('discord.js-commando');
const DatabaseResources = require('../../DatabaseResources.js');
const moment = require('moment');

module.exports = class Context extends Commando.Command {
  constructor(client) {
    super(client, {
      name: 'context',
      group: 'misc',
      memberName: 'context',
      description: 'Gets the context of a Skype message.'
    });
  }

  async run(message, args) {
    try {
      let contextId = args; // message ID to search context for

      // no manual context ID provided
      if (!contextId) {
        const lastMessage = message.guild.me.lastMessage;

        if (lastMessage.content.includes('msgid:')) {
          contextId = lastMessage.content.split('\n')[0].split(':')[1];
        }
      }
      
      if (!contextId) {
        message.channel.send('Sorry, either the last message didn\'t have a correct message ID, or couldn\'t get a context ID.')
        return;
      }

      const contextMessages = await DatabaseResources.getSkypeMessageContext(contextId);

      let reply = `range:${contextMessages[0].id}-${contextMessages[contextMessages.length - 1].id}\n`; // need this separate to insert at the top
      reply += `[${moment.unix(contextMessages[0].timestamp).format('MMM Do YYYY')}]\n`;

      for (let skypeMessage of contextMessages) {
        reply += `${skypeMessage.name}: ${skypeMessage.message}\n`;
      }

      message.channel.send(reply);
    } catch (e) {
      console.log(e);
      message.channel.send('Sorry, something went wrong.');
    }
  }
}