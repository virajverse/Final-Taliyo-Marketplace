export async function GET() {
  const js = `
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
// add push/notification handlers as needed
self.addEventListener('fetch', (event) => {
  // Minimal fetch handler to satisfy installability; let network handle normally
});
`;
  return new Response(js.trim(), {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache',
      'Service-Worker-Allowed': '/',
    },
  });
}
