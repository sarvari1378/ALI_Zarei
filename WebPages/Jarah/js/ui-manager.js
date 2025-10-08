// js/ui-manager.js (نسخه نهایی با دیباگینگ داخلی)

// --- توابع مربوط به سایدبار ---
export function initializeSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('uploadQueueSidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // این بخش به ما دقیقا می‌گوید کدام المان پیدا نشده است
    if (!hamburgerBtn) { console.error("Hamburger Button not found!"); return; }
    if (!sidebar) { console.error("Sidebar container not found!"); return; }
    if (!closeSidebarBtn) { console.error("Sidebar Close Button not found!"); return; }
    if (!sidebarOverlay) { console.error("Sidebar Overlay not found!"); return; }

    const openSidebar = () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('visible');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('visible');
    };

    hamburgerBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });
}

// --- توابع مربوط به نوتیفیکیشن Toast ---
export function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// --- توابع مربوط به UI صف آپلود ---
export function addQueueItemToUI(task) {
    const uploadQueueList = document.getElementById("uploadQueueList");
    if (!uploadQueueList) return;
    if (uploadQueueList.querySelector('.empty-message')) {
        uploadQueueList.innerHTML = '';
    }
    const li = document.createElement('li');
    li.className = 'queue-item';
    li.id = `task-${task.id}`;
    li.innerHTML = `
        <span class="item-icon ${task.status}"></span>
        <span class="item-name">محصول: ${task.data.code}</span>
        <span class="item-status ${task.status}">${task.status}</span>
    `;
    uploadQueueList.prepend(li);
}

export function updateQueueItemInUI(task) {
    const uploadQueueList = document.getElementById("uploadQueueList");
    if (!uploadQueueList) return;
    const li = document.getElementById(`task-${task.id}`);
    if (li) {
        li.querySelector('.item-icon').className = `item-icon ${task.status}`;
        const statusSpan = li.querySelector('.item-status');
        statusSpan.className = `item-status ${task.status}`;
        statusSpan.textContent = task.status;
    }
}

export function showEmptyQueueMessage() {
    const uploadQueueList = document.getElementById("uploadQueueList");
    if (uploadQueueList && uploadQueueList.children.length === 0) {
        uploadQueueList.innerHTML = '<li class="empty-message">هیچ آپلودی در صف نیست.</li>';
    }
}