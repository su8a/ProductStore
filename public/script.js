// Функции для работы с клиентами
async function loadCustomers() {
    const response = await fetch('/api/customers');
    const customers = await response.json();
    const tbody = document.querySelector('#customersTable tbody');
    const select = document.querySelector('#purchaseCustomer');
    
    tbody.innerHTML = '';
    select.innerHTML = '';
    
    customers.forEach(customer => {
        tbody.innerHTML += `
            <tr>
                <td>${customer.name}</td>
                <td>${customer.phone}</td>
                <td>${customer.email}</td>
                <td>
                    <button onclick="editCustomer(${customer.id})">Редактировать</button>
                    <button onclick="deleteCustomer(${customer.id})">Удалить</button>
                </td>
            </tr>
        `;
        
        select.innerHTML += `
            <option value="${customer.id}">${customer.name}</option>
        `;
    });
}

async function addCustomer() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    
    await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email })
    });
    
    loadCustomers();
    clearCustomerForm();
}

function clearCustomerForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerEmail').value = '';
}

async function deleteCustomer(id) {
    const confirmDelete = confirm('Вы уверены, что хотите удалить этого клиента?');
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/customers/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении товара');
            }

            await loadCustomers(); // Обновляем список товаров
            alert('Клиент успешно удален!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить клиента. Пожалуйста, попробуйте снова.');
        }
    }
}

async function editCustomer(id) {
    const name = prompt('Новое имя:');
    const phone = prompt('Новый телефон:');
    const email = prompt('Новый email:');
    
    if (name && phone && email) {
        await fetch(`/api/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, email })
        });
        
        loadCustomers();
    }
}

// Функции для работы с товарами
async function loadProducts() {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    // Обновляем таблицу товаров
    const tbody = document.querySelector('#productsTable tbody');
    const select = document.querySelector('#purchaseProduct');
    
    tbody.innerHTML = '';
    select.innerHTML = '';
    
    products.forEach(product => {
        tbody.innerHTML += `
            <tr>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${product.quantity}</td>
                <td>
                    <button onclick="editProduct(${product.id})">Редактировать</button>
                    <button onclick="deleteProduct(${product.id})">Удалить</button>
                </td>
            </tr>
        `;
        
        select.innerHTML += `
            <option value="${product.id}">${product.name}</option>
        `;
    });

    // Обновляем витрину товаров
    const showcase = document.getElementById('productsShowcase');
    showcase.innerHTML = '';
    
    products.forEach(product => {
        const stockStatus = product.quantity > 0 
            ? `В наличии: ${product.quantity} шт/кг.` 
            : 'Нет в наличии';
        
        showcase.innerHTML += `
            <div class="product-card">
                <h3>${product.name}</h3>
                <div class="product-price">${product.price} ₽</div>
                <div class="product-stock">${stockStatus}</div>
            </div>
        `;
    });
}

async function addProduct() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const quantity = document.getElementById('productQuantity').value;
    
    await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price, quantity })
    });
    
    loadProducts();
    clearProductForm();
}

async function deleteProduct(id) {
    const confirmDelete = confirm('Вы уверены, что хотите удалить этот товар?');
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Ошибка при удалении товара');
            }

            await loadProducts(); // Обновляем список товаров
            alert('Товар успешно удалён!');
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Не удалось удалить товар. Пожалуйста, попробуйте снова.');
        }
    }
}


function clearProductForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productQuantity').value = '';
}

async function editProduct(id) {
    const name = prompt('Новое название:');
    const price = prompt('Новая цена:');
    const quantity = prompt('Новое количество:');
    
    if (name && price && quantity) {
        await fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, price, quantity })
        });
        
        loadProducts();
    }
}


// Функция для добавления покупки
async function addPurchase() {
    const customer_id = document.getElementById('purchaseCustomer').value;
    const product_id = document.getElementById('purchaseProduct').value;
    const quantity = document.getElementById('purchaseQuantity').value;
    
    const response = await fetch('/api/products');
    const products = await response.json();
    
    const product = products.find(p => p.id == parseInt(product_id));
    if (product.quantity < quantity) {
        alert('Недостаточно товара в наличии!');
        return;
    }

    await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id, product_id, quantity })
    });
    
    loadProducts();
    document.getElementById('purchaseQuantity').value = '';
    alert('Покупка успешно оформлена!');
}

// Функция для переключения вкладок
function showTab(tabId) {
    // Скрываем все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убираем активный класс у всех кнопок
    document.querySelectorAll('.tab').forEach(button => {
        button.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    document.getElementById(tabId).classList.add('active');
    
    // Делаем кнопку активной
    document.querySelector(`.tab[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// Загрузка данных при запуске
window.onload = () => {
    loadCustomers();
    loadProducts();
};