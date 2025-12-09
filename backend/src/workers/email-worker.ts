/**
 * Email Worker - Background job to process pending email notifications
 * 
 * This worker runs periodically to process queued email notifications.
 * It can be run as:
 * 1. A standalone process: `node dist/workers/email-worker.js`
 * 2. A cron job: Add to crontab or use a scheduler
 * 3. A scheduled task in production (AWS Lambda, Google Cloud Functions, etc.)
 * 
 * Recommended: Run every 1-5 minutes depending on your email volume
 */

import "dotenv/config";
import { processPendingEmails } from "../services/email-notification.service.js";

/**
 * Process email queue
 */
async function processQueue() {
  try {
    console.log(`\n⏰ Email worker started at ${new Date().toISOString()}`);
    console.log("━".repeat(60));

    const result = await processPendingEmails(50); // Process up to 50 emails per run

    console.log("━".repeat(60));
    console.log(`✅ Email worker completed:`);
    console.log(`   • Processed: ${result.processed}`);
    console.log(`   • Successful: ${result.successful}`);
    console.log(`   • Failed: ${result.failed}`);
    console.log(`   • Time: ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error("❌ Email worker error:", error);
    process.exit(1);
  }
}

/**
 * Run worker in continuous mode
 */
async function runContinuous(intervalMinutes: number = 2) {
  console.log(`🔄 Email worker running in continuous mode (every ${intervalMinutes} minutes)`);
  console.log("Press Ctrl+C to stop\n");

  // Process immediately on start
  await processQueue();

  // Then process at intervals
  setInterval(async () => {
    await processQueue();
  }, intervalMinutes * 60 * 1000);
}

/**
 * Run worker once and exit
 */
async function runOnce() {
  await processQueue();
  process.exit(0);
}

// Main execution
const args = process.argv.slice(2);
const mode = args[0] || "once"; // Default to "once" mode
const interval = parseInt(args[1] || "2", 10); // Default to 2 minutes

if (mode === "continuous") {
  runContinuous(interval);
} else {
  runOnce();
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n👋 Email worker shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Email worker shutting down gracefully...");
  process.exit(0);
});
