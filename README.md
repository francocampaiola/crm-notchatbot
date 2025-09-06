# CRM de Clientes con IA

Un CRM moderno desarrollado con Next.js, Convex y QStash que incluye gestión de clientes, análisis con IA y automatización de tareas.

## 🚀 Características

- **Gestión de Clientes**: Alta, edición y listado de clientes con estados (Activo, Inactivo, Potencial)
- **Dashboard en Tiempo Real**: Actualizaciones automáticas con Convex
- **Asistente IA**: Análisis inteligente de clientes con recomendaciones
- **Automatización**: Job recurrente que marca clientes inactivos automáticamente via QStash
- **UI Moderna**: Interfaz construida con ShadcnUI y Tailwind CSS

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15, React 19, TypeScript
- **Base de Datos**: Convex (tiempo real)
- **Automatización**: QStash
- **UI**: ShadcnUI, Tailwind CSS
- **IA**: Google Gemini (via AI SDK)

## 🚀 Getting Started

### Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local

# Iniciar servidor de desarrollo
pnpm dev
```

### Variables de Entorno

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=tu_convex_url
CONVEX_DEPLOY_KEY=tu_convex_key

# QStash (solo para producción)
QSTASH_TOKEN=tu_qstash_token
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app

# OpenAI (opcional)
OPENAI_API_KEY=tu_openai_key
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
