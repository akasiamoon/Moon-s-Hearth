const portalData = {
    'window': `
        <h2>Fen Almanac</h2>
        <p><i>"The Frost Moon approaches."</i></p>
        <div style="border: 1px solid rgba(191,149,63,0.3); padding: 15px; margin-top:15px;">
            <p style="color: #fcf6ba;">Focus: Lavender & Chamomile</p>
            <p>Indoor seedlings are thriving near the hearth light.</p>
        </div>
    `,
    'herbs': `
        <h2>The Drying Rack</h2>
        <p>Current Harvest:</p>
        <p>• Lavender (Drying)<br>• Eucalyptus (Fresh)<br>• Dandelion Root (Curing)</p>
    `,
    'audio': `
        <h2>Bardic Soundscapes</h2>
        <p><i>Channeling: Hearth & Rain</i></p>
        <p style="color: #bf953f;">Bilateral audio active for deep focus.</p>
    `,
    'grimoire': `
        <h2>Kitchen Grimoire</h2>
        <p>Active Reagents:</p>
        <p>• Mistral Banana Bread<br>• Highland Stew</p>
    `,
    'alchemy': `
        <h2>Apothecary Formulary</h2>
        <p>Current Batch:</p>
        <p style="color: #fcf6ba;">Vibrant Ink Protectant</p>
        <p>(Shea & Vitamin E Restoration Salve)</p>
    `,
    'teacup': `
        <h2>The Stillness</h2>
        <p><i>"Breathe as the trees do."</i></p>
        <p>Current Elixir: Lady Grey with Honey.</p>
    `,
    'cat': `
        <h2>Bounty Board</h2>
        <div style="border-left: 2px solid #bf953f; padding-left: 15px; text-align: left;">
            <p><span style="color: #bf953f;">[✔]</span> Homeschooling Module</p>
            <p><span style="color: #bf953f;">[ ]</span> Provisioning Dash</p>
        </div>
    `,
    'sewing': `
        <h2>Measurement Log</h2>
        <p>Spring Tunics in progress:</p>
        <p>• Daughter (4'2") | Son (3'9")</p>
        <p style="opacity: 0.7;">Fabric: Linen Blend</p>
    `
};

const portalData = {
    'window': '<h2>Fen Almanac</h2><p>Focus: Lavender & Chamomile</p>',
    'herbs': '<h2>The Drying Rack</h2><p>Lavender, Eucalyptus, Dandelion Root</p>',
    'audio': '<h2>Bardic Soundscapes</h2><p>Bilateral audio active for focus.</p>',
    'grimoire': '<h2>Kitchen Grimoire</h2><p>Mistral Banana Bread & Highland Stew</p>',
    'alchemy': '<h2>Apothecary</h2><p>Vibrant Ink Protectant & Salve</p>',
    'teacup': '<h2>The Stillness</h2><p>Lady Grey with Honey.</p>',
    'cat': '<h2>Bounty Board</h2><p>Homeschool Module & DoorDash Shift</p>',
    'sewing': '<h2>Measurement Log</h2><p>Spring Tunics: Linen Blend</p>'
};

function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art'); // Finds the image
    
    if (portalData[portalName]) {
        content.innerHTML = portalData[portalName];
        overlay.classList.add('active');
        if (bg) bg.classList.add('dimmed'); // Triggers the CSS blur
    }
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed'); // Removes the blur
}

// Close on click outside
window.onclick = function(event) {
    const overlay = document.getElementById('parchment-overlay');
    if (event.target == overlay) closePortal();
}

// Close on Escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePortal();
});
