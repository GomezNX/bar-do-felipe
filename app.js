/* ===== BAR DO FELIPE - Lógica Completa com Abas e Fiado ===== */

let clientes = [];
let bebidas = [];
let comandas = [];

/* ===== CLIENTES ===== */
function adicionarCliente() {
  const nome = document.getElementById("clienteNome").value.trim();
  if (!nome) return alert("Digite o nome do cliente ou mesa!");
  const cliente = { id: gerarId(), nome, comanda: { itens: [] } };
  clientes.push(cliente);
  document.getElementById("clienteNome").value = "";
  renderClientes();
  renderFiado();
}

function renderClientes() {
  const lista = document.getElementById("listaClientes");
  if(!lista) return;
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
  if(!lista) return;
  lista.innerHTML = "";
  bebidas.forEach((b) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${b.nome} - R$${b.preco.toFixed(2)}</span>`;
    lista.appendChild(li);
  });
}

/* ===== COMANDAS ===== */
function abrirComanda(clienteId) {
  const container = document.getElementById("comandasContainer");
  const cliente = clientes.find(c => c.id === clienteId);
  const comanda = cliente.comanda;
  
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

  renderItensComanda(clienteId);
}

function adicionarItem(clienteId) {
  const bebidaId = document.getElementById("bebidaSelect").value;
  const qtd = parseInt(document.getElementById("quantidade").value);
  if (!bebidaId || qtd <= 0) return alert("Selecione a bebida e quantidade!");

  const bebida = bebidas.find(b => b.id === bebidaId);
  const cliente = clientes.find(c => c.id === clienteId);
  cliente.comanda.itens.push({
    bebidaId,
    nome: bebida.nome,
    preco: bebida.preco,
    quantidade: qtd
  });

  renderItensComanda(clienteId);
  renderFiado(); // Atualiza o total do fiado
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
    li.innerHTML = `
      <span>${item.nome} (${item.quantidade}x) - R$${subtotal.toFixed(2)}</span>
      <button onclick="removerItem('${clienteId}', ${i})">❌</button>
    `;
    lista.appendChild(li);
  });

  totalEl.textContent = `Total: R$${total.toFixed(2)}`;
}

function removerItem(clienteId, index) {
  const cliente = clientes.find(c => c.id === clienteId);
  cliente.comanda.itens.splice(index, 1);
  renderItensComanda(clienteId);
  renderFiado();
}

/* ===== FINALIZAR COMANDA ===== */
function finalizarComanda(clienteId) {
  if (!confirm("Finalizar esta comanda?")) return;

  const cliente = clientes.find(c => c.id === clienteId);
  cliente.comanda.itens = []; // Limpa comanda, mas mantém fiado acumulado
  renderClientes();
  renderFiado();
  document.getElementById("comandasContainer").innerHTML = "";
}

/* ===== FIADO POR CLIENTE ===== */
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
  if (!cliente || cliente.comanda.itens.length === 0) {
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
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  const tablinks = document.getElementsByClassName("tablink");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].classList.remove("active");
  }

  document.getElementById(nomeAba).style.display = "block";
  evt.currentTarget.classList.add("active");
}

/* ===== UTIL ===== */
function gerarId() {
  return Math.random().toString(36).substring(2, 10);
}
