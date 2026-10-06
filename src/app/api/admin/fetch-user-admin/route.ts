import { db } from "@/lib/firebase/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const usersRef = collection(db, "users");
    const q = query(
      usersRef,
      where("responsability", "==", "Administrateur"),
      where("status", "==", "APPROVED"),
    );

    const querySnapshot = await getDocs(q);
    const admins: any[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      admins.push({
        uid: doc.id,
        idUser: doc.id,
        name: data.name || "",
        email: data.mail || data.email || "",
        mail: data.mail || data.email || "",
        photoURL: data.photoURL || data.photoUrl || data.photo || "",
        smartphone: data.smartphone || data.phone || "",
        responsability: data.responsability,
        status: data.status,
      });
    });

    return NextResponse.json({ success: true, data: admins }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur API fetch-user-admin :", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Erreur lors de la récupération des administrateurs.",
      },
      { status: 500 },
    );
  }
}
