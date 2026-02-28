// === 0. SUPABASE CONNECTION ===
const supabaseUrl = 'https://yflfpwcaowzkoxqnohso.supabase.co';
const supabaseKey = 'sb_publishable_OUXpGQk3QkOoUu94S9YZNg_Sb34-Jc4';
const db = supabase.createClient(supabaseUrl, supabaseKey);

// === 1. LOCAL DATA ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings. Earthy and grounding.", ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], instructions: "Simmer over a low hearth fire until the potatoes yield and the broth is thick and fragrant." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling or a morning study session.", ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." }
];

const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "Steep 3 mins at 212°F", description: "A classic, elegant blend brightened with citrus and a touch of honey. Perfect for finding a quiet center in the afternoon." },
    { title: "Lavender Chamomile Nightcap", icon: "🍵", brew: "Steep 5 mins at 200°F", description: "A deeply soothing floral blend meant to quiet a racing mind and invite restful, restorative sleep." },
    { title: "Peppermint Clarity", icon: "🫖", brew: "Steep 4 mins at 212°F", description: "Bright, awakening, and sharp. An excellent companion for deciphering the Grimoire or writing code." }
];

const myApothecary = [
    { title: "Vibrant Ink Protectant Salve", icon: "🏺", description: "A deeply nourishing balm to protect and preserve skin artwork from fading.", ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E", instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set. Apply a thin layer to healed ink before braving the sun." },
    { title: "Wanderer's Muscle Rub", icon: "🌿", description: "A cooling and warming salve for weary legs after a long day's journey.", ingredients: "Coconut Oil, Peppermint, Camphor, Arnica Extract", instructions: "Blend into a smooth paste. Massage into aching muscles to draw out the cold and ease fatigue." }
];

const myHerbs = [
    { title: "Lavender", icon: "🪻", properties: "Restoration & Calm", description: "Hang near the window to sweeten the breeze. Excellent for sleep pillows and soothing teas." },
    { title: "Chamomile", icon: "🏵️", properties: "Peace & Warding", description: "Tiny suns that chase away the cold. Brew into a gentle tea to settle nerves and invite stillness." }
];

const mySewing = [
    { title: "Hearth Apron", status: "Completed", fabric: "Sturdy Canvas", notes: "Added deep pockets for gathering herbs and holding the kitchen Grimoire notes." }
];

// === 2. THE LIVING FEN ALMANAC ===
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
    const today = new Date(), month = today.getMonth(), dayOfWeek = today.getDay(), moon = getMoonPhase(today);
    dynamicAlmanac.moonPhase = moon.phase;
    dynamicAlmanac.season = ["Deep Winter", "Late Winter", "Early Spring", "High Spring", "Early Summer", "Midsummer", "Late Summer", "Early Autumn", "Deep Autumn", "Frostfall", "Early Winter", "Midwinter"][month];
    dynamicAlmanac.planting = moon.isWaxing ? "The moon waxes. Sow above-ground crops." : "The moon wanes. Focus on root crops and rest.";
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
const portalData = { 'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>' };

// === 3. HTML BUILDERS ===

// 🔮 GRIMOIRE: Recipes, Market, & Dynamic Meal Plans
async function buildGrimoireHTML() {
    let html = `<h2>Kitchen Grimoire</h2><div class="portal-scroll-container">`;

    // ALL CLOSED BY DEFAULT (Added 'closed' class to headers and panels)
    
    // SECTION 1: Recipes & Brews
    html += `<div class="section-header closed" onclick="toggleSection(this)">Sacred Recipes & Brews</div><div class="section-panel closed">`;
    const allBrews = [...myRecipes, ...myTeas]; 
    allBrews.forEach(item => {
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

    // SECTION 2: Live Meal Plans
    html += `<div class="section-header closed" onclick="toggleSection(this)">Weekly Provisions</div><div class="section-panel closed">`;
    html += `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-meal-item" placeholder="e.g. Moonday: Stew..." class="portal-input">
            <button onclick="addDynamicItem('meal_plans', 'new-meal-item', 'grimoire')" class="portal-btn">Add</button>
        </div>
    `;
    const { data: meals, error: mealErr } = await db.from('meal_plans').select('*').order('created_at', { ascending: true });
    if (!mealErr && meals) {
        meals.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('meal_plans', '${item.id}', ${item.is_completed}, 'grimoire')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('meal_plans', '${item.id}', 'grimoire')">✕</div>
            </div>`;
        });
    } else { html += `<p style="color: rgba(191,149,63,0.5); font-style: italic; font-size: 0.9em;">(Create 'meal_plans' in Supabase to save these)</p>`; }
    html += `</div>`;

    // SECTION 3: Live Market List
    html += `<div class="section-header closed" onclick="toggleSection(this)">Market List</div><div class="section-panel closed">`;
    html += `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-market-item" placeholder="Add an item..." class="portal-input">
            <button onclick="addDynamicItem('market_items', 'new-market-item', 'grimoire')" class="portal-btn">Add</button>
        </div>
    `;
    const { data: marketItems, error: mktErr } = await db.from('market_items').select('*').order('created_at', { ascending: false });
    if (!mktErr && marketItems) {
        marketItems.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('market_items', '${item.id}', ${item.is_completed}, 'grimoire')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('market_items', '${item.id}', 'grimoire')">✕</div>
            </div>`;
        });
    }
    html += `</div>`; 
    return html + `</div>`;
}

