// This function handles opening the different portals
function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    
    // Define what each portal shows
    const portalData = {
        'grimoire': '<h2>Kitchen Grimoire</h2><p><b>Sun-Aurelian Peach Cobbler</b><br>4-6 Cups Peaches, 1 Cup Sugar, 1 Stick Butter... [Instructions...]</p>',
        'cat': '<h2>Daily Bounty Board</h2><ul><li>3rd Grade Math Module</li><li>DoorDash Goal: $75</li><li>Hearth Sweep</li></ul>',
        'apothecary': '<h2>Apothecary Formulary</h2><p><b>Vibrant Ink Protectant</b><br>Shea Butter, Coconut Oil, Vitamin E...</p>'
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
