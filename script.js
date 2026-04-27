// --- MASTER PRICE LIST & CONFIG ---
let standardRates = JSON.parse(localStorage.getItem('perfect_cctv_item_db')) || {
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
        document.querySelector('.scroll-area').scrollTop = 0;
    } else {
        inputPanel.classList.remove('active');
        previewPanel.classList.add('active');
        btnEdit.classList.remove('active');
        btnPreview.classList.add('active');
        previewPanel.scrollTop = 0;
    }
}

async function sharePDF() {
    const element = document.getElementById('bill-preview');
    const name = document.getElementById('custName').value || "Client";
    const docNo = document.getElementById('quotNo').value;
    const fileName = `PERFECT_CCTV_${docNo}_${name.replace(/\s+/g, '_')}.pdf`;

    const opt = {
        margin: 0,
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        const btn = document.querySelector('.share-pdf-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ...';
        btn.disabled = true;

        const worker = html2pdf().set(opt).from(element);
        const blob = await worker.output('blob');
        const file = new File([blob], fileName, { type: 'application/pdf' });

        if (navigator.share) {
            await navigator.share({
                files: [file],
                title: 'Perfect CCTV Document',
                text: `Document ${docNo} for ${name}`
            });
        } else {
            html2pdf().set(opt).from(element).save();
        }
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    } catch (error) {
        console.error('Sharing failed:', error);
        btn.innerHTML = '<i class="fas fa-share-nodes"></i> Share';
        btn.disabled = false;
    }
}

// --- INITIALIZATION ---
let currentQuoteNo = parseInt(localStorage.getItem('perfect_cctv_quote_count')) || 1;
let currentTheme = localStorage.getItem('perfect_cctv_theme') || 'default';

// Load Business Profile
function loadBizProfile() {
    const profile = JSON.parse(localStorage.getItem('perfect_cctv_profile')) || {};
    if (profile.bizName) document.getElementById('myBizName').value = profile.bizName;
    if (profile.bizContact) document.getElementById('myBizContact').value = profile.bizContact;
    if (profile.bizAddr) document.getElementById('myBizAddress').value = profile.bizAddr;
    if (profile.bizOwner) document.getElementById('myBizOwner').value = profile.bizOwner;
    if (profile.bizFooterMsg) document.getElementById('myBizFooterMsg').value = profile.bizFooterMsg;
    if (profile.bizFooterSlogan) document.getElementById('myBizFooterSlogan').value = profile.bizFooterSlogan;
    if (profile.bizGST) document.getElementById('myBizGST').value = profile.bizGST;
    if (profile.bizBank) document.getElementById('myBizBank').value = profile.bizBank;
    
    const savedLogo = localStorage.getItem('perfect_cctv_logo');
    if (savedLogo) {
        document.getElementById('app-logo-preview').src = savedLogo;
        document.getElementById('p-logo').src = savedLogo;
    }
    const savedSig = localStorage.getItem('perfect_cctv_sig');
    if (savedSig) {
        document.getElementById('p-sig-img').src = savedSig;
        document.getElementById('p-sig-img').style.display = 'block';
    }
}

document.getElementById('billTheme').value = currentTheme;
applyTheme(currentTheme);
loadBizProfile();
updateQuoteDisplay();
loadHistory();
loadItemDB();
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

// --- ITEM DATABASE ---
function loadItemDB() {
    const list = document.getElementById('db-item-list');
    list.innerHTML = '';
    Object.keys(standardRates).forEach(name => {
        const div = document.createElement('div');
        div.className = 'quick-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.innerHTML = `<span>${name}</span><i class="fas fa-trash" onclick="removeItemFromDB('${name}')" style="color:red; font-size: 0.5rem;"></i>`;
        list.appendChild(div);
    });
}

function addItemToDB() {
    const name = document.getElementById('dbItemName').value.trim();
    const rate = parseFloat(document.getElementById('dbItemRate').value);
    if (name && rate) {
        standardRates[name] = rate;
        localStorage.setItem('perfect_cctv_item_db', JSON.stringify(standardRates));
        document.getElementById('dbItemName').value = '';
        document.getElementById('dbItemRate').value = '';
        loadItemDB();
        generateQuickSelect();
    }
}

function removeItemFromDB(name) {
    if (confirm(`Remove ${name} from database?`)) {
        delete standardRates[name];
        localStorage.setItem('perfect_cctv_item_db', JSON.stringify(standardRates));
        loadItemDB();
        generateQuickSelect();
    }
}

// --- ITEM MANAGEMENT ---
function generateQuickSelect() {
    const grid = document.getElementById('quickSelectGrid');
    grid.innerHTML = '';
    Object.keys(standardRates).forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-item';
        btn.innerText = item;
        btn.onclick = () => quickAdd(item, standardRates[item]);
        grid.appendChild(btn);
    });
}

