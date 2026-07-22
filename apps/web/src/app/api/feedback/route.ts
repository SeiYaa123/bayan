import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Feedback submitted:", body)
    
    // In a real application, we would write to database or send an email.
    // For this deployment, we return success.
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
