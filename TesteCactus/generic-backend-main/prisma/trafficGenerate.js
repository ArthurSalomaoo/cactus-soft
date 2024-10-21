// Função para gerar números aleatórios com distribuição normal (Gaussiana)
function randn_bm() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converte [0,1) para (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Função para gerar números aleatórios com média e desvio padrão específicos
function randomNormal(mean, std) {
  return mean + randn_bm() * std;
}

module.exports = {
  emularConsumoTrafegoSemanaSuave(customerId, index) {
    // Número total de minutos em uma semana
    const totalMinutos = 3 * 24 * 60; // 4320 minutoc
    const minutos = Array.from({ length: totalMinutos }, (_, i) => i); // Granularidade de 1 minuto

    const bgpData = [];

    const diferança = randomNormal(1, 0.2);
    // Parâmetros para os picos de consumo ajustados
    // Aumentamos o desvio padrão para que os picos se sobreponham
    const picoSemanaManha = { hora: 6, desvio: 2 * diferança, amplitude: 10 };
    const picoSemanaTarde = { hora: 11, desvio: 2 * diferança, amplitude: 12 };
    const picoSemanaNoite = { hora: 19, desvio: 2 * diferança, amplitude: 18 };

    //diferança geral  entre 0.5 e 1.5

    let diferançaDia = randomNormal(1, 0.5);
    for (let m = 0; m < totalMinutos; m++) {
      // Calcula o dia da semana e a hora do dia
      const dia = Math.floor(m / (24 * 60)) % 7; // 0 a 6 (onde 0 é segunda-feira)
      let hora = (m % (24 * 60)) / 60; // Hora do dia em decimal (0 a 24)

      // Consumo base
      const consumoBase = 5 * diferança;

      // Função gaussiana para picos de consumo

      let c;

      //atualiza a diferença diaria
      if (hora % 4 == 0) {
        diferançaDia = randomNormal(1, 0.1);
      }

      const picoManha =
        picoSemanaManha.amplitude *
        Math.exp(
          -0.5 *
            Math.pow((hora - picoSemanaManha.hora) / picoSemanaManha.desvio, 2)
        );
      const picoTarde =
        picoSemanaTarde.amplitude *
        Math.exp(
          -0.5 *
            Math.pow((hora - picoSemanaTarde.hora) / picoSemanaTarde.desvio, 2)
        );
      const picoNoite =
        picoSemanaNoite.amplitude *
        Math.exp(
          -0.5 *
            Math.pow((hora - picoSemanaNoite.hora) / picoSemanaNoite.desvio, 2)
        );
      c =
        consumoBase + ((picoManha + picoTarde + picoNoite) * diferançaDia) / 2;

      // Adiciona ruído aleatório para simular variações naturais
      c += randomNormal(0, 0.1);

      // Limita os valores para não ter consumo negativo
      c = Math.max(c, 0);

      // Determina a latência
      let latency;
      if (
        Math.random() <
        (index === 0 ? 0.3 : index == 5 ? 0.1 : index == 2 ? 0.02 : 0.01)
      ) {
        // 1% de chance de latência entre 50 e 220 ms
        latency = 50 + Math.random() * 170;
      } else {
        // 99% de chance de latência entre 0 e 50 ms
        latency = Math.random() * 49;
      }

      // Determina o package_loss
      let packageLoss;
      if (Math.random() < (index === 0 ? 0.2 : index == 5 ? 0.1 : 0.01)) {
        // 1% de chance de package_loss entre 1% e 10%
        packageLoss = 1 + Math.random() * 10;
      } else {
        // 99% de chance de package_loss ser 0
        packageLoss = 0;
      }

      //Determina se o ping foi bem sucedido
      let ping;
      if (Math.random() < (index == 0 ? 0.2 : index == 5 ? 0.3 : 0.01)) {
        ping = false;
      } else {
        ping = true;
      }

      bgpData.push({
        traffic: ping ? parseFloat((c * diferança).toFixed(2)) : null,
        ping: ping,
        packetLoss: ping ? packageLoss : null,
        latency: ping ? latency : null,
        customerId: customerId,
      }); // Convertendo para Gbps
    }

    // Cria uma lista de timestamps para o eixo x
    const inicioSemana = new Date();
    inicioSemana.setHours(0, 0, 0, 0); // Define a hora para 00:00:00.000

    const timestamps = minutos.map((m) => {
      const date = new Date(inicioSemana);
      date.setMinutes(date.getMinutes() + m);
      return date;
    });

    return bgpData.map((data, i) => ({ ...data, date: timestamps[i] }));
  },
};
