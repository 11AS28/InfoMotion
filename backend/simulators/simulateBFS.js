function simulateBFS(muchii, nodStart) {
  const steps = [];
  const adiacenta = {};
  const noduriSet = new Set();

  muchii.forEach(([a, b]) => {
    noduriSet.add(a); noduriSet.add(b);
    if (!adiacenta[a]) adiacenta[a] = [];
    if (!adiacenta[b]) adiacenta[b] = [];
    adiacenta[a].push(b);
    adiacenta[b].push(a);
  });

  const noduri = [...noduriSet];
  const statusNod = {};
  noduri.forEach(n => statusNod[n] = 'nevizitat');

  const coada = [nodStart];
  statusNod[nodStart] = 'in_coada';

  function faSnapshot(explicatie, muchieActiva = null) {
    steps.push({
      graphState: {
        nodes: noduri.map(n => ({ id: n, status: statusNod[n] })),
        edges: muchii.map(([a, b]) => ({
          from: a, to: b,
          activa: muchieActiva && ((muchieActiva[0] === a && muchieActiva[1] === b) || (muchieActiva[0] === b && muchieActiva[1] === a))
        })),
        coada: [...coada]
      },
      explanation: explicatie
    });
  }

  faSnapshot(`Pornim BFS din nodul ${nodStart}. Îl adăugăm în coadă.`);

  while (coada.length > 0) {
    const curent = coada.shift();
    statusNod[curent] = 'curent';
    faSnapshot(`Scoatem din coadă nodul ${curent} și îl procesăm.`);

    for (const vecin of adiacenta[curent]) {
      if (statusNod[vecin] === 'nevizitat') {
        statusNod[vecin] = 'in_coada';
        coada.push(vecin);
        faSnapshot(`De la ${curent} descoperim vecinul ${vecin}, îl adăugăm în coadă.`, [curent, vecin]);
      }
    }

    statusNod[curent] = 'vizitat';
    faSnapshot(`Nodul ${curent} este complet vizitat.`);
  }

  faSnapshot('BFS s-a terminat. Toate nodurile accesibile au fost vizitate.');
  return steps;
}

module.exports = { simulateBFS };