const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Select your ambient mix.</p>',
    'grimoire': '<h2>Kitchen Grimoire</h2><p>Select a recipe to read the parchment.</p>',
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
    
    // Grab our interactive containers
    const soundscape = document.getElementById('soundscape-container'); 
    const grimoire = document.getElementById('grimoire-container');
    
    if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
        
        // Handle Audio Display
        if (soundscape) {
            soundscape.style.display = (portalName === 'audio') ? 'grid' : 'none';
        }

        // Handle Grimoire Display
        if (grimoire) {
            grimoire.style.display = (portalName === 'grimoire') ? 'block' : 'none';
        }

        overlay.classList.add('active');
        if (bg) bg.classList.add('dimmed');
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    const grimoire = document.getElementById('grimoire-container');
    
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    
    if (soundscape) soundscape.style.display = 'none';
    if (grimoire) grimoire.style.display = 'none';
}

window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}

// === ACCORDION LOGIC FOR GRIMOIRE ===
document.addEventListener('DOMContentLoaded', () => {
    const grimoireHeaders = document.querySelectorAll('.grimoire-header');

    grimoireHeaders.forEach(header => {
        header.addEventListener('click', function() {
            // Toggle the active class for styling
            this.classList.toggle('active');

            // Find the panel right below this button
            const panel = this.nextElementSibling;

            // Expand or collapse
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                panel.style.padding = "0 15px"; // Remove padding when closed
            } else {
                panel.style.maxHeight = panel.scrollHeight + 30 + "px"; // Add a little extra space
                panel.style.padding = "10px 15px"; // Add padding when open
            }
        });
    });
});
