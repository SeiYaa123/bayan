import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, type, message } = body
    console.log("Feedback submitted:", body)
    
    // 1. Persistent file storage in the workspace root (useful for local development)
    try {
      const dataDir = "/home/ay/projetMaker"
      const filePath = path.join(dataDir, "feedback_submissions.json")
      
      let submissions = []
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8")
        try {
          submissions = JSON.parse(fileContent)
        } catch {
          submissions = []
        }
      }
      
      submissions.push({
        ...body,
        timestamp: new Date().toISOString()
      })
      
      fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), "utf-8")
      console.log("Feedback saved locally to feedback_submissions.json")
    } catch (fsError) {
      console.error("Failed to save feedback locally:", fsError)
    }

    // 2. Real-time notifications via Discord Webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (discordWebhookUrl) {
      try {
        const embedColor = 13147450 // #C89D3A in decimal
        const discordPayload = {
          embeds: [
            {
              title: "📝 Nouveau message reçu sur Bayān",
              color: embedColor,
              fields: [
                { name: "Nom / Pseudo", value: name || "Non spécifié", inline: true },
                { name: "Adresse Email", value: email || "Non spécifié", inline: true },
                { name: "Type de signalement", value: type || "Autre", inline: true },
                { name: "Message", value: message || "Vide" }
              ],
              timestamp: new Date().toISOString()
            }
          ]
        }
        await fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload)
        })
        console.log("Feedback notification sent to Discord")
      } catch (discordError) {
        console.error("Failed to send notification to Discord:", discordError)
      }
    }

    // 3. Real-time notifications via Telegram Bot
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN
    const telegramChatId = process.env.TELEGRAM_CHAT_ID
    if (telegramBotToken && telegramChatId) {
      try {
        const text = `📝 *Nouveau message reçu sur Bayān*\n\n*Nom :* ${name || "Non spécifié"}\n*Email :* ${email || "Non spécifié"}\n*Type :* ${type || "Autre"}\n\n*Message :*\n${message || "Vide"}`
        const telegramUrl = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`
        await fetch(telegramUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text,
            parse_mode: "Markdown"
          })
        })
        console.log("Feedback notification sent to Telegram")
      } catch (telegramError) {
        console.error("Failed to send notification to Telegram:", telegramError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Merci pour votre message ! Vos suggestions et corrections ont bien été enregistrées."
    })
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue lors de l'envoi." },
      { status: 400 }
    )
  }
}
