// 全局变量和函数
let cart = {};
let isLoggedIn = false;
let currentPriceGaoliang = 10; // 高粱酒默认价格
let currentQuantityGaoliang = 1; // 高粱酒默认数量
let currentPriceGuzi = 10; // 谷子酒默认价格
let currentQuantityGuzi = 1; // 谷子酒默认数量

// 订单搜索和筛选功能
let currentOrderPage = 1;
const ordersPerPage = 1; // 修改为每页显示1个订单
let currentOrderFilter = {
    status: 'all',
    timeRange: 'all',
    searchText: ''
};

// 模态框控制函数
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with id ${modalId} not found`);
        return;
    }

    // 清空表单和错误信息
    const form = modal.querySelector('form');
    const errorDiv = modal.querySelector('.error-message');
    if (form) form.reset();
    if (errorDiv) errorDiv.textContent = '';
    
    // 显示模态框
    modal.style.display = 'block';
    // 使用 requestAnimationFrame 确保过渡效果正常工作
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });

    // 防止页面滚动
    document.body.style.overflow = 'hidden';
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with id ${modalId} not found`);
        return;
    }

    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        // 清空表单和错误信息
        const form = modal.querySelector('form');
        const errorDiv = modal.querySelector('.error-message');
        if (form) form.reset();
        if (errorDiv) errorDiv.textContent = '';
        // 恢复页面滚动
        document.body.style.overflow = '';
    }, 300);
}

// 购物车相关函数
function addToCart(name, price) {
    if (checkLoginStatus()) {
        // 获取当前选择的数量和价格
        let quantity = 1;
        let currentPrice = price;
        
        if (name.includes('高粱')) {
            quantity = currentQuantityGaoliang;
            currentPrice = currentPriceGaoliang;
        } else if (name.includes('谷子')) {
            quantity = currentQuantityGuzi;
            currentPrice = currentPriceGuzi;
        }
        
        // 为商品创建唯一标识，包含名称和价格
        const itemKey = `${name}-${currentPrice}`;
        if (cart[itemKey]) {
            cart[itemKey].quantity += quantity;
        } else {
            cart[itemKey] = {
                name: name,
                price: currentPrice,
                quantity: quantity
            };
        }
        updateCart();
        // 显示添加成功提示
        showToast(`已将 ${name}（${currentPrice}元/斤） 添加到待购列表`);
        
        // 重置商品卡片
        if (name.includes('高粱')) {
            currentPriceGaoliang = 10;
            currentQuantityGaoliang = 1;
            document.getElementById('price-gaoliang').value = '10';
            document.getElementById('quantity-gaoliang').value = '1';
            updateTotalPrice('gaoliang');
        } else if (name.includes('谷子')) {
            currentPriceGuzi = 10;
            currentQuantityGuzi = 1;
            document.getElementById('price-guzi').value = '10';
            document.getElementById('quantity-guzi').value = '1';
            updateTotalPrice('guzi');
        }
    }
}

function updateCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const submitOrderBtn = document.querySelector('.submit-order-btn');
    let total = 0;
    
    if (!cartItems) return;
    
    if (Object.keys(cart).length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>您的待购列表还是空的</p>
                <a href="#products" class="shop-now-btn">去选购</a>
            </div>
        `;
        if (submitOrderBtn) {
            submitOrderBtn.style.display = 'none';
        }
        if (cartTotal) {
            cartTotal.textContent = '总计: ¥0';
        }
    } else {
        let cartItemsHtml = '';

        for (let itemKey in cart) {
            const item = cart[itemKey];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            cartItemsHtml += `
                <div class="cart-item">
                    <div class="item-info">
                        <span class="item-name">${item.name}（${item.price}元/斤）</span>
                    </div>
                    <span class="item-subtotal">小计: ¥${itemTotal}</span>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${itemKey}', -1)">-</button>
                    <input type="number" value="${item.quantity}" 
                        onchange="updateQuantityDirect('${itemKey}', this.value)"
                            min="1">
                    <button onclick="updateQuantity('${itemKey}', 1)">+</button>
                </div>
                <button onclick="removeFromCart('${itemKey}')" class="remove-btn">
                        <i class="fas fa-trash"></i>
                </button>
                </div>
            `;
        }
        
        cartItems.innerHTML = cartItemsHtml;
        
        if (submitOrderBtn) {
            submitOrderBtn.style.display = 'flex';
    }

        if (cartTotal) {
    cartTotal.textContent = `总计: ¥${total}`;
        }
    }
    
    saveCart();
}

// 其他全局函数
function updateQuantity(name, change) {
    if (cart[name]) {
        cart[name].quantity += change;
        if (cart[name].quantity <= 0) {
            removeFromCart(name);
        } else {
            updateCart();
        }
    }
}

function updateQuantityDirect(name, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
        removeFromCart(name);
    } else {
        cart[name].quantity = newQuantity;
        updateCart();
    }
}

function removeFromCart(name) {
    delete cart[name];
    updateCart();
}

function showToast(message) {
    const existingToast = document.querySelector('.toast-message');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

function showContactInfo() {
    alert('请联系我们进行定制：\n电话：13679012222 / 13683441560\n微信同号');
}

function handleShopNowClick(event) {
    event.preventDefault();
    const productsLink = document.querySelector('a[href="#products"]');
    if (productsLink) {
        productsLink.click();
    }
}

function updateUserMenu(username) {
    const guestButtons = document.querySelector('.guest-buttons');
    const userButtons = document.querySelector('.user-buttons');
    
    if (isLoggedIn && username) {
        guestButtons.style.display = 'none';
        userButtons.style.display = 'flex';
        
        // 更新个人中心信息
        const user = AV.User.current();
        if (user) {
            document.getElementById('profile-username').textContent = user.get('username') || '未设置';
            document.getElementById('profile-email').textContent = user.get('email');
            document.getElementById('profile-created').textContent = user.get('createdAt').toLocaleString();
        }
    } else {
        isLoggedIn = false;
        guestButtons.style.display = 'flex';
        userButtons.style.display = 'none';
        
        // 清空个人中心信息
        document.getElementById('profile-username').textContent = '';
        document.getElementById('profile-email').textContent = '';
        document.getElementById('profile-created').textContent = '';
        
        // 如果当前在个人中心页面或待购页面，跳转到首页
        if (window.location.hash === '#profile' || window.location.hash === '#cart') {
            window.location.replace('#home');
        }
    }
}

function checkLoginStatus() {
    if (!isLoggedIn) {
        showModal('loginModal');
        return false;
    }
    return true;
}

// 错误消息处理
function getErrorMessage(errorCode) {
    // 处理完整的错误消息
    if (typeof errorCode === 'string') {
        if (errorCode.includes('email')) {
            return '邮箱格式不正确或已被使用';
        }
        if (errorCode === '不是管理员账号') {
            return '该账号不是管理员账号';
        }
    }
    
    switch (errorCode) {
        case 210:
            return '用户名和密码不匹配';
        case 211:
            return '该用户不存在';
        case 202:
            return '用户名已被占用';
        case 203:
            return '邮箱已被占用';
        case 217:
            return '无效的用户名';
        case 125:
            return '邮箱地址无效';
        case 127:
            return '手机号码无效';
        case 'malformed_email':
            return '邮箱格式不正确';
        case 'email_missing':
            return '请输入邮箱地址';
        case 'username_missing':
            return '请输入用户名';
        case 'password_missing':
            return '请输入密码';
        case 'username_taken':
            return '该用户名已被使用';
        case 'email_taken':
            return '该邮箱已被使用';
        case 'CONNECTION_FAILED':
            return '连接服务器失败，请检查网络连接';
        case 'INVALID_EMAIL':
            return '邮箱格式不正确';
        case 'INVALID_PASSWORD':
            return '密码格式不正确';
        case 'INVALID_USERNAME':
            return '用户名格式不正确';
        default:
            if (typeof errorCode === 'string') {
                return errorCode;
            }
            // 根据上下文返回不同的默认错误消息
            const stack = new Error().stack;
            if (stack.includes('login')) {
                return '登录失败，请检查账号密码是否正确';
            } else if (stack.includes('register')) {
                return '注册失败，请稍后重试';
            }
            return '操作失败，请重试';
    }
}

// 处理 hash 变化
async function handleHash() {
    const hash = window.location.hash || '#home';
    const targetLink = document.querySelector(`a[href="${hash}"]`);
    if (!targetLink) return;

    // 移除所有活动状态
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
        section.style.opacity = '0';
        section.style.visibility = 'hidden';
    });
    
    // 添加新的活动状态
    targetLink.classList.add('active');
    const targetSection = document.getElementById(hash.slice(1));
    if (!targetSection) return;

    // 先滚动到顶部（除了联系我们页面）
    if (hash !== '#contact') {
        window.scrollTo({
            top: 0,
            behavior: 'instant'  // 使用 instant 避免滚动动画
        });
    }

    // 显示目标section
    targetSection.style.display = 'block';
    setTimeout(() => {
        targetSection.classList.add('active');
        targetSection.style.opacity = '1';
        targetSection.style.visibility = 'visible';
        
        // 只有联系我们页面需要滚动到特定位置
        if (hash === '#contact') {
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, 50);
    
    // 如果是个人中心页面，检查登录状态并加载内容
    if (hash === '#profile') {
        const currentUser = AV.User.current();
        if (currentUser) {
            isLoggedIn = true;
            await loadProfileOrders();
        } else {
            window.location.hash = '#home';
            showToast('请先登录');
            return;
        }
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', async function() {
    // 初始化事件监听
    initializeEventListeners();
    
    // 检查登录状态
    const currentUser = AV.User.current();
    if (currentUser) {
        // 获取最新的用户数据
        await currentUser.fetch();
        
        isLoggedIn = true;
        updateUserMenu(currentUser.get('username') || currentUser.get('email'));
        loadCart();
        
        // 如果在个人中心页面，加载个人中心内容
        if (window.location.hash === '#profile') {
            await loadProfileOrders();
        }
        
        // 更新收货信息
        document.getElementById('shipping-name').textContent = currentUser.get('defaultShippingName') || '未设置';
        document.getElementById('shipping-phone').textContent = currentUser.get('defaultShippingPhone') || '未设置';
        document.getElementById('shipping-address').textContent = currentUser.get('defaultShippingAddress') || '未设置';
    } else if (window.location.hash === '#profile') {
        // 如果未登录且在个人中心页面，跳转到首页
        window.location.hash = '#home';
        showToast('请先登录');
    }
    
    // 处理初始 hash
    await handleHash();
    
    // 监听 hash 变化
    window.addEventListener('hashchange', handleHash);
});

// 修改购物车存储功能
function saveCart() {
    const currentUser = AV.User.current();
    if (currentUser) {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cart));
    }
}

function loadCart() {
    const currentUser = AV.User.current();
    if (currentUser) {
        const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
        if (savedCart) {
            cart = JSON.parse(savedCart);
        } else {
            cart = {};
        }
    } else {
        cart = {};
    }
    updateCart();
}

// 页面加载时恢复购物车
document.addEventListener('DOMContentLoaded', loadCart);

// 在每次购物车更新时保存
const originalUpdateCart = updateCart;
updateCart = function() {
    originalUpdateCart();
    saveCart();
}

// 创建表情动画
const emojis = ['🍷', '🍺', '🥂', '🍶', '🥃', '🍸', '🍹', '🍻'];
let lastEmojiTime = 0;
const EMOJI_COOLDOWN = 50;

function createEmoji(x, y) {
    const emoji = document.createElement('div');
    emoji.className = 'floating-emoji';
    emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    
    const size = 16 + Math.random() * 16;
    emoji.style.fontSize = `${size}px`;
    
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    emoji.style.left = (x + offsetX) + 'px';
    emoji.style.top = (y + offsetY) + 'px';
    
    document.body.appendChild(emoji);
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 50;
    emoji.style.setProperty('--moveX', `${Math.cos(angle) * distance}px`);
    emoji.style.setProperty('--moveY', `${Math.sin(angle) * distance}px`);
    
    setTimeout(() => {
        emoji.remove();
    }, 800);
}

document.addEventListener('mousemove', function(e) {
    const currentTime = Date.now();
    if (currentTime - lastEmojiTime > EMOJI_COOLDOWN) {
        createEmoji(e.clientX, e.clientY);
        lastEmojiTime = currentTime;
    }
});

// 页面加载时初始化总价
document.addEventListener('DOMContentLoaded', function() {
    updateTotalPrice('gaoliang');
    updateTotalPrice('guzi');
});

function updateQuantitySelect(change, type) {
    const quantityInput = document.getElementById(`quantity-${type}`);
    if (type === 'gaoliang') {
        if (change === 0) {
            currentQuantityGaoliang = parseInt(quantityInput.value) || 1;
        } else {
            currentQuantityGaoliang = Math.max(1, currentQuantityGaoliang + change);
        }
        quantityInput.value = currentQuantityGaoliang;
    } else {
        if (change === 0) {
            currentQuantityGuzi = parseInt(quantityInput.value) || 1;
        } else {
            currentQuantityGuzi = Math.max(1, currentQuantityGuzi + change);
        }
        quantityInput.value = currentQuantityGuzi;
    }
    updateTotalPrice(type);
}

function updateTotalPrice(type) {
    let total;
    if (type === 'gaoliang') {
        total = currentPriceGaoliang * currentQuantityGaoliang;
        document.getElementById('total-price-gaoliang').textContent = `总价：¥${total}`;
        } else {
        total = currentPriceGuzi * currentQuantityGuzi;
        document.getElementById('total-price-guzi').textContent = `总价：¥${total}`;
        }
}

function updatePrice(price, type) {
    if (type === 'gaoliang') {
        currentPriceGaoliang = parseInt(price);
    } else {
        currentPriceGuzi = parseInt(price);
    }
    updateTotalPrice(type);
}

// 修改加载订单列表函数
async function loadFilteredOrders() {
    const orderList = document.querySelector('.order-list');
    if (!orderList) {
        console.error('找不到订单列表容器');
        return;
    }

    try {
        const currentUser = AV.User.current();
        if (!currentUser) {
            orderList.innerHTML = '<p class="no-orders">请先登录</p>';
            return;
        }

        // 显示加载状态
        orderList.innerHTML = '<div class="loading-spinner">加载中...</div>';

        // 创建基础查询
        const query = new AV.Query('Order');
        query.equalTo('user', currentUser);
        query.descending('createdAt'); // 按时间倒序排列
        
        // 获取总数用于分页
        const totalOrders = await query.count();
        const totalPages = Math.ceil(totalOrders / ordersPerPage);
        
        // 检查当前页是否超出总页数
        if (currentOrderPage > totalPages && totalPages > 0) {
            currentOrderPage = totalPages;
        }
        
        // 设置分页
        query.skip((currentOrderPage - 1) * ordersPerPage);
        query.limit(ordersPerPage);
        
        // 获取当前页订单
        const orders = await query.find();
        
        // 更新订单列表
        if (totalOrders === 0) {
            showEmptyOrders(orderList);
            // 隐藏分页控件
            const paginationDiv = document.querySelector('.pagination');
            if (paginationDiv) {
                paginationDiv.style.display = 'none';
            }
            return;
        }
        
        // 显示分页控件
        const paginationDiv = document.querySelector('.pagination');
        if (paginationDiv) {
            paginationDiv.style.display = 'flex';
        }
        
        // 清空订单列表并添加新的订单卡片
        orderList.innerHTML = '';
        orders.forEach(order => {
            const orderCard = createOrderCard(order);
            orderList.appendChild(orderCard);
        });
        
        // 更新分页控件
        updatePagination(totalPages);
        
    } catch (error) {
        console.error('加载订单失败:', error);
        orderList.innerHTML = '<p class="error-message">加载订单失败，请重试</p>';
    }
}

// 更新分页控件
function updatePagination(totalPages) {
    const paginationDiv = document.querySelector('.pagination');
    if (!paginationDiv) return;
    
    const prevButton = paginationDiv.querySelector('.prev-page');
    const nextButton = paginationDiv.querySelector('.next-page');
    const pageInfo = paginationDiv.querySelector('.page-info');
    
    // 更新按钮状态
    prevButton.disabled = currentOrderPage <= 1;
    nextButton.disabled = currentOrderPage >= totalPages;
    
    // 更新页码信息
    pageInfo.textContent = `第${currentOrderPage}页 / 共${totalPages}页`;
}

// 切换页面
async function changePage(page) {
    const query = new AV.Query('Order');
    query.equalTo('user', AV.User.current());
    const totalOrders = await query.count();
    const totalPages = Math.ceil(totalOrders / ordersPerPage);
    
    // 确保页码在有效范围内
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    
    currentOrderPage = page;
    await loadFilteredOrders();
    
    // 移除自动滚动
    // document.querySelector('.order-list').scrollIntoView({ behavior: 'smooth' });
}

// 修改创建订单卡片函数
function createOrderCard(order) {
    const orderCard = document.createElement('div');
    orderCard.className = 'order-card';
    
    // 获取订单状态中文描述
    const statusText = getOrderStatusText(order.get('status'));
    const statusClass = getOrderStatusClass(order.get('status'));
    
    // 格式化订单创建时间
    const orderTime = order.get('orderTime') || order.createdAt;
    const createdAt = orderTime.toLocaleString();
    
    // 构建订单商品列表HTML
    const itemsHtml = order.get('items').map(item => `
            <div class="order-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">¥${item.total}</span>
            </div>
        `).join('');
    
    orderCard.innerHTML = `
        <div class="order-header">
            <span class="order-id">订单号：${order.get('orderId')}</span>
            <span class="order-status ${statusClass}">${statusText}</span>
        </div>
        <div class="order-items">
            ${itemsHtml}
        </div>
        <div class="order-footer">
            <div class="order-info">
                <span class="order-time">下单时间：${createdAt}</span>
                <span class="order-total">总计：¥${order.get('totalAmount')}</span>
            </div>
            <div class="order-actions">
                <button class="view-detail-btn" onclick="viewOrderDetail('${order.get('orderId')}')">
                    查看详情
                </button>
                ${getOrderActionButton(order)}
            </div>
        </div>
    `;
    
    return orderCard;
}

// 获取订单状态文本
function getOrderStatusText(status) {
    const statusMap = {
        'pending': '待支付',
        'processing': '处理中',
        'shipping': '配送中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 获取订单状态样式类
function getOrderStatusClass(status) {
    const classMap = {
        'pending': 'status-pending',
        'processing': 'status-processing',
        'shipping': 'status-shipping',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
}

// 获取订单操作按钮
function getOrderActionButton(order) {
    const status = order.get('status');
    switch (status) {
        case 'pending':
            return `<button class="pay-now-btn" onclick="handlePayment('${order.get('orderId')}', ${order.get('totalAmount')}, 'alipay')">
                立即支付
            </button>`;
        case 'shipping':
            return `<button class="confirm-receipt-btn" onclick="confirmReceipt('${order.get('orderId')}')">
                确认收货
            </button>`;
        case 'completed':
            return `<button class="review-btn" onclick="writeReview('${order.get('orderId')}')">
                评价订单
            </button>`;
        default:
            return '';
    }
}

// 查看订单详情
async function viewOrderDetail(orderId) {
    try {
        const query = new AV.Query('Order');
        query.equalTo('orderId', orderId);
        const order = await query.first();
        
        if (!order) {
            showToast('订单不存在');
            return;
        }
        
        // 获取订单时间
        const orderTime = order.get('orderTime') || order.createdAt;
        
        // 创建详情模态框
        const modalHtml = `
            <div id="order-detail-modal" class="modal">
                <div class="modal-content order-detail-content">
                    <span class="close" onclick="hideModal('order-detail-modal')">&times;</span>
                    <h3>订单详情</h3>
                    <div class="order-detail-info">
                        <p><strong>订单号：</strong>${order.get('orderId')}</p>
                        <p><strong>下单时间：</strong>${orderTime.toLocaleString()}</p>
                        <p><strong>收货人：</strong>${order.get('userName')}</p>
                        <p><strong>联系电话：</strong>${order.get('contact')}</p>
                        <p><strong>收货地址：</strong>${order.get('address')}</p>
                        <p><strong>订单状态：</strong>${getOrderStatusText(order.get('status'))}</p>
                        ${order.get('note') ? `<p><strong>订单备注：</strong>${order.get('note')}</p>` : ''}
                    </div>
                    <div class="order-detail-items">
                        <h4>商品清单</h4>
                        ${order.get('items').map(item => `
                            <div class="detail-item">
                                <span class="item-name">${item.name}</span>
                                <span class="item-price">¥${item.price}/斤</span>
                                <span class="item-quantity">x${item.quantity}</span>
                                <span class="item-total">¥${item.total}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-detail-total">
                        <p><strong>总计：</strong>¥${order.get('totalAmount')}</p>
                    </div>
                </div>
            </div>
        `;
        
        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        showModal('order-detail-modal');
        
    } catch (error) {
        console.error('加载订单详情失败:', error);
        showToast('加载订单详情失败，请重试');
    }
}

// 确认收货
async function confirmReceipt(orderId) {
    if (!confirm('确认已收到商品吗？')) {
        return;
    }
    
    try {
        await updateOrderStatus(orderId, 'completed');
        showToast('确认收货成功！');
        loadProfileOrders(); // 刷新订单列表
    } catch (error) {
        console.error('确认收货失败:', error);
        showToast('确认收货失败，请重试');
    }
}

// 写评价
function writeReview(orderId) {
    // 创建评价模态框
    const modalHtml = `
        <div id="review-modal" class="modal">
            <div class="modal-content review-content">
                <span class="close" onclick="hideModal('review-modal')">&times;</span>
                <h3>订单评价</h3>
                <form id="review-form" onsubmit="submitReview(event, '${orderId}')">
                    <div class="rating">
                        <span>商品评分：</span>
                        <div class="stars">
                            <input type="radio" id="star5" name="rating" value="5" required>
                            <label for="star5">★</label>
                            <input type="radio" id="star4" name="rating" value="4">
                            <label for="star4">★</label>
                            <input type="radio" id="star3" name="rating" value="3">
                            <label for="star3">★</label>
                            <input type="radio" id="star2" name="rating" value="2">
                            <label for="star2">★</label>
                            <input type="radio" id="star1" name="rating" value="1">
                            <label for="star1">★</label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="review-content">评价内容：</label>
                        <textarea id="review-content" required></textarea>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-btn">提交评价</button>
                        <button type="button" class="cancel-btn" onclick="hideModal('review-modal')">取消</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // 添加模态框到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // 显示模态框
    showModal('review-modal');
}

// 提交评价
async function submitReview(event, orderId) {
    event.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const content = document.getElementById('review-content').value;
    
    try {
        // 创建评价对象
        const Review = AV.Object.extend('Review');
        const review = new Review();
        
        review.set('orderId', orderId);
        review.set('rating', parseInt(rating));
        review.set('content', content);
        review.set('user', AV.User.current());
        
        await review.save();
        
        hideModal('review-modal');
        showToast('评价提交成功！');
        
        // 更新订单状态为已评价
        const query = new AV.Query('Order');
        query.equalTo('orderId', orderId);
        const order = await query.first();
        if (order) {
            order.set('hasReview', true);
            await order.save();
            loadProfileOrders(); // 刷新订单列表
        }
        
    } catch (error) {
        console.error('提交评价失败:', error);
        showToast('提交评价失败，请重试');
    }
}

// 修改显示订单模态框函数
function showOrderModal() {
    if (!checkLoginStatus()) {
        return;
    }
    
    if (Object.keys(cart).length === 0) {
        showToast('购物车是空的，请先添加商品');
        return;
    }
    
    // 显示模态框
    showModal('order-modal');
    
    // 等待模态框完全显示后再填充内容
    setTimeout(() => {
        const orderItems = document.getElementById('order-items');
        const orderTotal = document.getElementById('order-total');
        
        // 填充订单明细
        orderItems.innerHTML = '';
        let total = 0;
        
        for (let itemKey in cart) {
            const item = cart[itemKey];
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <span>${item.name}（${item.price}元/斤） × ${item.quantity}</span>
                <span>¥${itemTotal}</span>
            `;
            orderItems.appendChild(itemElement);
        }
        
        orderTotal.textContent = `总计: ¥${total}`;
        
        // 填充收货信息（如果存在）
        const currentUser = AV.User.current();
        if (currentUser) {
            const shippingName = currentUser.get('defaultShippingName');
            const shippingPhone = currentUser.get('defaultShippingPhone');
            const shippingAddress = currentUser.get('defaultShippingAddress');
            
            const nameInput = document.getElementById('order-name');
            const phoneInput = document.getElementById('order-phone');
            const addressInput = document.getElementById('order-address');
            
            // 只有当所有收货信息都存在时才自动填充
            if (shippingName && shippingPhone && shippingAddress) {
                nameInput.value = shippingName;
                phoneInput.value = shippingPhone;
                addressInput.value = shippingAddress;
                
                // 添加提示信息
                showToast('已自动填充默认收货信息');
            } else {
                // 清空表单
                nameInput.value = '';
                phoneInput.value = '';
                addressInput.value = '';
            }
        }
    }, 100); // 给一个小延迟确保模态框已经显示
}

