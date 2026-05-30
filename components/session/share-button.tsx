"use client";

import { Share2 } from "lucide-react";

export function ShareButton() {
  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: document.title, url });
      return;
    }
    await navigator.clipboard.writeText(url);
  }

  return (
    <button
      type="button"
      className="inline-flex h-12 items-center justify-center gap-2 border border-hairline px-4 text-sm font-bold uppercase tracking-[1.5px] text-ink"
      onClick={() => void share()}
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  );
}
