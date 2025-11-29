// Source - https://stackoverflow.com/a
// Posted by Marcel Gruber
// Retrieved 2025-11-29, License - CC BY-SA 4.0

import { writeFileSync, existsSync, unlinkSync } from 'fs';

if (process.env.GENERATE_MIDDLEWARE === 'true') {
  const content = 'async function middleware(req) {console.log("Middleware is running")}';
  writeFileSync('./src/middleware.js', content, 'utf8');
  console.log('middleware.js file created');
} else {
  if (existsSync('./src/middleware.js')) {
    unlinkSync('./src/middleware.js');
    console.log('middleware.js file removed ');
  }
}
