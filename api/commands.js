/* ===== BAR DO FELIPE - Backend Simples (Serverless) =====
   Este é um exemplo usando Vercel Functions.
   Inicialmente os dados ficam em memória. Depois você pode conectar Supabase.
*/

let clientes = [];
let bebidas = [];
let comandas = [];

export default function handler(req, res) {
  const { method } = req;

  if (method === "GET") {
    // Retorna todos os dados
    res.status(200).json({ clientes, bebidas, comandas });
  } else if (method === "POST") {
    const { tipo, data } = req.body;

    if (tipo === "cliente") {
      const cliente = { id: gerarId(), nome: data.nome, aberto: true };
      clientes.push(cliente);
      res.status(201).json(cliente);
    } else if (tipo === "bebida") {
      const bebida = { id: gerarId(), nome: data.nome, preco: data.preco };
      bebidas.push(bebida);
      res.status(201).json(bebida);
    } else if (tipo === "item") {
      const { clienteId, bebidaId, quantidade } = data;
      const bebida = bebidas.find((b) => b.id === bebidaId);
      if (!bebida) return res.status(400).json({ error: "Bebida não encontrada" });

      let comanda = comandas.find((c) => c.clienteId === clienteId);
      if (!comanda) {
        comanda = { clienteId, itens: [] };
        comandas.push(comanda);
      }
      comanda.itens.push({ bebidaId, nome: bebida.nome, preco: bebida.preco, quantidade });
      res.status(201).json(comanda);
    } else if (tipo === "finalizar") {
      const { clienteId } = data;
      comandas = comandas.filter((c) => c.clienteId !== clienteId);
      clientes = clientes.filter((c) => c.id !== clienteId);
      res.status(200).json({ ok: true });
    } else {
      res.status(400).json({ error: "Tipo inválido" });
    }
  } else {
    res.status(405).json({ error: "Método não permitido" });
  }
}

/* ===== UTIL ===== */
function gerarId() {
  return Math.random().toString(36).substring(2, 10);
}
