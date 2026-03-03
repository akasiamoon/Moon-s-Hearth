// === 0. SUPABASE CONNECTION ===
const supabaseUrl = 'https://yflfpwcaowzkoxqnohso.supabase.co';
const supabaseKey = 'sb_publishable_OUXpGQk3QkOoUu94S9YZNg_Sb34-Jc4';
let db = null;

try {
    if (typeof supabase !== 'undefined') {
        db = supabase.createClient(supabaseUrl, supabaseKey);
        console.log("✨ Stars aligned: Connected to the archive.");
    } else {
        console.warn("⚠️ Cannot find Supabase! Falling back to Local Storage.");
    }
} catch (error) { console.error("The magical currents are scrambled:", error); }

// === 0.5 DATA MANAGER (The Brain) ===
async function loadData(tableName, orderBy = 'created_at', asc = false) {
    let results = null;
    if (db) {
        const { data, error } = await db.from(tableName).select('*').order(orderBy, { ascending: asc });
        if (!error && data) results = data;
    }
    if (!results) {
        results = JSON.parse(localStorage.getItem(tableName) || '[]');
        results.sort((a, b) => {
            if (a[orderBy] < b[orderBy]) return asc ? -1 : 1;
            if (a[orderBy] > b[orderBy]) return asc ? 1 : -1;
            return 0;
        });
    } else {
        localStorage.setItem(tableName, JSON.stringify(results));
    }
    return results;
}

async function insertData(tableName, itemObj) {
    itemObj.id = Date.now().toString();
    itemObj.created_at = new Date().toISOString();
    if (db) {
        const { data, error } = await db.from(tableName).insert([itemObj]).select();
        if (!error && data && data.length > 0) itemObj.id = data[0].id;
    }
    const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    localData.push(itemObj);
    localStorage.setItem(tableName, JSON.stringify(localData));
}

async function updateData(tableName, id, updates) {
    if (db) await db.from(tableName).update(updates).eq('id', id);
    const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    const index = localData.findIndex(item => item.id == id);
    if (index > -1) {
        localData[index] = { ...localData[index], ...updates };
        localStorage.setItem(tableName, JSON.stringify(localData));
    }
}

async function removeData(tableName, id) {
    if (db) await db.from(tableName).delete().eq('id', id);
    let localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    localData = localData.filter(item => item.id != id);
    localStorage.setItem(tableName, JSON.stringify(localData));
}

