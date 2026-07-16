import { NextResponse } from 'next/server';
import { getDefaultJobVacancies } from '@/lib/vacanciesStorage';
import { getVacanciesFromDB } from '@/lib/vacanciesStorageDB';
import { getVacancyApplicationCounts } from '@/lib/candidateStorageDB';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [dbVacancies, counts] = await Promise.all([
      getVacanciesFromDB(),
      getVacancyApplicationCounts(),
    ]);
    const vacancies = dbVacancies.length > 0 ? dbVacancies : getDefaultJobVacancies();

    return NextResponse.json(
      vacancies.map((vacancy) => ({
        ...vacancy,
        applicationCount: counts[vacancy.id] ?? 0,
      })),
    );
  } catch (error) {
    console.error('Error en GET /api/vacantes:', error);
    return NextResponse.json(
      getDefaultJobVacancies().map((vacancy) => ({
        ...vacancy,
        applicationCount: 0,
      })),
    );
  }
}
