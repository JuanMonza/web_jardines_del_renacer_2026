import { NextRequest, NextResponse } from "next/server";
import {
    getVacancyByIdFromDB,
    updateVacancyInDB,
    deactivateVacancyInDB,
} from "@/lib/vacanciesStorageDB";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const vacancy = await getVacancyByIdFromDB(params.id);

        if (!vacancy) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Vacante no encontrada.",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json({
            success: true,
            data: vacancy,
        });
    } catch (error) {
        console.error("Error en GET /api/vacantes/[id]:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Error interno.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        const body = await request.json();

        await updateVacancyInDB(params.id, body);

        return NextResponse.json({
            success: true,
            message: "Vacante actualizada correctamente.",
        });
    } catch (error) {
        console.error("Error en PUT /api/vacantes/[id]:", error);

        return NextResponse.json(
            {
                success: false,
                message: "No se pudo actualizar la vacante.",
            },
            { status: 500, },
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } },
) {
    try {
        await deactivateVacancyInDB(params.id);

        return NextResponse.json({
            success: true,
            message: "Vacante desactivada correctamente.",
        });
    } catch (error) {
        console.error("Error en DELETE /api/vacantes/[id]:", error);

        return NextResponse.json(
            {
                success: false,
                message: "No se pudo desactivar la vacante.",
            },
            {
                status: 500,
            },
        );
    }
}
