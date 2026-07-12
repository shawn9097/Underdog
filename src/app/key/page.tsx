import type { Metadata } from "next";
import CityNav from "@/components/CityNav";
import KeyRitual from "@/components/key/KeyRitual";
import { BRAND, WORLD } from "@/lib/album";

export const metadata: Metadata = {
  title: "Claim Your Key",
  description: `${BRAND.emailHook} ${WORLD.kintsugi.rule}`,
};

export default function Page() {
  return (
    <>
      <KeyRitual />
      <CityNav />
    </>
  );
}
