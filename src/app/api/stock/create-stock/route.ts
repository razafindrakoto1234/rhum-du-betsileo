import { adminDb } from "@/lib/firebase/firebaseAdmin";
import { NextResponse } from "next/server";

function getBottlesPerCarton(capacityStr: string): number {
  const cap = capacityStr.toLowerCase();
  if (cap.includes("75") || cap.includes("75cl")) return 9;
  if (cap.includes("25") || cap.includes("25cl")) return 30;
  if (cap.includes("1l") || cap.includes("100cl")) return 6;
  return 1;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      idWarehouse,
      idProduct,
      idCapacity,
      cartonQuantity,
      bottleQuantity,
    } = body;

    if (!idWarehouse || !idProduct || !idCapacity) {
      return NextResponse.json(
        { success: false, message: "Paramètres obligatoires manquants." },
        { status: 400 },
      );
    }

    // Récupérer le produit
    const productDoc = await adminDb
      .collection("products")
      .doc(idProduct)
      .get();
    let bottlesPerCarton = 1;

    if (productDoc.exists) {
      const productData = productDoc.data();
      const capacities = productData?.capacities || [];

      // Chercher par idCapacity ou par index si l'ID correspond à un format "cap-X"
      let capacityObj = capacities.find(
        (c: any) => c.idCapacity === idCapacity,
      );

      if (!capacityObj && idCapacity.startsWith("cap-")) {
        const index = parseInt(idCapacity.replace("cap-", ""), 10);
        if (!isNaN(index) && capacities[index]) {
          capacityObj = capacities[index];
        }
      }

      if (capacityObj && capacityObj.capacity) {
        bottlesPerCarton = getBottlesPerCarton(capacityObj.capacity);
      }
    }

    const cartons = Number(cartonQuantity) || 0;
    const bottles = Number(bottleQuantity) || 0;
    const totalBottles = cartons * bottlesPerCarton + bottles;

    const idStock = `${idWarehouse}_${idProduct}_${idCapacity}`;
    const stockRef = adminDb.collection("stocks").doc(idStock);

    const stockData = {
      idStock,
      idWarehouse,
      idProduct,
      idCapacity,
      cartonQuantity: cartons,
      bottleQuantity: bottles,
      totalBottles,
      updatedAt: new Date().toISOString(),
    };

    await stockRef.set(stockData, { merge: true });

    return NextResponse.json({
      success: true,
      message: "Stock enregistré avec succès.",
      data: stockData,
    });
  } catch (error: any) {
    console.error("Erreur API create-stock :", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erreur serveur." },
      { status: 500 },
    );
  }
}