function filterItems() {
    const q = document.getElementById('itemSearch').value.toLowerCase();
    document.querySelectorAll('#quickSelectGrid .quick-item').forEach(btn => {
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
    } else if (rows.length < 50) {
        addItem(name, rate);
    }
}

function addItem(name = "", rate = "") {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length < 50) {
        const container = document.getElementById('itemsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'item-row animated fadeIn';
        newRow.innerHTML = `
            <input type="text" class="item-desc" placeholder="Item" value="${name}" oninput="updatePreview()">
            <div style="display: flex; gap: 2px;">
                <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
                <select class="item-uom" onchange="updatePreview()" style="width: 60px; padding: 2px;">
                    <option value="Nos">Nos</option><option value="Mtr">Mtr</option>
                    <option value="Pkt">Pkt</option><option value="Day">Day</option>
                    <option value="Job">Job</option>
                </select>
            </div>
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
    const docType = document.getElementById('docType').value;
    const previewContainer = document.getElementById('bill-preview');
    const badgeLabel = document.querySelector('.quote-badge .label');
    const estTitle = document.querySelector('.estimate-title');
    const curr = document.getElementById('currency').value;

    // Document Type
    if (docType === 'bill') {
        previewContainer.classList.add('bill-mode');
        badgeLabel.innerText = "INVOICE";
        estTitle.innerText = "TAX INVOICE";
    } else {
        previewContainer.classList.remove('bill-mode');
        badgeLabel.innerText = "QUOTATION";
        estTitle.innerText = "ESTIMATE / QUOTATION";
    }

    // Business Details
    const bizName = document.getElementById('myBizName').value;
    const bizAddr = document.getElementById('myBizAddress').value;
    const bizCont = document.getElementById('myBizContact').value;
    const bizOwner = document.getElementById('myBizOwner').value;
    const bizFooterMsg = document.getElementById('myBizFooterMsg').value;
    const bizFooterSlogan = document.getElementById('myBizFooterSlogan').value;
    const bizGST = document.getElementById('myBizGST').value;
    const bizBank = document.getElementById('myBizBank').value;

    document.getElementById('p-myBizName').innerText = bizName;
    document.getElementById('p-myBizAddress').innerText = bizAddr;
    document.getElementById('p-myBizContact').innerText = bizCont;
    document.getElementById('p-preparedBy').innerText = bizOwner;
    document.getElementById('p-footerName').innerText = bizOwner;
    document.getElementById('p-footerMsg').innerText = bizFooterMsg;
    document.getElementById('p-footerSlogan').innerText = bizFooterSlogan;
    document.getElementById('p-myBizGST').innerText = bizGST;
    document.getElementById('p-gstRow').style.display = bizGST ? 'flex' : 'none';
    document.getElementById('p-bankDetails').innerText = bizBank || "N/A";
    
    // Client Details
    document.getElementById('p-custName').innerText = document.getElementById('custName').value || "Client Name";
    document.getElementById('p-custAddress').innerText = document.getElementById('custAddress').value || "Installation Address";
    document.getElementById('p-custContact').innerText = "Contact: " + (document.getElementById('custContact').value || "--");
    document.getElementById('p-date').innerText = formatDate(document.getElementById('quotDate').value);

    // Items
    const rows = document.querySelectorAll('.item-row');
    document.getElementById('item-count').innerText = `${rows.length}/50`;
    const previewBody = document.getElementById('p-itemsBody');
    previewBody.innerHTML = '';
    
    let subtotal = 0;
    rows.forEach((row, index) => {
        const desc = row.querySelector('.item-desc').value || "--";
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const uom = row.querySelector('.item-uom').value;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        subtotal += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index + 1}</td><td><strong>${desc}</strong></td><td>${qty}</td><td>${uom}</td><td>${curr}${rate.toLocaleString('en-IN')}</td><td>${curr}${amount.toLocaleString('en-IN')}</td>`;
        previewBody.appendChild(tr);
    });

    const discount = parseFloat(document.getElementById('discountAmt').value) || 0;
    const taxableAmount = subtotal - discount;

    // GST Calculation
    const gstEnabled = document.getElementById('gstEnabled').value === 'yes';
    const gstRate = parseFloat(document.getElementById('gstRate').value) || 0;
    const gstType = document.getElementById('gstType').value;
    const gstBreakdown = document.getElementById('gst-breakdown');
    gstBreakdown.innerHTML = '';
    
    let gstAmount = 0;
    if (gstEnabled && gstRate > 0) {
        gstAmount = (taxableAmount * gstRate) / 100;
        if (gstType === 'cgst-sgst') {
            const half = gstAmount / 2;
            const halfRate = gstRate / 2;
            gstBreakdown.innerHTML = `
                <div class="gst-row"><span>CGST (${halfRate}%):</span><span>${curr}${half.toLocaleString('en-IN')}</span></div>
                <div class="gst-row"><span>SGST (${halfRate}%):</span><span>${curr}${half.toLocaleString('en-IN')}</span></div>`;
        } else {
            gstBreakdown.innerHTML = `<div class="gst-row"><span>IGST (${gstRate}%):</span><span>${curr}${gstAmount.toLocaleString('en-IN')}</span></div>`;
        }
    }

    const grandTotal = taxableAmount + gstAmount;

    document.getElementById('p-subtotal').innerText = `${curr}${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('p-discount').innerText = `-${curr}${discount.toLocaleString('en-IN')}`;
    document.getElementById('p-grandtotal').innerText = `${curr}${grandTotal.toLocaleString('en-IN')}`;
    document.getElementById('p-discRow').style.display = discount > 0 ? 'flex' : 'none';

    document.getElementById('p-amountWords').innerText = convertNumberToWords(grandTotal) + " Only";
    document.getElementById('p-terms').innerHTML = document.getElementById('termsCond').value.split('\n').map(t => `<li>${t}</li>`).join('');
    
    // Save Profile & Draft
    saveProfile();
}

// --- HELPERS ---
function toggleSection(id) {
    document.getElementById(id).classList.toggle('hidden');
}

function handleLogoUpload(input, key) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            if (key === 'businessLogo') {
                document.getElementById('app-logo-preview').src = base64;
                document.getElementById('p-logo').src = base64;
                localStorage.setItem('perfect_cctv_logo', base64);
            } else {
                document.getElementById('p-sig-img').src = base64;
                document.getElementById('p-sig-img').style.display = 'block';
                localStorage.setItem('perfect_cctv_sig', base64);
            }
        };
        reader.readAsDataURL(file);
    }
}

function saveProfile() {
    const profile = {
        bizName: document.getElementById('myBizName').value,
        bizContact: document.getElementById('myBizContact').value,
        bizAddr: document.getElementById('myBizAddress').value,
        bizOwner: document.getElementById('myBizOwner').value,
        bizFooterMsg: document.getElementById('myBizFooterMsg').value,
        bizFooterSlogan: document.getElementById('myBizFooterSlogan').value,
        bizGST: document.getElementById('myBizGST').value,
        bizBank: document.getElementById('myBizBank').value
    };
    localStorage.setItem('perfect_cctv_profile', JSON.stringify(profile));
}

function formatDate(dateStr) {
    if (!dateStr) return "--/--/----";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
}

function convertNumberToWords(amount) {
    if (amount === 0) return "Zero";
    const words = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    function convert(n) {
        if (n < 20) return words[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + words[n % 10] : "");
        if (n < 1000) return words[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + convert(n % 100) : "");
        if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + convert(n % 1000) : "");
        return "";
    }
    return convert(Math.floor(amount));
}

// --- DATA MANAGEMENT ---
function exportData() {
    const data = {
        profile: JSON.parse(localStorage.getItem('perfect_cctv_profile')),
        history: JSON.parse(localStorage.getItem('perfect_cctv_history')),
        item_db: standardRates,
        logo: localStorage.getItem('perfect_cctv_logo'),
        sig: localStorage.getItem('perfect_cctv_sig')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CCTV_PRO_BACKUP_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
}

function importData(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            if (data.profile) localStorage.setItem('perfect_cctv_profile', JSON.stringify(data.profile));
            if (data.history) localStorage.setItem('perfect_cctv_history', JSON.stringify(data.history));
            if (data.item_db) localStorage.setItem('perfect_cctv_item_db', JSON.stringify(data.item_db));
            if (data.logo) localStorage.setItem('perfect_cctv_logo', data.logo);
            if (data.sig) localStorage.setItem('perfect_cctv_sig', data.sig);
            location.reload();
        };
        reader.readAsText(file);
    }
}

// --- PRINT & HISTORY ---
function printAndSave() {
    const name = document.getElementById('custName').value;
    if (!name) { alert("Client name required"); return; }
    
    const history = JSON.parse(localStorage.getItem('perfect_cctv_history')) || [];
    history.unshift({
        no: document.getElementById('quotNo').value,
        name: name,
        total: document.getElementById('p-grandtotal').innerText,
        date: formatDate(document.getElementById('quotDate').value),
        data: captureFormData()
    });
    localStorage.setItem('perfect_cctv_history', JSON.stringify(history.slice(0, 20)));
    
    currentQuoteNo++;
    localStorage.setItem('perfect_cctv_quote_count', currentQuoteNo);
    window.print();
}

function captureFormData() {
    const items = [];
    document.querySelectorAll('.item-row').forEach(row => {
        items.push({ d: row.querySelector('.item-desc').value, q: row.querySelector('.item-qty').value, r: row.querySelector('.item-rate').value, u: row.querySelector('.item-uom').value });
    });
    const name = document.getElementById('custName').value;
    return { name: name, addr: document.getElementById('custAddress').value, ph: document.getElementById('custContact').value, items: items };
}

function loadHistory() {
    const list = document.getElementById('historyList');
    const history = JSON.parse(localStorage.getItem('perfect_cctv_history')) || [];
    if (history.length === 0) { list.innerHTML = '<p style="font-size:0.6rem;">No history</p>'; return; }
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
    document.getElementById('custName').value = q.name || "";
    document.getElementById('custAddress').value = q.addr || "";
    document.getElementById('custContact').value = q.ph || "";
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    q.items.forEach(it => addItem(it.d, it.r));
    updatePreview();
}

function confirmClear() {
    if (confirm("Clear current form?")) {
        document.getElementById('custName').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custContact').value = '';
        document.getElementById('itemsContainer').innerHTML = `
            <div class="item-row animated fadeIn">
                <input type="text" class="item-desc" placeholder="Item" oninput="updatePreview()">
                <div style="display: flex; gap: 2px;">
                    <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
                    <select class="item-uom" onchange="updatePreview()" style="width: 60px; padding: 2px;">
                        <option value="Nos">Nos</option><option value="Mtr">Mtr</option>
                        <option value="Pkt">Pkt</option><option value="Day">Day</option>
                        <option value="Job">Job</option>
                    </select>
                </div>
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
    const docNo = document.getElementById('quotNo').value;
    let msg = `*${document.getElementById('myBizName').value}*\n*DOC NO:* ${docNo}\n*TO:* ${name}\n*TOTAL:* ${total}\n------------------\n`;
    document.querySelectorAll('.item-row').forEach((row, i) => {
        const d = row.querySelector('.item-desc').value;
        if (d) msg += `${i+1}. ${d} (${row.querySelector('.item-qty').value} ${row.querySelector('.item-uom').value}) = ${document.getElementById('currency').value}${row.querySelector('.item-rate').value * row.querySelector('.item-qty').value}\n`;
    });
    msg += `------------------\n📍 ${document.getElementById('myBizAddress').value}\n📞 ${document.getElementById('myBizContact').value}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

updatePreview();
