// 初始化 LeanCloud
AV.init({
    appId: "4Na9hFq3hmvskpzN5f4ScDrD-gzGzoHsz",
    appKey: "94ZxCP9PxFTF2wNi3nISSQoc",
    serverURL: "https://4na9hfq3.lc-cn-n1-shared.com"
});

document.addEventListener('DOMContentLoaded', function() {
    // 检查是否是管理员登录
    function checkAdminLogin() {
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (!isAdmin) {
            alert('请先登录管理员账号');
            window.location.href = 'index.html';
        }
    }
    
    // 页面加载时检查登录状态
    checkAdminLogin();
    
    // 导航切换
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加新的活动状态
            link.classList.add('active');
            const targetId = link.getAttribute('href').slice(1);
            document.getElementById(targetId).classList.add('active');

            // 如果切换到订单管理页面，加载订单数据
            if (targetId === 'orders') {
                loadOrders();
            }
        });
    });

    // 订单筛选功能
    const orderFilter = document.querySelector('.order-filters select');
    if (orderFilter) {
        orderFilter.addEventListener('change', function() {
            loadOrders(this.value);
        });
    }

    // 订单日期筛选
    const dateFilter = document.querySelector('.date-filter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            loadOrders(orderFilter.value, this.value);
        });
    }

    // 退出登录
    document.querySelector('.logout').addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('确定要退出管理后台吗？')) {
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        }
    });

    // 加载示例数据
    loadSampleData();
});

// 加载示例数据
function loadSampleData() {
    // 加载商品列表
    const productTable = document.querySelector('.product-table tbody');
    if (productTable) {
        productTable.innerHTML = generateSampleProducts();
    }

    // 加载订单列表
    const orderTable = document.querySelector('.order-table tbody');
    if (orderTable) {
        orderTable.innerHTML = generateSampleOrders();
    }

    // 加载用户列表
    const userTable = document.querySelector('.user-table tbody');
    if (userTable) {
        userTable.innerHTML = generateSampleUsers();
    }
}

// 生成示例数据的函数
function generateSampleProducts() {
    const products = [
        { id: 1, name: '法国红酒', price: 299, stock: 100, status: '在售' },
        { id: 2, name: '茅台白酒', price: 1999, stock: 50, status: '在售' },
        { id: 3, name: '精酿啤酒', price: 39, stock: 200, status: '在售' }
    ];

    return products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>¥${p.price}</td>
            <td>${p.stock}</td>
            <td>${p.status}</td>
            <td>
                <button onclick="editProduct(${p.id})">编辑</button>
                <button onclick="deleteProduct(${p.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 加载订单数据
async function loadOrders(status = 'all', date = '') {
    const orderTable = document.querySelector('.order-table tbody');
    if (!orderTable) return;

    try {
        const query = new AV.Query('Order');
        
        // 添加状态筛选
        if (status !== 'all') {
            query.equalTo('status', status);
        }
        
        // 添加日期筛选
        if (date) {
            const selectedDate = new Date(date);
            const nextDate = new Date(selectedDate);
            nextDate.setDate(nextDate.getDate() + 1);
            
            query.greaterThanOrEqualTo('createdAt', selectedDate);
            query.lessThan('createdAt', nextDate);
        }

        query.descending('createdAt');
        const orders = await query.find();
        
        orderTable.innerHTML = orders.map(order => {
            const data = order.toJSON();
            return `
                <tr>
                    <td>${data.orderId}</td>
                    <td>${data.userName}</td>
                    <td>¥${data.totalAmount}</td>
                    <td>
                        <span class="status-badge ${data.status}">
                            ${getStatusText(data.status)}
                        </span>
                    </td>
                    <td>${new Date(data.createdAt).toLocaleString()}</td>
                    <td>
                        <button onclick="viewOrder('${order.id}')" class="view-btn">查看</button>
                        <button onclick="updateOrderStatus('${order.id}')" class="update-btn">更新状态</button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('加载订单失败:', error);
        orderTable.innerHTML = '<tr><td colspan="6">加载订单失败，请重试</td></tr>';
    }
}

// 查看订单详情
async function viewOrder(orderId) {
    try {
        const query = new AV.Query('Order');
        const order = await query.get(orderId);
        const data = order.toJSON();
        
        const modalContent = `
            <div class="order-detail">
                <h3>订单详情 (${data.orderId})</h3>
                <div class="order-info">
                    <p><strong>客户名称：</strong>${data.userName}</p>
                    <p><strong>联系方式：</strong>${data.contact}</p>
                    <p><strong>收货地址：</strong>${data.address}</p>
                    <p><strong>下单时间：</strong>${new Date(data.createdAt).toLocaleString()}</p>
                    <p><strong>订单状态：</strong>${getStatusText(data.status)}</p>
                </div>
                <div class="order-items">
                    <h4>商品清单</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>商品名称</th>
                                <th>单价</th>
                                <th>数量</th>
                                <th>小计</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>¥${item.price}</td>
                                    <td>${item.quantity}</td>
                                    <td>¥${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="order-total">
                    <p><strong>订单总额：</strong>¥${data.totalAmount}</p>
                </div>
            </div>
        `;
        
        showModal(modalContent);
    } catch (error) {
        console.error('获取订单详情失败:', error);
        alert('获取订单详情失败，请重试');
    }
}

// 更新订单状态
async function updateOrderStatus(orderId) {
    try {
        const query = new AV.Query('Order');
        const order = await query.get(orderId);
        const currentStatus = order.get('status');
        
        const newStatus = await showStatusModal(currentStatus);
        if (newStatus) {
            order.set('status', newStatus);
            await order.save();
            showToast('订单状态更新成功');
            loadOrders(); // 重新加载订单列表
        }
    } catch (error) {
        console.error('更新订单状态失败:', error);
        alert('更新订单状态失败，请重试');
    }
}

// 显示状态选择模态框
function showStatusModal(currentStatus) {
    return new Promise((resolve) => {
        const modalContent = `
            <div class="status-modal">
                <h3>更新订单状态</h3>
                <select id="newStatus">
                    <option value="pending" ${currentStatus === 'pending' ? 'selected' : ''}>待处理</option>
                    <option value="processing" ${currentStatus === 'processing' ? 'selected' : ''}>处理中</option>
                    <option value="completed" ${currentStatus === 'completed' ? 'selected' : ''}>已完成</option>
                    <option value="cancelled" ${currentStatus === 'cancelled' ? 'selected' : ''}>已取消</option>
                </select>
                <div class="modal-buttons">
                    <button onclick="updateStatus()">确认</button>
                    <button onclick="closeModal()">取消</button>
                </div>
            </div>
        `;
        
        showModal(modalContent);
        
        window.updateStatus = function() {
            const newStatus = document.getElementById('newStatus').value;
            closeModal();
            resolve(newStatus);
        };
        
        window.closeModal = function() {
            closeModal();
            resolve(null);
        };
    });
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 显示模态框
function showModal(content) {
    let modal = document.querySelector('.modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeModal()">&times;</span>
            ${content}
        </div>
    `;
    
    modal.style.display = 'block';
}

// 关闭模态框
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示提示消息
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// 添加其他必要的函数... 