const config = require('../config');
const { cmd, commands } = require('../command');
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('../lib/functions');

cmd({
    pattern: "joinrequests",
    desc: "Get list of participants who requested to join the group",
    react: "📋",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, q, reply, isGroup }) => {
    if (!isGroup) return reply("This command can only be used in a group chat.");

    try {
        const groupJid = from;  // Use the group ID from the message context
        console.log(`Attempting to fetch pending requests for group: ${groupJid}`);
        
        const response = await conn.groupRequestParticipantsList(groupJid);
        console.log(response); // Log the response for debugging

        if (response.length > 0) {
            let participantList = "Pending Requests to Join the Group:\n";
            let mentions = []; // Array to hold participant mentions

            response.forEach(participant => {
                const jid = participant.jid;
                participantList += `😻 @${jid.split('@')[0]}\n`; // Format the mention
                mentions.push(jid); // Add JID to mentions array
            });

            // Send the reply with mentions
            await conn.sendMessage(from, {
                text: participantList,
                mentions: mentions // Include mentions array here
            });
        } else {
            reply("No pending requests to join the group.");
        }
    } catch (e) {
        console.error(`Error fetching participant requests: ${e.message}`); // Log specific error message
        reply("⚠️ An error occurred while fetching the pending requests. Please try again later.");
    }
});

cmd({
    pattern: "allreq",
    desc: "Approve or reject all join requests",
    react: "✅",
    category: "group",
    filename: __filename
}, 
async (conn, mek, m, { from, reply, isGroup }) => {
    if (!isGroup) return reply("This command can only be used in a group chat.");

    const action = m.body.includes("approve") ? "approve" : "reject"; // Determine action based on the command

    try {
        // Fetch all pending requests
        const pendingRequests = await conn.groupRequestParticipantsList(from);
        
        if (pendingRequests.length === 0) {
            return reply("There are no pending requests to manage.");
        }

        // Format mentions and JIDs for approval/rejection
        let participantList = "Pending Requests to Join the Group:\n";
        let mentions = [];
        let jids = [];

        pendingRequests.forEach(participant => {
            const jid = participant.jid;
            participantList += `😻 @${jid.split('@')[0]}\n`; // Format the mention
            mentions.push(jid); // Add JID to mentions array
            jids.push(jid); // Add JID to the jids array for action
        });

        // Send the pending requests as a message
        await conn.sendMessage(from, {
            text: participantList,
            mentions: mentions
        });

        // Proceed to approve/reject all requests
        const updateResponse = await conn.groupRequestParticipantsUpdate(from, jids, action);
        console.log(updateResponse); // Log the response for debugging

        // Send a confirmation message
        reply(`Successfully ${action}ed all join requests.`);
    } catch (e) {
        console.error(`Error updating participant requests: ${e.message}`); // Log specific error message
        reply("⚠️ An error occurred while processing the request. Please try again later.");
    }
});
