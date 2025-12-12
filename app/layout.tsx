import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Wagner Chaves | Advocacia Especializada",
    description:
        "Identificação de direitos e processos jurídicos a seu favor. Verifique sua situação com segurança.",
    keywords: [
        "advocacia",
        "processos",
        "restituição",
        "direito",
        "wagner chaves",
    ],
    authors: [{ name: "Wagner Chaves Advocacia" }],
    openGraph: {
        title: "Wagner Chaves | Advocacia Especializada",
        description: "Identificamos um direito a seu favor. Verifique sua situação.",
        type: "website",
        locale: "pt_BR",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <head>
                {/* Script para evitar flash de tema errado */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                        (function() {
                            var theme = localStorage.getItem('theme');
                            if (theme === 'light') {
                                document.documentElement.classList.remove('dark');
                            } else {
                                document.documentElement.classList.add('dark');
                            }
                        })();
                    `
                }} />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen">{children}</body>
        </html>
    );
}
