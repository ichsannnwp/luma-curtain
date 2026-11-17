
import { config } from './config.js'

let polling = false
let offset = 0

const token = config.TELEGRAM_BOT_TOKEN
const allowedChatId = config.TELEGRAM_CHAT_ID

async function sendMessage(chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
      signal: AbortSignal.timeout(10000),
    },
  )

  if (!response.ok) {
    throw new Error(`Telegram API error: ${response.status}`)
  }

  return response.json()
}

async function handleMessage(message) {
  const chatId = String(message.chat?.id ?? '')

  // Hanya akun yang diizinkan yang boleh menggunakan bot.
  if (!allowedChatId || chatId !== allowedChatId) {
    console.log('Telegram: pesan dari chat yang tidak diizinkan diabaikan.')
    return
  }

  const text = message.text?.trim()

  if (!text) return

  if (text === '/start' || text === '/start@LumaCurtainBot') {
    await sendMessage(
      chatId,
      'Halo! 👋\n\nSelamat datang di LumaCurtain Bot.\n\nBot berhasil terhubung ke backend LumaCurtain.\n\nKetik /help untuk melihat perintah yang tersedia.',
    )
    return
  }

  if (text === '/help') {
    await sendMessage(
      chatId,
      'Perintah LumaCurtain:\n\n/start - Memulai bot\n/help - Bantuan\n/status - Status sistem (segera hadir)',
    )
    return
  }

  await sendMessage(
    chatId,
    'Perintah belum tersedia. Ketik /help untuk melihat bantuan.',
  )
}

async function pollUpdates() {
  while (polling) {
    try {
      const response = await fetch(
        `https://api.telegram.org/bot${token}/getUpdates?offset=${offset}&timeout=30`,
        { signal: AbortSignal.timeout(40000) },
      )

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.description || 'Gagal mengambil update Telegram')
      }

      for (const update of data.result) {
        offset = update.update_id + 1

        if (update.message) {
          try {
            await handleMessage(update.message)
          } catch (error) {
            console.error('Telegram: gagal memproses pesan:', error.message)
          }
        }
      }
    } catch (error) {
      if (!polling) break

      console.error('Telegram polling error:', error.message)
      await new Promise(resolve => setTimeout(resolve, 5000))
    }
  }
}

export function startTelegram() {
  if (!token || !allowedChatId) {
    console.log('Telegram: tidak aktif (konfigurasi belum lengkap).')
    return
  }

  if (polling) return

  polling = true
  console.log('Telegram: memulai Long Polling...')
  void pollUpdates()
}
