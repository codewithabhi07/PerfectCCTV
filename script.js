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

const defaultSpecs = {
    'DVR': '4/8 Channel Full HD 1080P DVR',
    'NVR': '4/8 Channel Ultra HD 4K NVR',
    'Camera': '2.4MP Full HD IR Night Vision',
    'Power Supply': '12V DC Multi-Channel SMPS',
    'Hard-Disk': 'Surveillance Internal HDD',
    'Cable': '3+1 Solid Copper CCTV Cable (Mtr)',
    'BNC Connector': 'Copper Pin Heavy Duty',
    'DC Connector': 'Standard 12V Male Pin',
    'PVC Box': '4x4 Waterproof Weatherproof Box',
    'DVR Rack': '2U Metal Wall Mount Enclosure',
    'Router': 'Dual Band Gigabit Wi-Fi 6',
    '4/5 G': 'High Speed 4G/5G SIM Router',
    'POE Switch': '4/8 Port 10/100/1000 Mbps POE',
    'GIGA Switch': 'Gigabit Network Switch',
    'CAT 6 Lan Cable': 'Pure Copper Gigabit (Mtr)',
    'POE Waterproof Rack': 'Outdoor Weatherproof POE Enclosure',
    'NVR Rack': '4U Wall Mount Network Cabinet',
    'HDMI Cable': '4K Ultra HD 1.5M / 3M',
    'Splitter': 'HDMI 1 to 2 Powered Splitter',
    'Joinder': 'BNC / RJ45 Coupler',
    'Cable Tie Packet': 'Heavy Nylon Ties (100 Pcs)',
    'RJ 45 Connector': 'Cat6 Gold Plated Crystal Plug',
    'Wire Fitting Charges': 'Conduit / Casing Piping & Clipping (Mtr)',
    'Installation Charges': 'Camera Mounting, Alignment & Setup',
    'Travelling Charges': 'Site Visit & Transport'
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

// --- DATE & VALIDITY UTILITIES ---
function getLocalDateString(dateObj = new Date()) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
}

function addDaysToDateStr(dateStr, days) {
    const d = parseLocalDate(dateStr) || new Date();
    d.setDate(d.getDate() + days);
    return getLocalDateString(d);
}

let currentValidityDays = 15; // default 15 days validity

function setValidityDays(days) {
    currentValidityDays = days;
    const quoteDateStr = document.getElementById('quotDate').value || getLocalDateString();
    document.getElementById('validDate').value = addDaysToDateStr(quoteDateStr, days);
    updatePresetPillUI();
    updatePreview();
}

function onCustomValidDateChange() {
    currentValidityDays = null;
    updatePresetPillUI();
    updatePreview();
}

function handleQuoteDateChange() {
    if (currentValidityDays !== null) {
        const quoteDateStr = document.getElementById('quotDate').value;
        if (quoteDateStr) {
            document.getElementById('validDate').value = addDaysToDateStr(quoteDateStr, currentValidityDays);
        }
    }
    updatePreview();
}

function updatePresetPillUI() {
    document.querySelectorAll('.preset-pill').forEach(pill => pill.classList.remove('active'));
    if (currentValidityDays === 7) {
        const p7 = document.querySelector('.preset-pill[onclick="setValidityDays(7)"]');
        if (p7) p7.classList.add('active');
    } else if (currentValidityDays === 15) {
        const p15 = document.getElementById('preset-15');
        if (p15) p15.classList.add('active');
    } else if (currentValidityDays === 30) {
        const p30 = document.querySelector('.preset-pill[onclick="setValidityDays(30)"]');
        if (p30) p30.classList.add('active');
    }
}

document.getElementById('billTheme').value = currentTheme;
applyTheme(currentTheme);
loadBizProfile();
updateQuoteDisplay();
loadHistory();
loadItemDB();

// Initialize with safe local calendar dates
const initialDate = getLocalDateString();
document.getElementById('quotDate').value = initialDate;
document.getElementById('validDate').value = addDaysToDateStr(initialDate, 15);
currentValidityDays = 15;
updatePresetPillUI();

let currentSpecSize = localStorage.getItem('perfect_cctv_spec_size') || 'normal';
applySpecFontSize(currentSpecSize);
updateSpecSizeUI();

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

function setSpecFontSize(size) {
    currentSpecSize = size;
    localStorage.setItem('perfect_cctv_spec_size', size);
    applySpecFontSize(size);
    updateSpecSizeUI();
}

function applySpecFontSize(size) {
    const bill = document.getElementById('bill-preview');
    if (!bill) return;
    bill.classList.remove('spec-size-small', 'spec-size-normal', 'spec-size-medium', 'spec-size-large');
    bill.classList.add(`spec-size-${size}`);
}

