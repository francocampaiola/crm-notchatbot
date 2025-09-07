#!/usr/bin/env node

/**
 * Script para configurar automáticamente QStash en producción
 * Se ejecuta automáticamente después del deploy
 */

const https = require("https");
const http = require("http");

async function setupQStash() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const qstashToken = process.env.QSTASH_TOKEN;

  if (!appUrl || !qstashToken) {
    return;
  }

  try {
    const response = await fetch(`${appUrl}/api/qstash/schedule`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "create",
        schedule: "*/2 * * * *",
      }),
    });

    if (response.ok) {
      await response.json();
    } else {
      await response.json();
    }
  } catch {}
}

if (require.main === module) {
  setupQStash();
}

module.exports = { setupQStash };
