// === 0. SUPABASE CONNECTION ===
const supabaseUrl = 'https://yflfpwcaowzkoxqnohso.supabase.co';
const supabaseKey = 'sb_publishable_OUXpGQk3QkOoUu94S9YZNg_Sb34-Jc4';
const db = supabase.createClient(supabaseUrl, supabaseKey);

// A function to fetch your events whenever we need them
async function fetchCalendarEvents() {
    try {
        const { data: events, error } = await db
            .from('calendar_events')
            .select('id, title, start_date')
            .order('start_date', { ascending: true });

        if (error) {
            console.error("The connection was interrupted:", error.message);
            return [];
        }
        
        console.log("Calendar events retrieved from the archive:", events);
        return events;
        
    } catch (err) {
        console.error("Could not read the stars:", err);
        return [];
    }
}

// === 1. THE RECIPE BOOK ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings. Earthy and grounding.", ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], instructions: "Simmer over a low hearth fire until the potatoes yield and the broth is thick and fragrant." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling or a morning study session.", ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." }
];

// === 2. THE BOUNTY BOARD (Daily Quests) ===
const myQuests = [
    { title: "Familiar Care", description: "Ensure the cat is fed, watered, and sufficiently adored." },
    { title: "Hearth Tender", description: "Prepare a warm meal from the Grimoire." },
    { title: "Arcane Tinkering", description: "Spend a little time working on app development and code." },
    { title: "The Stillness", description: "Brew a cup of tea, listen to the rain, and take a moment to rest." }
];

// === 3. THE APOTHECARY (Alchemy) ===
const myApothecary = [
    { title: "Vibrant Ink Protectant Salve", icon: "🏺", description: "A deeply nourishing balm to protect and preserve skin artwork from fading.", ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E", instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set. Apply a thin layer to healed ink before braving the sun." },
    { title: "Wanderer's Muscle Rub", icon: "🌿", description: "A cooling and warming salve for weary legs after a long day's journey.", ingredients: "Coconut Oil, Peppermint, Camphor, Arnica Extract", instructions: "Blend into a smooth paste. Massage into aching muscles to draw out the cold and ease fatigue." },
    { title: "Clarity Focus Roll-on", icon: "✨", description: "A sharp, bright scent to clear the mind before studying the Grimoire or writing code.", ingredients: "Jojoba Oil, Rosemary, Lemon, Frankincense", instructions: "Combine in a small glass vial with a rollerball. Apply to the wrists and temples when the mental fog rolls in." }
];

// === 4. THE DRYING RACK (Herbs) ===
const myHerbs = [
    { title: "Lavender", icon: "🪻", properties: "Restoration & Calm", description: "Hang near the window to sweeten the breeze. Excellent for sleep pillows and soothing teas." },
    { title: "Eucalyptus", icon: "🌿", properties: "Clearing & Breath", description: "Hang in the washroom where the steam can release its oils. Clears the chest and the mind." },
    { title: "Dandelion Root", icon: "🌼", properties: "Resilience & Grounding", description: "A stubborn, persistent survivor. Roast the dried roots for a deep, earthy brew that fortifies the spirit." },
    { title: "Chamomile", icon: "🏵️", properties: "Peace & Warding", description: "Tiny suns that chase away the cold. Brew into a gentle tea to settle nerves and invite stillness." }
];

// === 5. THE STILLNESS (Teacup) ===
const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "Steep 3 mins at 212°F", description: "A classic, elegant blend brightened with citrus and a touch of honey. Perfect for finding a quiet center in the afternoon." },
    { title: "Lavender Chamomile Nightcap", icon: "🍵", brew: "Steep 5 mins at 200°F", description: "A deeply soothing floral blend meant to quiet a racing mind and invite restful, restorative sleep." },
    { title: "Peppermint Clarity", icon: "🫖", brew: "Steep 4 mins at 212°F", description: "Bright, awakening, and sharp. An excellent companion for deciphering the Grimoire or writing code." }
];

// === 6. THE MEASUREMENT LOG (Sewing) ===
const mySewing = [
    { title: "Spring Tunic", status: "In Progress", fabric: "Linen Blend (Forest Green)", notes: "Measurements: Bust 38, Waist 30. Remember to add an extra inch to the hem for draping." },
    { title: "Traveling Cloak", status: "Planning", fabric: "Heavy Wool (Midnight Blue)", notes: "Need to order clasps. Requires 3 yards of fabric and a satin lining for the hood." },
    { title: "Hearth Apron", status: "Completed", fabric: "Sturdy Canvas", notes: "Added deep pockets for gathering herbs and holding the kitchen Grimoire notes." }
];

