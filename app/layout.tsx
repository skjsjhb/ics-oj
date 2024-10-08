import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { ReactNode } from "react";
import { ToastContainer } from "react-toastify";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const apiVersion = await (
    await fetch(siteConfig.benchAPI + "/commit", { cache: "no-cache" })
  ).text();

  return (
    <html suppressHydrationWarning lang="zh-CN">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ToastContainer
          closeOnClick
          newestOnTop
          pauseOnFocusLoss
          pauseOnHover
          autoClose={3000}
          hideProgressBar={false}
          limit={5}
          position="top-right"
          rtl={false}
          theme="dark"
        />
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto pt-4 px-8 flex-grow">
              {children}
            </main>
            <footer className="mt-8 w-full flex flex-col items-center justify-center">
              <div>
                <b>skjsjhb</b>&nbsp;作品&nbsp;&nbsp;由&nbsp;<b>LC3XT</b>
                &nbsp;和&nbsp;
                <b>Next.js</b>&nbsp;强力驱动
              </div>
              <div>
                LC3XT 服务器版本 <b>{apiVersion}</b>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
