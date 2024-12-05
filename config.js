const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
SESSION_ID: process.env.SESSION_ID || "enter your session",  
OWNER_NUMBER: '923165123719@s.whatsapp.net',
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.imgur.com/m2zmwiC.jpeg",
ALIVE_MSG: process.env.ALIVE_IMG || "🤖🔰 Hi UD-MD Is Online Now 💻\n*💻 Owner* - UMAR REHMAN\n\n*💻 Owner Number* +923165123719\n\n_Type .menu to get the command menu._",
READ_MESSAGE: process.env.READ_MESSAGE || "true", // Added auto-read configuration
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
MODE: process.env.MODE || "public",
AUTO_VOICE: "false",
ELEVENLABS_API_KEY: 'sk_4669df1ac80b92a39528954725c4ff916fbfc7e3a4d75b22',
};