// === 7. THE LIVING FEN ALMANAC (Dynamic Data) ===
let dynamicAlmanac = { season: "", moonPhase: "", temp: "--°F", weather: "", planting: "", focus: "", entry: "" };

function getMoonPhase(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month < 3) { year--; month += 12; }
    let jd = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4) + day + Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) - 1524.5;
    let phaseDays = ((jd - 2451549.5) / 29.53 % 1) * 29.53;
    if (phaseDays < 1.84) return { phase: "New Moon 🌑", isWaxing: true };
    if (phaseDays < 5.53) return { phase: "Waxing Crescent 🌒", isWaxing: true };
    if (phaseDays < 9.22) return { phase: "First Quarter 🌓", isWaxing: true };
    if (phaseDays < 12.91) return { phase: "Waxing Gibbous 🌔", isWaxing: true };
    if (phaseDays < 16.61) return { phase: "Full Moon 🌕", isWaxing: false };
    if (phaseDays < 20.30) return { phase: "Waning Gibbous 🌖", isWaxing: false };
    if (phaseDays < 23.99) return { phase: "Last Quarter 🌗", isWaxing: false };
    if (phaseDays < 27.68) return { phase: "Waning Crescent 🌘", isWaxing: false };
    return { phase: "New Moon 🌑", isWaxing: true };
}

function updateNatureLore() {
    const today = new Date(), month = today.getMonth(), dayOfWeek = today.getDay(), moon = getMoonPhase(today);
    dynamicAlmanac.moonPhase = moon.phase;
    dynamicAlmanac.season = ["Deep Winter", "Late Winter", "Early Spring", "High Spring", "Early Summer", "Midsummer", "Late Summer", "Early Autumn", "Deep Autumn", "Frostfall", "Early Winter", "Midwinter"][month];
    if (month >= 2 && month <= 4) dynamicAlmanac.planting = moon.isWaxing ? "The moon waxes. Sow above-ground crops and leafy herbs." : "The moon wanes. Focus on root crops and soil prep.";
    else if (month >= 5 && month <= 7) dynamicAlmanac.planting = moon.isWaxing ? "Peak growth. Gather flowers at the height of the moon." : "The moon wanes. Harvest herbs for drying and weed beds.";
    else if (month >= 8 && month <= 10) dynamicAlmanac.planting = moon.isWaxing ? "Late sowing for winter greens. Gather the autumn harvest." : "The earth sleeps. Clear dead growth and turn compost.";
    else dynamicAlmanac.planting = moon.isWaxing ? "The soil slumbers. Plan the spring garden and review the Grimoire." : "Deep rest. Tend the hearth and protect roots from frost.";

    const dailyFocuses = [
        { focus: "Radiance & Restoration", entry: "Bask in the light of the week's accomplishments. Rest, reset, and let the hearth fire warm your spirit." }, 
        { focus: "Intuition & Planning", entry: "The week begins anew. Trust your instincts, outline your tasks, and step forward with quiet purpose." }, 
        { focus: "Momentum & The Forge", entry: "Channel your energy into creation. Tackle the Bounty Board with vigor and stoke the fires of your projects." }, 
        { focus: "Communication & Study", entry: "A day for the Grimoire and the code. Focus on learning, writing, and clear pathways of thought." }, 
        { focus: "Expansion & Growth", entry: "Look beyond the immediate. Nurture your long-term goals and let your roots stretch deeper into the soil." }, 
        { focus: "Hearth & Harmony", entry: "Cultivate beauty in your surroundings. Bake something sweet, tend to your familiars, and enjoy the comforts of the sanctuary." }, 
        { focus: "Grounding & Reflection", entry: "Tie up loose ends and clear the clutter. Ground yourself in the present moment before the cycle restarts." }  
    ];
    dynamicAlmanac.focus = dailyFocuses[dayOfWeek].focus;
    dynamicAlmanac.entry = dailyFocuses[dayOfWeek].entry;
}

