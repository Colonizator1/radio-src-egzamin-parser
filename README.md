# Radio SRZ Exam Parser

A Node.js application that monitors the Polish radio exam API and sends Telegram notifications when new exams are available.

## Features

- 🔍 Monitors radio exam API every X minutes (configurable)
- 📱 Sends Telegram notifications when exams are found
- 🐳 Dockerized for easy deployment
- ⏰ Uses current timestamp for API requests
- 🛡️ Error handling and graceful shutdown
- 📊 Detailed logging

## Prerequisites

- Node.js 18+ (if running locally)
- Docker and Docker Compose (for containerized deployment)
- Telegram Bot Token and Chat ID

## Setup Instructions

### 1. Clone and Setup

```bash
git clone <your-repo>
cd radio-srz-ekzamin-parser
```

### 2. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Parser Configuration (in minutes)
CHECK_INTERVAL=5

# Optional: Set timezone
TZ=Europe/Warsaw
```

### 3. Get Telegram Credentials

#### Create a Telegram Bot:
1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot` and follow the instructions
3. Copy the bot token to your `.env` file

#### Get Chat ID:
1. Start a conversation with your bot
2. Send any message to your bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find your chat ID in the response and add it to `.env`

## Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Option 2: Docker Only

```bash
# Build the image
docker build -t radio-parser .

# Run the container
docker run -d --name radio-parser --env-file .env radio-parser

# View logs
docker logs -f radio-parser
```

### Option 3: Local Development

```bash
# Install dependencies
npm install

# Start the application
npm start
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Required |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | Required |
| `CHECK_INTERVAL` | Check interval in minutes | 5 |
| `TZ` | Timezone for logs | Europe/Warsaw |

### API Endpoint

The parser monitors: `https://egzaminy.uke.gov.pl/netpar/exams.json`

Parameters:
- `category=M` - Category M exams
- `division_id=14` - Division 14
- `q=gd` - Query parameter
- `page_limit=10` - Results per page
- `page=1` - Page number
- `_=<timestamp>` - Current timestamp (auto-generated)

## Monitoring and Logs

### View Logs (Docker Compose)
```bash
docker-compose logs -f radio-parser
```

### View Logs (Docker)
```bash
docker logs -f radio-parser
```

### Health Check
The application includes health checks that run every 5 minutes.

## Troubleshooting

### Common Issues

1. **No Telegram notifications**
   - Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
   - Check bot permissions
   - Ensure you've started a conversation with the bot

2. **API connection errors**
   - Check internet connectivity
   - Verify the API endpoint is accessible
   - Check firewall settings

3. **Container won't start**
   - Verify `.env` file exists and is properly formatted
   - Check Docker daemon is running
   - Review container logs for specific errors

### Debugging

Enable debug mode by checking logs:

```bash
# Docker Compose
docker-compose logs -f

# Local
npm start
```

## API Response Format

Expected API response:
```json
{
  "exams": [
    {
      "id": "exam_id",
      "date": "2025-01-15",
      "location": "Warsaw",
      "type": "SRZ"
    }
  ],
  "meta": {
    "total_count": 1
  }
}
```

## Development

### Project Structure
```
radio-srz-ekzamin-parser/
├── index.js              # Main application
├── package.json           # Dependencies
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── .env.example          # Environment template
├── .gitignore           # Git ignore rules
└── README.md            # This file
```

### Adding Features

The `ExamParser` class is modular and easy to extend:
- Add new notification methods
- Implement different check intervals
- Add data persistence
- Include more API parameters

## License

MIT License

## Support

For issues and questions, please check the logs first and ensure your configuration is correct.