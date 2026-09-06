export function RoshoiMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary" />
      <path
        d="M9 23V9h7.2c3.1 0 5.1 1.7 5.1 4.3 0 2.1-1.2 3.6-3.2 4.2L22.6 23h-3.2l-4.1-5.2H12V23H9zm3-8.2h4c1.6 0 2.6-.8 2.6-2.1S17.6 10.7 16 10.7h-4v4.1z"
        fill="currentColor"
        className="text-primary-fg"
      />
    </svg>
  );
}
