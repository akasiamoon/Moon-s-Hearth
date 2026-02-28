// === 0. SUPABASE CONNECTION ===
const supabaseUrl = 'https://yflfpwcaowzkoxqnohso.supabase.co';
const supabaseKey = 'sb_publishable_OUXpGQk3QkOoUu94S9YZNg_Sb34-Jc4';
const db = supabase.createClient(supabaseUrl, supabaseKey);

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


// === 3. LITERAL CALENDAR GENERATOR ===
function generateCalendarHTML(events) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); 
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = today.toLocaleDateString('default', { month: 'long' });

    let html = `
    <div class="calendar-wrapper">
        <h3 class="gold-text" style="margin-bottom: 15px; font-size: 1.2em;">${monthName} ${year}</h3>
        <div class="calendar-grid">
            <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div>
            <div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>`;

    for (let i = 0; i < firstDay; i++) { 
        html += `<div class="cal-cell empty"></div>`; 
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        
        // Mark dates that have appointments
        const hasEvent = events.some(e => e.start_date && e.start_date.startsWith(dateStr) && e.text !== 'completed');
        const marker = hasEvent ? `<div class="cal-marker"></div>` : '';
        const isToday = (day === today.getDate()) ? 'today' : '';
        
        // Clicking a day opens the scribe form
        html += `<div class="cal-cell ${isToday}" onclick="prefillDate('${dateStr}')"><span>${day}</span>${marker}</div>`;
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
    let html = `<h2>Kitchen Grimoire</h2><div class="portal-scroll-container">`;

    // RECIPES
    html += `<div class="section-header closed" onclick="toggleSection(this)">Sacred Recipes</div><div class="section-panel closed">`;
    [...myRecipes, ...myTeas].forEach(item => {
        let ingList = item.ingredients ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : '';
        html += `
        <div class="grimoire-item">
            <button class="grimoire-header" onclick="toggleAccordion(this)">${item.icon || ''} ${item.title}</button>
            <div class="grimoire-panel">
                <p><em>${item.description}</em></p>
                ${item.brew ? `<div style="color:#bf953f; font-style:italic; margin-bottom:10px;">${item.brew}</div>` : ''}
                ${ingList ? `<ul>${ingList}</ul>` : ''}
                ${item.instructions ? `<p>${item.instructions}</p>` : ''}
            </div>
        </div>`;
    });
    html += `</div>`; 

    // WEEKLY PROVISIONS
    html += `<div class="section-header closed" onclick="toggleSection(this)">Weekly Provisions</div><div class="section-panel closed">
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-meal-item" placeholder="e.g. Moonday: Stew..." class="portal-input">
            <button onclick="addDynamicItem('meal_plans', 'new-meal-item', 'grimoire')" class="portal-btn">Add</button>
        </div>`;
        
    const { data: meals } = await db.from('meal_plans').select('*').order('created_at', { ascending: true });
    if (meals) {
        meals.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('meal_plans', '${item.id}', ${item.is_completed}, 'grimoire')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('meal_plans', '${item.id}', 'grimoire')">✕</div>
            </div>`;
        });
    }
    html += `</div>`;

    // MARKET LIST
    html += `<div class="section-header closed" onclick="toggleSection(this)">Market List</div><div class="section-panel closed">
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-market-item" placeholder="Add an item..." class="portal-input">
            <button onclick="addDynamicItem('market_items', 'new-market-item', 'grimoire')" class="portal-btn">Add</button>
        </div>`;
        
    const { data: marketItems } = await db.from('market_items').select('*').order('created_at', { ascending: false });
    if (marketItems) {
        marketItems.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('market_items', '${item.id}', ${item.is_completed}, 'grimoire')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('market_items', '${item.id}', 'grimoire')">✕</div>
            </div>`;
        });
    }
    html += `</div></div>`; 
    return html;
}

