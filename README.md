# Telegram Auth App

Obtén tu `TELEGRAM_SESSION` para usar MTProto en tus proyectos.

## 🚀 Despliegue Rápido

### Opción 1: Railway (Recomendado)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/telegram-auth)

1. Clic en "Deploy on Railway"
2. Espera a que se despliegue
3. Abre la URL generada
4. Ingresa tu número y código

### Opción 2: Render

1. Ve a [render.com](https://render.com)
2. Crea nuevo **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Deploy

### Opción 3: Vercel

1. Importa el repositorio en Vercel
2. Deploy
3. Listo

### Opción 4: Local

```bash
# Clonar
git clone https://github.com/vertiljivenson9/telegram-id.git
cd telegram-id

# Instalar
npm install

# Ejecutar
npm start

# Abrir http://localhost:3000
```

## 📋 Uso

1. Ingresa tu número de teléfono con código de país (ej: `+18294889614`)
2. Recibirás un código en tu Telegram
3. Ingresa el código en la web
4. Copia el `TELEGRAM_SESSION` generado
5. Pégalo en las variables de entorno de tu proyecto

## ⚙️ Variables de Entorno (Opcional)

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `3000` |

## 📝 Credenciales

Las credenciales de Telegram API ya están configuradas:
- `API_ID`: 37489169
- `API_HASH`: fb84f7159273b7237da3e1954ec4cbcd

## 🔒 Seguridad

- Las sesiones solo se muestran una vez
- No se almacenan en el servidor
- Conexión cifrada con Telegram

## 📄 Licencia

MIT
