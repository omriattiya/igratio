import { InstagramAnalyzer } from "@/components/InstagramAnalyzer";
import { SiteHeader } from "@/components/SiteHeader";
import { messages } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-100/80 dark:bg-[#0c1929]">
      <SiteHeader
        title={messages.home.headerTitle}
        description={messages.home.headerDescription}
      />
      <main className="flex flex-1 flex-col px-6 py-10">
        <InstagramAnalyzer />
      </main>
    </div>
  );
}
