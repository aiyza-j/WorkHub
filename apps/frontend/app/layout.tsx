import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistryWithContext from "./theme/ThemeRegistryWithContext";
import { ThemeProviderContext } from './contexts/ThemeContext';

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
        <ThemeProviderContext>
          <ThemeRegistryWithContext>
            {children}
          </ThemeRegistryWithContext>
        </ThemeProviderContext>
      </body>
    </html>
  );
}