import type { ReactNode } from "react";
import { Plus_Jakarta_Sans, Roboto_Mono } from "next/font/google";

// Las mismas fuentes del Index (qa/home-index-rebase/layout.tsx): los componentes se ven y se miden igual que allá.
const display = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--vmc-font-display" });
const mono = Roboto_Mono({ subsets: ["latin"], display: "swap", variable: "--vmc-font-mono" });

export default function ComponentsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <div className={`${display.variable} ${mono.variable}`}>{children}</div>;
}
