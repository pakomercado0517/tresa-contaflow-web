import Link from 'next/link';
import Image from 'next/image';

export function AuthLogo() {
  return (
    <Link href="/" className="absolute top-6 left-6 flex items-center gap-2">
      <Image src="/logotipo-contafy.svg" alt="Contafy" width={32} height={32} className="h-8 w-8" />
      <span className="text-xl font-semibold">Contafy</span>
    </Link>
  );
}