// === 1. LOCAL DATA (The Massive Library) ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings.", ingredients: ["4 large potatoes", "Wild garlic", "Leeks", "Heavy cream"], instructions: "Simmer until the potatoes yield." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling.", ingredients: ["3 bananas", "Brown sugar", "Vanilla"], instructions: "Bake until golden brown." },
    { title: "🍋 Summerset Lemon Blueberry Loaf", description: "A bright, citrus-infused sweet bread.", ingredients: ["2 cups flour", "1 cup sugar", "1 cup fresh blueberries"], instructions: "Fold berries gently, bake until clean." },
    { title: "🍎 Hearthfire Fried Apple Pies", description: "Warm hand-held pastries filled with spiced fruit.", ingredients: ["Pie dough", "Dried apples", "Cinnamon"], instructions: "Fry until golden and blistered." },
    { title: "🍫 Midnight Chocolate Cobbler", description: "A rich, self-saucing dessert river.", ingredients: ["Cocoa", "Sugar", "Boiling water"], instructions: "Do not stir! Pour boiling water over all." },
    { title: "🍲 Wayrest Rustic Bean Stew", description: "A humble, deeply satisfying soup.", ingredients: ["Robust beans", "Root vegetables", "Smoked bacon"], instructions: "Simmer in an iron pot until tender." },
    { title: "🧁 Legendary Sweetrolls", description: "Beloved pillowy pastry with thick icing.", ingredients: ["Yeast dough", "Butter", "Vanilla glaze"], instructions: "Bake in fluted tins. Guard closely." },
    { title: "🍏 Skyrim Apple Cabbage Stew", description: "Savory depth with tart orchard fruit.", ingredients: ["1 head cabbage", "2 tart apples", "Broth"], instructions: "Sauté cabbage, add liquids, and simmer." },
    { title: "🍠 Ashlander Spiced 'Ash Yams'", description: "Fiery preparation of root vegetables.", ingredients: ["Sweet potatoes", "Smoked paprika", "Honey"], instructions: "Roast until caramelized." },
    { title: "🍖 Valenwood Honey-Roasted Ribs", description: "Succulent slow-cooked meat dish.", ingredients: ["Pork ribs", "Wild honey", "Rosemary"], instructions: "Roast low and slow." },
    { title: "🍈 Elsweyr Melon-Jelly", description: "Cooling dessert for desert heat.", ingredients: ["Melon juice", "Honey", "Gelatin"], instructions: "Set in a cool cellar until firm." },
    { title: "🧀 Colovian Goat Cheese & Apples", description: "Simple rustic pairing for farmsteads.", ingredients: ["Goat cheese", "Red apples", "Honey"], instructions: "Arrange on a board and drizzle honey." },
    { title: "🦀 Jagga-Drenched 'Mudcrab' Cakes", description: "Tangy Bosmer delicacy.", ingredients: ["Crab meat", "Buttermilk", "Old Bay"], instructions: "Sear until golden and crisp." },
    { title: "🥣 Orsinium Venison Haunch", description: "Powerful meal for Orcish winters.", ingredients: ["Venison haunch", "Juniper berries", "Dark Ale"], instructions: "Braise for 6 hours until it falls apart." },
    { title: "🥣 Kwama Egg Quiche", description: "Earthy energy for ash storms.", ingredients: ["Kwama eggs", "Heavy cream", "Spinach"], instructions: "Bake until top is pale gold." },
    { title: "🍮 Argonian 'Mud-Ball' Truffles", description: "Dark chocolate morsels rolled in cocoa.", ingredients: ["Dark chocolate", "Cream", "Espresso powder"], instructions: "Chill, roll into balls, and coat in cocoa." },
    { title: "🍞 Breton 'Sun's Height' Biscuits", description: "Light, airy High Rock biscuits.", ingredients: ["Self-rising flour", "Buttermilk", "Honey"], instructions: "Bake high heat until they rise." },
    { title: "🥗 Bosmer 'Rite of Passage' Salad", description: "Meat-based salad for the Wood Elf.", ingredients: ["Smoked turkey", "Bacon crumbles", "Hard-boiled egg"], instructions: "Layer and drizzle with herb-cream." },
    { title: "🍷 Altmer 'Firsthold' Fruit Wine Sauce", description: "Elegant reduction for poultry.", ingredients: ["Red grape juice", "Blackberries", "Star anise"], instructions: "Reduce until it coats a spoon." },
    { title: "🥣 Nord 'Hrothgar' Venison Chili", description: "Spicy bowl designed to warm the bones.", ingredients: ["Ground venison", "Kidney beans", "Coffee"], instructions: "Simmer on the hearth for one hour." },
    { title: "🍪 Khajiit 'Sweet-Sabbath' Mooncakes", description: "Spice-filled caravan cookies.", ingredients: ["Molasses", "Ginger", "Cinnamon"], instructions: "Bake until edges are crisp." },
    { title: "🥧 Redguard 'Sentinel' Savory Pastries", description: "Durable travel triangles.", ingredients: ["Puff pastry", "Ground lamb", "Curry"], instructions: "Fold into triangles and bake golden." },
    { title: "🍵 Imperial 'Gold Coast' Spiced Tea", description: "Aromatic brew for coastal chill.", ingredients: ["Black tea", "Cinnamon", "Cloves"], instructions: "Simmer spices with tea and honey." },
    { title: "🥘 Wood Orc 'Wrothgar' Succotash", description: "Hearty corn and beans with bacon.", ingredients: ["Corn", "Lima beans", "Bacon"], instructions: "Sauté in rendered bacon fat." },
    { title: "🥧 Hammerfell 'Stros M'kai' Fish Pie", description: "Coastal staple with potato crust.", ingredients: ["White fish", "Leeks", "Mashed potatoes"], instructions: "Bake until toasted brown." },
    { title: "🥣 Dunmer 'Vivec City' Ash-Roasted Roots", description: "Smoky volcanic root vegetables.", ingredients: ["Carrots", "Parsnips", "Smoked salt"], instructions: "Roast at high heat until charred." },
    { title: "🍵 Khajiit 'Senche-Tiger' Chai", description: "Bold energy for nomadic pedlars.", ingredients: ["Black tea", "Ginger", "Saffron"], instructions: "Boil tea with ginger, steep saffron at end." },
    { title: "🥧 Bosmer 'Falinesti' Meat Pie", description: "Grain-free meat-based Green Pact pie.", ingredients: ["Ground beef", "Suet", "Juniper berries"], instructions: "Seal with meat crust and bake." },
    { title: "🍲 Nord 'Windhelm' Venison Stew", description: "Iron-rich fuel for blizzard weather.", ingredients: ["Beef chuck", "Kale", "Peppery ale"], instructions: "Low-simmer for 4 hours." },
    { title: "🍮 Altmer 'Alinor' Honey Mousse", description: "Ethereal Summerset dessert.", ingredients: ["Whipping cream", "Honey", "Orange flower water"], instructions: "Whip and chill in crystal glasses." }
];

