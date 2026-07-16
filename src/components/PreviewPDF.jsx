import { PDFViewer } from '@react-pdf/renderer';
import CheatSheetPDF from '../components/CheatSheetPDF';

const lectiiTest = [
  {
    id: 'test-1',
    titlu: 'Bubble Sort',
    descriere: 'Algoritm simplu de sortare prin interschimbări succesive.',
    cod: '#include <iostream>\nusing namespace std;\nint main() {\n  int v[5] = {5,3,1,4,2};\n  for (int i = 0; i < 5; i++)\n    for (int j = 0; j < 4-i; j++)\n      if (v[j] > v[j+1]) swap(v[j], v[j+1]);\n  return 0;\n}',
  },
  {
    id: 'test-2',
    titlu: 'Căutare Binară',
    descriere: 'Găsește un element într-un vector sortat în timp logaritmic.',
    cod: 'int cautareBinara(int v[], int n, int x) {\n  int st=0, dr=n-1;\n  while (st <= dr) {\n    int mij = (st+dr)/2;\n    if (v[mij] == x) return mij;\n    if (v[mij] < x) st = mij+1;\n    else dr = mij-1;\n  }\n  return -1;\n}',
  },
];

export default function PreviewPDF() {
  return (
    <PDFViewer width="100%" height={window.innerHeight}>
      <CheatSheetPDF lectii={lectiiTest} />
    </PDFViewer>
  );
}