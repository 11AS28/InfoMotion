function construiesteAdiacenta(muchii, directionat) {
  const adiacenta = {};
  const noduriSet = new Set();

  muchii.forEach(({ from, to, weight }) => {
    noduriSet.add(from);
    noduriSet.add(to);

    if (!adiacenta[from]) adiacenta[from] = [];
    if (!adiacenta[to]) adiacenta[to] = [];

    adiacenta[from].push({ nod: to, weight: weight ?? 1 });

    if (!directionat) {
      adiacenta[to].push({ nod: from, weight: weight ?? 1 });
    }
  });

  return { adiacenta, noduri: [...noduriSet] };
}

// folosit la fiecare snapshot, ca toate edge-urile să știe dacă sunt orientate/ponderate
function formateazaEdgesPentruSnapshot(muchii, directionat, muchieActiva) {
  return muchii.map(({ from, to, weight }) => {
    let activa = false;
    if (muchieActiva) {
      const potriveteDirect = muchieActiva[0] === from && muchieActiva[1] === to;
      const potrivireInversa = !directionat && muchieActiva[0] === to && muchieActiva[1] === from;
      activa = potriveteDirect || potrivireInversa;
    }
    return {
      from,
      to,
      weight: weight ?? null,
      directed: directionat,
      activa
    };
  });
}

module.exports = { construiesteAdiacenta, formateazaEdgesPentruSnapshot };