async function buildBountyBoardHTML() {
    let html = `<h2>The Bounty Board</h2><div class="portal-scroll-container">`;
    const { data: events } = await db.from('calendar_events').select('*').order('start_date', { ascending: true });
    
    // CALENDAR GRID
    html += generateCalendarHTML(events || []);

    // ALIGNMENTS LEDGER
    html += `<div class="section-header closed" onclick="toggleSection(this)">Alignments Ledger</div><div class="section-panel closed">`;
    if (events && events.length > 0) {
        events.forEach(ev => {
            const isDone = ev.text === 'completed' ? 'completed' : ''; 
            const dateStr = ev.start_date ? new Date(ev.start_date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleEvent('${ev.id}', '${ev.text}')">
                <div class="quest-checkbox"></div>
                <div class="quest-details">
                    <h3 class="quest-title">${ev.title}</h3>
                    <div style="font-size: 0.8em; color: rgba(191, 149, 63, 0.8);">${dateStr}</div>
                </div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteEvent('${ev.id}')">✕</div>
            </div>`;
        });
    }
    html += `</div>`; 

    // SCRIBE ALIGNMENT
    html += `
    <div id="scribe-section" class="section-header closed" onclick="toggleSection(this)">Scribe Alignment</div>
    <div id="scribe-panel" class="section-panel closed">
        <div style="margin-top: 10px; margin-bottom: 15px;">
            <input type="text" id="ev-title" placeholder="Alignment Title..." class="portal-input" style="margin-bottom: 10px;">
            <input type="datetime-local" id="ev-date" class="portal-input" style="margin-bottom: 10px;">
            <button onclick="addEvent()" class="portal-btn" style="width: 100%;">Seal in the Stars</button>
            <div id="ev-status" style="font-size: 0.8em; margin-top:5px; color:#bf953f; text-align:center;"></div>
        </div>
    </div>`;

    // DAILY ENDEAVORS
    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed">
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-quest-item" placeholder="Scribe a quick chore..." class="portal-input">
            <button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Add</button>
        </div>`;
        
    const { data: quests } = await db.from('daily_quests').select('*').order('created_at', { ascending: false });
    if (quests) {
        quests.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div>
            </div>`;
        });
    }
    html += `</div></div>`; 
    return html;
}

async function buildTeacupHTML() {
    let html = `<h2>The Stillness</h2><div class="portal-scroll-container">`;
    
    // JOURNAL INPUT
    html += `
        <div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-bottom: 20px;">
            <textarea id="journal-text" placeholder="Record your thoughts or visions..." class="portal-input" style="height: 100px; resize: none; margin-bottom: 10px;"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <label for="journal-image" class="custom-file-label">Attach Image</label>
                <input type="file" id="journal-image" accept="image/*" onchange="document.getElementById('file-name').innerText = this.files[0].name">
                <button onclick="submitJournalEntry()" id="journal-submit-btn" class="portal-btn">Seal Memory</button>
            </div>
            <div id="file-name" style="font-size: 0.8em; color: rgba(191,149,63,0.7); margin-top: 5px; font-style: italic;"></div>
            <div id="journal-status" style="font-size: 0.8em; color: #a89f91; margin-top: 5px;"></div>
        </div>`;

    // PAST JOURNALS
    const { data: notes } = await db.from('family_notes').select('*').order('created_at', { ascending: false });
    if (notes) {
        notes.forEach(note => {
            let imageHtml = '';
            if (note.image_url) {
                const { data } = db.storage.from('note-images').getPublicUrl(note.image_url);
                imageHtml = `<img src="${data.publicUrl}" style="max-width: 100%; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(191,149,63,0.3);" alt="Memory"/>`;
            }
            const dateStr = new Date(note.timestamp || note.created_at).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
            html += `
            <div class="tea-card">
                <div style="font-size: 0.85em; color: rgba(191,149,63,0.8); margin-bottom: 8px; border-bottom: 1px dashed rgba(191, 149, 63, 0.3); padding-bottom: 5px; display: flex; justify-content: space-between;">
                    <span>${dateStr}</span>
                    <button class="action-btn" style="color: #ff6b6b;" onclick="deleteJournalEntry('${note.id}')">Delete</button>
                </div>
                <p style="margin: 0; white-space: pre-wrap; font-size: 1.05em;">${note.note}</p>
                ${imageHtml}
            </div>`;
        });
    }
    return html + `</div>`;
}

function buildApothecaryHTML() {
    let html = `<h2>Apothecary</h2><div class="portal-scroll-container">`;
    myApothecary.forEach(item => { 
        html += `
        <div class="alchemy-card">
            <h3 class="alchemy-title">${item.icon} ${item.title}</h3>
            <p style="color:#d4c8a8; font-style:italic; margin-top:0;">${item.description}</p>
            <div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>Components:</strong> <span style="color:#e0e0e0;">${item.ingredients}</span></div>
            <p style="color:#d4c8a8; font-size:0.9em; margin:0;">${item.instructions}</p>
        </div>`; 
    });
    return html + `</div>`;
}

function buildHerbsHTML() {
    let html = `<h2>The Drying Rack</h2><div class="portal-scroll-container" id="herbs-container">`;
    myHerbs.forEach(herb => { 
        html += `
        <div class="herb-card">
