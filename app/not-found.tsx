import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h2 className="mb-1 text-xl font-medium">Page not found</h2>
      <p className="mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="text-sm underline underline-offset-4">
        Go back home
      </Link>
    </div>
  );
}
