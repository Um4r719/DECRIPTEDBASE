const { cmd } = require('../command');

cmd({
    pattern: "delete", // Primary command pattern
    react: "🗑️", // Reaction emoji when the command is triggered
    alias: ["del", "dl"], // Added aliases
    desc: "Delete a mentioned message",
    category: "main",
    filename: __filename
}, 
async (conn, mek, m, { from, isAdmins }) => {
    try {
        // Check if the command is used in a group
        if (!m.isGroup) {
            await conn.sendMessage(from, { text: 'This command can only be used in groups.' });
            return;
        }

        // Check if the user is an admin
        if (!isAdmins) {
            await conn.sendMessage(from, { text: 'Only admins can delete messages.' });
            return;
        }

        // Check if the message is quoted (i.e., it mentions another message)
        if (!m.quoted) {
            await conn.sendMessage(from, { text: 'Please reply to the message you want to delete.' });
            return;
        }

        // Log the quoted message to see its structure
        console.log("Quoted Message: ", m.quoted);

        // Get the message to be deleted
        const messageToDelete = m.quoted;

        // Check if the quoted message's key is defined
        if (!messageToDelete.key) {
            await conn.sendMessage(from, { text: 'The quoted message is invalid.' });
            return;
        }

        // Allow deletion of the quoted message regardless of the sender
        // Check if the quoted message's remoteJid is the same as the current chat
        if (messageToDelete.key.remoteJid !== from) {
            await conn.sendMessage(from, { text: 'You can only delete messages from this chat.' });
            return;
        }

        // Log the remoteJID to verify it's correct
        console.log("Remote JID: ", messageToDelete.key.remoteJid);

        // Delete the quoted message for everyone
        await conn.sendMessage(from, { delete: messageToDelete.key });

        // Confirm deletion
        await conn.sendMessage(from, { text: 'The message has been deleted.' });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(from, { text: 'Sorry, there was an error deleting the message.' }, { quoted: mek });
    }
});