// 修改提交订单函数
async function submitOrder(event) {
    event.preventDefault();
    
    try {
        // 检查登录状态
        const currentUser = AV.User.current();
        if (!currentUser) {
            showToast('请先登录');
            return;
        }

        // 检查购物车是否为空
        if (Object.keys(cart).length === 0) {
            showToast('购物车是空的，请先添加商品');
            return;
        }

        // 获取表单数据
        const name = document.getElementById('order-name').value.trim();
        const phone = document.getElementById('order-phone').value.trim();
        const address = document.getElementById('order-address').value.trim();
        const note = document.getElementById('order-note').value.trim();
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

        // 验证必填字段
        if (!name || !phone || !address) {
            showToast('请填写完整的收货信息');
            return;
        }

        // 保存用户信息到 localStorage
        const userInfo = { name, phone, address };
        localStorage.setItem('lastOrderInfo', JSON.stringify(userInfo));
        
        // 创建订单对象
        const Order = AV.Object.extend('Order');
        const order = new Order();
        
        // 生成订单号
        const orderId = generateOrderId();
        
        // 计算总金额
        let totalAmount = 0;
        const items = [];
        for (let itemKey in cart) {
            const item = cart[itemKey];
            const itemTotal = item.price * item.quantity;
            totalAmount += itemTotal;
            items.push({
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                total: itemTotal
            });
        }
        
        // 设置订单数据
        order.set({
            orderId,
            userName: name,
            contact: phone,
            address,
            note,
            items,
            totalAmount,
            status: 'pending',
            user: currentUser,
            paymentMethod,
            orderTime: new Date()
        });
        
        // 保存订单
        await order.save();
        
        // 清空购物车
        cart = {};
        updateCart();
        
        // 关闭订单模态框
        hideModal('order-modal');
        
        // 显示成功提示
        showToast('订单提交成功！');
        
        // 刷新订单列表
        await loadProfileOrders();
        
        // 跳转到支付页面
        await handlePayment(orderId, totalAmount, paymentMethod);
        
    } catch (error) {
        console.error('提交订单失败:', error);
        showToast('提交订单失败，请重试');
    }
}

