import fs from 'fs';
import path from 'path';

// Cloudflare auto-injects @astrojs/cloudflare which generates a wrangler.json
// that forces KV namespace creation. This causes the CI to crash on subsequent builds.
// This script intercepts that config before Cloudflare reads it and deletes the bindings.

const configPaths = [
  path.resolve(process.cwd(), 'dist/client/wrangler.json'),
  path.resolve(process.cwd(), 'dist/wrangler.json'),
  path.resolve(process.cwd(), 'wrangler.json')
];

let patched = false;

for (const configPath of configPaths) {
  if (fs.existsSync(configPath)) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(content);
      
      if (config.kv_namespaces) {
        console.log(`[patch-cloudflare] Found kv_namespaces in ${configPath}. Removing them to bypass CI crash.`);
        delete config.kv_namespaces;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        patched = true;
      }
    } catch (err) {
      console.error(`[patch-cloudflare] Error patching ${configPath}:`, err.message);
    }
  }
}

if (!patched) {
  console.log('[patch-cloudflare] No KV bindings found to patch. Proceeding safely.');
}
