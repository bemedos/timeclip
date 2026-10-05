import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function isYouTube(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    return (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "youtu.be" ||
      hostname.endsWith(".youtube.com")
    );
  } catch {
    return false;
  }
}

function createYouTubeTimestampUrl(
  originalUrl: string,
  seconds: number
) {
  const url = new URL(originalUrl);
  url.searchParams.set("t", `${seconds}s`);
  return url.toString();
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = await prisma.videoLink.findUnique({
    where: {
      id: id,
    },
  });

  if (!video) {
    notFound();
  }

  const timecode = formatTime(video.seconds);

  if (isYouTube(video.videoUrl)) {
    redirect(
      createYouTubeTimestampUrl(
        video.videoUrl,
        video.seconds
      )
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-gray-800 bg-gray-950 p-8">
          <p className="text-sm uppercase tracking-widest text-gray-500">
            TimeClip
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Video timestamp
          </h1>

          <p className="mt-3 text-gray-400">
            This clip starts at{" "}
            <span className="font-semibold text-white">
              {timecode}
            </span>
          </p>

          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block rounded-xl bg-white px-5 py-3 text-center font-semibold text-black hover:bg-gray-200"
          >
            Open video
          </a>
        </div>
      </div>
    </main>
  );
}
