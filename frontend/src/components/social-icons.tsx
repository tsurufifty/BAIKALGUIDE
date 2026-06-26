/**
 * Social media icons (VK, Telegram). Rendered as plain icons for now — no
 * links yet. To enable, wrap each in an <a href="..."> (or pass an href map).
 */

const ICON_CLASS = 'size-9 text-foreground/60 transition-colors hover:text-primary';

function VkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M12.79 16.5h.94s.28-.03.43-.19c.13-.15.13-.42.13-.42s-.02-1.27.57-1.45c.58-.19 1.32 1.22 2.11 1.76.6.41 1.05.32 1.05.32l2.11-.03s1.1-.07.58-.94c-.04-.07-.3-.64-1.57-1.81-1.32-1.23-1.15-1.03.45-3.16.97-1.3 1.36-2.09 1.24-2.43-.12-.32-.84-.24-.84-.24l-2.38.02s-.18-.02-.31.06c-.13.08-.21.26-.21.26s-.38 1-.88 1.86c-1.07 1.79-1.49 1.89-1.66 1.78-.4-.26-.3-1.05-.3-1.61 0-1.75.27-2.48-.52-2.67-.26-.06-.45-.11-1.13-.11-.86 0-1.59 0-2 .2-.27.14-.49.44-.36.46.16.02.53.1.73.37.25.35.24 1.13.24 1.13s.15 2.16-.34 2.43c-.34.18-.8-.19-1.75-1.82-.49-.83-.86-1.76-.86-1.76s-.07-.17-.2-.27c-.16-.11-.38-.15-.38-.15l-2.26.02s-.34.01-.46.16c-.11.13-.01.41-.01.41s1.77 4.06 3.77 6.11c1.84 1.88 3.93 1.76 3.93 1.76z" />
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}

export function SocialIcons({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span aria-label="VK" role="img">
        <VkIcon className={ICON_CLASS} />
      </span>
      <span aria-label="Telegram" role="img">
        <TelegramIcon className={ICON_CLASS} />
      </span>
    </div>
  );
}
