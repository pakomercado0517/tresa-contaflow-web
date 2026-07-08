# Contafy 💰

Sistema web SaaS para el control y gestión de facturas CFDI (México) que permite a empresas y contadores gestionar múltiples clientes/empresas (RFCs) desde una sola cuenta, con procesamiento automático de XML, validaciones fiscales, reportes profesionales y sincronización en la nube.

## 🚀 Características

- 📊 **Dashboard Interactivo**: Visualización de métricas financieras en tiempo real
- 📄 **Gestión de Facturas**: Carga y procesamiento automático de XML CFDI
- 💸 **Control de Gastos**: Registro y seguimiento de gastos empresariales
- 👥 **Multi-perfil**: Gestiona múltiples RFCs desde una sola cuenta
- 🔐 **Autenticación Segura**: Sistema de autenticación con JWT y verificación de email
- 📈 **Reportes y Gráficos**: Visualización de tendencias financieras con gráficos interactivos
- 📱 **Diseño Responsivo**: Interfaz optimizada para móviles y tablets
- 🌙 **Tema Oscuro**: Interfaz moderna con tema oscuro

## 🛠️ Stack Tecnológico

### Frontend

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **UI Library**: [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Componentes**: [Shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Iconos**: [Lucide React](https://lucide.dev/)

### Gestión de Estado y Datos

- **Estado Global**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query) (React Query)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) 20 o superior
- [pnpm](https://pnpm.io/) 8 o superior (gestor de paquetes requerido)

## 🔧 Instalación

1. **Clona el repositorio**

```bash
git clone https://github.com/tu-usuario/contafy.git
cd contafy
```

2. **Instala las dependencias**

```bash
pnpm install
```

3. **Configura las variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# URLs del Frontend
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Ruta pública del panel de códigos de descuento (solo servidor; reinicia `pnpm dev` tras cambiarla)
# Debe coincidir con segmentos de URL, sin slash inicial. Ej: admin/mi-panel-descuentos
# La página vive en app/internal/discount-management; Next reescribe esta ruta hacia ahí.
# Si difiere del path interno, /internal/discount-management responde 404.
ADMIN_DISCOUNT_ROUTE=internal/discount-management
```

4. **Inicia el servidor de desarrollo**

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo

# Producción
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción

# Calidad de Código
pnpm lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
contafy/
├── app/                    # Rutas y páginas (App Router)
│   ├── auth/              # Páginas de autenticación
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── dashboard/         # Dashboard principal
│   ├── components/        # Componentes específicos de rutas
│   ├── layout.tsx         # Layout raíz
│   ├── page.tsx           # Landing page
│   └── globals.css        # Estilos globales
├── components/            # Componentes globales reutilizables
│   ├── common/           # Componentes comunes
│   ├── layout/           # Componentes de layout
│   └── ui/               # Componentes de Shadcn/ui
├── lib/                  # Utilidades y lógica de negocio
│   ├── api/              # Cliente API y funciones de endpoints
│   ├── types/            # Tipos e interfaces TypeScript
│   └── utils.ts          # Utilidades generales
├── docs/                 # Documentación del proyecto
│   ├── api-information/  # Documentación de endpoints API
│   └── PRD_MICROSAAS.md  # Product Requirements Document
└── public/               # Archivos estáticos
```

## 🏗️ Arquitectura

### Estrategia de Fetching de Datos

El proyecto utiliza una **estrategia híbrida** que combina:

- **Server Components**: Para datos iniciales y páginas estáticas (SSR)
- **TanStack Query**: Para datos interactivos y client components
- **Server Actions**: Para formularios y mutaciones simples

### Autenticación

- **JWT** con tokens almacenados en **httpOnly cookies** para mayor seguridad
- Verificación de email mediante enlaces con tokens
- Recuperación de contraseña con enlaces temporales

### Modularización

- Cada ruta tiene su propia carpeta `components/` para subcomponentes
- `page.tsx` actúa como "guionista" (mínima lógica, solo composición)
- Componentes globales reutilizables en `components/`

## 🎨 Diseño

- **Enfoque**: Mobile-first (diseño responsivo)
- **Tema**: Oscuro con color primario verde
- **Componentes**: Basados en Shadcn/ui y Radix UI
- **Tipografía**: Geist (optimizada por Next.js)

## 📚 Documentación

La documentación completa del proyecto se encuentra en la carpeta `docs/`:

- `docs/PRD_MICROSAAS.md` - Product Requirements Document
- `docs/api-information/` - Documentación de endpoints API
- `docs/PROJECT_RULES.md` - Reglas y convenciones del proyecto

## 🧪 Desarrollo

### Convenciones de Código

- **TypeScript strict**: Sin `any`, tipado robusto
- **Interfaces sobre types**: Priorizar interfaces para estructuras de datos
- **Programación funcional**: Evitar clases, usar funciones puras
- **Nomenclatura descriptiva**: Variables con verbos auxiliares (`isLoading`, `hasError`)
- **Server Components primero**: Minimizar `"use client"` y hooks del cliente

### Reglas del Proyecto

Consulta `docs/PROJECT_RULES.md` para las reglas completas de desarrollo, incluyendo:

- Tipado TypeScript estricto
- Modularización y estructura de carpetas
- Principios de código simple y eficaz
- Paradigmas funcionales y declarativos
- Nomenclatura y convenciones
- UI y estilos con Tailwind CSS
- React y Next.js (Server Components)
- Estrategia de fetching de datos

## 🚢 Despliegue

### Vercel (Recomendado)

El despliegue más sencillo es usando [Vercel](https://vercel.com):

1. Conecta tu repositorio de GitHub
2. Configura las variables de entorno
3. Vercel detectará automáticamente Next.js y desplegará

### Otros Proveedores

La aplicación puede desplegarse en cualquier plataforma que soporte Next.js:

- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y de uso interno.

## 👥 Equipo

Desarrollado con ❤️ para facilitar la gestión financiera de empresas mexicanas.

---

**Nota**: Este proyecto requiere un backend API funcionando. Consulta la documentación en `docs/api-information/` para más detalles sobre los endpoints requeridos.
