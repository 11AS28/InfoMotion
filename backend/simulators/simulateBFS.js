const { construiesteAdiacenta, formateazaEdgesPentruSnapshot } = require('./graphUtils');

// muchii: [{ from, to, weight? }, ...]
// directionat: boolean
function simulateBFS(muchii, nodStart, directionat) {
  const steps = [];
  const { adiacenta, noduri } = construiesteAdiacenta(muchii, directionat);

  const statusNod = {};
  noduri.forEach(n => statusNod[n] = 'nevizitat');

  if (!noduri.includes(nodStart)) {
    return [{
      graphState: {
        nodes: noduri.map(n => ({ id: n, status: statusNod[n] })),
        edges: formateazaEdgesPentruSnapshot(muchii, directionat, null),
        coada: []
      },
      explanation: `Nodul de start "${nodStart}" nu există în graful introdus.`
    }];
  }

  const coada = [nodStart];
  statusNod[nodStart] = 'in_coada';

  function faSnapshot(explicatie, muchieActiva = null) {
    steps.push({
      graphState: {
        nodes: noduri.map(n => ({ id: n, status: statusNod[n] })),
        edges: formateazaEdgesPentruSnapshot(muchii, directionat, muchieActiva),
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

    const vecini = adiacenta[curent] || [];
    for (const { nod: vecin } of vecini) {
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