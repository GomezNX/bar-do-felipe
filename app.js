import { createClient } from '@supabase/supabase-js'

// 🔹 Cole sua URL e chave aqui
const supabaseUrl = 'COLE_AQUI_SUA_URL'
const supabaseKey = 'COLE_AQUI_SUA_ANON_KEY' // Use anon key para frontend
const supabase = createClient(supabaseUrl, supabaseKey)

// 🔹 Função para adicionar bebida
async function adicionarBebida(nome, valor) {
  const { data, error } = await supabase
    .from('bebidas')
    .insert([{ nome: nome, valor: valor }]);

  if (error) {
    console.error('Erro ao adicionar bebida:', error);
    alert('Erro ao adicionar bebida. Veja o console.');
  } else {
    console.log('Bebida adicionada:', data);
    alert('Bebida adicionada com sucesso!');
    listarBebidas(); // Atualiza a lista
  }
}

// 🔹 Função para listar bebidas
async function listarBebidas() {
  const { data, error } = await supabase
    .from('bebidas')
    .select('*')
    .order('id', { ascending: true });

  const lista = document.querySelector('#listaBebidas');
  lista.innerHTML = ''; // limpa a lista antes de renderizar

  if (error) {
    console.error('Erro ao listar bebidas:', error);
    lista.innerHTML = '<li>Erro ao carregar bebidas</li>';
  } else {
    data.forEach(b => {
      const li = document.createElement('li');
      li.textContent = `${b.nome} - R$ ${b.valor}`;
      lista.appendChild(li);
    });
  }
}

// 🔹 Evento do formulário
document.querySelector('#formBebida').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nome = document.querySelector('#nome').value;
  const valor = document.querySelector('#valor').value;
  if (nome && valor) {
    await adicionarBebida(nome, valor);
    document.querySelector('#formBebida').reset();
  } else {
    alert('Preencha nome e valor!');
  }
});

// 🔹 Lista inicial
listarBebidas();
