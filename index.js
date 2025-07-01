const express = require('express');
const path = require('path');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fórmula da experiência total
function expTotal(level) {
  return (50 / 3) * level ** 3 - 100 * level ** 2 + (850 / 3) * level - 200;
}
function expParaLevel(exp) {
  let lvl = 1;
  while (expTotal(lvl + 1) <= exp) lvl++;
  return lvl;
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/calcular', (req, res) => {
  const { exp_atual, horas, exp_crua, evento, stamina, double_event, boost } = req.body;

  const expAtual = parseFloat(exp_atual);
  let totalGanho = 0;
  let detalhes = '';

  for (let i = 0; i < horas.length; i++) {
    const h = parseFloat(horas[i]);
    const crua = parseFloat(exp_crua[i]);
    const e = parseFloat(evento[i]) / 100;
    const s = parseFloat(stamina[i]) / 100;

    const isDouble = double_event && double_event[i] === 'on';
    const isBoost = boost && boost[i] === 'on';

    const b = isDouble ? 1.0 : 0;  // 100%
    const bs = isBoost ? 0.5 : 0;  // 50%

    const bonus = (1 + b + e + bs) * s;
    const expHora = crua * bonus;
    const ganhoBloco = expHora * h;

    totalGanho += ganhoBloco;

    detalhes += `
      <li>
        <strong>Bloco ${i + 1}:</strong><br>
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
