// O array que armazena os itens do carrinho
let cart = [];

// Seleciona elementos importantes
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalElement = document.getElementById('cart-total');
const cartIcon = document.querySelector('.cart-icon');

// 1. Função para Abrir/Fechar o Carrinho (Modal)
function toggleCart() {
    cartOverlay.classList.toggle('active');
    renderCart(); // Garante que o carrinho está atualizado ao abrir
}

// Adiciona o evento de clique ao ícone do carrinho na nav
cartIcon.addEventListener('click', toggleCart);

// 2. Função para Adicionar Item ao Carrinho
function addToCart(event, name, price) {
    // Para evitar que o clique no botão navegue para o link do produto
    event.preventDefault(); 
    
    // Converte o preço para número
    const itemPrice = parseFloat(price);
    
    // Cria o objeto do novo item
    const newItem = {
        id: Date.now(), // ID único para fácil remoção
        name: name,
        price: itemPrice,
        quantity: 1 // Por enquanto, sempre adiciona 1
    };
    
    // Adiciona o item ao array do carrinho
    cart.push(newItem);
    
    // Atualiza o visual do carrinho
    renderCart();
    
    // Feedback visual opcional
    alert(`"${name}" adicionado ao carrinho!`);
}

// 3. Função para Remover Item
function removeFromCart(id) {
    // Filtra o array, mantendo apenas os itens que NÃO possuem o ID fornecido
    cart = cart.filter(item => item.id !== id);
    
    // Atualiza o visual do carrinho
    renderCart();
}

// 4. Função para Renderizar (Desenhar) o Carrinho na Tela
function renderCart() {
    // Limpa a lista atual
    cartItemsList.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Seu carrinho está vazio.</li>';
        cartTotalElement.textContent = 'R$ 0,00';
        return;
    }

    // Cria os elementos HTML para cada item no array
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const listItem = document.createElement('li');
        listItem.classList.add('cart-item');
        listItem.innerHTML = `
            <span class="item-name">${item.name}</span>
            <span class="item-details">
                ${item.quantity} x R$ ${item.price.toFixed(2).replace('.', ',')}
            </span>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remover</button>
        `;
        
        cartItemsList.appendChild(listItem);
    });

    // Atualiza o valor total com formatação brasileira
    cartTotalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

// 5. Garante que o carrinho comece vazio ao carregar a página
document.addEventListener('DOMContentLoaded', renderCart);