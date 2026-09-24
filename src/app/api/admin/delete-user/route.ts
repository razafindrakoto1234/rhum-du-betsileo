import { adminAuth, adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
    try{
        const body = await req.json()
        const userId = body.userID || body.userId

        if(!userId) {
            return NextResponse.json(
                { error: "L'identifiant de l'utilisateur (userID) est requis." },
                { status: 400 }
            );
        }

        // Suppression dans Firebase Auth
        await adminAuth.deleteUser(userId)

        // Suppression du document dans Firestore
        await adminDb.collection("users").doc(userId).delete()

        return NextResponse.json(
            { message: "Utilisateur supprimé avec succès." },
            { status: 200 }
        );
    } catch (error: any) {
        console.error
    }
}