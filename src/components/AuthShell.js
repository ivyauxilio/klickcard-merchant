import Link from "next/link";

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #3D6BFF 0%, transparent 45%), radial-gradient(circle at 80% 70%, #213EAA 0%, transparent 50%)",
          }}
        />
        <Link href="/" className="relative font-display text-lg font-semibold text-white">
          Auth App
        </Link>
        <div className="relative">
          <p className="font-display text-3xl font-semibold leading-tight text-white">
            One account, connected straight to your Laravel API.
          </p>
          <p className="mt-4 max-w-sm font-body text-sm text-white/60">
            Login, signup, and password reset all run through Redux Toolkit,
            with your session kept in sync on every page.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          {eyebrow && (
            <p className="mb-2 font-body text-xs font-semibold uppercase tracking-wide text-brand-600">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
          {subtitle && <p className="mt-1.5 font-body text-sm text-ink/55">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && <div className="mt-6 font-body text-sm text-ink/60">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
