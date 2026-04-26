#!/usr/bin/env node
/**
 * End-to-end smoke test for the native booking module.
 *
 * Uses lib/mindbody/booking.mjs to do a REAL booking (Test:false) against a
 * test client and a real future class. Confirms the module works wire-to-wire.
 *
 * Usage:
 *   node scripts/book-real-class.mjs --email me@example.com --class-id 12345
 *   node scripts/book-real-class.mjs --client-id 999 --class-id 12345
 *
 *   --no-email           don't have MindBody send the booking confirmation
 *   --waitlist           book to waitlist if class is full
 *   --service-id <ID>    consume a specific ClientService (pack/membership)
 *   --dry                use Test:true (no real booking, sanity check only)
 *
 * Env: reads ../landing-page/.env.local
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  getStaffToken,
  findClientByEmail,
  bookClient,
  getClientServices,
} from "../lib/mindbody/booking.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_PATH = resolve(__dirname, "../landing-page/.env.local");

function loadEnv(path) {
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let [, key, val] = m;
    val = val.trim().replace(/^["'](.*)["']$/, "$1");
    if (!(key in process.env)) process.env[key] = val;
  }
}

function parseArgs(argv) {
  const args = { sendEmail: true, test: false, waitlist: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--email") args.email = argv[++i];
    else if (a === "--client-id") args.clientId = argv[++i];
    else if (a === "--class-id") args.classId = argv[++i];
    else if (a === "--service-id") args.serviceId = argv[++i];
    else if (a === "--no-email") args.sendEmail = false;
    else if (a === "--waitlist") args.waitlist = true;
    else if (a === "--dry") args.test = true;
  }
  return args;
}

async function main() {
  loadEnv(ENV_PATH);
  const args = parseArgs(process.argv.slice(2));
  if (!args.classId) {
    console.error("Need --class-id <id>. Run probe-book-class.mjs first to find a class.");
    process.exit(1);
  }
  let clientId = args.clientId;
  if (!clientId) {
    const email = args.email || process.env.MINDBODY_TEST_CLIENT_EMAIL;
    if (!email) {
      console.error("Need --email or --client-id, or MINDBODY_TEST_CLIENT_EMAIL set.");
      process.exit(1);
    }
    const client = await findClientByEmail(email);
    if (!client) {
      console.error(`No MindBody client found for ${email}. Pass --client-id explicitly.`);
      process.exit(1);
    }
    clientId = client.Id || client.UniqueId;
    console.log(`Resolved ${email} → client ${clientId} (${client.FirstName} ${client.LastName})`);
  }

  // Warm token (also validates auth before we attempt the booking call).
  await getStaffToken();
  console.log(`Booking class ${args.classId} for client ${clientId} (test=${args.test})...`);

  const result = await bookClient({
    clientId,
    classId: args.classId,
    clientServiceId: args.serviceId,
    waitlist: args.waitlist,
    test: args.test,
    sendEmail: args.sendEmail,
  });

  if (result.ok) {
    console.log("\n✓ Booked.");
    console.log(JSON.stringify(result.visit, null, 2));
    if (args.test) {
      console.log("\n(Test mode — no real booking was committed.)");
    } else {
      console.log("\nVerify in MindBody Business under the client's profile.");
    }
    process.exit(0);
  }

  console.error(`\n✗ Booking failed: ${result.code}`);
  console.error(`  ${result.message}`);

  // For the PAYMENT_REQUIRED case, show what services this client has so the
  // caller knows which ClientServiceId to pass on retry.
  if (result.code === "PAYMENT_REQUIRED") {
    try {
      const services = await getClientServices(clientId);
      if (services.length === 0) {
        console.error("\n  Client has no ClientServices. They need a pricing option first.");
      } else {
        console.error("\n  Available ClientServices for this client:");
        for (const s of services) {
          console.error(
            `    - id=${s.Id} "${s.Name}" remaining=${s.Remaining}/${s.Count} ` +
              `expires=${s.ExpirationDate || "n/a"}`
          );
        }
        console.error("\n  Re-run with --service-id <ID> to consume one.");
      }
    } catch (err) {
      console.error(`\n  (Couldn't list ClientServices: ${err.message})`);
    }
  }

  // Print raw response for debugging unknown cases.
  if (result.code === "UNKNOWN" && result.raw) {
    console.error("\n  Raw response:");
    console.error("  " + JSON.stringify(result.raw, null, 2).split("\n").join("\n  "));
  }
  process.exit(1);
}

main().catch((err) => {
  console.error("\n✗ Unexpected error:");
  console.error(err.stack || err.message);
  process.exit(2);
});
