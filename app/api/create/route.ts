import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";

function parseTimecode(value: string): number | null {
  value = value.trim();

  // Plain seconds: 5025
  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const parts = value.split(":");

  // MM:SS
  if (parts.length === 2) {
    const minutes = Number(parts[0]);
    const seconds = Number(parts[1]);

    if (
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      seconds >= 60
    ) {
      return null;
    }

    return minutes * 60 + seconds;
  }

  // HH:MM:SS
  if (parts.length === 3) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    const seconds = Number(parts[2]);

    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      minutes >= 60 ||
      seconds >= 60
    ) {
      return null;
    }

    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const videoUrl = String(body.videoUrl ?? "");
    const timecode = String(body.timecode ?? "");

    // Make sure both fields were provided
    if (!videoUrl || !timecode) {
      return NextResponse.json(
        {
          error: "Video URL and timecode are required.",
        },
        { status: 400 }
      );
    }

    // Validate the URL
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(videoUrl);
    } catch {
      return NextResponse.json(
        {
          error: "Please enter a valid video URL.",
        },
        { status: 400 }
      );
    }

    // Only allow normal web URLs
    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      return NextResponse.json(
        {
          error: "Only HTTP and HTTPS URLs are supported.",
        },
        { status: 400 }
      );
    }

    // Convert timecode into seconds
    const seconds = parseTimecode(timecode);

    if (seconds === null || seconds < 0) {
      return NextResponse.json(
        {
          error:
            "Invalid timecode. Use 01:23:45, 23:45, or seconds.",
        },
        { status: 400 }
      );
    }

    // Generate a short ID
    const id = nanoid(10);

    // Save the video and timestamp
    await prisma.videoLink.create({
      data: {
        id,
        videoUrl: parsedUrl.toString(),
        seconds,
      },
    });

    // Send the new link back to the browser
    return NextResponse.json({
      id,
      url: `/v/${id}`,
    });
  } catch (error) {
    console.error("Create link error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}