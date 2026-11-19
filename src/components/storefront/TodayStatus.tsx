"use client";

import TodayAtBurgerash from "../TodayAtBurgerash";
import { useStorefrontStatus } from "./useStorefrontStatus";

export default function TodayStatus() {
  return <TodayAtBurgerash status={useStorefrontStatus()} />;
}
