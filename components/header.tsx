import Link from "next/link";

export const Header = ({ title }: { title: string }) => {
  return (
    <header className="border-b border-black/5 shadow-sm">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <span className="text-2xl font-semibold tracking-tight text-black">
          <Link href="/">{title}</Link>
        </span>
      </div>
    </header>
  );
};
