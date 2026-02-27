const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Bilateral audio active.</p>',
    'grimoire': '<h2>Kitchen Grimoire</h2><p>Mistral Banana Bread & Highland Stew</p>',
    'alchemy': '<h2>Apothecary</h2><p>Vibrant Ink Protectant & Salve</p>',
    'teacup': '<h2>The Stillness</h2><p>Lady Grey with Honey.</p>',
    'cat': '<h2>Bounty Board</h2><p>Homeschool Module & DoorDash Shift</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Linen Blend</p>'
};

function openPortal(portalName) {
    console.log("Opening portal: " + portalName);
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    
    if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
        overlay.classList.add('active');
        if (bg) bg.classList.add('dimmed');
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
}

window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}
