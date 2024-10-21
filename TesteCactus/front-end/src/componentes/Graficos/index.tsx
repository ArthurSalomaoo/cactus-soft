import { Bar } from "react-chartjs-2";

interface GraficosProps {
  dataPing: any;
  dataPacketLoss: any;
  dataLatencia: any;
  dataDisponibilidade: any;
  mediaDisponibilidade: number;
  totalAtivos: number;
  totalInativos: number;
  totalPacketLoss: number;
  totalComPerda: number;
  totalSemPerda: number;
  clientesAcimaLatencia: string[];
  clienteMaiorPerda: string | null;
  clienteMaiorMelhoria: string | null;
  clientesAltaDisponibilidade: string[];
  clienteSelecionado: {
    nome: string;
    ativos: number;
    inativos: number;
    disponibilidade: number;
    totalPacketLoss: number;
    comPerda: number;
    semPerda: number;
    latencias: number[];
  } | null;
  dataClientePing: any;
  dataClientePacketLoss: any;
  dataClienteLatencia: any;
  dataClienteDisponibilidade: any;
}

function Graficos(props: GraficosProps) {
  const {
    dataPing,
    dataPacketLoss,
    mediaDisponibilidade,
    totalAtivos,
    totalInativos,
    totalPacketLoss,
    totalComPerda,
    totalSemPerda,
    clientesAcimaLatencia,
    clienteMaiorPerda,
    clienteMaiorMelhoria,
    clientesAltaDisponibilidade,
    clienteSelecionado,
    dataClientePing,
    dataClientePacketLoss,
  } = props;

  return (
    <div>
      {clienteSelecionado === null ? (
        <div>
          <div style={{ textAlign: "justify", marginLeft: "50px" }}>
            <p>Disponibilidade média: {mediaDisponibilidade.toFixed(2)} %</p>
            <p>
              Clientes com latência acima de 50ms:
              {clientesAcimaLatencia.join(", ")}
            </p>
            <p>Cliente com maior perda de pacotes: {clienteMaiorPerda}</p>
            <p>
              Cliente com maior melhoria de latência: {clienteMaiorMelhoria}
            </p>
            <p>
              Clientes com disponibilidade {">"} 97%:
              {clientesAltaDisponibilidade.join(", ")}
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div
              style={{
                width: "45%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h2>Gráfico de Ping</h2>
              <Bar data={dataPing} options={{ responsive: true }} />
              <p>Total de ativos: {totalAtivos}</p>
              <p>Total de inativos: {totalInativos}</p>
            </div>
            <div
              style={{
                width: "45%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h2>Gráfico de Perda de Pacotes</h2>
              <Bar data={dataPacketLoss} options={{ responsive: true }} />
              <p>Packet Loss Total: {totalPacketLoss}</p>
              <p>Clientes com Perda de Pacotes: {totalComPerda}</p>
              <p>Clientes sem Perda de Pacotes: {totalSemPerda}</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <h2>Cliente Selecionado: {clienteSelecionado.nome}</h2>
            <p>
              Disponibilidade: {clienteSelecionado.disponibilidade.toFixed(2)} %
            </p>
          </div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <div
              style={{
                width: "45%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h2>Gráfico de Ping - {clienteSelecionado.nome}</h2>
              <Bar data={dataClientePing} options={{ responsive: true }} />
              <p>Ativos: {clienteSelecionado.ativos}</p>
              <p>Inativos: {clienteSelecionado.inativos}</p>
            </div>
            <div
              style={{
                width: "45%",
                padding: "20px",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            >
              <h2>Gráfico de Perda de Pacotes - {clienteSelecionado.nome}</h2>
              <Bar
                data={dataClientePacketLoss}
                options={{ responsive: true }}
              />
              <p>Packet Loss Total: {clienteSelecionado.totalPacketLoss}</p>
              <p>
                Clientes com Perda de Pacotes: {clienteSelecionado.comPerda}
              </p>
              <p>
                Clientes sem Perda de Pacotes: {clienteSelecionado.semPerda}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Graficos;
