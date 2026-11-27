import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { BoutonHaut } from "@/components/BoutonHaut";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Dragon Ball DB — Catalogue & suivi de collection",
  description:
    "Base de référence Dragon Ball : mangas & livres, DVD/Blu-ray, cartes à collectionner, jeux vidéo et figurines.",
};

const SCRIPT_THEME = `(() => {
  try {
    const t = localStorage.getItem("dragonball-db:theme");
    if (t === "clair" || t === "sombre") document.documentElement.dataset.theme = t;
  } catch {}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <BoutonHaut />
      </body>
    </html>
  );
}
