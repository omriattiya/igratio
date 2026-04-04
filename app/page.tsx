import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-100/80 dark:bg-[#0c1929]">
      <header className="border-b border-blue-200/60 bg-white/90 px-6 py-10 backdrop-blur dark:border-blue-900/60 dark:bg-blue-950/85">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-semibold tracking-tight text-blue-950 dark:text-blue-50">IG Ratio</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-blue-200/70">
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
