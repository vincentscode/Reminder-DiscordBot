# Discord Important Bot

This is a Discord bot designed to send important reminders to users in a server. The bot can be pinged using the `@important` mention, which will trigger a reminder system that sends notifications every few minutes until a response is received.

## Features

- Pingable as `@important`
- Sends reminders at specified intervals
- Continues to remind until a response is received

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/discord-important-bot.git
   ```
2. Navigate to the project directory:
   ```
   cd discord-important-bot
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration

Before running the bot, you need to set up your configuration. Open `src/config.json` and add your bot token.

```json
{
  "token": "YOUR_BOT_TOKEN"
}
```

## Usage

1. Start the bot:
   ```
   npm start
   ```
2. Ping the bot alongside any other user in your server.

## Future Work

- Reminders should be sent in a private thread attached to the original message to avoid cluttering the channel.