const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "3 mins @ 212°F", description: "Classic citrus and honey blend." },
    { title: "Lavender Chamomile", icon: "🍵", brew: "5 mins @ 200°F", description: "Soothing floral nightcap." },
    { title: "Road-Warrior Mate", icon: "🧉", brew: "5 mins @ 165°F", description: "Steady energy for Dashing." },
    { title: "Iron Goddess Oolong", icon: "🐉", brew: "3 mins @ 190°F", description: "Focus for coding sessions." },
    { title: "Midnight Lapsang", icon: "🖤", brew: "4 mins @ 212°F", description: "Pine-smoked campfire tea." }
];

const myApothecary = [
    { title: "Obsidian Velvet Lip Stain", icon: "💄", description: "Matte midnight finish.", ingredients: "Beeswax, Jojoba, Charcoal", instructions: "Melt and whisk." },
    { title: "Electric Prism Highlighter", icon: "🌈", description: "Rainbow glow highlighter.", ingredients: "Mica, Coconut Oil", instructions: "Press and cream." },
    { title: "Vibrant Ink Salve", icon: "🏺", description: "Tattoo preservation balm.", ingredients: "Beeswax, Shea, Calendula", instructions: "Melt and set." }
];

const myHerbs = [
    { title: "Rosemary", icon: "🌿", properties: "Memory", description: "Keeps focus sharp." },
    { title: "Gotu Kola", icon: "🍀", properties: "Cognition", description: "Sustains mental energy." }
];

// === 2. ALMANAC DATA ===
let dynamicAlmanac = { season: "", moonPhase: "", temp: "--°F", weather: "", planting: "", focus: "", entry: "" };

function getMoonPhase(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month < 3) { year--; month += 12; }
    let jd = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4) + day + Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) - 1524.5;
    let phaseDays = ((jd - 2451549.5) / 29.53 % 1) * 29.53;
    if (phaseDays < 16.61) return { phase: "Waxing Moon 🌔", isWaxing: true };
    return { phase: "Waning Moon 🌘", isWaxing: false };
}

function updateNatureLore() {
    const today = new Date(), month = today.getMonth();
    dynamicAlmanac.moonPhase = getMoonPhase(today).phase;
    dynamicAlmanac.season = ["Deep Winter", "Late Winter", "Early Spring", "High Spring", "Early Summer", "Midsummer", "Late Summer", "Early Autumn", "Deep Autumn", "Frostfall", "Early Winter", "Midwinter"][month];
    dynamicAlmanac.planting = "The moon waxes. Sow above-ground crops.";
    dynamicAlmanac.focus = "Intuition & Planning";
    dynamicAlmanac.entry = "Trust your instincts and step forward with quiet purpose.";
}

async function fetchLocalAtmosphere() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.93&longitude=-88.48&current_weather=true&temperature_unit=fahrenheit');
        const data = await response.json();
        dynamicAlmanac.temp = Math.round(data.current_weather.temperature) + "°F";
        dynamicAlmanac.weather = "Atmosphere holds a quiet energy.";
    } catch (error) { dynamicAlmanac.weather = "Currents scrambled."; }
}

