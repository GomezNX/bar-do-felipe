/* ===== BAR DO FELIPE - Lógica Principal ===== */

// Dados armazenados temporariamente (em breve conectar no Supabase)
let clientes = [];
let bebidas = [];
let comandas = [];

/* ===== CLIENTES ===== */
function adicionarCliente() {
  const nome = document.getElementById("clienteNome").value.trim();
  if (!nome) return alert("Digite o nome do cliente ou mesa!");
  const cliente = { id: gerarId(), nome, aberto: true };
  clientes.push(cliente);
  document.getElementById("clienteNome").value = "";
  renderClientes();
}

function renderClientes() {
  const lista = document.getElementById("listaClientes");
  lista.innerHTML = "";
  clientes.forEach((c) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${c.nome}</span>
      <button onclick="abrirComanda('${c.id}')">Abrir</button>
      <button onclick="finalizarComanda('${c.id}')">Finalizar</button>
    `;
    lista.appendChild(li);
  });
}

/* ===== BEBIDAS ===== */
function adicionarBebida() {
  const nome = document.getElementById("bebidaNome").value.trim();
  const preco = parseFloat(document.getElementById("bebidaPreco").value);
  if (!nome || isNaN(preco)) return alert("Preencha nome e preço!");
  const bebida = { id: gerarId(), nome, preco };
  bebidas.push(bebida);
  document.getElementById("bebidaNome").value = "";
  document.getElementById("bebidaPreco").value = "";
  renderBebidas();
}

function renderBebidas() {
  const lista = document.getElementById("listaBebidas");
  lista.innerHTML = "";
  bebidas.forEach((b) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${b.nome} - R$${b.preco.toFixed(2)}</span>
    `;
    lista.appendChild(li);
  });
}

/* ===== COMANDAS ===== */
function abrirComanda(clienteId) {
  const container = document.getElementById("comandasContainer");
  const cliente = clientes.find((c) => c.id === clienteId);
  const comanda = comandas.find((co) => co.clienteId === clienteId) || {
    clienteId,
    itens: [],
  };
  comandas = comandas.filter((co) => co.clienteId !== clienteId);
  comandas.push(comanda);

  container.innerHTML = `
    <div class="card">
      <h3>Comanda - ${cliente.nome}</h3>
      <div class="row">
        <select id="bebidaSelect">
          <option value="">Selecione uma bebida</option>
          ${bebidas
            .map((b) => `<option value="${b.id}">${b.nome} - R$${b.preco}</option>`)
            .join("")}
        </select>
        <input type="number" id="quantidade" placeholder="Qtd" min="1" value="1" />
        <button onclick="adicionarItem('${clienteId}')">Adicionar</button>
      </div>
      <ul id="itensComanda"></ul>
      <h4 id="totalComanda">Total: R$0,00</h4>
    </div>
  `;

  renderItensComanda(clienteId);
}

function adicionarItem(clienteId) {
  const bebidaId = document.getElementById("bebidaSelect").value;
  const qtd = parseInt(document.getElementById("quantidade").value);
  if (!bebidaId || qtd <= 0) return alert("Selecione a bebida e quantidade!");

  const bebida = bebidas.find((b) => b.id === bebidaId);
  const comanda = comandas.find((co) => co.clienteId === clienteId);

  comanda.itens.push({
    bebidaId,
    nome: bebida.nome,
    preco: bebida.preco,
    quantidade: qtd,
  });

  renderItensComanda(clienteId);
}

function renderItensComanda(clienteId) {
  const comanda = comandas.find((co) => co.clienteId === clienteId);
  const lista = document.getElementById("itensComanda");
  const totalEl = document.getElementById("totalComanda");

  lista.innerHTML = "";
  let total = 0;

  comanda.itens.forEach((item, i) => {
    const subtotal = item.preco * item.quantidade;
    total += subtotal;
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${item.nome} (${item.quantidade}x) - R$${subtotal.toFixed(2)}</span>
      <button onclick="removerItem('${clienteId}', ${i})">❌</button>
    `;
    lista.appendChild(li);
  });

  totalEl.textContent = `Total: R$${total.toFixed(2)}`;
}

function removerItem(clienteId, index) {
  const comanda = comandas.find((co) => co.clienteId === clienteId);
  comanda.itens.splice(index, 1);
  renderItensComanda(clienteId);
}

function finalizarComanda(clienteId) {
  if (!confirm("Finalizar esta comanda?")) return;
  comandas = comandas.filter((co) => co.clienteId !== clienteId);
  clientes = clientes.filter((c) => c.id !== clienteId);
  document.getElementById("comandasContainer").innerHTML = "";
  renderClientes();
}

/* ===== UTIL ===== */
function gerarId() {
  return Math.random().toString(36).substring(2, 10);
}
