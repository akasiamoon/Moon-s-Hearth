// === 1. THE RECIPE BOOK ===
const myRecipes = [
    {
        title: "🌿 Highland Potato Stew",
        description: "A hearty, warming broth perfect for cold evenings. Earthy and grounding.",
        ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"],
        instructions: "Simmer over a low hearth fire until the potatoes yield and the broth is thick and fragrant."
    },
    {
        title: "🍌 Mistral Banana Bread",
        description: "Sweet, dense, and perfect for traveling or a morning study session.",
        ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"],
        instructions: "Bake until the crust is a deep golden brown. Serve warm with butter."
    }
];

// === 2. THE BOUNTY BOARD (Daily Quests) ===
const myQuests = [
    { title: "Familiar Care", description: "Ensure the cat is fed, watered, and sufficiently adored." },
    { title: "Hearth Tender", description: "Prepare a warm meal from the Grimoire." },
    { title: "Arcane Tinkering", description: "Spend a little time working on app development and code." },
    { title: "The Stillness", description: "Brew a cup of tea, listen to the rain, and take a moment to rest." }
];

// === 3. THE APOTHECARY (Alchemy) ===
// Add your salves, tinctures, and potions here!
const myApothecary = [
    {
        title: "Vibrant Ink Protectant Salve",
        icon: "🏺",
        description: "A deeply nourishing balm to protect and preserve skin artwork from fading.",
        ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E",
        instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set. Apply a thin layer to healed ink before braving the sun."
    },
    {
        title: "Wanderer's Muscle Rub",
        icon: "🌿",
        description: "A cooling and warming salve for weary legs after a long day's journey.",
        ingredients: "Coconut Oil, Peppermint, Camphor, Arnica Extract",
        instructions: "Blend into a smooth paste. Massage into aching muscles to draw out the cold and ease fatigue."
    },
    {
        title: "Clarity Focus Roll-on",
        icon: "✨",
        description: "A sharp, bright scent to clear the mind before studying the Grimoire or writing code.",
        ingredients: "Jojoba Oil, Rosemary, Lemon, Frankincense",
        instructions: "Combine in a small glass vial with a rollerball. Apply to the wrists and temples when the mental fog rolls in."
    }
];

// === 4. THE LIVING FEN ALMANAC (Dynamic Data) ===
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

// === 5. PORTAL TEXT DATA ===
const portalData = {
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>',
    'teacup': '<h2>The Stillness</h2><p>Lady Grey with Honey.</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Linen Blend</p>'
};

// === 6. HTML BUILDERS ===
function buildGrimoireHTML() {
    let html = `<h2>Kitchen Grimoire</h2><p>Select a recipe to read the parchment.</p><div id="grimoire-container" style="margin-top:15px; max-height:50vh; overflow-y:auto; padding-right:10px;">`;
    myRecipes.forEach(recipe => {
        let ingList = recipe.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('');
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">${recipe.title}</button><div class="grimoire-panel"><p><em>${recipe.description}</em></p><ul>${ingList}</ul><p>${recipe.instructions}</p></div></div>`;
    });
    return html + `</div>`;
}

function buildBountyBoardHTML() {
    let html = `<h2>Bounty Board</h2><p>Tap a quest to mark it complete and claim the glory.</p><div id="bounty-container">`;
    myQuests.forEach(quest => {
        html += `<div class="quest-item" onclick="toggleQuest(this)"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${quest.title}</h3><p class="quest-desc">${quest.description}</p></div></div>`;
    });
    return html + `</div>`;
}

function buildApothecaryHTML() {
    let html = `<h2>Apothecary</h2><p>Tinctures, salves, and restorative blends.</p><div id="apothecary-container">`;
    myApothecary.forEach(item => {
        html += `
        <div class="alchemy-card">
            <h3 class="alchemy-title">${item.icon} ${item.title}</h3>
            <p class="alchemy-desc">${item.description}</p>
            <div class="alchemy-ingredients"><strong>Components:</strong> <span>${item.ingredients}</span></div>
            <p class="alchemy-instructions">${item.instructions}</p>
        </div>`;
    });
    return html + `</div>`;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2>Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div class="almanac-divider">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div class="almanac-focus">Daily Focus: ${dynamicAlmanac.focus}</div><p class="almanac-entry">"${dynamicAlmanac.entry}"</p><div class="almanac-planting"><strong>Nature's Lore:</strong> ${dynamicAlmanac.planting}</div></div>`;
}

// === 7. INTERACTIVE LOGIC ===
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
function toggleQuest(questElement) { questElement.classList.toggle('completed'); }

// === 8. OPEN & CLOSE PORTALS ===
function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    
    if (portalName === 'grimoire') content.innerHTML = buildGrimoireHTML();
    else if (portalName === 'cat') content.innerHTML = buildBountyBoardHTML();
    else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
    else if (portalName === 'alchemy') content.innerHTML = buildApothecaryHTML(); // Added Apothecary!
    else if (portalData[portalName]) content.innerHTML = portalData[portalName];

    if (soundscape) soundscape.style.display = (portalName === 'audio') ? 'grid' : 'none';

    overlay.classList.add('active');
    if (bg) bg.classList.add('dimmed');
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
