export function cookieDomainOptions(): { domain?: string } {
  const domain = process.env.NEXT_PUBLIC_AUTH_COOKIE_DOMAIN;
  return domain ? { domain } : {};
}
