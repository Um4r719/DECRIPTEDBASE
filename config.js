const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
SESSION_ID: process.env.SESSION_ID || "enter your session",  
OWNER_NUMBER: '923165123719@s.whatsapp.net',
ALIVE_IMG: process.env.ALIVE_IMG || "https://imgur.com/NxLHiOw.jpeg",
ALIVE_MSG: process.env.ALIVE_MSG || "🤖🔰 Hi UD-MD Is Online Now 💻\n*💻 Owner* - UMAR REHMAN\n\n*💻 Owner Number* +923165123719\n\n_Type .menu to get the command menu._",
READ_MESSAGE: process.env.READ_MESSAGE || "true", // Added auto-read configuration
AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true",
MODE: process.env.MODE || "public",
AUTO_VOICE: "true",
ELEVENLABS_API_KEY: 'sk_b71c6e84020a98ecee7af1b3b122700ac223fab74da4857c',
};
