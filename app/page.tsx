import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/80 px-6 py-10 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">IgRatio</h1>
          <p className="mt-2 max-w-2xl text-zinc-600 dark:text-zinc-400">
            Compare Instagram following and followers export files locally in your browser.
          </p>
        </div>
      </header>
      <main className="flex flex-1 flex-col px-6 py-10">
        <InstagramAnalyzer />
      </main>
    </div>
  );
}
