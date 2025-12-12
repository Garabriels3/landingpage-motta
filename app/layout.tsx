import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
    subsets: ["latin"],
    weight: ["300", "400", "700", "900"],
    variable: "--font-merriweather"
});

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
        <html lang="pt-BR" className={`${inter.variable} ${merriweather.variable}`}>
            <body className={inter.className}>{children}</body>
        </html>
    );
}
