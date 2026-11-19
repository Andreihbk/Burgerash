"use client";

import dynamic from "next/dynamic";
import { useUiStore } from "@/store/uiStore";

// Loaded on the first "customize" tap, not with the page.
const CustomizeModal = dynamic(() => import("./CustomizeModal"), { ssr: false });

export default function CustomizeModalHost() {
  const customizing = useUiStore((s) => s.customizing);
  return customizing ? <CustomizeModal key={customizing.id} product={customizing} /> : null;
}
