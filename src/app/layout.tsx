import React from "react";
import "@/assets/css/globals.css";
import Header from "@/views/Home/Header";
import Footer from "@/components/Footer";
export const metadata = {
  title: " Rooch  Explorer",
  description: "Rooch  Explorer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        ></meta>
      </head>
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
