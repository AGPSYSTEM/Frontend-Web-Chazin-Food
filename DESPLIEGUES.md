# 🌐 Ecosistema de Despliegue - Chazin Food

Documento de referencia para el equipo con los enlaces, accesos y configuración del entorno de producción desplegado.

---

## 🚀 Enlaces de Producción

| Servicio | Plataforma | Enlace / URL | Estado |
| :--- | :--- | :--- | :--- |
| **Frontend Web** | **Vercel** | [https://frontend-web-chazin-food.vercel.app/](https://frontend-web-chazin-food.vercel.app/) | ✅ Activo (HTTP 200) |
| **Backend API** | **Render** | [https://backend-web-chazin-food.onrender.com/api](https://backend-web-chazin-food.onrender.com/api) <br> Healthcheck: [/healthz](https://backend-web-chazin-food.onrender.com/healthz) | ✅ Activo |
| **Base de Datos** | **TiDB Cloud Serverless** | [Consola Web TiDB Cloud SQL Editor](https://tidbcloud.com/tidbs/10388797868956361939/sqleditor?orgId=1372813089209378454) | ✅ Activo |
| **Dashboard Render** | **Render Dashboard** | [Deploy Dashboard Render](https://dashboard.render.com/web/srv-dbgapukipgvc73f1grmg/deploys/dep-dbgbh8ss728c73du7an0?r=2026-10-27%4014%3A42%3A47%7E2026-10-27%4014%3A46%3A06) | ✅ Gestionado |

---

## ⚙️ Configuración y Variables de Entorno

### 1. Frontend (Vercel)
- **Repositorio conectado:** `AGPSYSTEM/Frontend-Web-Chazin-Food` (Rama: `main`)
- **Framework Preset:** Vite
- **Variables de Entorno clave:**
  ```env
  VITE_API_URL=https://backend-web-chazin-food.onrender.com/api
  VITE_GOOGLE_CLIENT_ID=704380683411-qqviom0drmbaq1gg9lp56spfecic6hac.apps.googleusercontent.com
  VITE_WOMPI_PUBLIC_KEY=pub_test_aqlt5Kk6gDrCW296IVkf1n0De21AEr2I
  VITE_CLOUDINARY_CLOUD_NAME=iof3ysvn
  VITE_CLOUDINARY_UPLOAD_PRESET=Chazinfood
  ```

### 2. Backend (Render)
- **Repositorio conectado:** `AGPSYSTEM/Backend-Web-Chazin-Food` (Rama: `main`)
- **Healthcheck Path:** `/healthz`
- **Variables de Entorno clave:**
  ```env
  PORT=10000
  NODE_ENV=production
  DB_HOST=gateway01.us-east-1.prod.aws.tidbcloud.com
  DB_PORT=4000
  DB_NAME=chazinfood
  DB_SSL=true
  ```

### 3. Base de Datos (TiDB Cloud)
- **Clúster ID:** `10388797868956361939`
- **Organización ID:** `1372813089209378454`
- **Esquema activo:** `backend/db/chazinfood_tidb_ready.sql` / `backend/db/chazinfood.sql`