async function fetchLocalAtmosphere() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.93&longitude=-88.48&current_weather=true&temperature_unit=fahrenheit');
        const data = await response.json();
        dynamicAlmanac.temp = Math.round(data.current_weather.temperature) + "°F";
        const code = data.current_weather.weathercode;
        if (code <= 1) dynamicAlmanac.weather = "Clear skies. The veil is thin and the stars or sun shine bright.";
        else if (code <= 3) dynamicAlmanac.weather = "A blanket of clouds gathers overhead.";
        else if (code == 45 || code == 48) dynamicAlmanac.weather = "Thick fog obscures the horizon. A time for stillness.";
        else if (code >= 51 && code <= 67) dynamicAlmanac.weather = "Rain falls, nourishing the deep roots of the earth.";
        else if (code >= 71 && code <= 77) dynamicAlmanac.weather = "Snow descends, bringing a quiet hush to the sanctuary.";
        else if (code >= 95) dynamicAlmanac.weather = "A tempest rages. Thunder echoes through the atmosphere.";
        else dynamicAlmanac.weather = "The atmosphere is shifting.";
    } catch (error) { dynamicAlmanac.weather = "The magical currents are scrambled. Look out the window!"; }
}

updateNatureLore(); fetchLocalAtmosphere();

// === 8. PORTAL TEXT DATA (Just for Audio now) ===
const portalData = {
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>'
};

// === 9. HTML BUILDERS (Now Connected to Live Data) ===

// 🔮 GRIMOIRE: Now includes Recipes, Teas, and Live Market List
async function buildGrimoireHTML() {
    let html = `<h2>Kitchen Grimoire</h2><p>Recipes, restorative teas, and provisions needed for the hearth.</p><div id="grimoire-container" style="margin-top:15px; max-height:60vh; overflow-y:auto; padding-right:10px;">`;

    // 1. Recipes and Teas
    html += `<h3>Sacred Recipes & Brews</h3>`;
    const allBrews = [...myRecipes, ...myTeas]; 
    allBrews.forEach(item => {
        let ingList = item.ingredients ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : '';
        let brewNote = item.brew ? `<div class="tea-brew" style="margin-bottom:10px; font-weight:bold;">${item.brew}</div>` : '';
        let icon = item.icon ? `${item.icon} ` : '';
        let instructions = item.instructions ? `<p>${item.instructions}</p>` : '';

        html += `
        <div class="grimoire-item">
            <button class="grimoire-header" onclick="toggleAccordion(this)">${icon}${item.title}</button>
            <div class="grimoire-panel">
                <p><em>${item.description}</em></p>
                ${brewNote}
                ${ingList ? `<ul>${ingList}</ul>` : ''}
                ${instructions}
            </div>
        </div>`;
    });

    // 2. Live Market Items
    html += `<h3 style="margin-top: 20px; border-top: 1px solid #4a3f35; padding-top: 15px;">Market Provisions</h3>`;
    html += `
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <input type="text" id="new-market-item" placeholder="Add an item..." class="portal-input">
            <button onclick="addMarketItem()" class="portal-btn">Add</button>
        </div>
    `;

    const { data: marketItems, error } = await db.from('market_items').select('*').order('created_at', { ascending: false });
    
    if (error) {
        html += `<p>The market lists are currently lost in the fog.</p>`;
    } else if (marketItems) {
        marketItems.forEach(item => {
            const isDone = item.is_completed ? 'completed' : '';
            html += `
            <div class="quest-item ${isDone}" onclick="toggleMarketItem('${item.id}', ${item.is_completed})">
                <div class="quest-checkbox" style="${item.is_completed ? 'background: #d4c8a8;' : ''}"></div>
                <div class="quest-details"><h3 class="quest-title" style="margin:0;">${item.text}</h3></div>
            </div>`;
        });
    }

    return html + `</div>`;
}

