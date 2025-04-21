import { Client, Message } from 'discord.js';

const activeReminders = new Map<string, { intervalId: NodeJS.Timeout, remindedUsers: Set<string> }>();
const REMINDER_INTERVAL_MINUTES = 5;
const REMINDER_TIMEOUT_MINUTES = 3 * 24 * 60;


export default (client: Client): void => {
    client.on('messageCreate', async (message: Message) => {
        // Ignore messages from bots (including self)
        if (message.author.bot) return;

        // Ignore messages that are not in guilds
        if (!message.guild) return;

        // Ignore messages that are not in text channels
        if (!message.channel.isTextBased()) return;
        if (!('createMessageCollector' in message.channel)) return;

        // Ignore messages without mentions
        if (message.mentions.users.size === 0) return;

        // Ignore messages that don't mention the bot
        if (!message.mentions.users.has(client.user!.id)) return;

        // Get mentioned users, excluding the bot itself
        const mentionedUsers = message.mentions.users
            .filter(user => user.id !== client.user!.id);

        // Check if at least one *other* user was mentioned alongside the bot
        if (mentionedUsers.size === 0) {
            await message.reply({
                content: "Please mention the user(s) you want me to remind along with me.",
                allowedMentions: { users: [] }
            });
            return;
        }

        console.log(`Important ping detected in message ${message.id} for users: ${Array.from(mentionedUsers.values()).map(u => u.tag).join(', ')}`);

        // --- Start Reminder Logic ---
        const remindedUserIds = new Set(mentionedUsers.map(user => user.id));
        const originalMessageLink = message.url;

        // Check if a reminder is already active for this message
        if (activeReminders.has(message.id)) {
            console.log(`Reminder already active for message ${message.id}`);
            return;
        }

        const startReminder = (msg: Message, usersToRemind: Set<string>) => {
            if (!('send' in msg.channel)) return;

            // React to the original message to indicate that a reminder has been set
            msg.react('❗');
            
            const intervalId = setInterval(async () => {
                if (!activeReminders.has(msg.id)) {
                    clearInterval(intervalId);
                    return;
                }

                const userPings = Array.from(usersToRemind).map(id => `<@${id}>`).join(' ');
                try {
                    if (!message.channel) {
                         console.warn(`Channel for message ${msg.id} not accessible. Stopping reminder.`);
                         stopReminder(msg.id);
                         return;
                    }

                    await message.reply({
                        content: `Reminder for ${userPings}: Please respond to the message above!`,
                        allowedMentions: { users: Array.from(usersToRemind) }
                    });
                    console.log(`Sent reminder for message ${msg.id}`);
                } catch (error) {
                    console.error(`Failed to send reminder for message ${msg.id}:`, error);
                    stopReminder(msg.id);
                }
            }, REMINDER_INTERVAL_MINUTES * 60 * 1000);

            activeReminders.set(msg.id, { intervalId, remindedUsers: usersToRemind });
            console.log(`Started reminder interval for message ${msg.id}`);
        };

        // Start the reminder interval
        startReminder(message, remindedUserIds);

        // --- Stop Condition Logic (Listen for replies) ---
        const filter = (reply: Message) =>
            reply.reference?.messageId === message.id && // Check if it's a reply to the original message
            remindedUserIds.has(reply.author.id); // Check if the author is one of the users being reminded

        // Listen for a longer duration, e.g., 3 days. Adjust as needed.
        const collector = message.channel.createMessageCollector({ filter, time: REMINDER_TIMEOUT_MINUTES * 60 * 1000 });

        collector.on('collect', (reply) => {
            console.log(`Reply detected for message ${message.id} from ${reply.author.tag}. Stopping reminders.`);
            stopReminder(message.id);
            collector.stop('replied');
            reply.react('✅');
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'replied') {
                 console.log(`Collector for message ${message.id} ended. Reason: ${reason}`);
                 stopReminder(message.id);
            }
        });
    });
};

const stopReminder = (messageId: string) => {
    const reminderData = activeReminders.get(messageId);
    if (reminderData) {
        clearInterval(reminderData.intervalId);
        activeReminders.delete(messageId);
        console.log(`Stopped reminder interval for message ${messageId}`);
    }
};