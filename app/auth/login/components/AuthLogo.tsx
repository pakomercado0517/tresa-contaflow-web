import Link from 'next/link';
import Image from 'next/image';

export function AuthLogo() {
  return (
    <Link
      href="/"
      className="relative z-10 flex items-center gap-2 px-4 pt-6 md:absolute md:top-6 md:left-6 md:px-0 md:pt-0"
    >
      <Image src="/logotipo-contafy.svg" alt="Contafy" width={32} height={32} className="h-8 w-8" />
      <span className="text-xl font-semibold">Contafy</span>
    </Link>
  );
}
