'use client';

export default function GlobalError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#faf6ef' }}>
        <main
          style={{
            minHeight: '100dvh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div style={{ maxWidth: 448, textAlign: 'center' }}>
            <h1 style={{ fontSize: 24, color: '#000f1a' }}>Something went wrong</h1>
            <p style={{ color: '#555' }}>The app failed to start this page.</p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                height: 40,
                padding: '0 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                background: '#eb8500',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
