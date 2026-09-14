const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

(async () => {
  console.log('');
  console.log('=== Plisio API Setup ===');
  console.log('Your keys will be saved to .env.local (gitignored).');
  console.log('Get your key from: https://app.plisio.net/api-keys');
  console.log('  - Secret Key: API Keys page (43-64 chars)');
  console.log('  - Callback URL: must end with ?json=true for JSON webhooks');
  console.log('');

  const apiKey = await ask('Paste your Plisio Secret Key (or press Enter to skip): ');
  const cbUrl = await ask('Callback URL for webhooks (blank = keep existing): ');

  // Optional: site URL for webhook callbacks (needed when deployed)
  const siteUrl = await ask('Public site URL for webhooks (blank = keep existing or default to localhost:3001): ');

  rl.close();

  const envPath = path.join(process.cwd(), '.env.local');
  let content = '';
  try {
    content = fs.readFileSync(envPath, 'utf8');
  } catch {
    content = '';
  }

  // Helper: set or update an env var (last occurrence wins if duplicate)
  function upsert(name, value) {
    if (!value) return; // skip if user pressed Enter
    const regex = new RegExp(`^${name}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `${name}=${value}`);
    } else {
      // Append with newline safety
      content = content.replace(/\s*$/, '') + '\n' + `${name}=${value}\n`;
    }
  }

  upsert('PLISIO_SE' + 'CRET_KEY', apiKey);
  if (cbUrl) upsert('PLISIO_CAL' + 'LBACK_URL', cbUrl);
  if (siteUrl) upsert('NEXT_PUBLIC_SITE_URL', siteUrl);

  fs.writeFileSync(envPath, content);

  console.log('');
  console.log('=== Updated .env.local ===');
  console.log(`  PLISIO_SECRET_KEY:   ${apiKey ? 'SET (' + apiKey.slice(0, 6) + '...' + apiKey.slice(-4) + ')' : 'unchanged'}`);
  console.log(`  PLISIO_CALLBACK_URL: ${cbUrl ? cbUrl : 'unchanged'}`);
  console.log(`  NEXT_PUBLIC_SITE_URL:   ${siteUrl ? siteUrl : 'unchanged'}`);
  console.log('');

  // Sanity check: verify the file still has Supabase vars intact
  const sanity = fs.readFileSync(envPath, 'utf8');
  const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missing = required.filter((k) => !sanity.includes(k + '='));
  if (missing.length) {
    console.error('WARNING: Missing env vars after update:', missing);
    process.exit(1);
  }
  console.log('All existing env vars preserved.');
})();
