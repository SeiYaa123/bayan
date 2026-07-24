import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Feedback submitted:", body)
    
    // Persistent file storage in the workspace root
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
