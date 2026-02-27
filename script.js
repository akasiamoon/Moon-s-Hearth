const portalData = {
    'grimoire': '<h2>Kitchen Grimoire</h2><p>Mistral Banana Bread & Highland Stew recipes are ready.</p>',
    'cat': '<h2>Daily Bounty Board</h2><ul><li>Math Module</li><li>DoorDash Goal</li><li>Hearth Sweep</li></ul>',
    'apothecary': '<h2>Apothecary Formulary</h2><p>Tattoo Protectant and Hand Balm formulas are active.</p>',
    'window': '<h2>Fen Almanac</h2><p>Next Frost Moon: March 3rd. Start Lavender seeds.</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Current: Hearth & Rain. Bilateral audio active.</p>',
    'teacup': '<h2>Self-Care Ritual</h2><p>Current: Lady Grey with Honey. Take a breath, Traveler.</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunic project: Daughter 4\'2", Son 3\'9".</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender (4 days), Eucalyptus (Fresh), Dandelion Root (Dry).</p>'
}; // This curly brace and semicolon MUST be here to close the list

function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bgImage = document.querySelector('.master-image');
    
    content.innerHTML = portalData[portalName];
    
    // Slide in the parchment and blur the sanctuary
    overlay.classList.add('active');
    bgImage.classList.add('blur-bg');
    
    // If it's the cat, load your quests
    if (portalName === 'cat') displayBounties();
}

function closePortal() {
    document.getElementById('parchment-overlay').classList.remove('active');
    document.querySelector('.master-image').classList.remove('blur-bg');
}
