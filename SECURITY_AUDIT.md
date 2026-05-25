# Security Audit — AlekAgency (uvalek/agencyweb2.0)

> Rama: `security/audit-fixes`
> Fecha: 2026-05-21
> Alcance: código del repo y configuración Next.js. No cubre lo que vive
> fuera del repo (Vercel dashboard, VPS de Hostinger, Supabase dashboard),
> esas acciones quedan documentadas como manuales al final.

---

## Resumen ejecutivo

| Severidad | Total |
|---|---|
| Crítica | 0 |
| Alta | 3 |
| Media | 5 |
| Baja | 3 |

**Top 5 más relevantes corregidos**

1. **Chatbot llamaba directo al VPS de Hostinger desde el navegador.** Refactor:
   ahora pasa por `/api/chat`, lo que aísla la URL del VPS y permite aplicar
   rate-limit, validación y futuras API keys solo en servidor.
2. **`/api/prueba` aceptaba payload arbitrario sin validar.** Añadida validación
   estricta con `zod`, límite de tamaño de archivos, rate-limit por IP y
   saneamiento de errores hacia el cliente.
3. **No había headers de seguridad globales.** `next.config.ts` ahora aplica
   HSTS, X-Frame-Options, CSP, Referrer-Policy, Permissions-Policy, X-Content-
   Type-Options y `images.remotePatterns` restrictivo.
4. **Endpoint de login sin rate limiting** — los reintentos venían directo a
   Supabase Auth. Añadido limitador en memoria por IP delante del login y del
   chat. Documentado el camino a Upstash cuando crezca el tráfico.
5. **Mensajes de error filtrando detalles internos.** Implementado wrapper que
   solo expone códigos públicos y deja los detalles en `console.error`.

---

## Fase 1 — Reconocimiento

### Stack

