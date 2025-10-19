// ======= CONFIGURAÇÃO DO SUPABASE =======
const SUPABASE_URL = "https://SEU-PROJETO.supabase.co"; // 🟢 Cole sua URL aqui
const SUPABASE_KEY = "SUA-CHAVE-ANON"; // 🟢 Cole sua chave anon aqui
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ======= TESTE DE CONEXÃO =======
async function testarConexao() {
  try {
    const { data, error } = await supabase.from("bebidas").select("*").limit(1);
    if (error) throw error;
    console.log("✅ Conectado ao Supabase com sucesso!");
  } catch (err) {
    alert("❌ Erro ao conectar ao Supabase: " + err.message);
  }
}
testarConexao();

// ======= VARIÁVEIS =======
let bebidas = [];
let clientes = [];
let comandas = [];

// ======= ADICIONAR BEBIDA =======
async function adicionarBebida() {
  const nome = document.getElementById("bebida-nome").value.trim();
  const preco = parseFloat(document.getElementById("bebida-preco").value);

  if (!nome || isNaN(preco)) {
    alert("Preencha o nome e o preço corretamente!");
    return;
  }

  try {
    const { data, error } = await supabase
      .from("bebidas")
      .insert([{ nome, preco }]);

    if (error) throw error;
    alert("🍺 Bebida adicionada com sucesso!");
    document.getElementById("bebida-nome").value = "";
    document.getElementById("bebida-preco").value = "";
    carregarBebidas();
  } catch (err) {
    alert("Erro ao adicionar bebida: " + err.message);
  }
}

// ======= CARREGAR BEBIDAS =======
async function carregarBebidas() {
  try {
    const { data, error } = await supabase.from("bebidas").select("*");
    if (error) throw error;

    bebidas = data;
    const lista = document.getElementById("lista-bebidas");
    if (lista) {
      lista.innerHTML = bebidas
        .map((b) => `<li>${b.nome} - R$ ${b.preco.toFixed(2)}</li>`)
        .join("");
    }
  } catch (err) {
    console.error("Erro ao carregar bebidas:", err);
  }
}

// ======= ADICIONAR CLIENTE =======
async function adicionarCliente() {
  const nome = document.getElementById("cliente-nome").value.trim();

  if (!nome) {
    alert("Digite o nome do cliente!");
    return;
  }

  try {
    const { error } = await supabase.from("clientes").insert([{ nome }]);
    if (error) throw error;

    alert("👤 Cliente adicionado com sucesso!");
    document.getElementById("cliente-nome").value = "";
    carregarClientes();
  } catch (err) {
    alert("Erro ao adicionar cliente: " + err.message);
  }
}

// ======= CARREGAR CLIENTES =======
async function carregarClientes() {
  try {
    const { data, error } = await supabase.from("clientes").select("*");
    if (error) throw error;

    clientes = data;
    const lista = document.getElementById("lista-clientes");
    if (lista) {
      lista.innerHTML = clientes
        .map((c) => `<li>${c.nome}</li>`)
        .join("");
    }
  } catch (err) {
    console.error("Erro ao carregar clientes:", err);
  }
}

// ======= ADICIONAR AO FIADO =======
async function adicionarFiado(clienteId, bebidaId) {
  try {
    const bebida = bebidas.find((b) => b.id === bebidaId);
    if (!bebida) throw new Error("Bebida não encontrada");

    const { error } = await supabase
      .from("fiado")
      .insert([{ cliente_id: clienteId, bebida_id: bebidaId, valor: bebida.preco }]);

    if (error) throw error;
    alert("🧾 Adicionado ao fiado!");
  } catch (err) {
    alert("Erro ao adicionar fiado: " + err.message);
  }
}

// ======= INICIALIZAR =======
window.onload = () => {
  carregarBebidas();
  carregarClientes();
};