// 生成订单号
function generateOrderId() {
    const now = new Date();
    const timestamp = now.getTime().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORDER${timestamp}${random}`;
}

// 管理员登录检查
async function checkAdminLogin(email, password) {
    try {
        console.log('尝试管理员登录:', email); // 调试日志
        const user = await AV.User.logIn(email, password);
        console.log('登录成功,用户信息:', user.toJSON()); // 调试日志
        
        if (user) {
            // 检查是否是管理员账号
            const isAdmin = user.get('isAdmin');
            console.log('是否是管理员:', isAdmin); // 调试日志
            
            if (isAdmin) {
                // 设置管理员登录状态
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('adminUser', JSON.stringify({
                    username: user.get('username'),
                    email: user.get('email')
                }));
                
                showToast('管理员登录成功！');
                // 跳转到管理后台
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1000);
                return true;
            } else {
                throw new Error('不是管理员账号');
            }
        }
        throw new Error('登录失败');
    } catch (error) {
        console.error('管理员登录失败:', error);
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            if (error.message === '不是管理员账号') {
                errorDiv.textContent = '该账号不是管理员账号';
            } else if (error.code === 211) {
                errorDiv.textContent = '该账号不存在，请先注册';
            } else if (error.code === 210) {
                errorDiv.textContent = '密码错误，请重试';
            } else {
                errorDiv.textContent = getErrorMessage(error.code || error.message);
            }
        }
        throw error;
    }
}

// 订单通知相关功能
class OrderNotification {
    constructor() {
        this.hasPermission = false;
        this.init();
    }

    async init() {
        try {
            // 检查浏览器是否支持通知
            if (!("Notification" in window)) {
                console.log('该浏览器不支持通知功能');
                return;
            }

            // 检查通知权限
            if (Notification.permission === "granted") {
                this.hasPermission = true;
            } else if (Notification.permission !== "denied") {
                const permission = await Notification.requestPermission();
                this.hasPermission = permission === "granted";
            }
        } catch (error) {
            console.error('初始化通知功能失败:', error);
        }
    }

    // 发送通知
    sendNotification(title, options = {}) {
        if (!this.hasPermission) return;
        
        try {
            const notification = new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });

            // 点击通知时的处理
            notification.onclick = () => {
                window.focus();
                if (options.url) {
                    window.location.href = options.url;
                }
                notification.close();
            };
            } catch (error) {
            console.error('发送通知失败:', error);
        }
    }
}

// 创建通知实例
const orderNotification = new OrderNotification();

// 修改订单状态变更函数，添加通知
async function updateOrderStatus(orderId, newStatus) {
    try {
        const query = new AV.Query('Order');
        query.equalTo('orderId', orderId);
        const order = await query.first();
        
        if (order) {
            const oldStatus = order.get('status');
            order.set('status', newStatus);
            await order.save();
            
            // 发送状态变更通知
            const statusText = getOrderStatusText(newStatus);
            const notificationTitle = `订单状态更新`;
            const notificationOptions = {
                body: `订单 ${orderId} 状态已更新为：${statusText}`,
                url: '#profile',
                requireInteraction: true
            };
            
            orderNotification.sendNotification(notificationTitle, notificationOptions);
            
            // 特定状态的额外通知
            switch (newStatus) {
                case 'processing':
                    orderNotification.sendNotification('订单处理中', {
                        body: '我们正在处理您的订单，请耐心等待',
                        url: '#profile'
                    });
                    break;
                case 'shipping':
                    orderNotification.sendNotification('订单已发货', {
                        body: '您的订单已发货，请注意查收',
                        url: '#profile'
                    });
                    break;
                case 'completed':
                    setTimeout(() => {
                        orderNotification.sendNotification('订单评价提醒', {
                            body: '订单已完成，欢迎您对本次购物体验进行评价',
                            url: '#profile'
                        });
                    }, 1000 * 60 * 60 * 24); // 24小时后提醒评价
                    break;
            }
            
            return true;
        }
        return false;
    } catch (error) {
        console.error('更新订单状态失败:', error);
        throw error;
    }
}

// 添加定时检查订单状态的功能
function startOrderStatusCheck() {
    // 每5分钟检查一次未完成的订单
    setInterval(async () => {
        if (!AV.User.current()) return;
        
        try {
            const query = new AV.Query('Order');
            query.equalTo('user', AV.User.current());
            query.notEqualTo('status', 'completed');
            query.notEqualTo('status', 'cancelled');
            
            const orders = await query.find();
            orders.forEach(order => {
                const status = order.get('status');
                const orderId = order.get('orderId');
                
                // 检查是否需要更新状态
                checkOrderStatusUpdate(orderId, status);
            });
        } catch (error) {
            console.error('检查订单状态失败:', error);
        }
    }, 1000 * 60 * 5); // 5分钟
}

// 在页面加载时启动订单状态检查
document.addEventListener('DOMContentLoaded', () => {
    // ... existing code ...
    startOrderStatusCheck();
});

// 添加支付处理相关函数
async function handlePayment(orderId, amount, paymentMethod) {
    try {
        // 创建支付订单
        const Payment = AV.Object.extend('Payment');
        const payment = new Payment();
        
        payment.set('orderId', orderId);
        payment.set('amount', amount);
        payment.set('method', paymentMethod);
        payment.set('status', 'pending');
        payment.set('user', AV.User.current());
        
        await payment.save();
        
        // 显示支付二维码
        showPaymentModal(orderId, amount, paymentMethod);
        
        // 开始轮询支付状态
        startPaymentCheck(payment.id);
        
    } catch (error) {
        console.error('创建支付订单失败:', error);
        showToast('创建支付订单失败，请重试');
    }
}

// 显示支付二维码
function showPaymentModal(orderId, amount, paymentMethod) {
    const modal = document.getElementById('payment-modal');
    const qrcodeDiv = document.getElementById('qrcode');
    const amountSpan = document.getElementById('payment-amount');
    const orderIdSpan = document.getElementById('payment-order-id');
    
    // 清空原有二维码
    qrcodeDiv.innerHTML = '';
    
    // 更新支付信息
    amountSpan.textContent = `¥${amount}`;
    orderIdSpan.textContent = orderId;
    
    // 生成支付二维码
    // 这里使用一个示例URL，实际项目中需要替换为真实的支付URL
    const paymentUrl = `https://example.com/pay/${orderId}`;
    new QRCode(qrcodeDiv, {
        text: paymentUrl,
        width: 180,
        height: 180,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // 显示支付模态框
    showModal('payment-modal');
}

// 开始检查支付状态
function startPaymentCheck(paymentId) {
    // 每3秒检查一次支付状态
    const checkInterval = setInterval(async () => {
        try {
            const query = new AV.Query('Payment');
            const payment = await query.get(paymentId);
            const status = payment.get('status');
            
            if (status === 'success') {
                // 支付成功
                clearInterval(checkInterval);
                handlePaymentSuccess(payment.get('orderId'));
            } else if (status === 'failed') {
                // 支付失败
                clearInterval(checkInterval);
                handlePaymentFailure(payment.get('orderId'));
            }
            // pending 状态继续等待
            
        } catch (error) {
            console.error('检查支付状态失败:', error);
            clearInterval(checkInterval);
            showToast('检查支付状态失败，请刷新页面重试');
        }
    }, 3000);
    
    // 保存interval id，用于取消检查
    window.paymentCheckInterval = checkInterval;
}

// 手动检查支付状态
async function checkPaymentStatus() {
    const orderId = document.getElementById('payment-order-id').textContent;
    try {
        const query = new AV.Query('Payment');
        query.equalTo('orderId', orderId);
        const payment = await query.first();
        
        if (payment) {
            const status = payment.get('status');
            if (status === 'success') {
                handlePaymentSuccess(orderId);
            } else if (status === 'failed') {
                handlePaymentFailure(orderId);
            } else {
                showToast('支付处理中，请稍候...');
            }
        }
    } catch (error) {
        console.error('检查支付状态失败:', error);
        showToast('检查支付状态失败，请重试');
    }
}

// 取消支付
function cancelPayment() {
    if (window.paymentCheckInterval) {
        clearInterval(window.paymentCheckInterval);
    }
    hideModal('payment-modal');
    showToast('已取消支付');
}

// 处理支付成功
async function handlePaymentSuccess(orderId) {
    try {
        // 更新订单状态
        await updateOrderStatus(orderId, 'processing');
        
        // 显示成功提示
        const paymentStatus = document.querySelector('.payment-status');
        paymentStatus.innerHTML = `
            <div class="payment-success">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>支付成功！</h3>
            <p>我们将尽快处理您的订单</p>
        `;
        
        // 3秒后关闭支付窗口并跳转到订单页面
    setTimeout(() => {
            hideModal('payment-modal');
            document.querySelector('a[href="#profile"]').click();
        }, 3000);
    } catch (error) {
        console.error('更新订单状态失败:', error);
        showToast('支付成功，但更新订单状态失败，请联系客服');
    }
}

// 处理支付失败
function handlePaymentFailure(orderId) {
    showToast('支付失败，请重试或选择其他支付方式');
    hideModal('payment-modal');
}

// 修改退出登录函数
async function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        try {
            // 执行退出登录
            await AV.User.logOut();
            isLoggedIn = false;
            updateUserMenu();
            cart = {};
            updateCart();
            
            // 切换到首页
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById('home').classList.add('active');
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelector('a[href="#home"]').classList.add('active');
            
            // 修改 URL
            window.location.hash = '#home';
            
            // 滚动到顶部
            window.scrollTo({
                top: 0,
                behavior: 'instant'
            });
            
            showToast('已退出登录');
        } catch (error) {
            console.error('退出登录失败:', error);
            showToast('退出登录失败，请重试');
        }
    }
}

