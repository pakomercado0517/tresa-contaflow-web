/**
 * Layout para rutas públicas (/public/[token]).
 * No incluye sidebar, navbar del dashboard ni autenticación.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-background min-h-screen">{children}</div>;
}
