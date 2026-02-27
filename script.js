const portalData = {
    'grimoire': `
        <h2 style="font-family:'Cinzel', serif; color:#ffca28; text-transform:uppercase; text-align:center;">Kitchen Grimoire</h2>
        <div style="border: 1px solid rgba(255,202,40,0.2); padding: 15px; text-align:center;">
            <p>• Mistral Banana Bread (Risen)</p>
            <p>• Highland Stew (Simmering)</p>
        </div>
    `,
    'cat': `
        <h2 style="font-family:'Cinzel', serif; color:#ffca28; text-transform:uppercase; text-align:center;">Bounty Board</h2>
        <div style="border: 1px solid rgba(255,202,40,0.2); padding: 15px; text-align:center;">
            <p><strong>⚔️ Homeschool Quest:</strong> Module 4 complete.</p>
            <p><strong>⚔️ Provisioning:</strong> DoorDash Shift.</p>
        </div>
    `
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
