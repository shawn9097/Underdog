import type { Metadata } from "next";
import HaloRoot from "@/components/halo/HaloRoot";

export const metadata: Metadata = {
  title: "The Halo",
  description:
    "The gleaming ring above. The Sainted decide who has worth — begin your Worth Assessment. Redemption, perfected.",
};

export default function Page() {
  return (
    <>
      <HaloRoot />
    </>
  );
}
