// This function handles opening the different portals
function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    
    content.innerHTML = portalData[portalName] || 'The portal is mist-shrouded...';
    
    // This adds the "active" class to trigger the CSS slide-in
    overlay.classList.add('active');
}

function closePortal() {
    document.getElementById('parchment-overlay').classList.remove('active');
}
    // Define what each portal shows
   const portalData = {
    // 1. Kitchen Grimoire
    'grimoire': `
        <h2>Kitchen Grimoire</h2>
        <p><i>ESO Provisioning: Mistral Banana Bread</i></p>
        <ul>
            <li>3-4 Ripe Bananas</li>
            <li>1 Stick Melted Butter</li>
            <li>3/4 Cup Sugar/Honey</li>
            <li>1 1/2 Cups Flour</li>
        </ul>
        <button onclick="alert('Viewing Full Recipe...')">Open Scroll</button>`,

    // 2. The Senche-Cat
    'cat': `
        <h2>Daily Bounty Board</h2>
        <p><i>The Familiar's Tasks:</i></p>
        <ul style="list-style-type: '⚔️ ';">
            <li>Scholar's Rite: Math Module</li>
            <li>Merchant's Run: DoorDash Goal</li>
            <li>Hearth Sweep: 15min Clean</li>
        </ul>`,

    // 3. The Apothecary Workbench
    'apothecary': `
        <h2>Apothecary Formulary</h2>
        <p><i>Vibrant Ink Tattoo Protectant</i></p>
        <ul>
            <li>Shea Butter (Restoration)</li>
            <li>Beeswax (The Glove)</li>
            <li>Vitamin E (The Binder)</li>
        </ul>`,

    // 4. The Fen Window
    'window': `
        <h2>Fen Almanac</h2>
        <p><b>Next Frost Moon:</b> March 3rd</p>
        <p><b>Current Focus:</b> Starting Lavender & Chamomile seeds indoors.</p>
        <p><i>Status: Tennessee Ice Storm Recovery Active.</i></p>`,

    // 5. The Crystal Phonograph
    'audio': `
        <h2>Bardic Soundscapes</h2>
        <p>Current: <b>Hearth & Rain</b></p>
        <button onclick="playAmbient('library')">Scholar's Library</button>
        <button onclick="playAmbient('senche')">Purring Sentinel</button>`,

    // 6. The Lady Grey Teacup
    'teacup': `
        <h2>Self-Care Ritual</h2>
        <p><b>Current Elixir:</b> Lady Grey with Honey.</p>
        <p><i>Reminder: Pause the Dash. Breath. The Fen is patient.</i></p>`,

    // 7. The Sewing Basket
    'sewing': `
        <h2>Measurement Log</h2>
        <p><b>Current Project:</b> Kids' Spring Tunics</p>
        <ul>
            <li>Daughter: H 4'2"</li>
            <li>Son: H 3'9"</li>
        </ul>`
};

    // Fill the parchment with the right data and show it
    content.innerHTML = portalData[portalName] || 'The portal is currently mist-shrouded...';
    overlay.style.display = 'block';
    overlay.style.transform = 'translateX(0)'; // This makes it "slide" in
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    overlay.style.transform = 'translateX(100%)'; // Slides it back out
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
}
