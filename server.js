import express from 'express'
import cors from 'cors'
import { TelegramClient } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { Api } from 'telegram'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Credenciales (las mismas del proyecto Vertiflix)
const API_ID = 37489169
const API_HASH = 'fb84f7159273b7237da3e1954ec4cbcd'

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Estado de la sesión
let client = null
let phoneCodeHash = null
let phoneNumber = null
let isConnecting = false

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Enviar código
app.post('/api/send-code', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone) {
      return res.status(400).json({ success: false, error: 'Número requerido' })
    }

    phoneNumber = phone.trim()

    // Desconectar cliente anterior si existe
    if (client) {
      try {
        await client.disconnect()
      } catch (e) {}
    }

    const stringSession = new StringSession('')
    client = new TelegramClient(stringSession, API_ID, API_HASH, {
      connectionRetries: 5,
      useWSS: false,
    })

    isConnecting = true
    console.log(`🔄 Conectando para ${phoneNumber}...`)
    
    await client.connect()
    console.log('✅ Conectado')

    const result = await client.invoke(
      new Api.auth.SendCode({
        phoneNumber: phoneNumber,
        apiId: API_ID,
        apiHash: API_HASH,
        settings: new Api.CodeSettings(),
      })
    )

    phoneCodeHash = result.phoneCodeHash
    isConnecting = false
    
    console.log(`✅ Código enviado a ${phoneNumber}`)
    
    res.json({ 
      success: true, 
      message: `Código enviado a ${phoneNumber}`,
      hash: phoneCodeHash.substring(0, 8) + '...'
    })

  } catch (error) {
    isConnecting = false
    console.error('❌ Error:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// Verificar código
app.post('/api/verify-code', async (req, res) => {
  try {
    const { code } = req.body
    
    if (!code) {
      return res.status(400).json({ success: false, error: 'Código requerido' })
    }

    if (!client || !phoneCodeHash || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Primero debes enviar el código' 
      })
    }

    console.log(`🔑 Verificando código: ${code}`)

    const signInResult = await client.invoke(
      new Api.auth.SignIn({
        phoneNumber: phoneNumber,
        phoneCodeHash: phoneCodeHash,
        phoneCode: code.trim(),
      })
    )

    const sessionString = client.session.save() || ''

    console.log('✅ Autenticación exitosa')

    // Obtener info del usuario
    const user = signInResult.user

    res.json({
      success: true,
      session: sessionString,
      user: {
        id: user?.id?.toString() || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        username: user?.username || '',
      }
    })

    // Desconectar después de éxito
    setTimeout(async () => {
      try {
        await client.disconnect()
      } catch (e) {}
    }, 2000)

  } catch (error) {
    console.error('❌ Error:', error.message)
    
    // Errores específicos
    if (error.message?.includes('SESSION_PASSWORD_NEEDED')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tu cuenta tiene 2FA activado. Desactívalo temporalmente.',
        needs2FA: true
      })
    }
    
    if (error.message?.includes('PHONE_CODE_INVALID')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Código inválido. Intenta de nuevo.'
      })
    }
    
    if (error.message?.includes('PHONE_CODE_EXPIRED')) {
      return res.status(400).json({ 
        success: false, 
        error: 'El código expiró. Solicita uno nuevo.'
      })
    }
    
    res.status(500).json({ 
      success: false, 
      error: error.message 
    })
  }
})

// Estado
app.get('/api/status', (req, res) => {
  res.json({
    ready: !!phoneCodeHash,
    phone: phoneNumber ? phoneNumber.slice(0, -4) + '****' : null,
    isConnecting
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║     🎬 TELEGRAM AUTH APP - Servidor Iniciado                 ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log(`🌐 URL: http://localhost:${PORT}`)
  console.log('')
  console.log('📋 Credenciales configuradas:')
  console.log(`   API_ID: ${API_ID}`)
  console.log(`   API_HASH: ${API_HASH.substring(0, 8)}...`)
  console.log('')
})
