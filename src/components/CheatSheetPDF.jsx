import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/roboto-latin-ext-400-normal.ttf', fontWeight: 'normal' },
    { src: '/fonts/roboto-latin-ext-700-normal.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Roboto', fontSize: 9 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  headerText: { fontSize: 14, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1E293B' },
  logo: { width: 30, height: 30 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { width: '48%', border: '1pt solid #E2E8F0', borderRadius: 6, padding: 8, marginBottom: 8 },
  cardTitle: { fontSize: 11, fontFamily: 'Roboto', fontWeight: 'bold', color: '#1E293B', marginBottom: 3 },
  desc: { fontSize: 7.5, fontFamily: 'Roboto', color: '#475569', marginBottom: 4, lineHeight: 1.3 },
  codeBlock: { backgroundColor: '#0F172A', color: '#E2E8F0', fontFamily: 'Courier', fontSize: 9, lineHeight: 1.4, padding: 6, borderRadius: 4 },
  noCode: { fontSize: 7, fontFamily: 'Roboto', color: '#94A3B8', padding: 6 },
  footer: { position: 'absolute', bottom: 20, left: 24, fontSize: 7, fontFamily: 'Roboto', color: '#94A3B8' },
});

export default function CheatSheetPDF({ lectii }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>

          <Image src="/logo-infomotion.png" style={styles.logo} />
          <Text style={styles.headerText}>Info Motion</Text>

          <Text style={styles.headerText}>- Cheat Sheet</Text>
        </View>
        <View style={styles.grid}>
          {lectii.map((lectie) => (
            <View key={lectie.id} style={styles.card}>
              <Text style={styles.cardTitle}>{lectie.titlu || 'Fără titlu'}</Text>
              <Text style={styles.desc}>{lectie.descriere || ''}</Text>
              {lectie.cod ? (
                <Text style={styles.codeBlock}>{lectie.cod}</Text>
              ) : (
                <Text style={styles.noCode}>Cod indisponibil pentru această lecție.</Text>
              )}
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Generat pe infomotion.space</Text>
      </Page>
    </Document>
  );
}