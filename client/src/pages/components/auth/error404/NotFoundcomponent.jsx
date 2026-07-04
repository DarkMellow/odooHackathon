function NotFoundContent() {
  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_60%)] bg-background text-foreground transition-colors dark:bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.16),_transparent_60%)]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-16">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-1 text-sm font-semibold text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              Error 404
            </span>

            <h1 className="mt-6 text-7xl font-black tracking-tight text-red-600 sm:text-8xl dark:text-red-400">
              Oops!
            </h1>

            <h2 className="mt-4 text-3xl font-bold text-foreground">
              This page doesn't exist.
            </h2>

            <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
              The page you're trying to access may have been moved,
              deleted, or the URL might be incorrect. Let&apos;s get you back on track.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-md transition hover:opacity-90">
                Go Home
              </button>

              <button
                onClick={handleGoBack}
                className="rounded-xl border border-border bg-card px-6 py-3 font-semibold text-foreground transition hover:bg-accent"
              >
                Go Back
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative h-96 w-96">
              <div className="absolute inset-0 rounded-full bg-red-100/70 dark:bg-red-900/25"></div>

              <h1 className="absolute inset-0 flex items-center justify-center text-[180px] font-black text-red-200/80 select-none dark:text-red-950/70">
                404
              </h1>

              <div className="absolute left-1/2 top-1/2 w-60 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-5 shadow-xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-xl text-white">
                    !
                  </div>

                  <div>
                    <div className="h-2 w-24 rounded bg-muted"></div>
                    <div className="mt-2 h-2 w-16 rounded bg-muted/80"></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 rounded bg-muted/80"></div>
                  <div className="h-2 rounded bg-muted/80"></div>
                  <div className="h-2 w-4/5 rounded bg-muted/80"></div>
                </div>

                <div className="mt-6 rounded-lg bg-red-100 py-2 text-center text-sm font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                  Page Not Found
                </div>
              </div>

              <div className="absolute left-10 top-8 h-3 w-3 rounded-full bg-red-400/80 animate-pulse"></div>
              <div className="absolute right-10 top-20 h-2 w-2 rounded-full bg-red-300/80 animate-ping"></div>
              <div className="absolute bottom-10 left-16 h-2 w-2 rounded-full bg-red-400/80 animate-pulse"></div>
              <div className="absolute bottom-16 right-12 h-4 w-4 rounded-full bg-red-300/80 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NotFoundContent;