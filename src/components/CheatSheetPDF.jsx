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
  desc: { fontSize: 7.5, fontFamily: 'Roboto', color: '#475569', marginBottom: 6, lineHeight: 1.3 },
  
  // Stiluri pentru etichete și blocurile de cod
  codeLabel: { fontSize: 7, fontFamily: 'Roboto', fontWeight: 'bold', color: '#64748B', marginBottom: 2, marginTop: 4 },
  codeBlock: { backgroundColor: '#0F172A', color: '#E2E8F0', fontFamily: 'Courier', fontSize: 8, lineHeight: 1.3, padding: 6, borderRadius: 4 },
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
          {lectii.map((lectie) => {
            // Preluăm codurile folosind toate denumirile posibile din Firestore
            const codCPP = lectie.cod || lectie.codCPP || lectie.codCPlusPlus || lectie.cod_cpp;
            const codPY = lectie.codPython || lectie.codPY || lectie.cod_python;

            return (
              <View key={lectie.id} style={styles.card}>
                <Text style={styles.cardTitle}>{lectie.titlu || 'Fără titlu'}</Text>
                <Text style={styles.desc}>{lectie.descriere || ''}</Text>

                {/* În loc de <div>, folosim <View> din react-pdf */}
                {codCPP || codPY ? (
                  <View>
                    {/* Bloc C++ */}
                    {codCPP ? (
                      <View style={{ marginBottom: 6 }}>
                        <Text style={styles.codeLabel}>C++:</Text>
                        <Text style={styles.codeBlock}>{codCPP}</Text>
                      </View>
                    ) : null}

                    {/* Bloc Python */}
                    {codPY ? (
                      <View>
                        <Text style={styles.codeLabel}>Python:</Text>
                        <Text style={styles.codeBlock}>{codPY}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <Text style={styles.noCode}>Cod indisponibil pentru această lecție.</Text>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.footer}>Generat pe infomotion.space</Text>
      </Page>
    </Document>
  );
}