import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const action = searchParams.get("action");

  if (!uid || !action || !["APPROVED", "REJECTED"].includes(action)) {
    return new NextResponse("Paramètres invalides.", { status: 400 });
  }

  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return new NextResponse("Utilisateur introuvable.", { status: 404 });
    }

    await userRef.update({
      status: action as "APPROVED" | "REJECTED",
    });

    const isApproved = action === "APPROVED";
    const statusText = isApproved ? "Approuvée" : "Rejetée";
    const color = isApproved ? "#16a34a" : "#dc2626";

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Traitement de la demande</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .box { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
            h1 { color: ${color}; font-size: 24px; margin-bottom: 12px; }
            p { color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Demande ${statusText} !</h1>
            <p>Le statut du compte administrateur a été mis à jour avec succès en <strong>${action}</strong>.</p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut :", error);
    return new NextResponse("Erreur serveur lors de la mise à jour.", {
      status: 500,
    });
  }
}
