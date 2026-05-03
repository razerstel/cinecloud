# CineCloud

Streaming privado de películas y series con interfaz inspirada en Netflix.
Consume metadatos de TMDB y reproduce los archivos vía iframe de
`vidsrc-embed.ru`. Pensado para desplegar en una instancia privada (Oracle
Cloud + Tailscale en una segunda fase).

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript estricto
- Tailwind CSS v4
- Prisma + SQLite
- Auth.js v5 (credenciales propias, sesiones JWT, contraseñas con bcrypt)
- TMDB API para metadatos
- vidsrc-embed.ru para reproducción

## Arranque local

```bash
cp .env.example .env
# rellena AUTH_SECRET (openssl rand -base64 32) y TMDB_API_KEY

npm install
npx prisma migrate dev --name init
npm run dev
```

Abre `http://localhost:3000` y crea una cuenta desde `/register`.

## Variables de entorno

Ver `.env.example`. Resumen:

| Var | Descripción |
|-----|-------------|
| `DATABASE_URL` | Ruta del fichero SQLite. |
| `AUTH_SECRET` | Secreto para firmar la sesión. Genera con `openssl rand -base64 32`. |
| `AUTH_URL` | URL pública del sitio. |
| `TMDB_API_KEY` | Token v4 (Bearer) o `api_key` v3 de TMDB. |

## Limitación conocida del tracking de progreso

El reproductor es un iframe cross-origin de `vidsrc-embed.ru`, por lo que la
política de mismo origen impide leer `currentTime` del `<video>` interno. La
posición se estima con un cronómetro local mientras la pestaña está activa y
se sincroniza cada 30 s al backend. Hay un botón "Marcar como visto" para
forzar el 100 %. Esta limitación es intrínseca al uso de un proveedor externo
y se resolvería sirviendo HLS propio.