// 🛡️ BOUNTY BOARD: Now includes Live Calendar Events and Daily Quests
async function buildBountyBoardHTML() {
    let html = `<h2>The Bounty Board</h2><div id="bounty-container" style="max-height:60vh; overflow-y:auto; padding-right:10px;">`;
    
    // 1. Live Calendar Events
    html += `<h3>Upcoming Alignments</h3><p style="font-size: 0.9em; margin-top:-10px;">Scheduled appointments and events.</p>`;
    const { data: events, error } = await db.from('calendar_events').select('*').order('start_date', { ascending: true });

    if (error) {
        html += `<p>The astrolabe is spinning wildly. Cannot read the calendar.</p>`;
    } else if (events && events.length > 0) {
        events.forEach(ev => {
            const dateStr = ev.start_date ? new Date(ev.start_date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Unknown Time';
            html += `
            <div class="alchemy-card" style="margin-bottom: 10px;">
                <h3 class="alchemy-title" style="margin-bottom: 5px;">📅 ${ev.title}</h3>
                <div style="font-size: 0.85em; color: #a89f91; margin-bottom: 5px;">${dateStr}</div>
                ${ev.text ? `<p style="margin:0; font-size: 0.9em;">${ev.text}</p>` : ''}
            </div>`;
        });
    } else {
        html += `<p style="font-style: italic;">No immediate alignments in the stars.</p>`;
    }

    // 2. Local Quests
    html += `<h3 style="margin-top: 20px; border-top: 1px solid #4a3f35; padding-top: 15px;">Daily Endeavors</h3>`;
    myQuests.forEach(quest => {
        html += `<div class="quest-item" onclick="toggleQuest(this)">
                    <div class="quest-checkbox"></div>
                    <div class="quest-details">
                        <h3 class="quest-title">${quest.title}</h3>
                        <p class="quest-desc">${quest.description}</p>
                    </div>
                </div>`;
    });

    return html + `</div>`;
}

// 🕯️ THE STILLNESS: Now a Live Journal with Images
async function buildTeacupHTML() {
    let html = `<h2>The Stillness</h2>
                <p style="font-style: italic; color: #d4c8a8; margin-bottom: 10px;">"Breathe deep. Record your thoughts and visions here."</p>
                <div id="teacup-container" style="max-height:60vh; overflow-y:auto; padding-right:10px;">`;

    // 1. Journal Form
    html += `
        <div style="background: rgba(20, 15, 12, 0.4); padding: 15px; border-radius: 8px; border: 1px dashed #4a3f35; margin-bottom: 20px;">
            <textarea id="journal-text" placeholder="Write a new entry..." class="portal-input" style="height: 80px; resize: none;"></textarea>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                <input type="file" id="journal-image" accept="image/*" style="font-size: 0.8em; max-width: 60%; color: #a89f91;">
                <button onclick="submitJournalEntry()" id="journal-submit-btn" class="portal-btn">Seal Memory</button>
            </div>
            <div id="journal-status" style="font-size: 0.8em; color: #a89f91; margin-top: 5px;"></div>
        </div>
    `;

    // 2. Live Notes
    const { data: notes, error } = await db.from('family_notes').select('*').order('created_at', { ascending: false });

    if (error) {
        html += `<p>The ink has spilled. Cannot read past entries.</p>`;
    } else if (notes) {
        notes.forEach(note => {
            let imageHtml = '';
            if (note.image_url) {
                const { data } = db.storage.from('note-images').getPublicUrl(note.image_url);
                imageHtml = `<img src="${data.publicUrl}" style="max-width: 100%; border-radius: 6px; margin-top: 10px; border: 1px solid #4a3f35;" alt="Journal Memory"/>`;
            }

            const dateStr = new Date(note.timestamp || note.created_at).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});

            html += `
            <div class="tea-card" style="margin-bottom: 15px; padding: 15px;">
                <div style="font-size: 0.85em; color: #a89f91; margin-bottom: 8px; border-bottom: 1px solid rgba(74, 63, 53, 0.5); padding-bottom: 5px;">
                    ✍️ ${dateStr}
                </div>
                <p style="margin: 0; white-space: pre-wrap; font-size: 0.95em;">${note.note}</p>
                ${imageHtml}
            </div>`;
        });
    }

    return html + `</div>`;
}

function buildApothecaryHTML() {
    let html = `<h2>Apothecary</h2><p>Tinctures, salves, and restorative blends.</p><div id="apothecary-container">`;
    myApothecary.forEach(item => {
        html += `<div class="alchemy-card"><h3 class="alchemy-title">${item.icon} ${item.title}</h3><p class="alchemy-desc">${item.description}</p><div class="alchemy-ingredients"><strong>Components:</strong> <span>${item.ingredients}</span></div><p class="alchemy-instructions">${item.instructions}</p></div>`;
    });
    return html + `</div>`;
}

