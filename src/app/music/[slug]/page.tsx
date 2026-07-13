import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrackView from "@/components/music/TrackView";
import { BRAND, TRACKS } from "@/lib/album";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = TRACKS.find((t) => t.slug === slug);
  if (!track) return { title: "THE MUSIC" };
  return {
    title: `${track.title} — THE MUSIC`,
    description: `Track ${track.n} of ${BRAND.album}: ${track.role} "${track.hook}"`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TRACKS.some((t) => t.slug === slug)) notFound();
  return <TrackView slug={slug} />;
}
