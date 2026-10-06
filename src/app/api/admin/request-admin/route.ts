import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const maxDuration = 60;

// Initialisation de Resend avec la clé configurée
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  let createdUid: string | null = null;

  try {
    const { displayName, email, password, phoneNumber } = await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "Les champs Nom, Email et Mot de passe sont obligatoires." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Création de l'utilisateur dans Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email: cleanEmail,
      password,
      displayName,
      phoneNumber:
        phoneNumber && phoneNumber.trim() !== ""
          ? phoneNumber.trim()
          : undefined,
    });

    createdUid = userRecord.uid;

    // 2. Création du document utilisateur dans la collection "users"
    try {
      await adminDb
        .collection("users")
        .doc(userRecord.uid)
        .set({
          idUser: userRecord.uid,
          name: displayName,
          mail: cleanEmail,
          smartphone: phoneNumber || "",
          photoURL: "",
          responsability: "Administrateur",
          isBlocked: false,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        });
    } catch (firestoreError) {
      if (createdUid) {
        await adminAuth.deleteUser(createdUid);
      }
      throw firestoreError;
    }

    // 3. Envoi de l'email de validation au DG via Resend
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const dgEmail = process.env.DG_EMAIL || "andrianasologuerra@gmail.com";

    const approveUrl = `${appUrl}/api/admin/verify-request?uid=${userRecord.uid}&action=APPROVED`;
    const rejectUrl = `${appUrl}/api/admin/verify-request?uid=${userRecord.uid}&action=REJECTED`;

    await resend.emails.send({
      from: "Rhum du Betsileo <onboarding@resend.dev>", // Ou votre domaine vérifié Resend
      to: dgEmail,
      subject: `Nouvelle demande de compte Administrateur : ${displayName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
              .card { max-width: 550px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
              .header { background-color: #2563eb; color: #ffffff; padding: 24px; text-align: center; }
              .header h2 { margin: 0; font-size: 20px; font-weight: 700; }
              .content { padding: 24px; line-height: 1.6; font-size: 14px; }
              .info-box { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 16px 0; }
              .info-item { margin-bottom: 8px; }
              .info-item:last-child { margin-bottom: 0; }
              .label { font-weight: 600; color: #64748b; }
              .actions { display: flex; gap: 12px; margin-top: 24px; text-align: center; }
              .btn { display: inline-block; flex: 1; padding: 12px 20px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 14px; text-align: center; }
              .btn-approve { background-color: #16a34a; color: #ffffff !important; }
              .btn-reject { background-color: #dc2626; color: #ffffff !important; }
              .footer { padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h2>Demande d'Accès Administrateur</h2>
              </div>
              <div class="content">
                <p>Bonjour Directeur Général,</p>
                <p>Une nouvelle demande de création de compte <strong>Administrateur</strong> a été soumise pour l'application :</p>
                
                <div class="info-box">
                  <div class="info-item"><span class="label">Nom complet :</span> ${displayName}</div>
                  <div class="info-item"><span class="label">Email :</span> ${cleanEmail}</div>
                  <div class="info-item"><span class="label">Téléphone :</span> ${phoneNumber || "Non renseigné"}</div>
                  <div class="info-item"><span class="label">Statut actuel :</span> <span style="color: #d97706; font-weight: bold;">PENDING</span></div>
                </div>

                <p>Veuillez valider ou rejeter cette demande en cliquant sur l'un des boutons ci-dessous :</p>

                <div class="actions">
                  <a href="${approveUrl}" class="btn btn-approve">Approuver</a>
                  <a href="${rejectUrl}" class="btn btn-reject">Rejeter</a>
                </div>
              </div>
              <div class="footer">
                Ceci est un message automatique généré par l'application Rhum du Betsileo.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Erreur API request-admin :", error);

    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Cet e-mail est déjà utilisé par un autre compte." },
        { status: 400 },
      );
    }

    if (error.code === "auth/invalid-phone-number") {
      return NextResponse.json(
        {
          error:
            "Le format du numéro de téléphone est invalide. Utilisez le format international (ex: +261341647584).",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error:
          error.message ||
          "Erreur interne lors de la création de la demande d'administration.",
      },
      { status: 500 },
    );
  }
}
