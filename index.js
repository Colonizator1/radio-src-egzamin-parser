const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

class ExamParser {
  constructor() {
    this.baseUrl = 'https://egzaminy.uke.gov.pl/netpar/exams.json';
    this.telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    this.telegramChatId = process.env.TELEGRAM_CHAT_ID;
    this.checkInterval = process.env.CHECK_INTERVAL || 5; // minutes
    this.searchKeyword = process.env.SEARCH_KEYWORD || 'GDYNIA';
    this.isRunning = false;
  }

  // Generate current timestamp
  getCurrentTimestamp() {
    return Date.now();
  }

  // Build API URL with current timestamp
  buildApiUrl() {
    const timestamp = this.getCurrentTimestamp();
    return `${this.baseUrl}?category=M&division_id=14&q=${this.searchKeyword}&page_limit=10&page=1&_=${timestamp}`;
  }

  // Send Telegram notification
  async sendTelegramNotification(message) {
    if (!this.telegramBotToken || !this.telegramChatId) {
      console.error('Telegram credentials not configured');
      return;
    }

    try {
      const telegramUrl = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      const response = await axios.post(telegramUrl, {
        chat_id: this.telegramChatId,
        text: message,
        parse_mode: 'HTML'
      });
      console.log('✅ Telegram notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send Telegram notification:', error.message);
    }
  }

  // Format exam data for notification
  formatExamMessage(exams) {
    let message = `🚨 <b>New Radio Exams Found!</b>\n\n`;
    message += `📊 Total exams: ${exams.length}\n\n`;
    
    exams.forEach((exam, index) => {
      message += `<b>Exam ${index + 1}:</b>\n`;
      // Add relevant exam fields based on actual API response structure
      if (exam.date_exam) message += `Date: ${exam.date_exam}\n`;
      if (exam.fullname) message += `Location: ${exam.fullname}\n`;
      message += `\n`;
    });
    
    message += `⏰ Checked at: ${new Date().toLocaleString('pl-PL')}`;
    message += `Link to exams: https://egzaminy.uke.gov.pl/pl/proposals/`;
    return message;
  }

  // Main function to check for exams
  async checkForExams() {
    if (this.isRunning) {
      console.log('⏳ Previous check still running, skipping...');
      return;
    }

    this.isRunning = true;
    console.log(`🔍 Checking for exams at ${new Date().toLocaleString('pl-PL')}`);

    try {
      const apiUrl = this.buildApiUrl();
      console.log(`📡 Querying: ${apiUrl}`);

      const response = await axios.get(apiUrl, {
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });

      const data = response.data;
      console.log(`📊 API Response - Total count: ${data.meta?.total_count || 0}, Exams: ${data.exams?.length || 0}`);

      if (data.exams && data.exams.length > 0) {
        console.log(`🎯 Found ${data.exams.length} exam(s)!`);
        const message = this.formatExamMessage(data.exams);
        await this.sendTelegramNotification(message);
      } else {
        console.log('ℹ️ No exams found');
      }

    } catch (error) {
      console.error('❌ Error checking for exams:', error.message);
      
      // Send error notification if it's a critical error
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        await this.sendTelegramNotification(
          `⚠️ <b>Exam Parser Error</b>\n\nFailed to connect to exam API.\nError: ${error.message}\nTime: ${new Date().toLocaleString('pl-PL')}`
        );
      }
    } finally {
      this.isRunning = false;
    }
  }

  // Start the parser
  start() {
    console.log('🚀 Starting Radio SRC Exam Parser');
    console.log(`⏰ Check interval: ${this.checkInterval} minutes`);
    console.log(`🤖 Telegram Bot: ${this.telegramBotToken ? 'Configured' : 'Not configured'}`);
    console.log(`💬 Chat ID: ${this.telegramChatId || 'Not configured'}`);

    // Initial check
    this.checkForExams();

    // Schedule periodic checks
    const cronExpression = `*/${this.checkInterval} * * * *`;
    console.log(`📅 Cron expression: ${cronExpression}`);

    cron.schedule(cronExpression, () => {
      this.checkForExams();
    });

    console.log('✅ Parser started successfully');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Start the parser
const parser = new ExamParser();
parser.start();