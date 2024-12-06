const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys');

const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson
} = require('./lib/functions');

const fetch = require('node-fetch');
const fs = require('fs');
const mega = require('mega');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');
const util = require('util');
const { sms, downloadMediaMessage } = require('./lib/msg');
const axios = require('axios');
const express = require("express");
const app = express();
const port = process.env.PORT || 9090;

// Prefix and owner details
const prefix = '.';
const ownerNumber = ['923165123719'];

// Use the mega package to fetch the file
const client = mega({ email: 'permaunban@gmail.com', password: 'umar165123719.' });
const file = client.download('https://mega.nz/file/<file-id>#<file-key>', '/path/to/save/file');

file.on('end', () => {
  console.log('Download complete!');
});

// Session auth management
if (!fs.existsSync(__dirname + '/CONNECTION/creds.json')) {
    if (!config.SESSION_ID) {
        console.log('Please add your session to SESSION_ID env !!');
        process.exit(1);
    }
    const sessdata = config.SESSION_ID;
    const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
    filer.download((err, data) => {
        if (err) throw err;
        fs.writeFile(__dirname + '/CONNECTION/creds.json', data, () => {
            console.log("SESSION DOWNLOADED COMPLETED ✅");
        });
    });
}

// Main function to handle the WhatsApp connection
async function connectToWA() {
    console.log("Connecting to Umar MD...");
    const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/CONNECTION/');
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
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`Connection closed. Reconnecting: ${shouldReconnect}`);
            if (shouldReconnect) connectToWA();
        } else if (connection === 'open') {
            console.log('Installing plugins...');
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() === ".js") {
                    require("./plugins/" + plugin);
                }
            });
            console.log('Plugins installed successfully ✅');
            console.log('UD Bot connected to WhatsApp ✅');

            const up = `UD-MD BOT connected successfully 😇✅\n\nPREFIX: ${prefix}`;
            conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
                image: { url: `https://imgur.com/NxLHiOw.jpeg` },
                caption: up
            });
        }
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('messages.upsert', async (mek) => {
        try {
            mek = mek.messages[0];
            if (!mek.message) return;

            mek.message = getContentType(mek.message) === 'ephemeralMessage'
                ? mek.message.ephemeralMessage.message
                : mek.message;

            // Auto-read status
            if (config.AUTO_READ_STATUS === "true" && mek.key.remoteJid === 'status@broadcast') {
                await conn.readMessages([mek.key]);
            }

            const m = sms(conn, mek);
            const type = getContentType(mek.message);
            const content = JSON.stringify(mek.message);
            const from = mek.key.remoteJid;
            const isCmd = content.startsWith(prefix);
            const command = isCmd ? content.slice(prefix.length).split(' ').shift().toLowerCase() : '';
            const args = content.split(/ +/).slice(1);
            const isGroup = from.endsWith('@g.us');
            const sender = mek.key.fromMe
                ? `${conn.user.id.split(':')[0]}@s.whatsapp.net`
                : mek.key.participant || mek.key.remoteJid;

            // Custom logic for owner/react
            if (sender.includes("923165123719") && !m.message.reactionMessage) {
                m.react("😽");
            }

            // Command handling
            const events = require('./command');
            const cmdName = isCmd ? content.slice(1).split(" ")[0].toLowerCase() : false;
            if (isCmd) {
                const cmd = events.commands.find((c) => c.pattern === cmdName) || events.commands.find((c) => c.alias?.includes(cmdName));
                if (cmd) {
                    if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key } });
                    try {
                        cmd.function(conn, mek, m, { from, command, args, isGroup, sender });
                    } catch (err) {
                        console.error("[PLUGIN ERROR]", err);
                    }
                }
            }

        } catch (err) {
            console.error("Message handler error:", err);
        }
    });
}

// HTTP server for bot status
app.get("/", (req, res) => {
    res.send("Hey, UD-MD BOT started ✅");
});

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

// Start WhatsApp connection
setTimeout(connectToWA, 4000);
