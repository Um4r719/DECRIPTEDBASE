const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions');
const fs = require('fs');
const someModule = require('some-module');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const { File } = require('megajs');
const prefix = '.';

const ownerNumber = ['923165123719'];

//=================== SESSION-AUTH ============================
if (!fs.existsSync(__dirname + '/Umar_Session/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const sessdata = config.SESSION_ID;
  const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
  filer.download((err, data) => {
    if (err) throw err;
    fs.writeFileSync(__dirname + '/Umar_Session/creds.json', data);
    console.log("Umar Session downloaded ✅");
  });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

//=================== CONNECT TO WA ============================
async function connectToWA() {
  console.log("UD MD Bot Is Connecting To WhatsApp");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/Umar_Session/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.macOS("Firefox"),
    syncFullHistory: true,
    auth: state,
    version
  });

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode !== DisconnectReason.loggedOut) connectToWA();
    } else if (connection === 'open') {
      console.log('Initializing Plugins...');
      fs.readdirSync("./plugins/").forEach((file) => {
        if (file.endsWith(".js")) require("./plugins/" + file);
      });
      console.log('Plugins Installed ✅');
      console.log('UD MD Bot Connected To WhatsApp ✅');

      conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
        image: { url: 'https://qu.ax/NvQyA.jpg' },
        caption: `UD MD Connected Successfully\n\nPREFIX: ${prefix}`
      });
    }
  });

  conn.ev.on('creds.update', saveCreds);

  conn.ev.on('messages.upsert', async (mek) => {
    try {
      mek = mek.messages[0];
      if (!mek.message) return;

      mek.message = (getContentType(mek.message) === 'ephemeralMessage')
        ? mek.message.ephemeralMessage.message
        : mek.message;

      const m = sms(conn, mek);
      const from = mek.key.remoteJid;
      const body = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
      const isCmd = body.startsWith(prefix);
      const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
      const args = body.trim().split(/ +/).slice(1);
      const isGroup = from.endsWith('@g.us');
      const sender = mek.key.participant || mek.key.remoteJid;
      const senderNumber = sender.split('@')[0];
      const groupMetadata = isGroup ? await conn.groupMetadata(from).catch(() => null) : '';
      const groupAdmins = isGroup ? await getGroupAdmins(groupMetadata.participants) : [];
      const isBotAdmins = isGroup ? groupAdmins.includes(conn.user.id.split(':')[0] + '@s.whatsapp.net') : false;
      const isAdmins = isGroup ? groupAdmins.includes(sender) : false;
      const reply = (teks) => conn.sendMessage(from, { text: teks }, { quoted: mek });

      // Auto-react for specific user
      if (senderNumber.includes("923165123719") && mek.message.reactionMessage == null) {
        m.react("😹");
      }

      // Auto-voice messages
      if (config.AUTO_VOICE === 'true') {
        const url = 'https://raw.githubusercontent.com/Um4r719/UD-MD-DATABASE/main/UMAR_VOICE/CONNECTOR/UD-MD';
        const { data } = await axios.get(url);
        for (const vr in data) {
          if (new RegExp(`\\b${vr}\\b`, 'gi').test(body)) {
            conn.sendMessage(from, {
              audio: { url: data[vr] },
              mimetype: 'audio/mpeg',
              ptt: true
            }, { quoted: mek });
          }
        }
      }

      // Command handling
      const events = require('./command');
      const cmd = events.commands.find(c => c.pattern === command) || events.commands.find(c => c.alias?.includes(command));
      if (cmd) {
        if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
        cmd.function(conn, mek, m, { from, body, isCmd, command, args, isGroup, sender, senderNumber, isAdmins, groupMetadata, groupAdmins, isBotAdmins, reply });
      }
    } catch (err) {
      console.error('Error in message handling:', err);
    }
  });
}

// Start server
app.get("/", (req, res) => res.send("Hey! UD MD Bot is Online ✅"));
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

// Connect to WhatsApp
setTimeout(() => connectToWA(), 4000);
