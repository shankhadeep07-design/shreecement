const { Worker } = require('worker_threads');
const path = require('path');

function startEventReminderJob() {
  const worker = new Worker(path.resolve(__dirname, './eventReminder.worker.js'));

  worker.on('message', (msg) => {
    console.log('Worker:', msg);
  });

  worker.on('error', (err) => {
    console.error('Worker error:', err);
  });

  worker.on('exit', (code) => {
    if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
  });
}

// You can run this daily using node-cron
const cron = require('node-cron');

cron.schedule(
  '0 0 * * *', // minute hour day month weekday -> 0 0 means 12:00 AM
  () => {
    console.log('Starting Event Reminder Worker at 12 AM IST...');
    startEventReminderJob();
  },
  {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Set timezone to IST
  }
);