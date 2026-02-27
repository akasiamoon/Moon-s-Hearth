const portalData = {
    'grimoire': '<h2>Kitchen Grimoire</h2><p>Provisioning: Mistral Banana Bread & Highland Stew recipes are prepared for the hearth.</p>',
    'cat': '<h2>Daily Bounty Board</h2><ul><li>Scholar’s Rite: Math Module</li><li>Merchant’s Run: DoorDash Goal</li><li>Hearth Sweep: 15min Clean</li></ul>',
    'apothecary': '<h2>Apothecary Formulary</h2><p>Current Batch: Vibrant Ink Protectant (Shea & Vitamin E) and Restoration Salve.</p>',
    'window': '<h2>Fen Almanac</h2><p>The Frost Moon approaches. Current Focus: Starting Lavender and Chamomile seeds indoors.</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Channeling: Hearth & Rain. Ambient bilateral audio is active for deep focus.</p>',
    'teacup': '<h2>Self-Care Ritual</h2><p>Current Elixir: Lady Grey with Honey. The Fen is patient; take your time to breathe.</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Daughter (4\'2") | Son (3\'9"). Fabric: Linen Blend.</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Harvested: Lavender (Drying), Eucalyptus (Fresh), Dandelion Root (Curing).</p>'
};

function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    
    if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
        overlay.classList.add('active');
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    overlay.classList.remove('active');
}

// Close portal if user clicks OUTSIDE the glass card
window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) {
        closePortal();
    }
}

// Keyboard Shortcut: Hit 'Escape' to close the menu
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePortal();
    }
});
