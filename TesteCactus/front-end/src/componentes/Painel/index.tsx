import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Graficos from "../Graficos/index";

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface RespostaDados {
  data: Dados[];
}

interface Dados {
  id: string;
  ping: boolean;
  customerId: string;
  packetLoss: number;
  latency: number;
  latencias: number[];
}

interface RespostaClientes {
  data: Cliente[];
}

interface Cliente {
  id: string;
  name: string;
}

function Painel() {
  const [clientesComLatencia, setClientesComLatencia] = useState<{
    acima50: number;
    abaixo50: number;
  }>({ acima50: 0, abaixo50: 0 });
  const [clientesComDisponibilidade, setClientesComDisponibilidade] = useState<{
    acima97: number;
    abaixo97: number;
  }>({ acima97: 0, abaixo97: 0 });
  const [dados, setDados] = useState<Dados[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ativosEInativos, setAtivosEInativos] = useState<
    {
      id: string;
      nome: string;
      ativos: number;
      inativos: number;
      totalPacketLoss: number;
      comPerda: number;
      semPerda: number;
      disponibilidade: number;
      latencias: number[];
    }[]
  >([]);

  const [opcao, setOpcao] = useState("");
  const [clientesAcimaLatencia, setClientesAcimaLatencia] = useState<string[]>(
    []
  );
  const [clienteMaiorPerda, setClienteMaiorPerda] = useState<string | null>(
    null
  );
  const [clienteMaiorMelhoria, setClienteMaiorMelhoria] = useState<
    string | null
  >(null);
  const [clientesAltaDisponibilidade, setClientesAltaDisponibilidade] =
    useState<string[]>([]);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setOpcao(event.target.value);
  };

  const getClientes = async () => {
    try {
      const resposta: RespostaClientes = await axios.get(
        "http://localhost:3333/findManyCliente"
      );
      setClientes(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar os clientes:", error);
    }
  };

  const getDados = async () => {
    try {
      const resposta: RespostaDados = await axios.get(
        "http://localhost:3333/dados"
      );
      setDados(resposta.data);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    }
  };

  const calcularInativosEAtivos = () => {
    const dadosPing = clientes.map((cliente) => ({
      id: cliente.id,
      nome: cliente.name,
      ativos: 0,
      inativos: 0,
      totalPacketLoss: 0,
      comPerda: 0,
      semPerda: 0,
      disponibilidade: 0,
      latencias: [] as number[],
    }));

    let maiorPerda = 0;
    let clienteComMaiorPerda = "";
    let clientesAcimaLimiteLatencia: string[] = [];

    dados.forEach((item) => {
      dadosPing.forEach((item2) => {
        if (item.customerId === item2.id) {
          if (item.ping) {
            item2.ativos++;
          } else {
            item2.inativos++;
          }
          item2.totalPacketLoss += item.packetLoss;

          item2.latencias.push(item.latency);

          if (
            item.latency > 50 &&
            !clientesAcimaLimiteLatencia.includes(item2.nome)
          ) {
            clientesAcimaLimiteLatencia.push(item2.nome);
          }

          if (item.packetLoss > maiorPerda) {
            maiorPerda = item.packetLoss;
            clienteComMaiorPerda = item2.nome;
          }

          if (item.packetLoss > 0) {
            item2.comPerda++;
          } else {
            item2.semPerda++;
          }
        }
      });
    });

    // Calcula a disponibilidade para cada cliente
    let clientesAltaDisponibilidadeTemp: string[] = [];
    dadosPing.forEach((cliente) => {
      const totalMedicoes = cliente.ativos + cliente.inativos;
      cliente.disponibilidade =
        totalMedicoes > 0 ? (cliente.ativos / totalMedicoes) * 100 : 0;

      if (cliente.disponibilidade > 97) {
        clientesAltaDisponibilidadeTemp.push(cliente.nome);
      }
    });

    // Identifica cliente com maior melhoria de latência
    let maiorMelhoria = 0;
    let clienteComMaiorMelhoria = "";
    dadosPing.forEach((cliente) => {
      if (cliente.latencias.length > 1) {
        const melhoria =
          Math.max(...cliente.latencias) - Math.min(...cliente.latencias);
        if (melhoria > maiorMelhoria) {
          maiorMelhoria = melhoria;
          clienteComMaiorMelhoria = cliente.nome;
        }
      }
    });
    let contagemLatencia = { acima50: 0, abaixo50: 0 };
    let contagemDisponibilidade = { acima97: 0, abaixo97: 0 };

    dados.forEach((item) => {
      dadosPing.forEach((item2) => {
        if (item.customerId === item2.id) {
          // Contagem de latência
          if (item.latency > 50) {
            contagemLatencia.acima50++;
          } else {
            contagemLatencia.abaixo50++;
          }
          // Contagem de disponibilidade
          const totalMedicoes = item2.ativos + item2.inativos;
          if (totalMedicoes > 0) {
            const disponibilidade = (item2.ativos / totalMedicoes) * 100;
            if (disponibilidade > 97) {
              contagemDisponibilidade.acima97++;
            } else {
              contagemDisponibilidade.abaixo97++;
            }
          }
        }
      });
    });

    setClientesComLatencia(contagemLatencia);
    setClientesComDisponibilidade(contagemDisponibilidade);
    setAtivosEInativos(dadosPing);
    setClientesAcimaLatencia(clientesAcimaLimiteLatencia);
    setClienteMaiorPerda(clienteComMaiorPerda);
    setClientesAltaDisponibilidade(clientesAltaDisponibilidadeTemp);
    setClienteMaiorMelhoria(clienteComMaiorMelhoria);
  };

  useEffect(() => {
    getDados();
    getClientes();
  }, []);

  useEffect(() => {
    if (dados.length > 0 && clientes.length > 0) {
      calcularInativosEAtivos();
    }
  }, [dados, clientes]);

  // Soma total de todos os ativos, inativos, packet loss, clientes com e sem perda
  const totalAtivos = ativosEInativos.reduce(
    (acc, curr) => acc + curr.ativos,
    0
  );
  const totalInativos = ativosEInativos.reduce(
    (acc, curr) => acc + curr.inativos,
    0
  );
  const totalPacketLoss = ativosEInativos.reduce(
    (acc, curr) => acc + curr.totalPacketLoss,
    0
  );
  const totalComPerda = ativosEInativos.reduce(
    (acc, curr) => acc + curr.comPerda,
    0
  );
  const totalSemPerda = ativosEInativos.reduce(
    (acc, curr) => acc + curr.semPerda,
    0
  );

  // Calcula a média de disponibilidade
  const mediaDisponibilidade =
    ativosEInativos.length > 0
      ? ativosEInativos.reduce((acc, curr) => acc + curr.disponibilidade, 0) /
        ativosEInativos.length
      : 0;

  // Gráfico geral para todos os clientes (Ping)
  const dataPing = {
    labels: ["Clientes"],
    datasets: [
      {
        label: "Ativos",
        data: [totalAtivos],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Inativos",
        data: [totalInativos],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  // Gráfico de perda de pacotes
  const dataPacketLoss = {
    labels: ["Clientes"],
    datasets: [
      {
        label: "Packet Loss Total",
        data: [totalPacketLoss],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Clientes com Perda de Pacotes",
        data: [totalComPerda],
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Clientes sem Perda de Pacotes",
        data: [totalSemPerda],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const dataLatencia = {
    labels: ["Latência"],
    datasets: [
      {
        label: "Clientes acima de 50 ms",
        data: [clientesComLatencia.acima50],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
      {
        label: "Clientes abaixo de 50 ms",
        data: [clientesComLatencia.abaixo50],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ]
  };

  const dataDisponibilidade = {
    labels: ["Disponibilidade"],
    datasets: [
      {
        label: "Clientes acima de 97%",
        data: [clientesComDisponibilidade.acima97],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Clientes abaixo de 97%",
        data: [clientesComDisponibilidade.abaixo97],
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      }
    ]
  };

  // Gráfico individual por cliente selecionado

  const clienteSelecionado =
    ativosEInativos.find((cliente) => cliente.id === opcao) || null;

  const dataClientePing = {
    labels: [clienteSelecionado?.nome || ""],
    datasets: [
      {
        label: "Ativos",
        data: [clienteSelecionado?.ativos || 0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
      {
        label: "Inativos",
        data: [clienteSelecionado?.inativos || 0],
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const dataClientePacketLoss = {
    labels: [clienteSelecionado?.nome || ""],
    datasets: [
      {
        label: "Packet Loss Total",
        data: [clienteSelecionado?.totalPacketLoss || 0],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
      {
        label: "Clientes com Perda de Pacotes",
        data: [clienteSelecionado?.comPerda || 0],
        backgroundColor: "rgba(255, 206, 86, 0.6)",
      },
      {
        label: "Clientes sem Perda de Pacotes",
        data: [clienteSelecionado?.semPerda || 0],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
      },
    ],
  };

  const dataClienteLatencia = {
    labels: [clienteSelecionado?.nome || ""],
    datasets: [
      {
        label: "Latência",
        data:
          clienteSelecionado?.latencias &&
          clienteSelecionado.latencias.length > 0
            ? [
                clienteSelecionado.latencias.reduce(
                  (acc, curr) => acc + curr,
                  0
                ) / clienteSelecionado.latencias.length,
              ]
            : [0], // Se não houver latências ou clienteSelecionado não estiver definido, exibe 0
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const dataClienteDisponibilidade = {
    labels: [clienteSelecionado?.nome || ""],
    datasets: [
      {
        label: "Disponibilidade (%)",
        data: [clienteSelecionado?.disponibilidade || 0],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div>
      <h1>TelecomNova</h1>
      <main>
        <div>
          <select id="opcoes" value={opcao} onChange={handleChange}>
            <option value="">Selecione o cliente</option>
            {clientes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <Graficos
            dataPing={dataPing}
            dataPacketLoss={dataPacketLoss}
            dataLatencia={dataLatencia}
            dataDisponibilidade={dataDisponibilidade}
            mediaDisponibilidade={mediaDisponibilidade}
            totalAtivos={totalAtivos}
            totalInativos={totalInativos}
            totalPacketLoss={totalPacketLoss}
            totalComPerda={totalComPerda}
            totalSemPerda={totalSemPerda}
            clientesAcimaLatencia={clientesAcimaLatencia}
            clienteMaiorPerda={clienteMaiorPerda}
            clienteMaiorMelhoria={clienteMaiorMelhoria}
            clientesAltaDisponibilidade={clientesAltaDisponibilidade}
            clienteSelecionado={clienteSelecionado} // Agora deve estar correto
            dataClientePing={dataClientePing}
            dataClientePacketLoss={dataClientePacketLoss}
            dataClienteLatencia={dataClienteLatencia}
            dataClienteDisponibilidade={dataClienteDisponibilidade}
          />
        </div>
      </main>
    </div>
  );
}

export default Painel;
