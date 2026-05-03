# CineCloud

Streaming privado de películas y series con interfaz inspirada en Netflix.
Consume metadatos de **TMDB** y reproduce los archivos vía iframe de
**vidsrc-embed.ru**. Pensado para desplegar en una instancia privada (Oracle
Cloud + Tailscale en una segunda fase).

## Funcionalidades

- Hero a pantalla casi completa con backdrop y CTAs.
- Filas categorizadas (tendencias, populares, mejor valoradas, géneros).
- Tarjetas con hover expandible, scroll-snap horizontal y `next/image`.
- Páginas de detalle para películas y series con sinopsis, géneros, runtime,
  selector de temporada, lista de episodios y recomendaciones.
- Reproductor que monta el iframe de vidsrc con `autoplay` y `autonext` para
  series.
- **Autenticación** propia (login + registro) con Auth.js v5, sesiones JWT y
  contraseñas hasheadas con bcrypt (cost 12). Validación con Zod.
- Persistencia de **progreso de visualización** (heartbeat de 30 s mientras la
  pestaña está activa, sentinel de "marcar como visto" al 100 %).
- **Mi lista** y fila "Continuar viendo" personalizadas por usuario.
- **Buscador** multi (películas + series) con debounce.
- Loading skeletons y revalidación ISR de 1 hora en datos TMDB.

## Stack

- Next.js 16 (App Router) + React 19
- TypeScript estricto
- Tailwind CSS v4
- Prisma + SQLite (sin servidor de BD adicional)
- Auth.js v5 (`next-auth@beta`) con Credentials provider
- TMDB API (token v3 o v4)
- vidsrc-embed.ru (iframe)

## Arranque local

```bash
cp .env.example .env
# rellena AUTH_SECRET (openssl rand -base64 32) y TMDB_API_KEY

npm install
npx prisma migrate dev --name init
npm run dev
```

Abre `http://localhost:3000` y crea una cuenta desde `/register`. Cualquier
ruta no autenticada redirige a `/login` con `callbackUrl`.

Para verificar la API key de TMDB sin tocar la app:

```bash
node scripts/check-tmdb.mjs
```

## Variables de entorno

Ver `.env.example`. Resumen:

| Var | Descripción |
|-----|-------------|
| `DATABASE_URL` | Ruta del fichero SQLite. |
| `AUTH_SECRET` | Secreto para firmar la sesión. Genera con `openssl rand -base64 32`. |
| `AUTH_URL` | URL pública del sitio. |
| `TMDB_API_KEY` | Token v4 (Bearer) o `api_key` v3 de TMDB. |
| `VIDSRC_BASE_URL` | Base del proveedor del iframe. Por defecto `https://vidsrc-embed.ru`. |

## Estructura

```
src/
├── app/
│   ├── (app)/                # rutas protegidas
│   │   ├── page.tsx          # home con hero + filas
│   │   ├── movie/[id]/       # ficha película
│   │   ├── tv/[id]/          # ficha serie
│   │   ├── watch/[type]/[id]/ # reproductor
│   │   ├── search/           # buscador
│   │   └── my-list/          # watchlist personal
│   ├── (auth)/login          # login
│   ├── (auth)/register       # registro
│   └── api/                  # auth, register, progress, watchlist
├── components/               # Hero, Row, Card, Player, Navbar...
├── lib/                      # auth, db, tmdb, vidsrc
└── proxy.ts                  # protección de rutas (Next 16)
```

## Limitación conocida del tracking

El reproductor es un iframe cross-origin de `vidsrc-embed.ru`, por lo que la
política de mismo origen impide leer `currentTime` del `<video>` interno. La
posición se estima con un cronómetro local mientras la pestaña está activa y
se sincroniza cada 30 s al backend. Hay un botón "Marcar como visto" para
forzar el 100 %. Esta limitación es intrínseca al uso de un proveedor externo
y se resolvería sirviendo HLS propio.

## Despliegue privado (segunda fase)

El destino es una instancia Oracle Cloud Always Free + Tailscale para que la
URL solo sea accesible desde dispositivos del usuario. Esa parte se aborda en
una siguiente iteración: la app actual está pensada para correr en cualquier
máquina con Node 20+ tras `npm run build && npm start`.