// 初始化所有事件监听器
function initializeEventListeners() {
    // 导航链接点击处理
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            // 如果是登录或注册按钮，不阻止默认行为
            if (link.classList.contains('login-btn') || link.classList.contains('register-btn')) {
                return;
            }
            
            e.preventDefault();
            const hash = link.getAttribute('href');
            
            // 如果是个人中心页面，先检查登录状态
            if (hash === '#profile' && !isLoggedIn) {
                showToast('请先登录');
                showModal('loginModal');
                return;
            }
            
            // 更新 URL
            window.location.hash = hash;
        });
    });

    // 监听浏览器前进后退按钮
    window.addEventListener('popstate', handleHash);

    // 登录按钮点击事件
    document.querySelector('.login-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showModal('loginModal');
    });

    // 注册按钮点击事件
    document.querySelector('.register-btn').addEventListener('click', function(e) {
        e.preventDefault();
        showModal('registerModal');
    });

    // 添加模态框关闭按钮事件
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal.id);
        });
    });

    // 添加点击模态框外部关闭的事件
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });

    // 阻止模态框内容点击事件冒泡
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // 登录表单提交
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.email.value;
        const password = this.password.value;
        const errorDiv = document.getElementById('login-error');
        
        try {
            // 先尝试管理员登录
            if (email.endsWith('@admin.com')) {
                try {
                    await checkAdminLogin(email, password);
                    return; // 如果是管理员登录成功，直接返回
                } catch (error) {
                    return;
                }
            }

            // 普通用户登录
            const user = await AV.User.logIn(email, password);
            if (user) {
                // 再次检查确保不是管理员账号
                if (user.get('isAdmin')) {
                    errorDiv.textContent = '请使用管理员登录入口';
                    return;
                }

                isLoggedIn = true;
                
                // 先隐藏模态框
                hideModal('loginModal');
                
                // 等待模态框完全关闭
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 更新用户菜单
                updateUserMenu(user.get('username') || user.get('email'));
                
                // 获取最新的用户数据
                await user.fetch();
                
                // 更新个人中心信息
                document.getElementById('profile-username').textContent = user.get('username') || '未设置';
                document.getElementById('profile-email').textContent = user.get('email');
                document.getElementById('profile-created').textContent = user.get('createdAt').toLocaleString();
                
                // 更新收货信息
                document.getElementById('shipping-name').textContent = user.get('defaultShippingName') || '未设置';
                document.getElementById('shipping-phone').textContent = user.get('defaultShippingPhone') || '未设置';
                document.getElementById('shipping-address').textContent = user.get('defaultShippingAddress') || '未设置';
                
                // 重置表单
                this.reset();
                
                // 加载购物车
                loadCart();
                
                // 显示登录成功提示
                showToast('登录成功！');
                
                // 切换到首页
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById('home').classList.add('active');
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.querySelector('a[href="#home"]').classList.add('active');
                
                // 修改 URL
                window.location.hash = '#home';
                
                // 滚动到顶部
                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
            }
        } catch (error) {
            console.error('登录错误:', error);
            errorDiv.textContent = getErrorMessage(error.code || error.message);
        }
    });

    // 注册表单提交
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = this.username.value;
        const email = this.email.value;
        const password = this.password.value;
        const confirmPassword = this.confirmPassword.value;
        const errorDiv = document.getElementById('register-error');

        if (password !== confirmPassword) {
            errorDiv.textContent = '两次输入的密码不一致！';
            return;
        }

        try {
            const user = new AV.User();
            user.setUsername(username);
            user.setPassword(password);
            user.setEmail(email);
            
            // 检查是否是管理员邮箱
            if (email.endsWith('@admin.com')) {
                user.set('isAdmin', true);
            }
            
            await user.signUp();
            isLoggedIn = true;
            
            // 如果是管理员账号，直接跳转到管理后台
            if (email.endsWith('@admin.com')) {
                sessionStorage.setItem('isAdmin', 'true');
                sessionStorage.setItem('adminUser', JSON.stringify({
                    username: username,
                    email: email
                }));
                
                showToast('管理员账号注册成功！');
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 1500);
                return;
            }
            
            // 普通用户注册后的处理
            hideModal('registerModal');
            await new Promise(resolve => setTimeout(resolve, 300));
            updateUserMenu(username);
            document.getElementById('profile-username').textContent = username;
            document.getElementById('profile-email').textContent = email;
            document.getElementById('profile-created').textContent = new Date().toLocaleString();
            this.reset();
            showToast('注册成功！');
            
            // 切换到首页
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                document.getElementById('home').classList.add('active');
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.querySelector('a[href="#home"]').classList.add('active');
            history.replaceState(null, '', '#home');
                window.scrollTo({
                    top: 0,
                    behavior: 'instant'
                });
            } catch (error) {
            console.error('注册错误:', error);
            errorDiv.textContent = getErrorMessage(error.code || error.message);
        }
    });
}

