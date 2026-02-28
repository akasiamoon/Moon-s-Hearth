// === 1. THE RECIPE BOOK ===
const myRecipes = [
    {
        title: "🌿 Highland Potato Stew",
        description: "A hearty, warming broth perfect for cold evenings. Earthy and grounding.",
        ingredients: [
            "4 large potatoes, peeled and diced",
            "Wild garlic, leeks, and a heavy pour of cream",
            "A pinch of salt and cracked black pepper"
        ],
        instructions: "Simmer over a low hearth fire until the potatoes yield and the broth is thick and fragrant."
    },
    {
        title: "🍌 Mistral Banana Bread",
        description: "Sweet, dense, and perfect for traveling or a morning study session.",
        ingredients: [
            "3 overripe bananas, mashed",
            "Brown sugar, melted butter, and a dash of vanilla",
            "Flour and a pinch of cinnamon"
        ],
        instructions: "Bake until the crust is a deep golden brown. Serve warm with butter."
    }
]; // (You can still add your other recipes back in here!)

// === 2. THE BOUNTY BOARD (Daily Chores) ===
// Add, remove, or change your daily tasks right here!
const myQuests = [
    {
        title: "Guild Duties: Instruction",
        description: "Guide the son and daughter through today's homeschool modules."
    },
    {
        title: "Coin Purse Bounty",
        description: "Head out and complete a DoorDash delivery shift."
    },
    {
        title: "Familiar Care",
        description: "Ensure the cat is fed, watered, and sufficiently adored."
    },
    {
        title: "Hearth Tender",
        description: "Prepare a meal from the Grimoire for the family."
    },
    {
        title: "Arcane Tinkering",
        description: "Spend a little time working on app development and code."
    }
];

// === 3. PORTAL TEXT DATA ===
const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>',
    'alchemy': '<h2>Apothecary</h2><p>Vibrant Ink Protectant & Salve</p>',
    'teacup': '<h2>The Stillness</h2><p>Lady Grey with Honey.</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Linen Blend</p>'
};

// === 4. AUTO-GENERATE GRIMOIRE HTML ===
function buildGrimoireHTML() {
    let html = `<h2>Kitchen Grimoire</h2><p>Select a recipe to read the parchment.</p>`;
    html += `<div id="grimoire-container" style="margin-top:15px; max-height:50vh; overflow-y:auto; padding-right:10px;">`;
    
    myRecipes.forEach(recipe => {
        let ingredientsList = recipe.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('');
        html += `
        <div class="grimoire-item">
            <button class="grimoire-header" onclick="toggleAccordion(this)">${recipe.title}</button>
            <div class="grimoire-panel">
                <p><em>${recipe.description}</em></p>
                <ul>${ingredientsList}</ul>
                <p>${recipe.instructions}</p>
            </div>
        </div>`;
    });
    
    html += `</div>`;
    return html;
}

// === 5. AUTO-GENERATE BOUNTY BOARD HTML ===
function buildBountyBoardHTML() {
    let html = `<h2>Bounty Board</h2><p>Tap a quest to mark it complete and claim the glory.</p>`;
    html += `<div id="bounty-container">`;
    
    myQuests.forEach(quest => {
        html += `
        <div class="quest-item" onclick="toggleQuest(this)">
            <div class="quest-checkbox"></div>
            <div class="quest-details">
                <h3 class="quest-title">${quest.title}</h3>
                <p class="quest-desc">${quest.description}</p>
            </div>
        </div>`;
    });
    
    html += `</div>`;
    return html;
}

// === 6. INTERACTIVE LOGIC ===
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
    // Toggles the 'completed' class which triggers the CSS cross-out and gold checkbox
    questElement.classList.toggle('completed');
}

// === 7. OPEN & CLOSE PORTALS ===
function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    
    // Check which generator to run, or fall back to standard text
    if (portalName === 'grimoire') {
        content.innerHTML = buildGrimoireHTML();
    } else if (portalName === 'cat') {
        content.innerHTML = buildBountyBoardHTML();
    } else if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
    }

    // Show or hide the audio buttons
    if (soundscape) {
        soundscape.style.display = (portalName === 'audio') ? 'grid' : 'none';
    }

    overlay.classList.add('active');
    if (bg) bg.classList.add('dimmed');
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    
    if (soundscape) {
        soundscape.style.display = 'none';
    }
}

window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}
