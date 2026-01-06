import Link from "next/link";

export function AuthLogo() {
  return (
    <Link href="/" className="absolute top-6 left-6 flex items-center gap-2">
      <div className="flex gap-1">
        <div className="h-4 w-1 bg-primary rounded-full"></div>
        <div className="h-6 w-1 bg-primary rounded-full"></div>
        <div className="h-8 w-1 bg-primary rounded-full"></div>
      </div>
      <span className="text-xl font-semibold">Conta Flow</span>
    </Link>
  );
}



