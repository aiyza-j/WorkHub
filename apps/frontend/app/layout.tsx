import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "./theme/ThemeRegistry";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Manage users, projects, and tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry mode={"light"}>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