- **Next.js 16.1.6** con App Router (`src/app/...`).
- **React 19.2.3**, TypeScript 5.
- **Auth:** Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`).
- **DB:** Supabase Postgres (proyecto "SuperCerebro").
- **Hosting:** Vercel.
- **Dominio:** www.alekagency.com.

### Rutas

| Ruta | Tipo | Función |
|---|---|---|
| `/` | público | Landing principal |
| `/privacidad` | público | Política de privacidad |
| `/prueba` | público | Wizard de solicitud de prueba |
| `/admin/login` | público | Login Supabase |
| `/admin` | autenticado | Dashboard de solicitudes |
| `/admin/[id]` | autenticado | Detalle de solicitud |
| `/api/prueba` | POST público | Recibe el formulario del wizard |
| `/api/chat` | POST público (nuevo) | Proxy del chatbot al VPS |

### Auth

- Middleware en `src/middleware.ts` refresca el cookie de sesión en `/admin/*`.
- Tanto `/admin` como `/admin/[id]` validan `supabase.auth.getUser()` en el
  servidor antes de leer datos.
- Cookies HttpOnly gestionadas por `@supabase/ssr` con `SameSite=Lax` por
  defecto (la librería las configura correctamente).
- `ADMIN_EMAIL` opcional permite restringir a un solo correo.

### Comunicación con VPS Hostinger

- ChatModal hablaba directamente con `https://megachatbot-chatbotmain.aslx54.easypanel.host/api/webchat`
  desde el navegador. Esta auditoría introduce un proxy en `/api/chat`.

### `.gitignore` y secretos

- `.env*` está ignorado. No hay archivos de entorno trackeados.
- No se encontraron secretos hardcodeados en el código (las menciones a
  `service_role` y `eyJh` son documentación/UI, no valores).
- Historial de git limpio de `.env*`.

---

## Acciones del audit por fase

### Fase 2 — Secretos y API keys

| Acción | Estado |
|---|---|
| Búsqueda de patrones `sk-`, `Bearer`, `eyJh`, `api_key`, `password` | ✅ Sin hits reales |
| `.env*` en `.gitignore` | ✅ Ya estaba |
| Historial git de archivos `.env*` | ✅ Limpio |
| `NEXT_PUBLIC_*` que contengan secretos | ✅ Solo URL + anon key Supabase + URL pública del chatbot |
| API key del VPS viajando desde cliente | ✅ Refactor: ahora pasa por `/api/chat` |
| `.env.example` con todas las variables sin valores reales | ✅ Creado |

### Fase 3 — Autenticación

| Acción | Estado |
|---|---|
| Hash de contraseñas | ✅ Delegado a Supabase Auth (bcrypt internamente) |
| Rate limiting en login | ✅ In-memory por IP en `/admin/login` (vía `signInLimited` server action) |
| Sesiones HttpOnly + Secure + SameSite | ✅ `@supabase/ssr` las configura así |
| Protección de rutas | ✅ Middleware + chequeo server en cada page |
| Eliminar protección sólo por `useEffect` | ✅ N/A — toda la protección es server-side |
| Recuperación de contraseña | ⚠️ No implementada en el repo. Si en el futuro se añade, usar tokens cortos. |

### Fase 4 — API routes

`/api/prueba`:

| Acción | Estado |
|---|---|
| Método HTTP estricto | ✅ Sólo `POST` definido |
| Validación con `zod` | ✅ Schema completo, máx longitudes y tipos |
| Auth donde aplica | ⏭️ Endpoint público de captura, no requiere auth |
| IDOR | ✅ Sólo `INSERT`, no expone ids ajenos |
| Rate limiting | ✅ In-memory 5 req / 10 min / IP |
| CORS | ✅ Default Next.js (same-origin) |
| Mensajes de error sanitizados | ✅ Genéricos al cliente, detalle en logs |
| SQL injection | ✅ Cliente Supabase usa parámetros |
| Límite tamaño archivos | ✅ 25 MB por archivo |

### Fase 5 — Chatbot

| Acción | Estado |
|---|---|
| Proxy `/api/chat` en lugar de fetch directo | ✅ Implementado |
| Rate limit agresivo | ✅ 30 req / 5 min por IP, 8 por segundo |
| Límite longitud input | ✅ 4000 caracteres |
| Detección de prompt injection obvio | ✅ Loggea intentos sospechosos |
| Circuit breaker básico | ✅ Si supera 200 req/min globales, devuelve 429 hasta que baje |
| URL del VPS se mueve a env server-side | ✅ `CHATBOT_URL` (sin `NEXT_PUBLIC_`). Acción manual en Vercel descrita abajo. |

### Fase 6 — Headers y `next.config`

| Header / config | Aplicado |
|---|---|
| `Strict-Transport-Security` (max-age 2 años + preload) | ✅ |
| `X-Frame-Options: DENY` | ✅ |
| `X-Content-Type-Options: nosniff` | ✅ |
| `Referrer-Policy: strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` (camera, mic, geo deshabilitados) | ✅ |
| `Content-Security-Policy` adaptado al sitio | ✅ |
| `images.remotePatterns` restrictivo | ✅ Sólo dominios usados |
| Open redirects | ✅ No hay redirecciones que tomen URL por param |

### Fase 7 — Dependencias

Antes del audit: **5 high + 7 moderate = 12 vulnerabilidades**.
Después: **0 high + 2 moderate**.

Lo que se hizo:

- `npm audit fix` (limpia `fast-uri`, `flatted`, `hono`, `@hono/node-server`,
  `brace-expansion`, `ip-address`).
- Bump de **Next.js 16.1.6 → 16.2.6** (y `eslint-config-next` en sincronía).
  Cubre toda esta lista de avisos críticos:
  - CSRF bypass via null origin (Server Actions y dev HMR websocket)
  - Middleware/Proxy bypass en App Router
  - Cache poisoning en RSC y en redirects de middleware
  - HTTP request smuggling en rewrites
  - DoS en Server Components y `next/image`
  - XSS con nonces CSP en App Router

Riesgo aceptado:

- **`postcss`** (2 moderate, transitive de `next`). Único "fix" es
  `npm audit fix --force` que regresa Next a 9.x. No es viable.
  La vulnerabilidad (XSS por `</style>` mal escapado en CSS stringify) sólo
  toca el pipeline de build de Tailwind/Next y no procesa input del usuario,
  así que el riesgo real para nosotros es ~cero. Se revisará en la próxima
  versión menor de Next.

### Fase 8 — Vercel + VPS + Supabase

Documentado en las secciones manuales al final.

---

## ACCIONES MANUALES EN VERCEL

Necesito que las hagas tú en el dashboard:

1. **HTTPS forzado** — en Settings → Domains, confirma que el toggle "Redirect
   HTTP to HTTPS" esté en ON.
2. **Variables de entorno por entorno**
   - `CHATBOT_URL` (server-side, sin prefijo `NEXT_PUBLIC_`):
     `https://megachatbot-chatbotmain.aslx54.easypanel.host`
   - Mueve los valores de `NEXT_PUBLIC_CHATBOT_URL` si lo tenías. Después de
     desplegar este cambio, ya no es necesario.
   - Confirma que `SUPABASE_SERVICE_ROLE_KEY` está marcado como "Sensitive" y
     SOLO existe en Production. No debe estar en Preview ni en Development.
3. **Deployment Protection** — Activa "Standard Protection" o "All Deployments"
   en Settings → Deployment Protection para que las preview URLs requieran
   login con tu cuenta Vercel.
4. **Build logs** — Revisa los últimos 5 builds en busca de cualquier env
   logueado por error. Si encuentras alguno, rota la key correspondiente.
5. **DNS / dominio**
   - Añadir registro **CAA** apuntando a `letsencrypt.org` (los certificados
     de Vercel salen de Let's Encrypt) para impedir que otra CA emita certs
     para tu dominio.
   - Si vas a enviar correos desde el dominio: añade **SPF**, **DKIM** y
     **DMARC**. Si no envías, considera **MX null + DMARC `p=reject`** para
     evitar suplantación.

---

## ACCIONES MANUALES EN EL VPS (Hostinger)

No tengo acceso al VPS. Recorre este checklist por SSH:

```bash
# 1) UFW solo con 22, 80, 443
sudo ufw status verbose
# Si está inactivo o tiene otros puertos abiertos:
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 2) SSH solo por llave (sin password)
sudo nano /etc/ssh/sshd_config
# Asegúrate de tener:
#   PasswordAuthentication no
#   PubkeyAuthentication yes
#   PermitRootLogin no
# Idealmente cambia también el puerto:
#   Port 2222   (luego: sudo ufw allow 2222/tcp && sudo ufw delete allow 22/tcp)
sudo systemctl restart ssh

# 3) fail2ban
sudo apt update && sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status

# 4) Servicio del chatbot NO como root
# Verifica con:
ps aux | grep chatbot
# Si está como root, crea un usuario dedicado:
sudo adduser --system --group chatbot
sudo chown -R chatbot:chatbot /ruta/al/servicio
# Y en el systemd unit: User=chatbot, Group=chatbot

# 5) El servicio escucha en localhost detrás de nginx/caddy
# El backend debería bindear a 127.0.0.1:<puerto>, NO a 0.0.0.0
ss -tnlp | grep <puerto>
# nginx/caddy reenvía 443 -> 127.0.0.1:<puerto>

# 6) HTTPS con Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d megachatbot-chatbotmain.aslx54.easypanel.host
# Renovación automática:
sudo systemctl status certbot.timer

# 7) CORS del VPS sólo a tu dominio Vercel
# En el handler del chatbot añade:
#   Access-Control-Allow-Origin: https://www.alekagency.com
# No "*"

# 8) Logs y rotación
sudo journalctl -u <unidad-chatbot> --since "1 hour ago"
# Configura logrotate si escribes a archivo propio.
```

Marca cada punto cuando esté hecho.

---

## ACCIONES MANUALES EN SUPABASE

1. **Storage policies** — el bucket `trial-uploads` es privado. Confirma que en
   Storage → Policies no tenga ninguna policy pública.
2. **Auth → Settings** — confirma que **Sign-ups esté DESHABILITADO**. Solo tu
   correo debería poder loguear; no queremos signups abiertos al público.
3. **Rate limiting** — Auth → Rate Limits → confirma que email/password tenga
   un límite bajo (5-10 por hora por IP).
4. **MFA en tu cuenta admin** — Auth → Users → tu cuenta → activa MFA con TOTP.
5. **RLS** — `public.trial_requests` tiene RLS habilitado y SIN policies. Solo
   el service_role puede leer/escribir. ✅ Correcto.
6. **Tablas legacy** — `documents` y `n8n_chat_histories` también tienen RLS;
   revisa que sus policies actuales sean las que esperas o estarán expuestas
   por la anon key.
7. **Service role key** — confírmate de que **NO** está en ninguna variable
   `NEXT_PUBLIC_*` en Vercel. Solo en `SUPABASE_SERVICE_ROLE_KEY`.

---

## Recomendaciones a futuro

- **Migrar rate limit a Upstash Ratelimit** cuando el sitio crezca o cuando
  Vercel escale a más de una región (el in-memory es por instancia).
- **Sentry** o **Logflare** para monitoreo de errores en producción. Ayuda a
  detectar abuso y bugs sin esperar a que el usuario reporte.
- **WAF** — si el chatbot empieza a recibir abuso, activar Vercel WAF.
- **Pentest profesional** cuando el negocio justifique el costo (~después de
  tener clientes pagos y datos sensibles de varios).
- **Política de rotación de keys** — rotar `SUPABASE_SERVICE_ROLE_KEY` cada
  6 meses como buena práctica.
- **Backups Supabase** — confirma que tienes backups diarios activados (en el
  plan Pro vienen por default).

---

## Lista completa de cambios por archivo

Ver commits de la rama `security/audit-fixes` (uno por área):

- `next.config.ts` — security headers + remotePatterns
- `src/lib/rate-limit.ts` — limiter en memoria reutilizable
- `src/app/api/prueba/route.ts` — zod, límites, rate limit
- `src/app/api/chat/route.ts` — nuevo proxy del chatbot
- `src/components/ChatModal.tsx` — llama a `/api/chat`
- `src/app/admin/login/page.tsx` + `actions.ts` — rate limit del login
- `.env.example` — plantilla nueva