function updateSpecSizeUI() {
    const pills = document.querySelectorAll('#specSizePills .preset-pill');
    pills.forEach(p => {
        if (p.getAttribute('data-size') === currentSpecSize) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });
}

function updateQuoteDisplay() {
    const docType = document.getElementById('docType').value;
    const isBill = docType === 'bill';
    const prefix = isBill ? 'INV' : 'QT';
    const formatted = `${prefix}-${String(currentQuoteNo).padStart(3, '0')}`;
    document.getElementById('quotNo').value = formatted;
    document.getElementById('p-quotNo').innerText = `#${formatted}`;
    document.getElementById('label-docNo').innerText = isBill ? 'Invoice No.' : 'Quote No.';
    document.getElementById('label-validDate').innerText = isBill ? 'Due Date' : 'Valid Until';
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
        const itemVal = standardRates[name];
        const rate = typeof itemVal === 'object' ? itemVal.rate : itemVal;
        const spec = typeof itemVal === 'object' ? (itemVal.spec || '') : (defaultSpecs[name] || '');
        const div = document.createElement('div');
        div.className = 'quick-item db-item-pill';
        div.innerHTML = `
            <div class="db-item-info">
                <strong>${name}</strong>
                <span class="db-item-rate">₹${rate}</span>
                ${spec ? `<small class="db-item-spec">${spec}</small>` : ''}
            </div>
            <i class="fas fa-trash db-item-del" onclick="removeItemFromDB('${name}')" title="Delete"></i>
        `;
        list.appendChild(div);
    });
}

function addItemToDB() {
    const name = document.getElementById('dbItemName').value.trim();
    const rate = parseFloat(document.getElementById('dbItemRate').value);
    const spec = document.getElementById('dbItemSpec') ? document.getElementById('dbItemSpec').value.trim() : '';
    if (name && !isNaN(rate)) {
        standardRates[name] = { rate: rate, spec: spec };
        localStorage.setItem('perfect_cctv_item_db', JSON.stringify(standardRates));
        document.getElementById('dbItemName').value = '';
        document.getElementById('dbItemRate').value = '';
        if (document.getElementById('dbItemSpec')) document.getElementById('dbItemSpec').value = '';
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
        const itemVal = standardRates[item];
        const rate = typeof itemVal === 'object' ? itemVal.rate : itemVal;
        const spec = typeof itemVal === 'object' ? (itemVal.spec || '') : (defaultSpecs[item] || '');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-item';
        btn.title = spec ? `${item}: ${spec} (₹${rate})` : `${item} (₹${rate})`;
        btn.innerHTML = `<span>${item}</span><small style="opacity:0.75; font-size:0.55rem; display:block;">₹${rate}</small>`;
        btn.onclick = () => quickAdd(item, rate, spec);
        grid.appendChild(btn);
    });
}

function filterItems() {
    const q = document.getElementById('itemSearch').value.toLowerCase();
    document.querySelectorAll('#quickSelectGrid .quick-item').forEach(btn => {
        btn.style.display = btn.innerText.toLowerCase().includes(q) ? 'block' : 'none';
    });
}

function quickAdd(name, rate, spec = '') {
    if (!spec && defaultSpecs[name]) {
        spec = defaultSpecs[name];
    }
    const rows = document.querySelectorAll('.item-row');
    const lastRow = rows[rows.length - 1];
    const descInput = lastRow.querySelector('.item-desc');
    const specInput = lastRow.querySelector('.item-spec');
    
    if (descInput.value === "") {
        descInput.value = name;
        if (specInput) specInput.value = spec;
        lastRow.querySelector('.item-rate').value = rate;
        updatePreview();
    } else if (rows.length < 50) {
        addItem(name, rate, spec);
    }
}

function addItem(name = "", rate = "", spec = "") {
    const rows = document.querySelectorAll('.item-row');
    if (rows.length < 50) {
        const container = document.getElementById('itemsContainer');
        const newRow = document.createElement('div');
        newRow.className = 'item-row animated fadeIn';
        newRow.innerHTML = `
            <div class="item-fields">
                <input type="text" class="item-desc" placeholder="Item Name (e.g. Dome Camera)" value="${name}" oninput="updatePreview()">
                <input type="text" class="item-spec" placeholder="Specification / Model / Details" value="${spec}" oninput="updatePreview()">
            </div>
            <div class="item-controls">
                <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
                <select class="item-uom" onchange="updatePreview()">
                    <option value="Nos">Nos</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Pkt">Pkt</option>
                    <option value="Set">Set</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Day">Day</option>
                    <option value="Job">Job</option>
                </select>
                <input type="number" class="item-rate" placeholder="Rate" value="${rate}" oninput="updatePreview()">
                <button class="remove-btn" onclick="removeItem(this)"><i class="fas fa-times"></i></button>
            </div>
        `;
        container.appendChild(newRow);
        updatePreview();
    }
}

