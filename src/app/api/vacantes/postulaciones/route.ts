import { NextResponse } from "next/server";
import { getAllApplicationsFromDB } from "@/lib/candidateStorageDB";

export const dynamic = "force-dynamic";

export async function GET() {
  try {

    const data = await getAllApplicationsFromDB();

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );

  }
}
