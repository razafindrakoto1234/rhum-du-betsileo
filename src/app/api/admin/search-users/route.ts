import { verifyAdminRequest } from "@/lib/auth/verify-admin";
import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { UserData } from "@/types/user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const authResult = await verifyAdminRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // 3. Récupération de la requête de recherche
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toLowerCase() || "";

    if (!query) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 4. Récupération des utilisateurs depuis Firestore
    const snapshot = await adminDb.collection("users").get();

    // 5. Filtrage flexible (Contient la sous-chaîne + Insensible à la casse)
    const matchingUsers: UserData[] = [];

    snapshot.docs.forEach((doc) => {
      const data = doc.data();

      const name = (data.name || "").toLowerCase();
      const mail = (data.mail || "").toLowerCase();
      const responsability = (data.responsability || "").toLowerCase();
      const smartphone = (data.smartphone || "").toLowerCase();

      // Vérifie si 'query' (ex: "a" ou "admin") est présent dans l'un des champs
      const isMatch =
        name.includes(query) ||
        mail.includes(query) ||
        responsability.includes(query) ||
        smartphone.includes(query);

      if (isMatch) {
        matchingUsers.push({
          idUser: doc.id,
          name: data.name || "",
          mail: data.mail || "",
          smartphone: data.smartphone || "",
          photoURL: data.photoURL || "",
          responsability: data.responsability || "simple",
          createdAt: data.createdAt?.toDate
            ? data.createdAt.toDate().toISOString()
            : new Date().toISOString(),
        });
      }
    });

    // Limiter les résultats si besoin (ex: max 20)
    const limitedResults = matchingUsers.slice(0, 20);

    return NextResponse.json({
      success: true,
      data: limitedResults,
    });
  } catch (error: any) {
    console.error("Erreur API search-users : ", error);
    return NextResponse.json(
      {
        error: error.message || "Erreur lors de la recherche des utilisateurs.",
      },
      { status: 500 },
    );
  }
}
