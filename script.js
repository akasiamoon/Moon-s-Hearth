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

// === 0.5 DATA MANAGER ===
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

// === 1. LOCAL DATA ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings.", ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], instructions: "Simmer over a low hearth fire until the potatoes yield." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling or a morning study session.", ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." }
];

const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "Steep 3 mins at 212°F", description: "A classic, elegant blend brightened with citrus and a touch of honey." },
    { title: "Lavender Chamomile Nightcap", icon: "🍵", brew: "Steep 5 mins at 200°F", description: "A deeply soothing floral blend meant to quiet a racing mind." }
];

const myApothecary = [
    { title: "Vibrant Ink Protectant Salve", icon: "🏺", description: "A deeply nourishing balm to protect and preserve skin artwork.", ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E", instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set." }
];

const myHerbs = [
    { title: "Lavender", icon: "🪻", properties: "Restoration & Calm", description: "Hang near the window to sweeten the breeze. Excellent for sleep pillows and soothing teas." }
];

const mySewing = [
    { title: "Hearth Apron", status: "Completed", fabric: "Sturdy Canvas", notes: "Added deep pockets for gathering herbs." }
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
    dynamicAlmanac.entry = "Trust your instincts, outline your tasks, and step forward with quiet purpose.";
}

async function fetchLocalAtmosphere() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.93&longitude=-88.48&current_weather=true&temperature_unit=fahrenheit');
        const data = await response.json();
        dynamicAlmanac.temp = Math.round(data.current_weather.temperature) + "°F";
        dynamicAlmanac.weather = "The atmosphere holds a quiet energy.";
    } catch (error) { dynamicAlmanac.weather = "The magical currents are scrambled."; }
}

updateNatureLore(); fetchLocalAtmosphere();
const portalData = { 'audio': '<h2 class="gold-text">Bardic Soundscapes</h2><p style="color: rgba(191,149,63,0.8); font-style:italic; text-align:center;">Select your ambient mix.</p>' };

// === 3. CALENDAR ===
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

    let html = `
    <div class="calendar-wrapper">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <span class="action-btn" style="font-size:1.5em;" onclick="changeCalendarMonth(-1)">◀</span>
            <h3 class="gold-text" style="margin: 0; font-size: 1.2em; padding-bottom: 0;">${monthName} ${calYear}</h3>
            <span class="action-btn" style="font-size:1.5em;" onclick="changeCalendarMonth(1)">▶</span>
        </div>
        <div class="calendar-grid">
            <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div>
            <div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>`;

    for (let i = 0; i < firstDay; i++) { html += `<div class="cal-cell empty"></div>`; }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const hasEvent = events && events.some(e => e.start_date && e.start_date.startsWith(dateStr) && e.text !== 'completed');
        const marker = hasEvent ? `<div class="cal-marker"></div>` : '';
        const isToday = (day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) ? 'today' : '';
        const holiday = holidays.find(h => h.date === dateStr);
        const holiClass = holiday ? 'holiday' : '';
        const holiText = holiday ? `<div class="holiday-text">${holiday.name}</div>` : '';
        html += `<div class="cal-cell ${isToday} ${holiClass}" onclick="prefillDate('${dateStr}')"><span>${day}</span>${holiText}${marker}</div>`;
    }
    html += `</div></div>`;
    return html;
}

function prefillDate(dateStr) {
    const section = document.getElementById('scribe-section');
    const panel = document.getElementById('scribe-panel');
    if (section && panel) {
        section.classList.remove('closed');
        panel.classList.remove('closed');
        document.getElementById('ev-date').value = dateStr + "T12:00";
        document.getElementById('ev-title').focus();
    }
}

