export const disposableDomains = new Set<string>([
  '0-mail.com',
  '10minutemail.com',
  '10minutemail.net',
  '20minutemail.com',
  'anonymmail.net',
  'dispostable.com',
  'dropmail.me',
  'emailondeck.com',
  'fakeinbox.com',
  'getairmail.com',
  'getnada.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamailblock.com',
  'inboxkitten.com',
  'inboxbear.com',
  'maildrop.cc',
  'mailinator.com',
  'mohmal.com',
  'mytemp.email',
  'sharklasers.com',
  'spamgourmet.com',
  'tempmail.dev',
  'tempmail.ninja',
  'tempmailo.com',
  'temp-mail.org',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
]);

export function isDisposableEmail(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return true;
  const domain = parts[1].toLowerCase();
  return disposableDomains.has(domain);
}