function buildHerbsHTML() {
    let html = `<h2>The Drying Rack</h2><p>Hanging botanicals and their magical properties.</p><div id="herbs-container">`;
    myHerbs.forEach(herb => {
        html += `<div class="herb-card"><div class="herb-icon">${herb.icon}</div><h3 class="herb-title">${herb.title}</h3><div class="herb-prop">${herb.properties}</div><p class="herb-desc">${herb.description}</p></div>`;
    });
    return html + `</div>`;
}

function buildSewingHTML() {
    let html = `<h2>Measurement Log</h2><p>Tracking the threads of current projects.</p><div id="sewing-container">`;
    mySewing.forEach(project => {
        html += `
        <div class="sewing-card">
            <h3 class="sewing-title">${project.title}</h3>
            <div class="sewing-status">${project.status}</div>
            <div class="sewing-fabric"><strong>Fabric:</strong> ${project.fabric}</div>
            <div class="sewing-notes">${project.notes}</div>
        </div>`;
    });
    return html + `</div>`;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2>Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div class="almanac-divider">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div class="almanac-focus">Daily Focus: ${dynamicAlmanac.focus}</div><p class="almanac-entry">"${dynamicAlmanac.entry}"</p><div class="almanac-planting"><strong>Nature's Lore:</strong> ${dynamicAlmanac.planting}</div></div>`;
}

// === 10. INTERACTIVE LOGIC ===
function toggleAccordion(button) {
    button.classList.toggle('active');
    const panel = button.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
        panel.style.padding = "0 15px";
    } else {
        panel.style.maxHeight = panel.scrollHeight + 30 + "px";
        panel.style.padding = "10px 15px";
    }
}

function toggleQuest(questElement) { 
    questElement.classList.toggle('completed'); 
}

// Database Write Functions
async function addMarketItem() {
    const input = document.getElementById('new-market-item');
    const text = input.value.trim();
    if (!text) return;

    await db.from('market_items').insert([{ text: text, is_completed: false }]);
    openPortal('grimoire'); 
}

async function toggleMarketItem(id, currentState) {
    await db.from('market_items').update({ is_completed: !currentState }).eq('id', id);
    openPortal('grimoire'); 
}

async function submitJournalEntry() {
    const textInput = document.getElementById('journal-text').value.trim();
    const fileInput = document.getElementById('journal-image').files[0];
    const statusText = document.getElementById('journal-status');
    const submitBtn = document.getElementById('journal-submit-btn');

    if (!textInput && !fileInput) {
        statusText.innerText = "Please write a note or select an image.";
        return;
    }

    submitBtn.innerText = "Sealing...";
    submitBtn.disabled = true;
    statusText.innerText = "Whispering to the archive...";

    let imageUrl = null;

    try {
        if (fileInput) {
            const fileExt = fileInput.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const { error: uploadError } = await db.storage.from('note-images').upload(fileName, fileInput);
            if (uploadError) throw uploadError;
            imageUrl = fileName;
        }

        const { error: insertError } = await db.from('family_notes').insert([{ 
            note: textInput, 
            image_url: imageUrl,
            timestamp: new Date().toISOString()
        }]);

        if (insertError) throw insertError;
        openPortal('teacup');

    } catch (error) {
        console.error("Failed to seal memory:", error);
        statusText.innerText = "Failed to seal memory. Try again.";
        submitBtn.innerText = "Seal Memory";
        submitBtn.disabled = false;
    }
}

// === 11. OPEN & CLOSE PORTALS ===
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    
    overlay.classList.add('active');
    if (bg) bg.classList.add('dimmed');
    
    // Show loading text while waiting for the database
    content.innerHTML = `<h2 style="text-align: center; margin-top: 20px;">Consulting the stars... ⏳</h2>`;

    if (portalName === 'grimoire') content.innerHTML = await buildGrimoireHTML();
    else if (portalName === 'cat') content.innerHTML = await buildBountyBoardHTML();
    else if (portalName === 'teacup') content.innerHTML = await buildTeacupHTML();
    else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
    else if (portalName === 'alchemy') content.innerHTML = buildApothecaryHTML(); 
    else if (portalName === 'herbs') content.innerHTML = buildHerbsHTML(); 
    else if (portalName === 'sewing') content.innerHTML = buildSewingHTML();
    else if (portalData[portalName]) content.innerHTML = portalData[portalName];

    if (soundscape) soundscape.style.display = (portalName === 'audio') ? 'grid' : 'none';
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
