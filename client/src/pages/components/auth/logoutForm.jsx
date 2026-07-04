function LogoutForm() {
  return (
    <section className="min-h-screen bg-background px-4 py-10 text-foreground transition-colors sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
              O
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Logout
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Are you sure you want to logout from your account?
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              className="h-11 w-full rounded-lg bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>

            <button
              type="button"
              className="h-11 w-full rounded-lg border border-border bg-background text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogoutForm;