// === 1. THE RECIPE BOOK ===
// To add a new recipe, just copy one of these blocks and change the text! No HTML required.
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
    },
    {
        title: "🍋 Lemon Blueberry Bread",
        description: "Bright citrus and sweet berries. A refined, scholarly treat.",
        ingredients: [
            "A handful of fresh blueberries",
            "Zest and juice of one large lemon",
            "Standard sweet bread batter"
        ],
        instructions: "Fold the berries in gently so they don't burst. Best enjoyed alongside Lady Grey tea."
    },
    {
        title: "🍫 Easy Chocolate Cobbler",
        description: "A simple, rich, and decadent comfort dessert for when the winter winds howl.",
        ingredients: [
            "Cocoa powder, sugar, and flour base",
            "Boiling water poured over the top before baking"
        ],
        instructions: "The magic happens in the oven, creating a rich cake on top and a thick fudge sauce underneath."
    }
];

// === 2. PORTAL TEXT DATA ===
const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>',
    'alchemy': '<h2>Apothecary</h2><p>Vibrant Ink Protectant & Salve</p>',
    'teacup': '<h2>The Stillness</h2><p>Lady Grey with Honey.</p>',
    'cat': '<h2>Bounty Board</h2><p>Homeschool Module & DoorDash Shift</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Linen Blend</p>'
};

// === 3. AUTO-GENERATE GRIMOIRE HTML ===
function buildGrimoireHTML() {
    let html = `<h2>Kitchen Grimoire</h2><p>Select a recipe to read the parchment.</p>`;
    html += `<div id="grimoire-container" style="margin-top:15px; max-height:50vh; overflow-y:auto; padding-right:10px;">`;
    
    myRecipes.forEach(recipe => {
        // Automatically turns your ingredients list into bullet points
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

// === 4. ACCORDION ANIMATION LOGIC ===
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

// === 5. OPEN & CLOSE PORTALS ===
function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    
    // If it's the grimoire, run our generator. Otherwise, load standard text.
    if (portalName === 'grimoire') {
        content.innerHTML = buildGrimoireHTML();
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
