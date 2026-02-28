const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>', // Tweaked the text slightly!
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
    const soundscape = document.getElementById('soundscape-container'); // Grab the audio container
    
    if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
        
        // Show the audio player ONLY if the audio portal is opened
        if (portalName === 'audio') {
            soundscape.style.display = 'grid'; 
        } else {
            soundscape.style.display = 'none';
        }

        overlay.classList.add('active');
        if (bg) bg.classList.add('dimmed');
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    
    // Hide the audio player when the portal closes so it doesn't accidentally show up on other pages
    if (soundscape) {
        soundscape.style.display = 'none';
    }
}

window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}