function removeItem(btn) {
    if (document.querySelectorAll('.item-row').length > 1) {
        btn.closest('.item-row').remove();
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
    const isBill = docType === 'bill';

    // Document Type & Badges
    if (isBill) {
        previewContainer.classList.add('bill-mode');
        badgeLabel.innerText = "INVOICE";
        estTitle.innerText = "TAX INVOICE";
        document.getElementById('p-validLabel').innerText = "DUE DATE";
    } else {
        previewContainer.classList.remove('bill-mode');
        badgeLabel.innerText = "QUOTATION";
        estTitle.innerText = "ESTIMATE / QUOTATION";
        document.getElementById('p-validLabel').innerText = "VALID UNTIL";
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
    const gstRow = document.getElementById('p-gstRow');
    if (gstRow) gstRow.style.display = bizGST ? 'flex' : 'none';
    const bankDetailsEl = document.getElementById('p-bankDetails');
    const bankInfoEl = document.getElementById('p-bankInfo');
    if (bizBank && bizBank.trim()) {
        if (bankDetailsEl) bankDetailsEl.innerText = bizBank;
        if (bankInfoEl) bankInfoEl.style.display = 'block';
    } else {
        if (bankDetailsEl) bankDetailsEl.innerText = "";
        if (bankInfoEl) bankInfoEl.style.display = 'none';
    }
    
    // Client Details
    document.getElementById('p-custName').innerText = document.getElementById('custName').value || "Client Name";
    document.getElementById('p-custAddress').innerText = document.getElementById('custAddress').value || "Installation Address";
    document.getElementById('p-custContact').innerText = "Contact: " + (document.getElementById('custContact').value || "--");
    
    // Dates
    const quotDateVal = document.getElementById('quotDate').value;
    const validDateVal = document.getElementById('validDate').value;
    document.getElementById('p-date').innerText = formatDate(quotDateVal);
    const validRow = document.getElementById('p-validRow');
    if (validDateVal) {
        document.getElementById('p-validDate').innerText = formatDate(validDateVal);
        validRow.style.display = 'flex';
    } else {
        document.getElementById('p-validDate').innerText = "--/--/----";
        validRow.style.display = 'none';
    }

    // Items
    const rows = document.querySelectorAll('.item-row');
    document.getElementById('item-count').innerText = `${rows.length}/50`;
    const previewBody = document.getElementById('p-itemsBody');
    previewBody.innerHTML = '';
    
    let subtotal = 0;
    rows.forEach((row, index) => {
        const desc = row.querySelector('.item-desc').value || "--";
        const spec = row.querySelector('.item-spec') ? row.querySelector('.item-spec').value : "";
        const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
        const uom = row.querySelector('.item-uom').value;
        const rate = parseFloat(row.querySelector('.item-rate').value) || 0;
        const amount = qty * rate;
        subtotal += amount;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="text-center">${index + 1}</td>
            <td><strong class="item-name">${desc}</strong></td>
            <td class="item-spec-cell">${spec ? spec : '<span style="color:#94a3b8;">-</span>'}</td>
            <td class="text-center">${qty}</td>
            <td class="text-center"><span class="item-uom-tag">${uom}</span></td>
            <td class="text-right">${curr}${rate.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td class="text-right amount-cell"><strong>${curr}${amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></td>
        `;
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
                <div class="gst-row"><span>CGST (${halfRate}%):</span><span>${curr}${half.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                <div class="gst-row"><span>SGST (${halfRate}%):</span><span>${curr}${half.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>`;
        } else {
            gstBreakdown.innerHTML = `<div class="gst-row"><span>IGST (${gstRate}%):</span><span>${curr}${gstAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>`;
        }
    }

    const grandTotal = taxableAmount + gstAmount;

    document.getElementById('p-subtotal').innerText = `${curr}${subtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('p-discount').innerText = `-${curr}${discount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('p-grandtotal').innerText = `${curr}${grandTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('p-discRow').style.display = discount > 0 ? 'flex' : 'none';

    document.getElementById('p-amountWords').innerText = convertNumberToWords(grandTotal);
    document.getElementById('p-terms').innerHTML = document.getElementById('termsCond').value.split('\n').filter(t => t.trim() !== '').map(t => `<li>${t}</li>`).join('');
    
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
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const [y, m, d] = parts;
        return `${d}-${m}-${y}`;
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function convertNumberToWords(amount) {
    amount = Math.round(amount);
    if (!amount || amount === 0) return "Rupees Zero Only";
    const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    function numToWords(n) {
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
        if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + numToWords(n % 100) : "");
        if (n < 100000) return numToWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "");
        if (n < 10000000) return numToWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "");
        return numToWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "");
    }
    return "Rupees " + numToWords(amount).trim() + " Only";
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
    a.download = `CCTV_PRO_BACKUP_${getLocalDateString()}.json`;
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
        validDate: formatDate(document.getElementById('validDate').value),
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
        items.push({
            d: row.querySelector('.item-desc').value,
            s: row.querySelector('.item-spec') ? row.querySelector('.item-spec').value : '',
            q: row.querySelector('.item-qty').value,
            r: row.querySelector('.item-rate').value,
            u: row.querySelector('.item-uom').value
        });
    });
    const name = document.getElementById('custName').value;
    return {
        name: name,
        addr: document.getElementById('custAddress').value,
        ph: document.getElementById('custContact').value,
        date: document.getElementById('quotDate').value,
        validDate: document.getElementById('validDate').value,
        validDays: currentValidityDays,
        items: items
    };
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
    if (!q) return;
    document.getElementById('custName').value = q.name || "";
    document.getElementById('custAddress').value = q.addr || "";
    document.getElementById('custContact').value = q.ph || "";
    if (q.date) document.getElementById('quotDate').value = q.date;
    if (q.validDate) document.getElementById('validDate').value = q.validDate;
    currentValidityDays = q.validDays !== undefined ? q.validDays : null;
    updatePresetPillUI();
    const container = document.getElementById('itemsContainer');
    container.innerHTML = '';
    if (q.items && q.items.length > 0) {
        q.items.forEach(it => addItem(it.d, it.r, it.s || ''));
    }
    updatePreview();
}

function confirmClear() {
    if (confirm("Clear current form?")) {
        document.getElementById('custName').value = '';
        document.getElementById('custAddress').value = '';
        document.getElementById('custContact').value = '';
        
        const todayStr = getLocalDateString();
        document.getElementById('quotDate').value = todayStr;
        document.getElementById('validDate').value = addDaysToDateStr(todayStr, 15);
        currentValidityDays = 15;
        updatePresetPillUI();

        document.getElementById('itemsContainer').innerHTML = `
            <div class="item-row animated fadeIn">
                <div class="item-fields">
                    <input type="text" class="item-desc" placeholder="Item Name (e.g. Dome Camera)" oninput="updatePreview()">
                    <input type="text" class="item-spec" placeholder="Specification / Model / Details" oninput="updatePreview()">
                </div>
                <div class="item-controls">
                    <input type="number" class="item-qty" placeholder="Qty" value="1" oninput="updatePreview()">
                    <select class="item-uom" onchange="updatePreview()">
                        <option value="Nos">Nos</option><option value="Mtr">Mtr</option>
                        <option value="Pkt">Pkt</option><option value="Set">Set</option>
                        <option value="Pcs">Pcs</option><option value="Day">Day</option>
                        <option value="Job">Job</option>
                    </select>
                    <input type="number" class="item-rate" placeholder="Rate" oninput="updatePreview()">
                    <button class="remove-btn" onclick="removeItem(this)"><i class="fas fa-times"></i></button>
                </div>
            </div>`;
        updateQuoteDisplay();
        updatePreview();
    }
}

function shareWhatsApp() {
    const name = document.getElementById('custName').value || "Customer";
    const total = document.getElementById('p-grandtotal').innerText;
    const docNo = document.getElementById('quotNo').value;
    const isBill = document.getElementById('docType').value === 'bill';
    const docTitle = isBill ? 'INVOICE' : 'QUOTATION';
    const dateIssued = formatDate(document.getElementById('quotDate').value);
    const validUntil = formatDate(document.getElementById('validDate').value);
    const validLabel = isBill ? 'DUE DATE' : 'VALID UNTIL';

    let msg = `*${document.getElementById('myBizName').value}*\n*${docTitle} NO:* ${docNo}\n*DATE:* ${dateIssued}\n*${validLabel}:* ${validUntil}\n*TO:* ${name}\n*TOTAL:* ${total}\n------------------\n`;
    document.querySelectorAll('.item-row').forEach((row, i) => {
        const d = row.querySelector('.item-desc').value;
        const s = row.querySelector('.item-spec') ? row.querySelector('.item-spec').value : '';
        if (d) {
            const qty = row.querySelector('.item-qty').value;
            const uom = row.querySelector('.item-uom').value;
            const rate = row.querySelector('.item-rate').value;
            const specText = s ? ` [${s}]` : '';
            msg += `${i+1}. ${d}${specText} (${qty} ${uom}) = ${document.getElementById('currency').value}${rate * qty}\n`;
        }
    });
    msg += `------------------\n📍 ${document.getElementById('myBizAddress').value}\n📞 ${document.getElementById('myBizContact').value}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
}

updatePreview();
