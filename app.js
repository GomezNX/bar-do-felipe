/* ===== BAR DO FELIPE - App com Supabase ===== */

/* ===== CONEXÃO SUPABASE ===== */
const SUPABASE_URL = 'COLE_AQUI_A_URL_DO_PROJETO';
const SUPABASE_KEY = 'COLE_AQUI_A_CHAVE_PUBLICA';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ===== VARIÁVEIS ===== */
let clientes = [];
let bebidas = [];

/* ===== CLIENTES ===== */
async function carregarClientes() {
  const { data, error } = await supabase.from('clientes').select('*');
  if (error) return alert("Erro ao carregar clientes: " + error.message);
  clientes = data.map(c => ({ ...c, comanda: { itens: [] } }));
  renderClientes();
  renderFiado();
}

async function adicionarCliente() {
  const nome = document.getElementById("clienteNome").value.trim();
  if (!nome) return alert("Digite o nome do cliente!");

  const { data, error } = await supabase.from('clientes').insert([{ nome }]).select();
  if (error) return alert("Erro ao salvar cliente: " + error.message);

  clientes.push({ id: data[0].id, nome: data[0].nome, comanda: { itens: [] } });
  document.getElementById("clienteNome").value = "";
  renderClientes();
  renderFiado();
}

function renderClientes() {
  const lista = document.getElementById("listaClientes");
  if(!lista) return;
  lista.innerHTML = "";
  clientes.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${c.nome}</span>
      <button onclick="abrirComanda('${c.id}')">Abrir</button>
    `;
    lista.appendChild(li);
  });
}

/* ===== BEBIDAS ===== */
async function carregarBebidas() {
  const { data, error } = await supabase.from('bebidas').select('*');
  if (error) return alert("Erro ao carregar bebidas: " + error.message);
  bebidas = data;
  renderBebidas();
}

async function adicionarBebida() {
  const nome = document.getElementById("bebidaNome").value.trim();
  const preco = parseFloat(document.getElementById("bebidaPreco").value);
  if (!nome || isNaN(preco)) return alert("Preencha nome e preço!");

  const { data, error } = await supabase.from('bebidas').insert([{ nome, preco }]).select();
  if (error) return alert("Erro ao salvar bebida: " + error.message);

  bebidas.push({ id: data[0].id, nome: data[0].nome, preco: data[0].preco });
  document.getElementById("bebidaNome").value = "";
  document.getElementById("bebidaPreco").value = "";
  renderBebidas();
}

function renderBebidas() {
  const lista = document.getElementById("listaBebidas");
  if(!lista) return;
  lista.innerHTML = "";
  bebidas.forEach(b => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${b.nome} - R$${b.preco.toFixed(2)}</span>`;
    lista.appendChild(li);
  });
}

/* ===== COMANDAS ===== */
async function abrirComanda(clienteId) {
  const container = document.getElementById("comandasContainer");
  const cliente = clientes.find(c => c.id === clienteId);
  container.innerHTML = `
    <div class="card">
      <h3>Comanda - ${cliente.nome}</h3>
      <div class="row">
        <select id="bebidaSelect">
          <option value="">Selecione uma bebida</option>
          ${bebidas.map(b => `<option value="${b.id}">${b.nome} - R$${b.preco}</option>`).join("")}
        </select>
        <input type="number" id="quantidade" placeholder="Qtd" min="1" value="1" />
        <button onclick="adicionarItem('${clienteId}')">Adicionar</button>
      </div>
      <ul id="itensComanda"></ul>
      <h4 id="totalComanda">Total: R$0,00</h4>
    </div>
  `;

  // Carregar itens do banco
  const { data, error } = await supabase
    .from('itens_comanda')
    .select('*')
    .eq('cliente_id', clienteId);
  if(!error && data.length) {
    cliente.comanda.itens = data.map(i => ({
      bebidaId: i.bebida_id,
      nome: bebidas.find(b => b.id === i.bebida_id)?.nome || '',
      preco: i.preco,
      quantidade: i.quantidade
    }));
  }

  renderItensComanda(clienteId);
  renderFiado();
}

async function adicionarItem(clienteId) {
  const bebidaId = document.getElementById("bebidaSelect").value;
  const qtd = parseInt(document.getElementById("quantidade").value);
  if (!bebidaId || qtd <= 0) return alert("Selecione a bebida e quantidade!");

  const cliente = clientes.find(c => c.id === clienteId);
  const bebida = bebidas.find(b => b.id === bebidaId);

  // Inserir item no Supabase
  const { data, error } = await supabase.from('itens_comanda')
    .insert([{ cliente_id: clienteId, bebida_id: bebidaId, quantidade: qtd, preco: bebida.preco }]).select();
  if(error) return alert("Erro ao adicionar item: " + error.message);

  cliente.comanda.itens.push({ bebidaId, nome: bebida.nome, preco: bebida.preco, quantidade: qtd });
  renderItensComanda(clienteId);
  renderFiado();
}

function renderItensComanda(clienteId) {
  const cliente = clientes.find(c => c.id === clienteId);
  const comanda = cliente.comanda;
  const lista = document.getElementById("itensComanda");
  const totalEl = document.getElementById("totalComanda");
  lista.innerHTML = "";

  let total = 0;
  comanda.itens.forEach((item, i) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.nome} (${item.quantidade}x) - R$${subtotal.toFixed(2)}</span>`;
    lista.appendChild(li);
  });

  totalEl.textContent = `Total: R$${total.toFixed(2)}`;
}

/* ===== FIADO ===== */
function renderFiado() {
  const lista = document.getElementById("listaFiado");
  if(!lista) return;
  lista.innerHTML = "";
  clientes.forEach(c => {
    const total = c.comanda.itens.reduce((sum, i) => sum + i.preco*i.quantidade, 0);
    const li = document.createElement("li");
    li.innerHTML = `<span onclick="verFiado('${c.id}')">${c.nome} - R$${total.toFixed(2)}</span>`;
    lista.appendChild(li);
  });
}

function verFiado(clienteId) {
  const detalhes = document.getElementById("detalhesFiado");
  const cliente = clientes.find(c => c.id === clienteId);
  if(!cliente || !cliente.comanda.itens.length) {
    detalhes.innerHTML = "<p>Sem consumo registrado</p>";
    return;
  }
  const itens = cliente.comanda.itens;
  const total = itens.reduce((sum, i) => sum + i.preco*i.quantidade, 0);

  detalhes.innerHTML = `
    <h3>${cliente.nome} - Total: R$${total.toFixed(2)}</h3>
    <ul>
      ${itens.map(i => `<li>${i.nome} (${i.quantidade}x) - R$${(i.preco*i.quantidade).toFixed(2)}</li>`).join("")}
    </ul>
  `;
}

/* ===== ABAS ===== */
function abrirAba(evt, nomeAba) {
  const tabcontent = document.getElementsByClassName("tabcontent");
  for (let i=0; i<tabcontent.length; i++) tabcontent[i].style.display = "none";

  const tablinks = document.getElementsByClassName("tablink");
  for (let i=0; i<tablinks.length; i++) tablinks[i].classList.remove("active");

  document.getElementById(nomeAba).style.display = "block";
  evt.currentTarget.classList.add("active");
}

/* ===== UTIL ===== */
function gerarId() {
  return Math.random().toString(36).substring(2, 10);
}

/* ===== CARREGAR INICIAL ===== */
carregarClientes();
carregarBebidas();
abrirAba({currentTarget: document.querySelector('.tablink.active')}, 'clientes');
