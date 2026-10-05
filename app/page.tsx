"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [timecode, setTimecode] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createLink(e: FormEvent) {
    e.preventDefault();

    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          timecode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Something went wrong."
        );
      }

      setResult(
        window.location.origin + data.url
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-3xl 
flex-col items-center justify-center px-6">

        <h1 className="text-5xl font-bold tracking-tight">
          TimeClip
        </h1>

        <p className="mt-4 text-center text-lg 
text-gray-400">
          Create a link that opens a video at an exact 
moment.
        </p>

        <form
          onSubmit={createLink}
          className="mt-10 w-full max-w-xl space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm 
text-gray-300">
              Video URL
            </label>

            <input
              type="url"
              value={videoUrl}
              onChange={(e) =>
                setVideoUrl(e.target.value)
              }
              
placeholder="https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border 
border-gray-700 bg-gray-900 px-4 py-3 outline-none 
focus:border-white"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm 
text-gray-300">
              Timecode
            </label>

            <input
              type="text"
              value={timecode}
              onChange={(e) =>
                setTimecode(e.target.value)
              }
              placeholder="01:23:45"
              className="w-full rounded-xl border 
border-gray-700 bg-gray-900 px-4 py-3 outline-none 
focus:border-white"
              required
            />

            <p className="mt-2 text-sm text-gray-500">
              Examples: 01:23:45, 23:45, or 5025
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 
font-semibold text-black hover:bg-gray-200 
disabled:opacity-50"
          >
            {loading
              ? "Creating..."
              : "Create timestamp link"}
          </button>
        </form>

        {error && (
          <div className="mt-6 w-full max-w-xl rounded-xl 
border border-red-900 bg-red-950/40 p-4 text-red-300">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 w-full max-w-xl rounded-xl 
border border-green-900 bg-green-950/40 p-5">
            <p className="text-sm text-green-300">
              Your timestamp link:
            </p>

            <div className="mt-3 break-all rounded-lg 
bg-black p-3 text-green-400">
              {result}
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={copyLink}
                className="rounded-lg bg-white px-4 py-2 
font-medium text-black"
              >
                Copy
              </button>

              <a
                href={result}
                className="rounded-lg border border-gray-700 
px-4 py-2"
              >
                Open
              </a>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