// === 4. HTML BUILDERS ===
async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">Kitchen Grimoire</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Sacred Recipes</div><div class="section-panel closed">`;
    [...myRecipes, ...myTeas].forEach(item => {
        let ingList = item.ingredients ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : '';
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">${item.icon || ''} ${item.title}</button><div class="grimoire-panel"><p><em>${item.description}</em></p>${item.brew ? `<div style="color:#bf953f; font-style:italic; margin-bottom:10px;">${item.brew}</div>` : ''}${ingList ? `<ul>${ingList}</ul>` : ''}${item.instructions ? `<p>${item.instructions}</p>` : ''}</div></div>`;
    });
    const dbRecipes = await loadData('recipes');
    dbRecipes.forEach(item => {
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">📜 ${item.title}</button><div class="grimoire-panel"><p style="white-space: pre-wrap;">${item.description}</p><div style="text-align: right; margin-top: 10px;"><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('recipes', '${item.id}', 'grimoire')">Purge Entry</button></div></div></div>`;
    });
    html += `</div>`; 
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe Quick Recipe</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="recipe-title" placeholder="Recipe Title..." class="portal-input" style="margin-bottom: 10px;"><textarea id="recipe-desc" placeholder="Ingredients & Notes..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('recipes', 'recipe-title', 'recipe-desc', 'grimoire')" class="portal-btn" style="width: 100%;">Add to Grimoire</button></div></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Weekly Provisions</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-meal-item" placeholder="e.g. Moonday: Stew..." class="portal-input"><button onclick="addDynamicItem('meal_plans', 'new-meal-item', 'grimoire')" class="portal-btn">Add</button></div>`;
    const meals = await loadData('meal_plans', 'created_at', true);
    meals.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('meal_plans', '${item.id}', ${item.is_completed}, 'grimoire')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('meal_plans', '${item.id}', 'grimoire')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Market List</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-market-item" placeholder="Add an item..." class="portal-input"><button onclick="addDynamicItem('market_items', 'new-market-item', 'grimoire')" class="portal-btn">Add</button></div>`;
    const marketItems = await loadData('market_items');
    marketItems.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('market_items', '${item.id}', ${item.is_completed}, 'grimoire')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('market_items', '${item.id}', 'grimoire')">✕</div></div>`; 
    });
    html += `</div></div>`; 
    return html;
}