// === 3. CALENDAR SYSTEM ===
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
let holidayCache = {}; 

async function fetchHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`);
        if (!res.ok) return [];
        const data = await res.json();
        holidayCache[year] = data;
        return data;
    } catch(e) { return []; }
}

function changeCalendarMonth(offset) {
    calMonth += offset;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    else if (calMonth > 11) { calMonth = 0; calYear++; }
    openPortal('cat'); 
}

async function generateCalendarHTML(events) {
    const today = new Date();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const monthName = new Date(calYear, calMonth).toLocaleDateString('default', { month: 'long' });
    const holidays = await fetchHolidays(calYear);

    let html = `<div class="calendar-wrapper">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <span class="action-btn" onclick="changeCalendarMonth(-1)">◀</span>
            <h3 class="gold-text">${monthName} ${calYear}</h3>
            <span class="action-btn" onclick="changeCalendarMonth(1)">▶</span>
        </div>
        <div class="calendar-grid">`;
    ["Su","Mo","Tu","We","Th","Fr","Sa"].forEach(d => html += `<div class="cal-day-name">${d}</div>`);
    for (let i = 0; i < firstDay; i++) html += `<div class="cal-cell empty"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const hasEvent = events && events.some(e => e.start_date && e.start_date.startsWith(dateStr) && e.text !== 'completed');
        const isToday = (day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) ? 'today' : '';
        const holiday = holidays.find(h => h.date === dateStr);
        html += `<div class="cal-cell ${isToday} ${holiday ? 'holiday' : ''}" onclick="prefillDate('${dateStr}')">
            <span>${day}</span>${holiday ? `<div class="holiday-text">${holiday.name}</div>` : ''}${hasEvent ? `<div class="cal-marker"></div>` : ''}
        </div>`;
    }
    return html + `</div></div>`;
}

