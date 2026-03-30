// --- MASTER PRICE LIST & CONFIG ---
const standardRates = {
    'DVR': 3500, 'NVR': 4500, 'Camera': 1500, 'Power Supply': 800,
    'Hard-Disk': 3500, 'Cable': 15, 'BNC Connector': 20, 'DC Connector': 15,
    'PVC Box': 60, 'DVR Rack': 1200, 'Router': 2500, '4/5 G': 3500,
    'POE Switch': 2500, 'GIGA Switch': 3500, 'CAT 6 Lan Cable': 25,
    'POE Waterproof Rack': 1500, 'NVR Rack': 1500, 'HDMI Cable': 350,
    'Splitter': 500, 'Joinder': 100, 'Cable Tie Packet': 150,
    'RJ 45 Connector': 10, 'Wire Fitting Charges': 10,
    'Installation Charges': 500, 'Travelling Charges': 300
};

// --- MOBILE NAVIGATION ---
function switchTab(tab) {
    const inputPanel = document.getElementById('input-panel');
    const previewPanel = document.querySelector('.preview-panel');
    const btnEdit = document.getElementById('btn-edit');
    const btnPreview = document.getElementById('btn-preview');

    if (tab === 'edit') {
        inputPanel.classList.add('active');
        previewPanel.classList.remove('active');
        btnEdit.classList.add('active');
        btnPreview.classList.remove('active');
    } else {
        inputPanel.classList.remove('active');
        previewPanel.classList.add('active');
        btnEdit.classList.remove('active');
        btnPreview.classList.add('active');
    }
}

async function sharePDF() {
    const element = document.getElementById('bill-preview');
    const name = document.getElementById('custName').value || "Client";
    const fileName = `PERFECT_CCTV_QUOTE_${name.replace(/\s+/g, '_')}.pdf`;

    // Options for html2pdf
    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        // Show loading state or alert
        const btn = document.querySelector('.share-pdf-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
        btn.disabled = true;

        const worker = html2pdf().set(opt).from(element);
        const blob = await worker.output('blob');
        
        const file = new File([blob], fileName, { type: 'application/pdf' });

        if (navigator.share) {
            await navigator.share({
                files: [file],
                title: 'CCTV Quotation',
                text: `Quotation for ${name} from Perfect CCTV.`
            });
        } else {
            // Fallback for desktop: download the file
            html2pdf().set(opt).from(element).save();
            alert("Share feature not supported on this browser. File has been downloaded instead.");
        }
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (error) {
        console.error('Sharing failed:', error);
        alert("Could not generate or share PDF. Please try the Print/Save option.");
        document.querySelector('.share-pdf-btn').disabled = false;
        document.querySelector('.share-pdf-btn').innerHTML = '<i class="fas fa-share-nodes"></i> Share PDF';
    }
}

// --- INITIALIZATION ---
let currentQuoteNo = parseInt(localStorage.getItem('perfect_cctv_quote_count')) || 1;
let currentTheme = localStorage.getItem('perfect_cctv_theme') || 'default';
document.getElementById('billTheme').value = currentTheme;
applyTheme(currentTheme);

updateQuoteDisplay();
loadHistory();
document.getElementById('quotDate').valueAsDate = new Date();
generateQuickSelect();

function changeTheme() {
    const theme = document.getElementById('billTheme').value;
    localStorage.setItem('perfect_cctv_theme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    const container = document.querySelector('.app-container');
    container.setAttribute('data-theme', theme);
}

function updateQuoteDisplay() {
    const docType = document.getElementById('docType').value;
    const prefix = docType === 'bill' ? 'INV' : 'QT';
    const formatted = `${prefix}-${String(currentQuoteNo).padStart(3, '0')}`;
    document.getElementById('quotNo').value = formatted;
    document.getElementById('p-quotNo').innerText = `#${formatted}`;
    document.getElementById('label-docNo').innerText = docType === 'bill' ? 'Invoice No.' : 'Quote No.';
}

function updateDocType() {
    updateQuoteDisplay();
    updatePreview();
}

// --- ITEM MANAGEMENT ---
function generateQuickSelect() {
    const grid = document.getElementById('quickSelectGrid');
    grid.innerHTML = '';
    Object.keys(standardRates).forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-item' + (['Wire Fitting Charges', 'Installation Charges', 'Travelling Charges'].includes(item) ? ' highlight' : '');
        btn.innerText = item;
        btn.onclick = () => quickAdd(item, standardRates[item]);
        grid.appendChild(btn);
    });
}

