import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import AuthProvider from "@/components/AuthProvider";
import NotificationPoller from "@/components/notifications/NotificationPoller";

export const metadata = {
  title: "KlickCard App",
  description: "Discount App and earn rewards",
};

export default function RootLayout({ children }) {
  const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
  return (
    <html lang="en" data-google-analytics-opt-out="">
      <body className="font-body antialiased">
        {/* Google Tag Manager - noscript fallback */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{
                display: "none",
                visibility: "hidden",
              }}
            />
          </noscript>
        )}

        {/* Google Tag Manager */}
        {GTM_ID && (
          <Script id="google-tag-manager" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `}
          </Script>
        )}
        <Providers>
          <AuthProvider>
            <NotificationPoller />
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
