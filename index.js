const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Cálculo de experiência total acumulada para determinado level
// Fórmula baseada na documentação oficial do Tibia: https://www.tibia.com/library/?subtopic=experiencetable
function expTotal(level) {
  return (50 / 3) * level ** 3 - 100 * level ** 2 + (850 / 3) * level - 200;
}

// Determina o level com base na experiência total acumulada
function expParaLevel(exp) {
  let lvl = 1;
  while (expTotal(lvl + 1) <= exp) lvl++;
  return lvl;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/calcular', (req, res) => {
  const {
    exp_atual,
    horas,
    exp_crua,
    evento,
    stamina,
    double_event = [],
    boost = []
  } = req.body;

  const keys = Object.keys(horas);
  let totalGanho = 0;
  let detalhes = '';
  const expAtual = parseFloat(exp_atual);

  for (const i of keys) {
    const h = parseFloat(horas[i]);
    const crua = parseFloat(exp_crua[i]);
    const e = parseFloat(evento[i]) / 100;
    const s = parseFloat(stamina[i]) / 100;
    const b = parseFloat(double_event[i]) / 100 || 0;
    const bs = parseFloat(boost[i]) / 100 || 0;

    const bonus = (1 + b + e + bs) * s;
    const expHora = crua * bonus;
    const ganhoBloco = expHora * h;

    totalGanho += ganhoBloco;

    detalhes += `
      <li>
        <strong>Bloco ${parseInt(i) + 1}:</strong><br>
        Horas: ${h}<br>
        Exp/hora com bônus: ${expHora.toLocaleString()}<br>
        Exp total do bloco: ${ganhoBloco.toLocaleString()}<br>
        Bônus aplicado: ${(bonus * 100).toFixed(0)}%
      </li><br>
    `;
  }

  const expFinal = expAtual + totalGanho;
  const levelAtual = expParaLevel(expAtual);
  const levelFinal = expParaLevel(expFinal);

  res.send(`
    <h2>Resumo de Experiência</h2>
    <p>EXP atual: <strong>${expAtual.toLocaleString()}</strong> (Level ${levelAtual})</p>
    <ul>${detalhes}</ul>
    <p><strong>EXP total obtida:</strong> ${totalGanho.toLocaleString()}</p>
    <p><strong>EXP final:</strong> ${expFinal.toLocaleString()} (Level ${levelFinal})</p>
    <br><a href="/">Voltar</a>
  `);
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
