import { redirect } from "next/navigation";

export default function AccountPage() {
  // Redirigir a la página principal de setup con el tab de cuenta activo
  redirect("/dashboard/setup?tab=account");
}
