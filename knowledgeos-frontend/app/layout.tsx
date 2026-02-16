
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "KnowledgeOS",
    description: "Your Second Brain",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pl">
        <body className={`${spaceMono.className} bg-tech-bg text-tech-primary`}>
        <div className="scanline" />
        {children}
        </body>
        </html>
    );
}