// 🛡️ BOUNTY BOARD: Dynamic Quests & Calendar
async function buildBountyBoardHTML() {
    let html = `<h2>The Bounty Board</h2><div class="portal-scroll-container">`;
    
    // SECTION 1: Alignments (Events)
    html += `<div class="section-header closed" onclick="toggleSection(this)">Upcoming Alignments</div><div class="section-panel closed">`;
    const { data: events, error } = await db.from('calendar_events').select('*').order('start_date', { ascending: true });

    if (error) { html += `<p style="color:#ff5555;">Cannot read the calendar.</p>`; } 
    else if (events && events.length > 0) {
        events.forEach(ev => {
            const isDone = ev.text === 'completed' ? 'completed' : ''; 
            const dateStr = ev.start_date ? new Date(ev.start_date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleEvent('${ev.id}', '${ev.text}')">
                <div class="quest-checkbox"></div>
                <div class="quest-details">
                    <h3 class="quest-title" style="margin-bottom: 2px;">${ev.title}</h3>
                    <div style="font-size: 0.85em; color: rgba(191, 149, 63, 0.8);">${dateStr}</div>
                </div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteEvent('${ev.id}')">✕</div>
            </div>`;
        });
    }
    html += `</div>`; 

    // SECTION 2: Scribe New Alignment
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe Alignment</div><div class="section-panel closed">
        <div style="margin-top: 10px; margin-bottom: 15px;">
            <input type="text" id="ev-title" placeholder="Alignment Title..." class="portal-input" style="margin-bottom: 10px;">
            <input type="datetime-local" id="ev-date" class="portal-input" style="margin-bottom: 10px;">
            <button onclick="addEvent()" class="portal-btn" style="width: 100%;">Add to Calendar</button>
            <div id="ev-status" style="font-size: 0.8em; margin-top:5px; color:#bf953f;"></div>
        </div>
    </div>`;

    // SECTION 3: Dynamic Daily Endeavors
    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed">`;
    html += `
        <div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;">
            <input type="text" id="new-quest-item" placeholder="Scribe a quick chore..." class="portal-input">
            <button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Add</button>
        </div>
    `;
    const { data: quests, error: qErr } = await db.from('daily_quests').select('*').order('created_at', { ascending: false });
    if (!qErr && quests) {
        quests.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')">
                <div class="quest-checkbox"></div>
                <div class="quest-details"><h3 class="quest-title">${item.text}</h3></div>
                <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div>
            </div>`;
        });
    } else { html += `<p style="color: rgba(191,149,63,0.5); font-style: italic; font-size: 0.9em;">(Create 'daily_quests' in Supabase to save these)</p>`; }
    html += `</div>`; 
    return html + `</div>`;
}

// 🕯️ THE STILLNESS: Journal
async function buildTeacupHTML() {
    let html = `<h2>The Stillness</h2><div class="portal-scroll-container">`;
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
        </div>
    `;

    const { data: notes, error } = await db.from('family_notes').select('*').order('created_at', { ascending: false });
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
    myApothecary.forEach(item => { html += `<div class="alchemy-card"><h3 class="alchemy-title">${item.icon} ${item.title}</h3><p class="alchemy-desc">${item.description}</p><div class="alchemy-ingredients"><strong>Components:</strong> <span>${item.ingredients}</span></div><p class="alchemy-instructions">${item.instructions}</p></div>`; });
    return html + `</div>`;
}

function buildHerbsHTML() {
    let html = `<h2>The Drying Rack</h2><div class="portal-scroll-container" id="herbs-container">`;
    myHerbs.forEach(herb => { html += `<div class="herb-card"><div class="herb-icon">${herb.icon}</div><h3 class="herb-title">${herb.title}</h3><div class="herb-prop">${herb.properties}</div><p class="herb-desc">${herb.description}</p></div>`; });
    return html + `</div>`;
}

function buildSewingHTML() {
    let html = `<h2>Measurement Log</h2><div class="portal-scroll-container">`;
    mySewing.forEach(project => { html += `<div class="sewing-card"><h3 class="sewing-title">${project.title}</h3><div class="sewing-status">${project.status}</div><div class="sewing-fabric"><strong>Fabric:</strong> ${project.fabric}</div><div class="sewing-notes">${project.notes}</div></div>`; });
    return html + `</div>`;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2>Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div class="almanac-divider">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div class="almanac-focus">Daily Focus: ${dynamicAlmanac.focus}</div><p class="almanac-entry">"${dynamicAlmanac.entry}"</p><div class="almanac-planting"><strong>Nature's Lore:</strong> ${dynamicAlmanac.planting}</div></div>`;
}

// === 4. UI LOGIC ===
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

// === 5. DYNAMIC SUPABASE FUNCTIONS ===
async function addDynamicItem(table, inputId, portal) {
    const text = document.getElementById(inputId).value.trim();
    if (!text) return;
    await db.from(table).insert([{ text: text, is_completed: false }]);
    openPortal(portal); 
}
async function toggleDynamicItem(table, id, currentState, portal) {
    await db.from(table).update({ is_completed: !currentState }).eq('id', id);
    openPortal(portal); 
}
async function deleteDynamicItem(table, id, portal) {
    await db.from(table).delete().eq('id', id);
    openPortal(portal);
}

// Events
async function addEvent() {
    const title = document.getElementById('ev-title').value.trim();
    const date = document.getElementById('ev-date').value;
    if (!title) return;
    document.getElementById('ev-status').innerText = "Scribing...";
    await db.from('calendar_events').insert([{ title: title, start_date: date, text: 'pending' }]);
    openPortal('cat');
}
async function deleteEvent(id) {
    await db.from('calendar_events').delete().eq('id', id);
    openPortal('cat');
}
async function toggleEvent(id, currentText) {
    const newState = currentText === 'completed' ? 'pending' : 'completed';
    await db.from('calendar_events').update({ text: newState }).eq('id', id);
    openPortal('cat');
}

// Journal
async function submitJournalEntry() {
    const textInput = document.getElementById('journal-text').value.trim();
    const fileInput = document.getElementById('journal-image').files[0];
    const submitBtn = document.getElementById('journal-submit-btn');

    if (!textInput && !fileInput) return;
    submitBtn.innerText = "Sealing..."; submitBtn.disabled = true;

    try {
        let imageUrl = null;
        if (fileInput) {
            const fileName = `${Math.random()}.${fileInput.name.split('.').pop()}`;
            const { error } = await db.storage.from('note-images').upload(fileName, fileInput);
            if (error) throw error;
            imageUrl = fileName;
        }
        await db.from('family_notes').insert([{ note: textInput, image_url: imageUrl, timestamp: new Date().toISOString() }]);
        openPortal('teacup');
    } catch (error) {
        submitBtn.innerText = "Seal Memory"; submitBtn.disabled = false;
    }
}
async function deleteJournalEntry(id) {
    await db.from('family_notes').delete().eq('id', id);
    openPortal('teacup');
}

// === 6. OPEN & CLOSE PORTALS (PROTECTING AUDIO) ===
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    
    overlay.classList.add('active'); if (bg) bg.classList.add('dimmed');

    // Protect Audio Logic: Only show loading if NOT audio
    if (portalName !== 'audio') {
        content.innerHTML = `<h2 style="text-align: center; margin-top: 20px;">Consulting the archive... ⏳</h2>`;
        if (soundscape) soundscape.style.display = 'none';
    }

    if (portalName === 'grimoire') content.innerHTML = await buildGrimoireHTML();
    else if (portalName === 'cat') content.innerHTML = await buildBountyBoardHTML();
    else if (portalName === 'teacup') content.innerHTML = await buildTeacupHTML();
    else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
    else if (portalName === 'alchemy') content.innerHTML = buildApothecaryHTML(); 
    else if (portalName === 'herbs') content.innerHTML = buildHerbsHTML(); 
    else if (portalName === 'sewing') content.innerHTML = buildSewingHTML();
    else if (portalName === 'audio') {
        content.innerHTML = portalData['audio'];
        if (soundscape) soundscape.style.display = 'grid'; // Ensure audio grid displays
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    if (soundscape) soundscape.style.display = 'none';
}

window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}
