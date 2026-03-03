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

// Detect the vault name for our helper scripts
const vault = db; 

// === 0.5 DATA MANAGER (The "Brain") ===
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
    // Generate a temporary ID for local storage fallback
    if (!itemObj.id) itemObj.id = Date.now().toString();
    itemObj.created_at = new Date().toISOString();
    
    if (db) {
        const { data, error } = await db.from(tableName).insert([itemObj]).select();
        if (!error && data && data.length > 0) itemObj.id = data[0].id;
    }
    const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    localData.push(itemObj);
    localStorage.setItem(tableName, JSON.stringify(localData));
}

// ... [Keep your existing updateData and removeData functions here] ...

// === 1. LOCAL ARRAYS ===
// [Keep your myRecipes, myTeas, myApothecary, myHerbs arrays exactly as they are]

// === 4. UPDATED UPLOAD LOGIC (With Auto-Shrink) ===
async function uploadAsset() {
    const nameInput = document.getElementById('asset-name').value.trim();
    const fileInput = document.getElementById('asset-image');
    const statusDiv = document.getElementById('asset-file-name'); 
    const file = fileInput.files[0];

    if (!nameInput || !file || !db) {
        statusDiv.innerText = "⚠️ Missing info or connection!";
        return;
    }

    statusDiv.innerText = "✨ Resizing...";

    resizeImage(file, 800, async (resizedBlob) => {
        try {
            const fileName = `stash_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            
            statusDiv.innerText = "🚀 Sending to Cloud...";
            const { data, error: uploadError } = await db.storage
                .from('assets')
                .upload(fileName, resizedBlob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            const { data: urlData } = db.storage.from('assets').getPublicUrl(fileName);
            const publicUrl = urlData.publicUrl;

            statusDiv.innerText = "📜 Recording...";

            // CRITICAL FIX: Changed from 'housing_assets' to 'inventory_stash' to match your loader
            await insertData('inventory_stash', { name: nameInput, image_url: publicUrl });

            statusDiv.innerText = "✅ Stashed!";
            openPortal('inventory'); // Refresh the view
        } catch (err) {
            statusDiv.innerText = "🚫 Failed: " + err.message;
        }
    });
}

function resizeImage(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => { callback(blob); }, 'image/png');
        };
    };
}

// === 5. BULK SCRIBE (One version only) ===
async function bulkScribeData() {
    if (!db) return;
    console.log("📜 Syncing Library...");
    
    // Combine all your hardcoded data into the sync ritual
    try {
        await db.from('herbs').upsert(myHerbs.map(h => ({title: h.title, description: h.description, icon: h.icon})));
        await db.from('recipes').upsert(myRecipes.map(r => ({title: r.title, description: r.description})));
        await db.from('apothecary').upsert(myApothecary.map(a => ({title: a.title, description: a.description})));
        
        console.log("✅ Library Sync Complete.");
    } catch (e) {
        console.error("Scribe Error:", e);
    }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    updateFamiliarUI();
    applySeasonalDecor();
    setTimeout(loadActiveTrophy, 500);
    
    // Only run this once! Comment it out after your first successful load.
    // bulkScribeData(); 
});