async function buildBountyBoardHTML() {
    let html = `<h2 class="gold-text">The Bounty Board</h2><div class="portal-scroll-container">`;
    const events = await loadData('calendar_events', 'start_date', true);
    html += await generateCalendarHTML(events);
    html += `<div class="section-header closed" onclick="toggleSection(this)">Alignments Ledger</div><div class="section-panel closed">`;
    if (events.length > 0) {
        events.forEach(ev => {
            const isDone = ev.text === 'completed' ? 'completed' : ''; 
            const dateStr = ev.start_date ? new Date(ev.start_date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
            html += `<div class="quest-item ${isDone}" onclick="toggleEvent('${ev.id}', '${ev.text}')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${ev.title}</h3><div style="font-size: 0.8em; color: rgba(191, 149, 63, 0.8);">${dateStr}</div></div><div class="delete-icon" onclick="event.stopPropagation(); deleteEvent('${ev.id}')">✕</div></div>`;
        });
    } else { html += `<p style="color: rgba(191,149,63,0.5); font-style: italic;">No current alignments recorded.</p>`; }
    html += `</div>`; 
    html += `<div id="scribe-section" class="section-header closed" onclick="toggleSection(this)">Scribe Alignment</div><div id="scribe-panel" class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="ev-title" placeholder="Alignment Title..." class="portal-input" style="margin-bottom: 10px;"><input type="datetime-local" id="ev-date" class="portal-input" style="margin-bottom: 10px;"><button onclick="addEvent()" class="portal-btn" style="width: 100%;">Seal in the Stars</button><div id="ev-status" style="font-size: 0.8em; margin-top:5px; color:#bf953f; text-align:center;"></div></div></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-quest-item" placeholder="Scribe a quick chore..." class="portal-input"><button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Add</button></div>`;
    const quests = await loadData('daily_quests');
    quests.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div></div>`; 
    });
    html += `</div></div>`; 
    return html;
}

async function buildTeacupHTML() {
    let html = `<h2 class="gold-text">The Stillness</h2><div class="portal-scroll-container">`;
    html += `<div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-bottom: 20px;"><textarea id="journal-text" placeholder="Record your thoughts or visions..." class="portal-input" style="height: 100px; resize: none; margin-bottom: 10px;"></textarea><div style="display: flex; justify-content: space-between; align-items: center;"><label for="journal-image" class="custom-file-label">Attach Image</label><input type="file" id="journal-image" accept="image/*" onchange="document.getElementById('file-name').innerText = this.files[0].name"><button onclick="submitJournalEntry()" id="journal-submit-btn" class="portal-btn">Seal Memory</button></div><div id="file-name" style="font-size: 0.8em; color: rgba(191,149,63,0.7); margin-top: 5px; font-style: italic;"></div><div id="journal-status" style="font-size: 0.8em; color: #a89f91; margin-top: 5px;"></div></div>`;
    const notes = await loadData('family_notes');
    notes.forEach(note => {
        let imageHtml = '';
        if (note.image_url) {
            let pubUrl = note.image_url;
            if (db && !note.image_url.startsWith('http') && !note.image_url.startsWith('data:')) {
                const { data } = db.storage.from('note-images').getPublicUrl(note.image_url);
                pubUrl = data.publicUrl;
            }
            imageHtml = `<img src="${pubUrl}" style="max-width: 100%; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(191,149,63,0.3);" alt="Memory"/>`;
        }
        const dateStr = new Date(note.timestamp || note.created_at).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
        html += `<div class="tea-card"><div style="font-size: 0.85em; color: rgba(191,149,63,0.8); margin-bottom: 8px; border-bottom: 1px dashed rgba(191, 149, 63, 0.3); padding-bottom: 5px; display: flex; justify-content: space-between;"><span>${dateStr}</span><button class="action-btn" style="color: #ff6b6b;" onclick="deleteJournalEntry('${note.id}')">Delete</button></div><p style="margin: 0; white-space: pre-wrap; font-size: 1.05em;">${note.note}</p>${imageHtml}</div>`;
    });
    return html + `</div>`;
}

async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const transactions = await loadData('ledger_transactions', 'created_at', false);
    let balance = 0;
    transactions.forEach(t => balance += parseFloat(t.amount || 0));
    html += `<div style="text-align:center; font-size:1.8em; color:#fcf6ba; font-family:'Cinzel', serif; margin-bottom:20px; text-shadow: 0 0 10px rgba(191,149,63,0.5);">Vault Balance: $${balance.toFixed(2)}</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Hearth Upkeep</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-bill" placeholder="Add a bill..." class="portal-input"><button onclick="addDynamicItem('hearth_upkeep', 'new-bill', 'ledger')" class="portal-btn">Add</button></div>`;
    const bills = await loadData('hearth_upkeep');
    bills.forEach(item => {
        const isDone = item.is_completed ? 'completed' : '';
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('hearth_upkeep', '${item.id}', ${item.is_completed}, 'ledger')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('hearth_upkeep', '${item.id}', 'ledger')">✕</div></div>`;
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Trade & Cashflow</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="ledger-desc" placeholder="Description..." class="portal-input" style="flex: 2;"><input type="number" step="0.01" id="ledger-amt" placeholder="+/- $" class="portal-input" style="flex: 1;"><button onclick="addLedgerEntry('ledger_transactions', 'ledger-desc', 'ledger-amt', 'ledger')" class="portal-btn">Log</button></div>`;
    transactions.forEach(item => {
        const amtValue = parseFloat(item.amount);
        const amtClass = amtValue >= 0 ? 'color: #8fce00;' : 'color: #ff6b6b;';
        const sign = amtValue >= 0 ? '+' : '';
        html += `<div class="quest-item" style="cursor: default; padding: 10px 15px;"><div class="quest-details" style="display:flex; justify-content:space-between; width:100%; align-items:center;"><h3 class="quest-title" style="font-size:0.95em; margin:0;">${item.desc}</h3><div style="font-family:'Quicksand', sans-serif; font-weight:bold; font-size:1.1em; ${amtClass}">${sign}$${amtValue.toFixed(2)}</div></div><div class="delete-icon" style="margin-left: 10px;" onclick="deleteLedgerEntry('ledger_transactions', '${item.id}', 'ledger')">✕</div></div>`;
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Treasury Goals</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="goal-title" placeholder="Goal..." class="portal-input" style="margin-bottom: 10px;"><input type="text" id="goal-amount" placeholder="Amount..." class="portal-input" style="margin-bottom: 10px;"><button onclick="addDetailedItem('savings_goals', 'goal-title', 'goal-amount', 'ledger')" class="portal-btn" style="width: 100%;">Set Goal</button></div>`;
    const goals = await loadData('savings_goals');
    goals.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">💰 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('savings_goals', '${item.id}', 'ledger')">✕</button></div><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>Target:</strong> <span style="color:#e0e0e0;">${item.description}</span></div></div>`;
    });
    html += `</div></div>`;
    return html;
}

async function buildWorkshopHTML() {
    let html = `<h2 class="gold-text">Artisan's Workshop</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Project Blueprints</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-project" placeholder="New project name..." class="portal-input"><button onclick="addDynamicItem('workshop_projects', 'new-project', 'workshop')" class="portal-btn">Add</button></div>`;
    const projects = await loadData('workshop_projects');
    projects.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('workshop_projects', '${item.id}', ${item.is_completed}, 'workshop')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('workshop_projects', '${item.id}', 'workshop')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Tool Chest</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-tool" placeholder="Tool maintenance..." class="portal-input"><button onclick="addDynamicItem('tool_chest', 'new-tool', 'workshop')" class="portal-btn">Add</button></div>`;
    const tools = await loadData('tool_chest');
    tools.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('tool_chest', '${item.id}', ${item.is_completed}, 'workshop')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('tool_chest', '${item.id}', 'workshop')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Material Pile</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="mat-name" placeholder="Material..." class="portal-input" style="margin-bottom: 10px;"><input type="text" id="mat-qty" placeholder="Quantity..." class="portal-input" style="margin-bottom: 10px;"><button onclick="addDetailedItem('material_pile', 'mat-name', 'mat-qty', 'workshop')" class="portal-btn" style="width: 100%;">Log Material</button></div>`;
    const mats = await loadData('material_pile');
    mats.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">🪵 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('material_pile', '${item.id}', 'workshop')">✕</button></div><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>In Stock:</strong> <span style="color:#e0e0e0;">${item.description}</span></div></div>`;
    });
    html += `</div></div>`;
    return html;
}

// NEW: The Apprentices' Ledger 
async function buildApprenticeHTML() {
    let html = `<h2 class="gold-text">Apprentices' Ledger</h2><div class="portal-scroll-container">`;

    // 1. TODAY's INSPIRATION (The 31-Day Rotating Archive)
    const dateDay = new Date().getDate(); // Gets a number between 1 and 31
    const indoorActivities = [
        "Build a magnificent blanket fort sanctuary and read a story inside with flashlights.",
        "Kitchen Alchemy: Bake a sweet treat and have the apprentices measure the ingredients.",
        "Construct an indoor obstacle course using pillows, chairs, and soft boundaries.",
        "Create a magical map of your house and hide a small 'treasure' for them to find.",
        "Hold a shadow-puppet theater using a flashlight and a blank wall.",
        "The Floor is Lava! Navigate the living room using only designated safe zones.",
        "Science Magic: Create a baking soda and vinegar volcano in the sink.",
        "Indoor Scavenger Hunt: Find 5 things that are red, 4 that are soft, and 3 that are round.",
        "Scribe a collaborative story: Take turns adding one sentence at a time.",
        "Put on an impromptu living room play or talent show.",
        "Have an indoor picnic on a blanket in the living room for lunch.",
        "DIY Instruments: Make shakers from dry beans and containers, or drums from pots.",
        "Cardboard Engineering: Turn an old box into a spaceship, castle, or car.",
        "Play a classic board game or put together a jigsaw puzzle.",
        "Tape a web of yarn across a hallway to create a 'laser maze' to navigate through.",
        "Sock Skating: Put on smooth socks and have a sliding contest on hard floors.",
        "Create 'stained glass' art using tissue paper and tape it to the window.",
        "Play 'Keep the Balloon Up' - don't let it touch the ground!",
        "Draw a life-sized self-portrait by tracing each other on large paper or cardboard.",
        "Have a living room dance party to freeze dance music.",
        "Hide and Seek, but hide a specific stuffed animal instead of people.",
        "Origami Hour: Learn to fold paper boats, hats, or jumping frogs.",
        "Write a letter or draw a picture to mail to a family member or friend.",
        "Host an indoor 'camping' trip with sleeping bags and ghost stories.",
        "Play 'Simon Says' or 'Follow the Leader'.",
        "Setup a mini 'store' and practice counting coins to buy snacks or toys.",
        "Make homemade playdough or slime using flour, water, and salt.",
        "Have a paper airplane making contest to see whose flies the farthest.",
        "Build the tallest tower possible out of plastic cups, books, or blocks.",
        "Look through old photo albums and tell stories about the memories.",
        "Quiet hour: Put on the Bardic Soundscapes and do independent drawing or reading."
    ];
    
    // Arrays start at 0, so we subtract 1 from the date!
    const dailyPrompt = indoorActivities[dateDay - 1]; 

    html += `<div class="alchemy-card" style="border-left: 3px solid #fcf6ba; background: rgba(191,149,63,0.15);">
                <h3 class="alchemy-title" style="color: #fff; font-size: 1.05em;">✨ Today's Inspiration</h3>
                <p style="color:#fcf6ba; font-style:italic; margin: 5px 0; font-size: 1.1em;">"${dailyPrompt}"</p>
             </div>`;

    // 2. CURRICULUM & LESSONS (The Checklist)
    html += `<div class="section-header closed" onclick="toggleSection(this)">Curriculum Quests</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-lesson" placeholder="Assign a lesson or task..." class="portal-input"><button onclick="addDynamicItem('apprentice_lessons', 'new-lesson', 'apprentice')" class="portal-btn">Assign</button></div>`;
    const lessons = await loadData('apprentice_lessons');
    lessons.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('apprentice_lessons', '${item.id}', ${item.is_completed}, 'apprentice')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('apprentice_lessons', '${item.id}', 'apprentice')">✕</div></div>`; 
    });
    html += `</div>`;

    // 3. MILESTONES & NOTES (Text Logging)
    html += `<div class="section-header closed" onclick="toggleSection(this)">Milestones & Notes</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="milestone-title" placeholder="Subject or Milestone..." class="portal-input" style="margin-bottom: 10px;"><textarea id="milestone-desc" placeholder="Notes on their progress..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('apprentice_milestones', 'milestone-title', 'milestone-desc', 'apprentice')" class="portal-btn" style="width: 100%;">Record Note</button></div>`;
    const milestones = await loadData('apprentice_milestones');
    milestones.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">📜 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('apprentice_milestones', '${item.id}', 'apprentice')">✕</button></div><p style="color:#d4c8a8; font-size:0.9em; margin:0; white-space:pre-wrap;">${item.description}</p></div>`;
    });
    html += `</div></div>`;

    return html;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2 class="gold-text">Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div style="color:rgba(191,149,63,0.5); margin:15px 0; font-size:0.9em; letter-spacing:2px;">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div style="color:#fcf6ba; font-size:1.3em; font-family:'Cinzel', serif; margin:15px 0;">Daily Focus: ${dynamicAlmanac.focus}</div><p style="color:#d4c8a8; font-style:italic; margin-bottom:15px;">"${dynamicAlmanac.entry}"</p><div style="color:#bf953f; font-size:0.95em; font-style:italic; margin-top:10px; border-top:1px dashed rgba(191,149,63,0.3); padding-top:10px;"><strong>Nature's Lore:</strong> ${dynamicAlmanac.planting}</div></div>`;
}

// === 5. UI LOGIC ===
function toggleAccordion(button) {
    button.classList.toggle('active');
    const panel = button.nextElementSibling;
    if (panel.style.maxHeight) { panel.style.maxHeight = null; panel.style.padding = "0 15px"; } 
    else { panel.style.maxHeight = panel.scrollHeight + 30 + "px"; panel.style.padding = "10px 15px"; }
}

function toggleSection(headerBtn) {
    headerBtn.classList.toggle('closed');
    const panel = headerBtn.nextElementSibling;
    panel.classList.toggle('closed');
}

// === 6. INTERACTIVE ACTIONS ===
async function addDynamicItem(table, inputId, portal) {
    const text = document.getElementById(inputId).value.trim();
    if (!text) return;
    await insertData(table, { text: text, is_completed: false });
    openPortal(portal); 
}

async function toggleDynamicItem(table, id, currentState, portal) {
    await updateData(table, id, { is_completed: !currentState });
    if (!currentState) feedFamiliar();
    openPortal(portal); 
}

async function deleteDynamicItem(table, id, portal) {
    await removeData(table, id);
    openPortal(portal);
}

async function addDetailedItem(table, titleId, descId, portal) {
    const title = document.getElementById(titleId).value.trim();
    const desc = document.getElementById(descId).value.trim();
    if (!title) return;
    await insertData(table, { title: title, description: desc });
    openPortal(portal);
}

async function deleteDetailedItem(table, id, portal) {
    await removeData(table, id);
    openPortal(portal);
}

// === LEDGER MATH FUNCTIONS ===
async function addLedgerEntry(table, descId, amtId, portal) {
    const desc = document.getElementById(descId).value.trim();
    const amtStr = document.getElementById(amtId).value.trim();
    const amount = parseFloat(amtStr);
    if (!desc || isNaN(amount)) return; 
    await insertData(table, { desc: desc, amount: amount });
    feedFamiliar();
    openPortal(portal); 
}

async function deleteLedgerEntry(table, id, portal) {
    await removeData(table, id);
    openPortal(portal);
}

async function addEvent() {
    const title = document.getElementById('ev-title').value.trim();
    const date = document.getElementById('ev-date').value;
    if (!title) return;
    document.getElementById('ev-status').innerText = "Scribing...";
    await insertData('calendar_events', { title: title, start_date: date, text: 'pending' });
    openPortal('cat');
}

async function deleteEvent(id) {
    await removeData('calendar_events', id);
    openPortal('cat');
}

async function toggleEvent(id, currentText) {
    const newState = currentText === 'completed' ? 'pending' : 'completed';
    await updateData('calendar_events', id, { text: newState });
    if (newState === 'completed') feedFamiliar();
    openPortal('cat');
}

async function submitJournalEntry() {
    const textInput = document.getElementById('journal-text').value.trim();
    const fileInput = document.getElementById('journal-image').files[0];
    const submitBtn = document.getElementById('journal-submit-btn');
    if (!textInput && !fileInput) return;
    submitBtn.innerText = "Sealing..."; submitBtn.disabled = true;
    try {
        let imageUrl = null;
        if (fileInput && db) {
            const fileName = `${Math.random()}.${fileInput.name.split('.').pop()}`;
            const { error } = await db.storage.from('note-images').upload(fileName, fileInput);
            if (!error) imageUrl = fileName;
        } else if (fileInput) {
             const reader = new FileReader();
             reader.onload = async (e) => {
                 await insertData('family_notes', { note: textInput, image_url: e.target.result });
                 openPortal('teacup');
             };
             reader.readAsDataURL(fileInput);
             return;
        }
        await insertData('family_notes', { note: textInput, image_url: imageUrl });
        openPortal('teacup');
    } catch (error) { submitBtn.innerText = "Seal Memory"; submitBtn.disabled = false; }
}

async function deleteJournalEntry(id) {
    await removeData('family_notes', id);
    openPortal('teacup');
}

// === 7. OPEN & CLOSE PORTALS ===
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    overlay.classList.add('active'); if (bg) bg.classList.add('dimmed');

    if (portalName === 'audio') {
        content.innerHTML = portalData['audio']; 
        if (soundscape) { content.appendChild(soundscape); soundscape.style.display = 'grid'; }
        return; 
    }

    content.innerHTML = `<h2 class="gold-text" style="text-align: center; margin-top: 20px;">Consulting... ⏳</h2>`;
    if (soundscape) { soundscape.style.display = 'none'; document.body.appendChild(soundscape); }

    if (portalName === 'grimoire') content.innerHTML = await buildGrimoireHTML();
    else if (portalName === 'cat') content.innerHTML = await buildBountyBoardHTML();
    else if (portalName === 'teacup') content.innerHTML = await buildTeacupHTML();
    else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
    else if (portalName === 'alchemy') content.innerHTML = await buildApothecaryHTML(); 
    else if (portalName === 'herbs') content.innerHTML = await buildHerbsHTML(); 
    else if (portalName === 'sewing') content.innerHTML = await buildSewingHTML();
    else if (portalName === 'ledger') content.innerHTML = await buildLedgerHTML();
    else if (portalName === 'workshop') content.innerHTML = await buildWorkshopHTML();
    else if (portalName === 'apprentice') content.innerHTML = await buildApprenticeHTML(); 
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    if (soundscape) { soundscape.style.display = 'none'; document.body.appendChild(soundscape); }
    calMonth = new Date().getMonth(); calYear = new Date().getFullYear();
}

// === 8. BARDIC SOUNDSCAPES ===
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('play-btn') && e.target.hasAttribute('data-target')) {
        const audioId = e.target.getAttribute('data-target');
        const audioEl = document.getElementById(audioId);
        if (audioEl) {
            if (audioEl.paused) {
                audioEl.play().catch(err => console.error("Audio playback failed:", err));
                e.target.classList.add('active'); e.target.style.color = "#fff";
            } else {
                audioEl.pause(); e.target.classList.remove('active'); e.target.style.color = "#d4c8a8";
            }
        }
    }
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('volume-slider') && e.target.hasAttribute('data-target')) {
        const audioId = e.target.getAttribute('data-target');
        const audioEl = document.getElementById(audioId);
        if (audioEl) { audioEl.volume = e.target.value; }
    }
});

// === 9. THE FAMILIAR ===
let familiarXP = 0;
const maxXP = 5;

function feedFamiliar() {
    if (familiarXP < maxXP) { familiarXP++; updateFamiliarUI(); }
}

function updateFamiliarUI() {
    const xpCircle = document.getElementById('xp-circle');
    const avatar = document.getElementById('familiar-avatar');
    if (!xpCircle || !avatar) return;
    const offset = 289 - (289 * (familiarXP / maxXP));
    xpCircle.style.strokeDashoffset = offset;
    avatar.className = '';
    if (familiarXP === 0) {
        avatar.src = "cat_sleep.jpg"; avatar.classList.add('state-sleeping');
        xpCircle.style.stroke = "#bf953f";
    } else if (familiarXP > 0 && familiarXP < maxXP) {
        avatar.src = "cat_sit.jpg"; avatar.classList.add('state-awake');
        xpCircle.style.stroke = "#bf953f";
    } else if (familiarXP === maxXP) {
        avatar.src = "cat_play.jpg"; avatar.classList.add('state-zoomies');
        xpCircle.style.stroke = "#fcf6ba";
    }
}

function claimFamiliarLoot() {
    const speech = document.getElementById('familiar-speech');
    if (!speech) return;
    if (familiarXP < maxXP) { feedFamiliar(); return; }
    const lootMessages = ["✨ Purring shadows.", "🦇 Rare gold!", "🔮 Glimmering magic.", "📜 New spells.", "🐾 Headbutt!"];
    speech.innerText = lootMessages[Math.floor(Math.random() * lootMessages.length)];
    speech.classList.remove('hidden');
    setTimeout(() => { speech.classList.add('hidden'); familiarXP = 0; updateFamiliarUI(); }, 4000);
}

setTimeout(updateFamiliarUI, 200);
