import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

// Autorise un temps d'exécution jusqu'à 60 secondes pour traiter les images volumineuses
export const maxDuration = 60;

export async function POST(request: Request) {
  let createdUid: string | null = null;

  try {
    const authResult = await verifyAdminRequest(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const { displayName, email, password, phoneNumber, photoURL } =
      await request.json();

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: "Les champs Nom, Email et Mot de passe sont obligatoires." },
        { status: 400 },
      );
    }

    const cleanEmail = email.trim().toLowerCase();

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

    try {
      await adminDb
        .collection("users")
        .doc(userRecord.uid)
        .set({
          idUser: userRecord.uid,
          name: displayName,
          mail: cleanEmail,
          smartphone: phoneNumber || "",
          photoURL: photoURL || "",
          responsability: "simple",
          createdAt: new Date(),
        });
    } catch (firestoreError) {
      if (createdUid) {
        await adminAuth.deleteUser(createdUid);
      }
      throw firestoreError;
    }

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Erreur API create-user :", error);

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
          error.message || "Erreur interne lors de la création de l'agent.",
      },
      { status: 500 },
    );
  }
}
