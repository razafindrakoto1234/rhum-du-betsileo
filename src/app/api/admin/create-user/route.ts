import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

// Autorise un temps d'exécution jusqu'à 60 secondes pour traiter les images volumineuses
export const maxDuration = 60;

export async function POST(request: Request) {
  let createdUid: string | null = null;

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Non autorisé. Jeton de connexion manquant." },
        { status: 401 },
      );
    }

    const token = authHeader.split("Bearer ")[1];
    let decodedToken;

    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch {
      return NextResponse.json(
        {
          error:
            "Session expirée ou jeton invalide. Veuillez vous reconnecter.",
        },
        { status: 401 },
      );
    }

    // Vérification assouplie du rôle Administrateur
    const callerDoc = await adminDb
      .collection("users")
      .doc(decodedToken.uid)
      .get();

    const callerData = callerDoc.data();
    const role = (
      callerData?.responsability ||
      callerData?.role ||
      ""
    ).toLowerCase();

    if (!callerDoc.exists || (role !== "administrateur" && role !== "admin")) {
      return NextResponse.json(
        {
          error:
            "Accès refusé. Vous devez être Administrateur pour effectuer cette action.",
        },
        { status: 403 },
      );
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
