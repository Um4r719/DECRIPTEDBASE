const config = require("../config");
const { cmd, commands } = require("../command");
const { runtime } = require("../lib/functions");

cmd({
  pattern: "menu",
  desc: "To get the menu.",
  react: '📜',
  category: "main",
  filename: __filename
}, async (client, message, args, context, reply) => {
  try {
    let menuCategories = {
      main: '',
      download: '',
      group: '',
      owner: '',
      convert: '',
      search: '',
      ai: '',
      fun: '',
      other: ''
    };

    for (let i = 0; i < commands.length; i++) {
      if (commands[i].pattern && !commands[i].dontAddCommandList) {
        menuCategories[commands[i].category] += `*◦ :* ${commands[i].pattern}\n`;
      }
    }

    let menuMessage = `
👋 Hello, *${context.pushname}*,
⦁ I am an automated WhatsApp bot that can help you perform tasks, search, and retrieve data/information through *WhatsApp*.

> *Version*: ${require("../package.json").version}
> *Run Time*: ${runtime(process.uptime())}

╭╼╼╼╼╼╼╼╼╼╼
*├1 • OWNER*
*├2 • CONVERT*
*├3 • DOWNLOAD*
*├4 • AI*
*├5 • SEARCH*
*├6 • MAIN*
*├7 • GROUP*
╰╼╼╼╼╼╼╼╼╼╼

_*☘ Select the number corresponding to the category you want*_
    `;

    const response = await client.sendMessage(context.from, {
      document: { url: "https://i.imgur.com/IfaDdJf.jpeg" },
      fileName: "UD MD BOT",
      mimetype: "application/xml",
      fileLength: 1000000000000,
      caption: menuMessage,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "𝐔𝐌𝟒𝐑 𝐗𝐃🌈™",
          newsletterJid: "120363315623541442@newsletter"
        },
        externalAdReply: {
          title: "ＵＤ ＭＤ ＢＯＴ",
          body: "Powered by • Um4r",
          thumbnailUrl: config.ALIVE_IMG,
          sourceUrl: "https://instagram.com/um4rxd",
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    });

    const messageId = response.key.id;

    client.ev.on("messages.upsert", async event => {
      const incomingMessage = event.messages[0];
      if (!incomingMessage.message) {
        return;
      }

      const messageText = incomingMessage.message.conversation || incomingMessage.message.extendedTextMessage?.text;
      const chatId = incomingMessage.key.remoteJid;
      const isReplyToMenu = 
      incomingMessage.message.extendedTextMessage && 
      incomingMessage.message.extendedTextMessage.contextInfo && // Check if contextInfo exists
      incomingMessage.message.extendedTextMessage.contextInfo.stanzaId === messageId;
      
      if (isReplyToMenu) {
        await client.sendMessage(chatId, {
          react: {
            text: '👾',
            key: incomingMessage.key
          }
        });

        let categoryCommands;
        switch (messageText) {
          case '1': {
          context.reply("hiiii")
          }
           // categoryCommands = "\n👩‍💻 *OWNER COMMANDS* 👩‍💻\n\n\n";
            break;
          case '2':
            categoryCommands = "\n🌀 *CONVERT COMMANDS* 🌀\n\n\n";
            break;
          case '3':
            categoryCommands = "\n📥 *DOWNLOAD COMMANDS* 📥\n\n\n";
            break;
          case '4':
            categoryCommands = "\n👾 *AI COMMANDS* 👾\n\n\n";
            break;
          // Add additional cases for other categories here
          default:
            return;
        }

        await client.sendMessage(chatId, {
          document: { url: "https://i.imgur.com/IfaDdJf.jpeg" },
          fileName: "UD MD BOT",
          mimetype: "application/xml",
          fileLength: 1000000000000,
          caption: categoryCommands,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: "𝐔𝐌𝟒𝐑 𝐗𝐃🌈™",
              newsletterJid: "120363315623541442@newsletter"
            },
            externalAdReply: {
              title: "ＵＤ ＭＤ ＢＯＴ",
              body: "Powered by • Um4r",
              thumbnailUrl: config.ALIVE_IMG,
              sourceUrl: "https://instagram.com/um4rxd",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
    });
  } catch (error) {
    console.error("Error in menu command:", error);
  }
});
