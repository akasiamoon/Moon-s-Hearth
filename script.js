// === 0. SUPABASE CONNECTION ===
const supabaseUrl = 'https://yflfpwcaowzkoxqnohso.supabase.co';
const supabaseKey = 'sb_publishable_OUXpGQk3QkOoUu94S9YZNg_Sb34-Jc4';
let db = null;

try {
    if (typeof supabase !== 'undefined') {
        db = supabase.createClient(supabaseUrl, supabaseKey);
        console.log("✨ Stars aligned: Connected to the archive.");
    }
} catch (error) { console.error("Magical currents scrambled:", error); }

// === DATA MANAGER ===
async function loadData(tableName, orderBy = 'created_at', asc = false) {
    let results = null;
    if (db) {
        const { data, error } = await db.from(tableName).select('*').order(orderBy, { ascending: asc });
        if (!error && data) results = data;
    }
    if (!results) {
        results = JSON.parse(localStorage.getItem(tableName) || '[]');
        results.sort((a, b) => asc ? (a[orderBy] > b[orderBy] ? 1 : -1) : (a[orderBy] < b[orderBy] ? 1 : -1));
    } else { localStorage.setItem(tableName, JSON.stringify(results)); }
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

// === 1. LOCAL DATA ARRAYS (ALL HUNDREDS OF LINES) ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings.", ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], instructions: "Simmer over a low hearth fire until the potatoes yield." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling or a morning study session.", ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." }
];

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

// (Additional myTeas, myHerbs, myApothecary arrays go here...)

// === 2. HOUSING ENGINE LOGIC ===
let editingItem = null;
let isDragging = false;

function toggleEditMode() {
    const layer = document.getElementById('furnishing-layer');
    // Important: We find the button by ID since it's now in the dynamic inventory portal
    const btn = document.getElementById('edit-mode-btn');
    
    layer.classList.toggle('edit-mode');
    
    if (layer.classList.contains('edit-mode')) {
        if(btn) { btn.innerText = "❌ Exit Furnishing Mode"; btn.style.borderColor = "#ff6b6b"; btn.style.color = "#ff6b6b"; }
        closePortal(); 
    } else {
        if(btn) { btn.innerText = "🔨 Enter Furnishing Mode"; btn.style.borderColor = "#8fce00"; btn.style.color = "#8fce00"; }
        document.getElementById('furnish-controls').style.display = 'none';
    }
}

async function spawnFurnishing(dbId, imageUrl) {
    const newItem = { inventory_id: dbId, image_url: imageUrl, pos_x: '50%', pos_y: '50%', scale: 1 };
    await insertData('active_room', newItem);
    loadRoomFurnishings();
}

async function loadRoomFurnishings() {
    const layer = document.getElementById('furnishing-layer');
    if(!layer) return;
    layer.innerHTML = ''; 
    const items = await loadData('active_room');
    items.forEach((item, index) => {
        const img = document.createElement('img');
        img.src = item.image_url;
        img.className = 'furnishing-item';
        img.style.left = item.pos_x; img.style.top = item.pos_y;
        img.style.zIndex = 10 + index;
        img.style.transform = `translate(-50%, -50%) scale(${item.scale})`; 
        img.dataset.id = item.id; img.dataset.scale = item.scale;
        img.onmousedown = startDrag;
        layer.appendChild(img);
    });
}

function startDrag(e) {
    if (!document.getElementById('furnishing-layer').classList.contains('edit-mode')) return;
    e.preventDefault();
    isDragging = true; editingItem = e.target;
    const ctrl = document.getElementById('furnish-controls');
    ctrl.style.display = 'block';
    ctrl.style.left = e.clientX + 20 + 'px'; ctrl.style.top = e.clientY + 20 + 'px';
    document.getElementById('furnish-scale').value = editingItem.dataset.scale;
    document.onmousemove = dragItem; document.onmouseup = stopDrag;
}

function dragItem(e) {
    if (!isDragging || !editingItem) return;
    editingItem.style.left = e.clientX + 'px'; editingItem.style.top = e.clientY + 'px';
    const ctrl = document.getElementById('furnish-controls');
    ctrl.style.left = e.clientX + 20 + 'px'; ctrl.style.top = e.clientY + 20 + 'px';
}

function stopDrag() { isDragging = false; document.onmousemove = null; document.onmouseup = null; }

// === 3. PORTAL BUILDERS ===
async function buildInventoryHTML() {
    let html = `<h2 class="gold-text">The Grand Stash</h2><div class="portal-scroll-container">`;
    // The Button uses onclick directly to avoid "Ghost Listener" issues
    html += `<div style="text-align:center; margin-bottom: 20px;">
                <button onclick="toggleEditMode()" id="edit-mode-btn" class="portal-btn" style="width: 100%; border-color: #8fce00; color: #8fce00;">🔨 Enter Furnishing Mode</button>
             </div>`;
    // ... logic for asset upload ...
    const stash = await loadData('inventory_stash');
    html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px;">`;
    stash.forEach(item => {
        html += `<div class="sound-item" style="cursor:pointer;" onclick="spawnFurnishing('${item.id}', '${item.image_url}')">
                    <img src="${item.image_url}" style="width:100%; height:50px; object-fit:contain;">
                    <div style="font-size:0.7em; color:#d4c8a8;">${item.name}</div>
                 </div>`;
    });
    return html + `</div></div>`;
}

async function buildApprenticeHTML() {
    let html = `<h2 class="gold-text">Apprentices' Ledger</h2><div class="portal-scroll-container">`;
    const dailyPrompt = indoorActivities[new Date().getDate() - 1] || indoorActivities[0];
    html += `<div class="alchemy-card" style="border-left: 3px solid #fcf6ba; background: rgba(191,149,63,0.15);">
                <h3 class="alchemy-title">✨ Today's Inspiration</h3>
                <p style="color:#fcf6ba; font-style:italic;">"${dailyPrompt}"</p>
             </div>`;
    // ... Load lessons and milestones ...
    return html + `</div>`;
}

// (Add other buildHTML functions like Grimoire, Ledger, etc. here)

// === 4. CORE UI LOGIC ===
async function openPortal(name) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const soundscape = document.getElementById('soundscape-container');
    overlay.classList.add('active');

    if (name === 'audio') {
        content.innerHTML = '<h2 class="gold-text">Bardic Soundscapes</h2>';
        content.appendChild(soundscape); soundscape.style.display = 'grid';
    } else {
        soundscape.style.display = 'none';
        if (name === 'inventory') content.innerHTML = await buildInventoryHTML();
        else if (name === 'apprentice') content.innerHTML = await buildApprenticeHTML();
        else if (name === 'grimoire') content.innerHTML = await buildGrimoireHTML();
        // ... add remaining portal mappings ...
    }
}

function closePortal() { document.getElementById('parchment-overlay').classList.remove('active'); }

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('furnish-scale').addEventListener('input', (e) => {
        if (editingItem) {
            editingItem.style.transform = `translate(-50%, -50%) scale(${e.target.value})`;
            editingItem.dataset.scale = e.target.value;
        }
    });
    document.getElementById('furnish-lock').addEventListener('click', async () => {
        if (editingItem) {
            await updateData('active_room', editingItem.dataset.id, {
                pos_x: editingItem.style.left, pos_y: editingItem.style.top,
                scale: parseFloat(editingItem.dataset.scale)
            });
            document.getElementById('furnish-controls').style.display = 'none';
            editingItem = null;
        }
    });
    loadRoomFurnishings();
});