// 显示编辑收货信息模态框
function showEditShippingModal() {
    const currentUser = AV.User.current();
    if (!currentUser) {
        showToast('请先登录');
        return;
    }

    // 填充现有收货信息
    document.getElementById('edit-shipping-name').value = currentUser.get('defaultShippingName') || '';
    document.getElementById('edit-shipping-phone').value = currentUser.get('defaultShippingPhone') || '';
    document.getElementById('edit-shipping-address').value = currentUser.get('defaultShippingAddress') || '';

    showModal('shipping-modal');
}

// 保存收货信息
async function saveShippingInfo(event) {
    event.preventDefault();
    
    try {
        const currentUser = AV.User.current();
        if (!currentUser) {
            showToast('请先登录');
            return;
        }

        const name = document.getElementById('edit-shipping-name').value.trim();
        const phone = document.getElementById('edit-shipping-phone').value.trim();
        const address = document.getElementById('edit-shipping-address').value.trim();

        // 更新用户信息
        currentUser.set('defaultShippingName', name);
        currentUser.set('defaultShippingPhone', phone);
        currentUser.set('defaultShippingAddress', address);
        
        await currentUser.save();

        hideModal('shipping-modal');
        showToast('收货信息保存成功！');

        // 重新加载个人页面以显示最新信息
        await loadProfileOrders();

    } catch (error) {
        console.error('保存收货信息失败:', error);
        showToast('保存失败，请重试');
    }
} 