function filterItems() {
    const q = document.getElementById('itemSearch').value.toLowerCase();
    document.querySelectorAll('.quick-item').forEach(btn => {
        btn.style.display = btn.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
}

function quickAdd(name, rate) {
    const rows = document.querySelectorAll('.item-row');
    const lastRow = rows[rows.length - 1];
    const descInput = lastRow.querySelector('.item-desc');
    
    if (descInput.value === "") {
        descInput.value = name;
        lastRow.querySelector('.item-rate').value = rate;
        updatePreview();
    } else if (rows.length < 20) {
        addItem(name, rate);
    } else {
        alert("Maximum 20 items reached.");
    }
}

function addItem(name = "", rate = "") {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length < 20) {
        const container = document.getElementById('itemsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'item-row animated fadeIn';
        newRow.innerHTML = `
            <input type="text" class="item-desc" placeholder="Item" value="${name}" oninput="updatePreview()">
            <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
            <input type="number" class="item-rate" placeholder="Rate" value="${rate}" oninput="updatePreview()">
            <button class="remove-btn" onclick="removeItem(this)"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(newRow);
        updatePreview();
    }
}

function removeItem(btn) {
    if (document.querySelectorAll('.item-row').length > 1) {
        btn.parentElement.remove();
        updatePreview();
    }
}

// --- CORE PREVIEW & CALCULATIONS ---
function updatePreview() {
    // 0. Document Type logic
    const docType = document.getElementById('docType').value;
    const previewContainer = document.getElementById('bill-preview');
    const badgeLabel = document.querySelector('.quote-badge .label');
    const estTitle = document.querySelector('.estimate-title');

    if (docType === 'bill') {
        previewContainer.classList.add('bill-mode');
        badgeLabel.innerText = "INVOICE";
        estTitle.innerText = "TAX INVOICE";
    } else {
        previewContainer.classList.remove('bill-mode');
        badgeLabel.innerText = "QUOTATION";
        estTitle.innerText = "ESTIMATE / QUOTATION";
    }

    // 1. Details
    const name = document.getElementById('custName').value || "Client Name";
    const address = document.getElementById('custAddress').value || "Installation Address";
    const contact = document.getElementById('custContact').value || "--";
    const dateInput = document.getElementById('quotDate').value;
    const discount = parseFloat(document.getElementById('discountAmt').value) || 0;

    document.getElementById('p-custName').innerText = name;
    document.getElementById('p-custAddress').innerText = address;
    document.getElementById('p-custContact').innerText = "Contact: " + contact;
    document.getElementById('p-date').innerText = formatDate(dateInput);

    // 2. Items
    const rows = document.querySelectorAll('.item-row');
    document.getElementById('item-count').innerText = `${rows.length}/20`;
    const previewBody = document.getElementById('p-itemsBody');
    previewBody.innerHTML = '';
    
    let subtotal = 0;
    rows.forEach((row, index) => {
        const desc = row.querySelector('.item-desc').value || "--";
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        subtotal += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index + 1}</td><td><strong>${desc}</strong></td><td>${qty}</td><td>₹${rate.toLocaleString('en-IN')}</td><td>₹${amount.toLocaleString('en-IN')}</td>`;
        previewBody.appendChild(tr);
    });

    const grandTotal = subtotal - discount;

    document.getElementById('p-subtotal').innerText = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('p-discount').innerText = `-₹${discount.toLocaleString('en-IN')}`;
    document.getElementById('p-grandtotal').innerText = `₹${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('p-discRow').style.display = discount > 0 ? 'flex' : 'none';

    // 3. Amount in Words
    document.getElementById('p-amountWords').innerText = convertNumberToWords(grandTotal) + " Only";

    // 4. Terms
    document.getElementById('p-terms').innerHTML = document.getElementById('termsCond').value.split('\n').map(t => `<li>${t}</li>`).join('');
    
    // Set document title for professional PDF filename
    document.title = `PERFECT_CCTV_QUOTE_${name.replace(/\s+/g, '_')}_${document.getElementById('quotNo').value}`;
}

// --- UTILITIES ---
function formatDate(dateStr) {
    if (!dateStr) return "--/--/----";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

function convertNumberToWords(amount) {
    if (amount === 0) return "Rupees Zero";
    const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    
    function convert(n) {
        if (n < 20) return words[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + words[n % 10] : "");
        if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
        return "";
    }
    return "Rupees " + convert(Math.floor(amount));
}

// --- STORAGE & PRINT ---
function printAndSave() {
    const name = document.getElementById('custName').value;
    if (!name) { alert("Please enter client name first."); return; }
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('perfect_cctv_history')) || [];
    history.unshift({
        no: document.getElementById('quotNo').value,
        name: name,
        total: document.getElementById('p-grandtotal').innerText,
        date: formatDate(document.getElementById('quotDate').value),
        data: captureFormData()
    });
    localStorage.setItem('perfect_cctv_history', JSON.stringify(history.slice(0, 10)));
    
    // Increment Quote Count
    currentQuoteNo++;
    localStorage.setItem('perfect_cctv_quote_count', currentQuoteNo);
    
    updateQuoteDisplay();
    loadHistory();
    window.print();
}

function captureFormData() {
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        items.push({ d: row.querySelector('.item-desc').value, q: row.querySelector('.item-qty').value, r: row.querySelector('.item-rate').value });
    });
    return { name: document.getElementById('custName').value, addr: document.getElementById('custAddress').value, ph: document.getElementById('custContact').value, disc: document.getElementById('discountAmt').value, items: items };
}

function loadHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('perfect_cctv_history')) || [];
    if (history.length === 0) { list.innerHTML = '<p class="empty-msg">No history yet</p>'; return; }
    list.innerHTML = history.map((item, i) => `
        <div class="history-item" onclick="reloadQuote(${i})">
            <span><strong>${item.no}</strong> - ${item.name}</span>
            <span>${item.total}</span>
        </div>
    `).join('');
}

function reloadQuote(index) {
    const history = JSON.parse(localStorage.getItem('perfect_cctv_history'));
    const q = history[index].data;
    document.getElementById('custName').value = q.name;
    document.getElementById('custAddress').value = q.addr;
    document.getElementById('custContact').value = q.ph;
    document.getElementById('discountAmt').value = q.disc;
    
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    q.items.forEach(it => addItem(it.d, it.r, it.q)); // Note: modified addItem slightly to support qty in future if needed
    updatePreview();
}

function confirmClear() {
    if (confirm("Reset everything for a new quote?")) {
        document.getElementById('custName').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custContact').value = '';
        document.getElementById('discountAmt').value = 0;
        document.getElementById('itemsContainer').innerHTML = `
            <div class="item-row animated fadeIn">
                <input type="text" class="item-desc" placeholder="Item" oninput="updatePreview()">
                <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
                <input type="number" class="item-rate" placeholder="Rate" oninput="updatePreview()">
                <button class="remove-btn" onclick="removeItem(this)"><i class="fas fa-times"></i></button>
            </div>`;
        updateQuoteDisplay();
        updatePreview();
    }
}

function shareWhatsApp() {
    const name = document.getElementById('custName').value || "Customer";
    const total = document.getElementById('p-grandtotal').innerText;
    const docType = document.getElementById('docType').value;
    const docLabel = docType === 'bill' ? 'INVOICE' : 'QUOTE';
    let msg = `*PERFECT CCTV INSTALLATION*\n*${docLabel}:* ${document.getElementById('quotNo').value}\n*TO:* ${name}\n*TOTAL:* ${total}\n------------------\n`;
    document.querySelectorAll('.item-row').forEach((row, i) => {
        const d = row.querySelector('.item-desc').value;
        if (d) msg += `${i+1}. ${d} (${row.querySelector('.item-qty').value} qty) = ${row.querySelector('.item-rate').value * row.querySelector('.item-qty').value}\n`;
    });
    msg += `------------------\n📍 Lasur Tal. Chopda, Jalgaon\n📞 9370110212`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

updatePreview();
