import type {Metadata} from "next";
import {Space_Mono} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/lib/ThemeProvider";

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
        <html lang="pl" suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: `
                try {
                    var t = localStorage.getItem('theme') || 'cyber-green';
                    document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
            ` }} />
        </head>
        <body className={`${spaceMono.className} bg-tech-bg text-tech-primary`}>
        <ThemeProvider>
            <div className="scanline" />
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}