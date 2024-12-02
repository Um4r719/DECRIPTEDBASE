const config = require('../config');
const { cmd } = require('../command');
const { sendMessage } = require('../lib/functions'); // If required, ensure this function exists
const os = require("os");

cmd({
    pattern: "ping",
    react: "📟",
    alias: ["speed"],
    desc: "Check bot's ping",
    category: "main",
    use: '.ping',
    filename: __filename
}, async (conn, mek, m, {
    from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber,
    botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName,
    participants, groupAdmins, isBotAdmins, isAdmins, reply
}) => {
    try {
        const initial = new Date().getTime();
        let pingMessage = await conn.sendMessage(from, { text: '```Testing Ping...```' }, { quoted: mek });
        const final = new Date().getTime();
        const pingTime = final - initial;

        // Delete the previous message and send a new one with the ping result
        await conn.sendMessage(from, { delete: pingMessage.key });
        return await conn.sendMessage(from, { text: `*📍 Pong* *${pingTime} ms*` }, { quoted: mek });
    } catch (error) {
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        console.log(error);
        reply(`❌ *An error occurred!*\n\n${error}`);
    }
});