// === 4. HTML PORTAL BUILDERS (THE BIG LOGIC) ===
async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">Kitchen Grimoire</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Sacred Recipes</div><div class="section-panel closed">`;
    [...myRecipes, ...myTeas].forEach(item => {
        let ingList = item.ingredients ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : '';
        html += `<div class="grimoire-item">
            <button class="grimoire-header" onclick="toggleAccordion(this)">${item.icon || ''} ${item.title}</button>
            <div class="grimoire-panel"><p><em>${item.description}</em></p>
            ${ingList ? `<ul>${ingList}</ul>` : ''}<p>${item.instructions || ''}</p></div></div>`;
    });
    const dbRecipes = await loadData('recipes');
    dbRecipes.forEach(item => {
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">📜 ${item.title}</button><div class="grimoire-panel"><p>${item.description}</p>
        <button class="action-btn" style="color:#ff6b6b;" onclick="deleteDetailedItem('recipes', '${item.id}', 'grimoire')">Purge</button></div></div>`;
    });
    return html + `</div></div>`;
}

async function buildBountyBoardHTML() {
    let html = `<h2 class="gold-text">The Bounty Board</h2><div class="portal-scroll-container">`;
    const events = await loadData('calendar_events', 'start_date', true);
    html += await generateCalendarHTML(events);
    // [Keep your Daily Endeavors logic here...]
    return html + `</div>`;
}

async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const transactions = await loadData('ledger_transactions', 'created_at', false);
    let balance = 0; transactions.forEach(t => balance += parseFloat(t.amount || 0));
    html += `<div style="text-align:center; font-size:1.8em; color:#fcf6ba;">Vault Balance: $${balance.toFixed(2)}</div>`;
    // [Keep your Cashflow and Goals logic here...]
    return html + `</div>`;
}

async function buildApothecaryHTML() {
    let html = `<h2 class="gold-text">Apothecary</h2><div class="portal-scroll-container">`;
    myApothecary.forEach(item => {
        html += `<div class="alchemy-card"><h3 class="alchemy-title">${item.icon || '🏺'} ${item.title}</h3><p>${item.description}</p></div>`;
    });
    return html + `</div>`;
}

async function buildInventoryHTML() {
    let html = `<h2 class="gold-text">Architect's Studio</h2><div class="portal-scroll-container">`;
    // Trophy Gallery
    html += `<div class="section-header closed" onclick="toggleSection(this)">Trophy Gallery</div><div class="section-panel closed">`;
    const rooms = await loadData('trophy_rooms');
    rooms.forEach(room => {
        html += `<div class="alchemy-card">${room.name} <button class="portal-btn" onclick="loadTrophy('${room.id}', '${room.bg_url}')">Apply</button></div>`;
    });
    html += `</div>`;
    // The Grand Stash
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Grand Stash</div><div class="section-panel closed">
        <input type="text" id="asset-name" placeholder="Asset Name..." class="portal-input">
        <input type="file" id="asset-image" accept="image/png" onchange="document.getElementById('asset-file-name').innerText = this.files[0].name">
        <button onclick="uploadAsset()" class="portal-btn">Store</button>
        <div id="asset-file-name"></div>
        <div id="stash-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(70px,1fr)); gap:10px;">`;
    const stash = await loadData('inventory_stash');
    stash.forEach(item => {
        html += `<div onclick="spawnToForge('${item.image_url}')"><img src="${item.image_url}" style="width:100%;"></div>`;
    });
    return html + `</div></div></div>`;
}

// === 5. THE FORGE LOGIC (RESIZING & UPLOAD) ===
async function uploadAsset() {
    const nameInput = document.getElementById('asset-name').value.trim();
    const fileInput = document.getElementById('asset-image');
    const statusDiv = document.getElementById('asset-file-name');
    const file = fileInput.files[0];

    if (!nameInput || !file || !db) return;

    statusDiv.innerText = "✨ Resizing...";
    resizeImage(file, 800, async (resizedBlob) => {
        try {
            const fileName = `stash_${Date.now()}_${file.name}`;
            const { data, error } = await db.storage.from('assets').upload(fileName, resizedBlob);
            if (error) throw error;
            const { data: urlData } = db.storage.from('assets').getPublicUrl(fileName);
            await insertData('inventory_stash', { name: nameInput, image_url: urlData.publicUrl });
            statusDiv.innerText = "✅ Stashed!";
            openPortal('inventory');
        } catch (err) { statusDiv.innerText = "🚫 Failed: " + err.message; }
    });
}

function resizeImage(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        const img = new Image(); img.src = e.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth; canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => callback(blob), 'image/png');
        };
    };
}

// === 6. UI HELPERS ===
function toggleSection(btn) {
    btn.classList.toggle('closed');
    btn.nextElementSibling.classList.toggle('closed');
}
function toggleAccordion(btn) {
    btn.classList.toggle('active');
    const p = btn.nextElementSibling;
    p.style.maxHeight = p.style.maxHeight ? null : p.scrollHeight + "px";
}

async function openPortal(name) {
    const content = document.getElementById('portal-content');
    document.getElementById('parchment-overlay').classList.add('active');
    if (name === 'grimoire') content.innerHTML = await buildGrimoireHTML();
    else if (name === 'cat') content.innerHTML = await buildBountyBoardHTML();
    else if (name === 'inventory') content.innerHTML = await buildInventoryHTML();
    else if (name === 'ledger') content.innerHTML = await buildLedgerHTML();
    else if (name === 'alchemy') content.innerHTML = await buildApothecaryHTML();
}

function closePortal() {
    document.getElementById('parchment-overlay').classList.remove('active');
}

// === 7. THE FAMILIAR (CAT BRAIN) ===
let familiarXP = 0; const maxXP = 5;
function updateFamiliarUI() {
    const xpCircle = document.getElementById('xp-circle');
    if (!xpCircle) return;
    xpCircle.style.strokeDashoffset = 289 - (289 * (familiarXP / maxXP));
}

// === 8. INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    updateFamiliarUI();
    updateNatureLore();
    fetchLocalAtmosphere();
    console.log("🏰 Sanctuary Fully Reforged.");
});

// bulkScribeData(); // Run once then comment out!
