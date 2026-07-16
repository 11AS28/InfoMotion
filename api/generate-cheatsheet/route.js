
import { adminDb } from '@/lib/firebaseAdmin';
import { renderToStream } from '@react-pdf/renderer';
import CheatSheetDocument from '@/components/CheatSheetPDF';

export async function POST(req) {
  const { ids } = await req.json();

  if (!ids?.length) {
    return new Response('No lessons selected', { status: 400 });
  }

  const snapshot = await adminDb
    .collection('lectii')
    .where('__name__', 'in', ids.slice(0, 30))
    .get();

  const lectii = snapshot.docs.map((doc) => ({
    id: doc.id,
    titlu: doc.data().titlu,
    descriere: doc.data().descriere,
    cod: doc.data().codCPlusPlus,
  }));

  const stream = await renderToStream(<CheatSheetDocument lectii={lectii} />);

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="copiuta.pdf"',
    },
  });
}