type SiteHeaderProps = {
  title: string;
  description: string;
};

export function SiteHeader({ title, description }: SiteHeaderProps) {
  return (
    <header className="border-b border-blue-900/60 bg-blue-950/85 px-6 py-10 backdrop-blur">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold tracking-tight text-blue-50">{title}</h1>
        <p className="mt-2 max-w-2xl text-blue-200/70">{description}</p>
      </div>
    </header>
  );
}
