import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// reCAPTCHA v3 is behavioral — loading it site-wide lets Google build a risk
// profile. The token is executed + verified only on submit (see SignupForm).
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

// Warm serif for headings — harvest-table feel.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

// Friendly, highly legible body sans (shared across the family of sites).
const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Thanksgiving Signup — What Are You Bringing?",
  applicationName: "Thanksgiving Signup",
  description:
    "Our family Thanksgiving potluck signup sheet — add your name and what you're bringing so we don't end up with five pies and no turkey.",
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#9E2B2B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full">
        {children}
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
