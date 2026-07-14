import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de prueba para verificar la conexión a la base de datos MySQL.
 * Intenta obtener una conexión del pool y ejecutar una consulta simple.
 */
export async function GET() {
  try {
    // Intenta obtener una conexión del pool.
    // Si las credenciales en .env.local son incorrectas, esto fallará.
    const connection = await pool.getConnection();

    // Ejecuta una consulta simple para confirmar que podemos comunicarnos.
    const [rows] = await connection.query('SELECT NOW() as now, "Conexión exitosa" as message;');

    // Libera la conexión para que otros puedan usarla.
    connection.release();

    // Si todo salió bien, devuelve un mensaje de éxito.
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    // Si algo falla (conexión, consulta, etc.), captura el error.
    console.error('Error al conectar con la base de datos:', error);
    // Devuelve un mensaje de error detallado para facilitar el diagnóstico.
    return NextResponse.json(
      { success: false, message: 'Error al conectar con la base de datos.', error: error.message },
      { status: 500 },
    );
  }
}