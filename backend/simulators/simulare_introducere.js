// muchii: [{ from, to }]  — pentru lecția asta mereu neorientat, fără weight
function simulateConceptGrafuri(muchii) {
  const steps = [];
  const noduriIntroduse = [];
  const muchiiIntroduse = [];

  const noduriUnice = [];
  muchii.forEach(({ from, to }) => {
    if (!noduriUnice.includes(from)) noduriUnice.push(from);
    if (!noduriUnice.includes(to)) noduriUnice.push(to);
  });

  function faSnapshot(explicatie, muchieActiva = null) {
    steps.push({
      graphState: {
        nodes: noduriIntroduse.map(id => ({ id, status: 'stabil' })),
        edges: muchiiIntroduse.map(m => ({
          from: m.from,
          to: m.to,
          weight: null,
          directed: false,
          activa: !!muchieActiva && muchieActiva[0] === m.from && muchieActiva[1] === m.to
        })),
        coada: []
      },
      explanation: explicatie
    });
  }

  // pasul 0: graf gol, doar explicație introductivă
  faSnapshot('Un graf pornește de la o mulțime de noduri (V) și o mulțime de muchii (M). Să le construim pas cu pas.');

  // introducem nodurile unul câte unul
  noduriUnice.forEach((nod) => {
    noduriIntroduse.push(nod);
    const litereV = noduriIntroduse.join(', ');
    faSnapshot(`Adăugăm nodul ${nod} în mulțimea V. Acum V = {${litereV}}.`);
  });

  // introducem muchiile una câte una
  muchii.forEach(({ from, to }) => {
    muchiiIntroduse.push({ from, to });
    const perechi = muchiiIntroduse.map(m => `(${m.from},${m.to})`).join(', ');
    faSnapshot(
      `Adăugăm muchia dintre ${from} și ${to}. Este neorientată, deci poți merge din ${from} în ${to}, dar și din ${to} în ${from}. Acum M = {${perechi}}.`,
      [from, to]
    );
  });

  faSnapshot(
    `Graful este complet: V = {${noduriUnice.join(', ')}} și M = {${muchiiIntroduse.map(m => `(${m.from},${m.to})`).join(', ')}}. Fiind neorientat, fiecare muchie funcționează în ambele sensuri.`
  );

  return steps;
}

module.exports = { simulateConceptGrafuri };