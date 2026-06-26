/** Sign-up is limited to Russian mail providers (Mail.ru group + Yandex). */
export const RUSSIAN_MAIL_DOMAINS = [
  'mail.ru',
  'bk.ru',
  'list.ru',
  'inbox.ru',
  'internet.ru',
  'yandex.ru',
  'ya.ru',
  'yandex.com',
];

export function isRussianMail(email: string): boolean {
  const at = email.lastIndexOf('@');
  if (at < 0) return false;
  return RUSSIAN_MAIL_DOMAINS.includes(email.slice(at + 1).trim().toLowerCase());
}
