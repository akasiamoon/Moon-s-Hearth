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

// === 0.5 DATA MANAGER ===
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
    itemObj.id = Date.now().toString();
    itemObj.created_at = new Date().toISOString();
    if (db) {
        const { data, error } = await db.from(tableName).insert([itemObj]).select();
        if (!error && data && data.length > 0) itemObj.id = data[0].id;
    }
    const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    localData.push(itemObj);
    localStorage.setItem(tableName, JSON.stringify(localData));
}

async function updateData(tableName, id, updates) {
    if (db) await db.from(tableName).update(updates).eq('id', id);
    const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    const index = localData.findIndex(item => item.id == id);
    if (index > -1) {
        localData[index] = { ...localData[index], ...updates };
        localStorage.setItem(tableName, JSON.stringify(localData));
    }
}

async function removeData(tableName, id) {
    if (db) await db.from(tableName).delete().eq('id', id);
    let localData = JSON.parse(localStorage.getItem(tableName) || '[]');
    localData = localData.filter(item => item.id != id);
    localStorage.setItem(tableName, JSON.stringify(localData));
}

// === 1. LOCAL DATA ===
const myRecipes = [
    { 
        title: "🌿 Highland Potato Stew", 
        description: "A hearty, warming broth perfect for cold evenings.", 
        ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], 
        instructions: "Simmer over a low hearth fire until the potatoes yield." 
    },
    { 
        title: "🍌 Mistral Banana Bread", 
        description: "Sweet, dense, and perfect for traveling or a morning study session.", 
        ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], 
        instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." 
    },
    {
        title: "🍋 Summerset Lemon Blueberry Loaf",
        description: "A bright, citrus-infused sweet bread studded with bursts of fresh wild berries.",
        ingredients: ["2 cups flour, sifted", "1 cup sugar and a generous squeeze of fresh lemon juice", "1 cup fresh blueberries, dusted in flour", "Butter, eggs, and a splash of milk"],
        instructions: "Fold the berries in gently so they don't burst. Bake in a hearth oven until a wooden skewer comes out clean, then drizzle with lemon glaze."
    },
    {
        title: "🍎 Hearthfire Fried Apple Pies",
        description: "Warm, hand-held pastries filled with spiced fruit, perfect for a quick snack on a long journey.",
        ingredients: ["Handmade pie dough, rolled thin", "Dried apples reconstituted with cinnamon, nutmeg, and brown sugar", "A deep pan of hot oil or butter for frying"],
        instructions: "Spoon the spiced fruit onto the dough, fold over, and crimp the edges tightly. Fry until golden and blistered, then drain on parchment."
    },
    {
        title: "🍫 Midnight Chocolate Cobbler",
        description: "A rich, self-saucing dessert where a molten chocolate river hides beneath a cakey crust.",
        ingredients: ["Flour, sugar, cocoa powder, and milk for the batter", "A dry mix of sugar and cocoa sprinkled on top", "1.5 cups boiling water poured over the entire dish"],
        instructions: "Do not stir the water into the batter! Let the oven do the magic. Bake until the top is set but the bottom bubbles with thick, dark chocolate."
    },
    {
        title: "🍲 Wayrest Rustic Bean Stew",
        description: "A humble, deeply satisfying soup made from the staples of the pantry.",
        ingredients: ["Robust beans (navy, pinto, or great northern)", "A rich stock, simmered with root vegetables", "Smoked meat or thick bacon for flavor", "Crusty bread for dipping"],
        instructions: "Simmer everything together in an iron pot until the beans are tender and the broth has thickened. Best served on a rainy evening."
    },
    {
        title: "🧁 Legendary Sweetrolls",
        description: "A beloved, pillowy pastry topped with a thick, sweet icing. Guard it closely so it isn't stolen by passing adventurers.",
        ingredients: ["Soft yeast dough, enriched with butter and honey", "A thick glaze made from powdered sugar, milk, and vanilla extract"],
        instructions: "Bake in specialized fluted tins until golden. Let cool slightly before drowning the tops in the sweet white glaze."
    },
    {
        title: "🍏 Skyrim Apple Cabbage Stew",
        description: "A staple of the frozen north, balancing the savory depth of broth with the tart sweetness of orchard fruit.",
        ingredients: ["1 head of green cabbage, roughly chopped", "2 tart apples, cored and diced", "Chicken or vegetable broth, with a splash of apple cider", "Salt, pepper, and caraway seeds"],
        instructions: "Sauté the cabbage until wilted, add the apples and liquids, and simmer until everything is tender and deeply flavorful."
    },
    {
        title: "🍠 Ashlander Spiced 'Ash Yams'",
        description: "A fiery and sweet preparation of robust root vegetables, inspired by the harsh, volcanic beauty of Morrowind.",
        ingredients: ["Large sweet potatoes (ash yams), cubed", "Olive oil, smoked paprika, cumin, and a pinch of cayenne", "A drizzle of dark honey"],
        instructions: "Toss the yams in the oil and spices. Roast in a hot hearth oven until the edges are caramelized and crispy, then finish with honey."
    },
    {
        title: "🍖 Valenwood Honey-Roasted Ribs",
        description: "A succulent, slow-cooked meat dish honoring the Wood Elves' strict meat-based Green Pact.",
        ingredients: ["A rack of pork ribs", "A glaze of wild honey, minced garlic, and crushed rosemary", "Coarse sea salt"],
        instructions: "Rub the ribs with salt and herbs, then roast low and slow. Baste generously with honey in the final moments to create a sticky, caramelized crust."
    },
    {
        title: "🍈 Elsweyr Melon-Jelly",
        description: "A shimmering, translucent dessert favored by Khajiiti travelers for its cooling properties in the desert heat.",
        ingredients: ["2 cups honeydew or cantaloupe juice, strained", "Honey to sweeten", "Unflavored gelatin or agar-agar", "Mint leaves for garnish"],
        instructions: "Dissolve the honey and thickener into the warmed juice. Pour into shallow glass bowls and let set in a cool cellar until firm. Garnish with mint before serving."
    },
    {
        title: "🧀 Colovian Goat Cheese & Apples",
        description: "A simple, rustic pairing found on the tables of Imperial estates and humble farmsteads alike.",
        ingredients: ["A wheel of sharp, aged goat cheese", "2 crisp red apples, sliced thin", "A handful of walnuts", "A drizzle of wildflower honey"],
        instructions: "Arrange the cheese and fruit on a wooden board. Drizzle with honey and serve with nuts for a perfectly balanced provision."
    },
    {
        title: "🦀 Jagga-Drenched 'Mudcrab' Cakes",
        description: "A Bosmer delicacy (Green Pact friendly!) that uses fermented pig's milk (Jagga) for a unique, tangy kick.",
        ingredients: ["1 lb crab meat (or white fish), flaked", "1/2 cup buttermilk (our Jagga substitute)", "Breadcrumbs, egg, and old bay seasoning", "Minced green onions"],
        instructions: "Mix the meat with seasoning, egg, and buttermilk. Form into small cakes and sear in a hot iron skillet until the exterior is golden and crisp."
    },
    {
        title: "🥣 Orsinium Venison Haunch",
        description: "A dense, powerful meal designed to sustain an Orc through the freezing winters of the Wrothgarian Mountains.",
        ingredients: ["Venison roast (or beef chuck)", "Juniper berries, crushed", "Root vegetables (carrots, parsnips, onions)", "Dark ale or heavy stout"],
        instructions: "Rub the meat with crushed berries and salt. Sear well, then braise in the dark ale with root vegetables for 4-6 hours until it falls apart with a fork."
    },
    {
        title: "🥣 Kwama Egg Quiche",
        description: "A staple of the Dunmer diet in Morrowind, this savory pie is rich, earthy, and provides lasting energy for trekking through ash storms.",
        ingredients: ["4 large 'Kwama' eggs (chicken eggs)", "1/2 cup heavy cream", "Handful of 'Scrib Jelly' (mushrooms or soft cheese)", "1 cup chopped spinach", "Salt and crushed peppercorns"],
        instructions: "Whisk eggs and cream until frothy. Fold in the mushrooms and greens. Pour into a flaky crust and bake in a steady hearth until the center is set and the top is a pale gold."
    },
    {
        title: "🍮 Argonian 'Mud-Ball' Truffles",
        description: "A surprisingly sweet treat from the Black Marsh. These dense, dark chocolate morsels are rolled in cocoa 'mud' for a decadent finish.",
        ingredients: ["1 cup dark chocolate, melted", "1/4 cup heavy cream", "A pinch of sea salt", "1 teaspoon espresso powder (for that swampy depth)", "Cocoa powder for rolling"],
        instructions: "Heat the cream and pour over the chocolate and espresso powder. Let sit, then stir until smooth. Chill until firm, roll into small balls, and coat heavily in cocoa powder."
    },
    {
        title: "🍞 Breton 'Sun's Height' Biscuits",
        description: "Light, airy, and golden—these High Rock biscuits are served warm with plenty of butter during the midsummer festivals.",
        ingredients: ["2 cups self-rising flour", "1 cup buttermilk", "1/2 cup cold butter, grated", "1 tablespoon honey"],
        instructions: "Cut the cold butter into the flour until crumbly. Stir in buttermilk and honey just until combined. Pat into circles, bake at a high heat until they rise like the summer sun, and brush with extra honey-butter."
    },
    {
        title: "🥗 Bosmer 'Rite of Passage' Salad",
        description: "For the Wood Elf who adheres to the Green Pact but craves texture, this salad uses only animal-based fats and proteins.",
        ingredients: ["Smoked turkey or chicken strips", "Hard-boiled egg slices", "Crispy bacon crumbles", "Dressing: Sour cream mixed with chives and lemon zest"],
        instructions: "Layer the smoked meats and eggs. Top with a mountain of crispy bacon. Drizzle with the herb-cream dressing for a meal that honors the forest without harming a single leaf."
    },
    {
        title: "🍷 Altmer 'Firsthold' Fruit Wine Sauce",
        description: "An elegant, sophisticated reduction used to glaze poultry or desserts, embodying the refined tastes of the High Elves.",
        ingredients: ["1 cup red grape juice or non-alcoholic wine", "1/4 cup blackberries", "1 star anise", "2 tablespoons honey"],
        instructions: "Simmer all ingredients in a small copper pot over low heat until the liquid reduces by half and coats the back of a spoon. Strain and drizzle over roasted bird or vanilla sponge cake."
    },
    {
        title: "🥣 Nord 'Hrothgar' Venison Chili",
        description: "A thick, spicy, and incredibly filling bowl designed to warm the bones after a climb up the 7,000 steps.",
        ingredients: ["1 lb ground venison (or lean beef)", "1 onion, diced", "2 cloves garlic, smashed", "1 can kidney beans", "Chili powder, cumin, and a splash of strong coffee"],
        instructions: "Brown the meat with onions and garlic. Stir in the beans, spices, and coffee. Let it low-simmer on the hearth for at least an hour until the flavors are as bold as a Dragonborn's shout."
    },
    {
        title: "🍪 Khajiit 'Sweet-Sabbath' Mooncakes",
        description: "This one has no skooma, but plenty of sugar! A dense, spice-filled cookie that Khajiiti caravans trade across the borders.",
        ingredients: ["2 cups flour", "1/2 cup butter, softened", "1/4 cup sugar and 1/4 cup molasses", "1 tsp ginger and 1 tsp cinnamon", "A pinch of cloves"],
        instructions: "Cream the butter and sugars. Mix in the dry spices and flour until a stiff dough forms. Roll into balls, flatten slightly with a fork, and bake until the edges are crisp but the centers remain chewy."
    },
    {
        title: "🥧 Redguard 'Sentinel' Savory Pastries",
        description: "Flaky, golden triangles filled with spiced meat and vegetables, durable enough for desert travel across the Alik'r.",
        ingredients: ["Puff pastry sheets", "1/2 lb ground lamb or beef", "1/2 cup peas", "Curry powder, turmeric, and coriander"],
        instructions: "Sauté the meat with the desert spices and peas. Cut pastry into squares, place a spoonful of filling in the center, and fold into triangles. Bake until the pastry rises into golden, buttery layers."
    },
    {
        title: "🍵 Imperial 'Gold Coast' Spiced Tea",
        description: "A warming, aromatic brew favored by merchants and nobility in Anvil and Kvatch to shake off the coastal chill.",
        ingredients: ["2 cups black tea, brewed strong", "2 cinnamon sticks", "4 whole cloves", "A generous dollop of honey", "A slice of orange"],
        instructions: "Simmer the spices in the tea for ten minutes. Stir in the honey until dissolved and garnish with the orange slice. Serve in your finest ceramic mug."
    },
    {
        title: "🥘 Wood Orc 'Wrothgar' Succotash",
        description: "A hearty, rustic side dish that combines the last of the season's corn and beans with savory smoked fats.",
        ingredients: ["2 cups corn kernels", "1 cup lima beans or edamame", "4 strips of thick-cut bacon, diced", "1 red bell pepper, chopped", "A pinch of dried thyme"],
        instructions: "Fry the bacon until crisp. Sauté the vegetables in the rendered fat until tender. Season with thyme, salt, and pepper for a dish that tastes of the mountain foothills."
    },
    {
        title: "🥧 Hammerfell 'Stros M'kai' Fish Pie",
        description: "A coastal staple featuring fresh white fish and a golden, buttery crust—perfect for a weary sailor returning to port.",
        ingredients: ["1 lb white fish (cod or tilapia), cubed", "1 cup frozen peas", "1 cup leeks, sliced", "2 cups mashed potatoes for the 'crust'", "A splash of heavy cream"],
        instructions: "Simmer the fish, leeks, and peas in the cream until the fish is flaky. Pour into a baking dish, spread the mashed potatoes over the top, and bake until the peaks are toasted golden brown."
    },
    {
        title: "🥣 Dunmer 'Vivec City' Ash-Roasted Roots",
        description: "A smoky, savory preparation of root vegetables that mimics the traditional cooking method of burying food in hot volcanic ash.",
        ingredients: ["3 large carrots, halved", "2 parsnips, quartered", "Olive oil and smoked sea salt", "1 tsp dried rosemary"],
        instructions: "Toss the roots in oil, rosemary, and smoked salt. Roast at a high heat until the edges are slightly charred and the insides are tender, providing that authentic 'ash-grown' flavor."
    },
    {
        title: "🍵 Khajiit 'Senche-Tiger' Chai",
        description: "A bold, heavily spiced tea that provides a sharp kick of energy, favored by the nomadic Baandari Pedlars.",
        ingredients: ["2 cups strong black tea", "1/4 cup heavy cream", "3 cardamom pods, crushed", "2 slices of fresh ginger", "A pinch of saffron (if the vault allows)"],
        instructions: "Boil the tea with the ginger and cardamom. Stir in the cream and honey to taste. Let the saffron steep at the very end to release its golden color and royal aroma."
    },
    {
        title: "🥧 Bosmer 'Falinesti' Meat Pie",
        description: "A dense, savory pie made entirely without grain or vegetable, strictly adhering to the Green Pact of Valenwood.",
        ingredients: ["1 lb ground venison or beef", "1/2 lb suet or animal fat, chilled", "2 egg yolks", "Coarse salt and crushed juniper berries"],
        instructions: "Press a 'crust' of seasoned ground meat into a small tin. Fill with a mixture of meat and suet. Seal the top with more meat, brush with egg yolk, and bake until the juices run clear."
    },
    {
        title: "🍲 Nord 'Windhelm' Venison Stew",
        description: "A thick, iron-rich stew designed to keep a warrior's blood warm during a blizzard in the Eastmarch.",
        ingredients: ["1 lb venison or beef chuck, cubed", "2 large potatoes, peeled", "1 cup hardy kale", "Beef bone broth", "A splash of dark, peppery ale"],
        instructions: "Sear the meat in a hot pot. Add the broth, ale, and potatoes. Low-simmer for hours until the meat is tender enough to eat with a spoon, then toss in the kale at the very end."
    },
    {
        title: "🍮 Altmer 'Alinor' Honey Mousse",
        description: "A light, ethereal dessert served in the high spires of the Summerset Isles, delicate and perfectly balanced.",
        ingredients: ["1 cup heavy whipping cream", "3 tablespoons wildflower honey", "1 teaspoon orange flower water", "Fresh raspberries for the top"],
        instructions: "Whip the cream until soft peaks form. Slowly fold in the honey and orange flower water. Chill in crystal glasses for two hours and serve topped with a single, perfect berry."
    }
];

const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "Steep 3 mins at 212°F", description: "A classic, elegant blend brightened with citrus and a touch of honey." },
    { title: "Lavender Chamomile Nightcap", icon: "🍵", brew: "Steep 5 mins at 200°F", description: "A deeply soothing floral blend meant to quiet a racing mind." }
];

const myApothecary = [
    { title: "Vibrant Ink Protectant Salve", icon: "🏺", description: "A deeply nourishing balm to protect and preserve skin artwork.", ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E", instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set." }
];

const myHerbs = [
    // --- FOCUS & DEVELOPMENT (For Unity, CSS, & Python) ---
    { 
        title: "Rosemary", 
        icon: "🌿", 
        properties: "Memory & Mental Clarity", 
        description: "The 'Herb of Remembrance.' Burn as incense or keep fresh at your workstation to stay sharp during complex app development." 
    },
    { 
        title: "Gotu Kola", 
        icon: "🍀", 
        properties: "Cognitive Support", 
        description: "A staple for deep focus. It helps sustain the mental energy required for long coding sessions and game design." 
    },
    { 
        title: "Ginkgo Biloba", 
        icon: "🍃", 
        properties: "Circulation & Vision", 
        description: "Supports blood flow to the brain and eye health—essential for long hours spent looking at screens while homeschooling or dev work." 
    },

    // --- STAMINA & ENERGY (For Delivery Shifts & Busy Days) ---
    { 
        title: "Peppermint", 
        icon: "🌱", 
        properties: "Vigilance & Digestion", 
        description: "A bright, waking herb. Perfect as a mid-shift tea during DoorDash runs to maintain alertness and settle the stomach." 
    },
    { 
        title: "Nettle", 
        icon: "🌿", 
        properties: "Nutrient Density & Vitality", 
        description: "Rich in iron and minerals. Brew as a nourishing infusion to maintain physical stamina through demanding Tennessee winters." 
    },
    { 
        title: "Ginseng", 
        icon: "🪵", 
        properties: "Adrenal Support", 
        description: "A powerful adaptogen that helps the body manage stress and fatigue, keeping your energy steady across multiple tasks." 
    },

    // --- PEACE & HOUSEHOLD (For Family & Homeschooling) ---
    { 
        title: "Lavender", 
        icon: "🪻", 
        properties: "Restoration & Calm", 
        description: "Excellent for sleep pillows and soothing teas to calm the household after a day of outdoor play." 
    },
    { 
        title: "Chamomile", 
        icon: "🌼", 
        properties: "Gentle Sleep & Ease", 
        description: "The ultimate 'quiet time' herb. Use it to transition the apprentices from lessons to rest." 
    },
    { 
        title: "Lemon Balm", 
        icon: "🍋", 
        properties: "Bright Mood & Anxiety Relief", 
        description: "A gentle, sunny herb that lifts the spirit. Great for reducing the stress of a busy schedule or homeschooling challenges." 
    },
    { 
        title: "Catnip", 
        icon: "🐈", 
        properties: "Relaxation (For Humans Too!)", 
        description: "While it makes your Alinor Familiar zoomy, as a tea it is incredibly soothing for humans and helps settle restless energy." 
    },

    // --- PROTECTION & WELLNESS ---
    { 
        title: "Elderberry", 
        icon: "🫐", 
        properties: "Immunity & Seasonal Shield", 
        description: "A powerful ally for the changing seasons. Brew into a syrup to ward off the winter chill." 
    },
    { 
        title: "Echinacea", 
        icon: "🌸", 
        properties: "Immune Activation", 
        description: "Used at the first sign of a 'glitch' in your health to boost the body's natural defenses." 
    },
    { 
        title: "Calendula", 
        icon: "🧡", 
        properties: "Skin Healing", 
        description: "A bright orange bloom used in salves to soothe skin. (Keep this in mind for our future tattoo preservation recipes!)." 
    },
    { 
        title: "Yarrow", 
        icon: "🦴", 
        properties: "Boundaries & Stopping Flow", 
        description: "A traditional 'wound-wort.' Historically used to stop bleeding, it is also used metaphorically for energetic protection." 
    }
];
];

const mySewing = [
    { title: "Hearth Apron", status: "Completed", fabric: "Sturdy Canvas", notes: "Added deep pockets for gathering herbs." }
];

// === 2. ALMANAC DATA ===
let dynamicAlmanac = { season: "", moonPhase: "", temp: "--°F", weather: "", planting: "", focus: "", entry: "" };

function getMoonPhase(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month < 3) { year--; month += 12; }
    let jd = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4) + day + Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) - 1524.5;
    let phaseDays = ((jd - 2451549.5) / 29.53 % 1) * 29.53;
    if (phaseDays < 16.61) return { phase: "Waxing Moon 🌔", isWaxing: true };
    return { phase: "Waning Moon 🌘", isWaxing: false };
}

function updateNatureLore() {
    const today = new Date(), month = today.getMonth();
    dynamicAlmanac.moonPhase = getMoonPhase(today).phase;
    dynamicAlmanac.season = ["Deep Winter", "Late Winter", "Early Spring", "High Spring", "Early Summer", "Midsummer", "Late Summer", "Early Autumn", "Deep Autumn", "Frostfall", "Early Winter", "Midwinter"][month];
    dynamicAlmanac.planting = "The moon waxes. Sow above-ground crops.";
    dynamicAlmanac.focus = "Intuition & Planning";
    dynamicAlmanac.entry = "Trust your instincts, outline your tasks, and step forward with quiet purpose.";
}

async function fetchLocalAtmosphere() {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.93&longitude=-88.48&current_weather=true&temperature_unit=fahrenheit');
        const data = await response.json();
        dynamicAlmanac.temp = Math.round(data.current_weather.temperature) + "°F";
        dynamicAlmanac.weather = "The atmosphere holds a quiet energy.";
    } catch (error) { dynamicAlmanac.weather = "The magical currents are scrambled."; }
}

updateNatureLore(); fetchLocalAtmosphere();
const portalData = { 'audio': '<h2 class="gold-text">Bardic Soundscapes</h2><p style="color: rgba(191,149,63,0.8); font-style:italic; text-align:center;">Select your ambient mix.</p>' };

// === 3. CALENDAR ===
let calMonth = new Date().getMonth();
let calYear = new Date().getFullYear();
let holidayCache = {}; 

async function fetchHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    try {
        const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/US`);
        if (!res.ok) return [];
        const data = await res.json();
        holidayCache[year] = data;
        return data;
    } catch(e) { return []; }
}

function changeCalendarMonth(offset) {
    calMonth += offset;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    else if (calMonth > 11) { calMonth = 0; calYear++; }
    openPortal('cat'); 
}

async function generateCalendarHTML(events) {
    const today = new Date();
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const monthName = new Date(calYear, calMonth).toLocaleDateString('default', { month: 'long' });
    const holidays = await fetchHolidays(calYear);

    let html = `
    <div class="calendar-wrapper">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
            <span class="action-btn" style="font-size:1.5em;" onclick="changeCalendarMonth(-1)">◀</span>
            <h3 class="gold-text" style="margin: 0; font-size: 1.2em; padding-bottom: 0;">${monthName} ${calYear}</h3>
            <span class="action-btn" style="font-size:1.5em;" onclick="changeCalendarMonth(1)">▶</span>
        </div>
        <div class="calendar-grid">
            <div class="cal-day-name">Su</div><div class="cal-day-name">Mo</div><div class="cal-day-name">Tu</div>
            <div class="cal-day-name">We</div><div class="cal-day-name">Th</div><div class="cal-day-name">Fr</div><div class="cal-day-name">Sa</div>`;

    for (let i = 0; i < firstDay; i++) { html += `<div class="cal-cell empty"></div>`; }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const hasEvent = events && events.some(e => e.start_date && e.start_date.startsWith(dateStr) && e.text !== 'completed');
        const marker = hasEvent ? `<div class="cal-marker"></div>` : '';
        const isToday = (day === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()) ? 'today' : '';
        const holiday = holidays.find(h => h.date === dateStr);
        const holiClass = holiday ? 'holiday' : '';
        const holiText = holiday ? `<div class="holiday-text">${holiday.name}</div>` : '';
        html += `<div class="cal-cell ${isToday} ${holiClass}" onclick="prefillDate('${dateStr}')"><span>${day}</span>${holiText}${marker}</div>`;
    }
    html += `</div></div>`;
    return html;
}

function prefillDate(dateStr) {
    const section = document.getElementById('scribe-section');
    const panel = document.getElementById('scribe-panel');
    if (section && panel) {
        section.classList.remove('closed');
        panel.classList.remove('closed');
        document.getElementById('ev-date').value = dateStr + "T12:00";
        document.getElementById('ev-title').focus();
    }
}

// === 4. HTML BUILDERS ===
async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">Kitchen Grimoire</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Sacred Recipes</div><div class="section-panel closed">`;
    [...myRecipes, ...myTeas].forEach(item => {
        let ingList = item.ingredients ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : '';
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">${item.icon || ''} ${item.title}</button><div class="grimoire-panel"><p><em>${item.description}</em></p>${item.brew ? `<div style="color:#bf953f; font-style:italic; margin-bottom:10px;">${item.brew}</div>` : ''}${ingList ? `<ul>${ingList}</ul>` : ''}${item.instructions ? `<p>${item.instructions}</p>` : ''}</div></div>`;
    });
    const dbRecipes = await loadData('recipes');
    dbRecipes.forEach(item => {
        html += `<div class="grimoire-item"><button class="grimoire-header" onclick="toggleAccordion(this)">📜 ${item.title}</button><div class="grimoire-panel"><p style="white-space: pre-wrap;">${item.description}</p><div style="text-align: right; margin-top: 10px;"><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('recipes', '${item.id}', 'grimoire')">Purge Entry</button></div></div></div>`;
    });
    html += `</div>`; 
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe Quick Recipe</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="recipe-title" placeholder="Recipe Title..." class="portal-input" style="margin-bottom: 10px;"><textarea id="recipe-desc" placeholder="Ingredients & Notes..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('recipes', 'recipe-title', 'recipe-desc', 'grimoire')" class="portal-btn" style="width: 100%;">Add to Grimoire</button></div></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Weekly Provisions</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-meal-item" placeholder="e.g. Moonday: Stew..." class="portal-input"><button onclick="addDynamicItem('meal_plans', 'new-meal-item', 'grimoire')" class="portal-btn">Add</button></div>`;
    const meals = await loadData('meal_plans', 'created_at', true);
    meals.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('meal_plans', '${item.id}', ${item.is_completed}, 'grimoire')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('meal_plans', '${item.id}', 'grimoire')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Market List</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-market-item" placeholder="Add an item..." class="portal-input"><button onclick="addDynamicItem('market_items', 'new-market-item', 'grimoire')" class="portal-btn">Add</button></div>`;
    const marketItems = await loadData('market_items');
    marketItems.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('market_items', '${item.id}', ${item.is_completed}, 'grimoire')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('market_items', '${item.id}', 'grimoire')">✕</div></div>`; 
    });
    html += `</div></div>`; 
    return html;
}

async function buildBountyBoardHTML() {
    let html = `<h2 class="gold-text">The Bounty Board</h2><div class="portal-scroll-container">`;
    const events = await loadData('calendar_events', 'start_date', true);
    html += await generateCalendarHTML(events);
    html += `<div class="section-header closed" onclick="toggleSection(this)">Alignments Ledger</div><div class="section-panel closed">`;
    if (events.length > 0) {
        events.forEach(ev => {
            const isDone = ev.text === 'completed' ? 'completed' : ''; 
            const dateStr = ev.start_date ? new Date(ev.start_date).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
            html += `<div class="quest-item ${isDone}" onclick="toggleEvent('${ev.id}', '${ev.text}')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${ev.title}</h3><div style="font-size: 0.8em; color: rgba(191, 149, 63, 0.8);">${dateStr}</div></div><div class="delete-icon" onclick="event.stopPropagation(); deleteEvent('${ev.id}')">✕</div></div>`;
        });
    } else { html += `<p style="color: rgba(191,149,63,0.5); font-style: italic;">No current alignments recorded.</p>`; }
    html += `</div>`; 
    html += `<div id="scribe-section" class="section-header closed" onclick="toggleSection(this)">Scribe Alignment</div><div id="scribe-panel" class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="ev-title" placeholder="Alignment Title..." class="portal-input" style="margin-bottom: 10px;"><input type="datetime-local" id="ev-date" class="portal-input" style="margin-bottom: 10px;"><button onclick="addEvent()" class="portal-btn" style="width: 100%;">Seal in the Stars</button><div id="ev-status" style="font-size: 0.8em; margin-top:5px; color:#bf953f; text-align:center;"></div></div></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-quest-item" placeholder="Scribe a quick chore..." class="portal-input"><button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Add</button></div>`;
    const quests = await loadData('daily_quests');
    quests.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div></div>`; 
    });
    html += `</div></div>`; 
    return html;
}

async function buildTeacupHTML() {
    let html = `<h2 class="gold-text">The Stillness</h2><div class="portal-scroll-container">`;
    html += `<div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-bottom: 20px;"><textarea id="journal-text" placeholder="Record your thoughts or visions..." class="portal-input" style="height: 100px; resize: none; margin-bottom: 10px;"></textarea><div style="display: flex; justify-content: space-between; align-items: center;"><label for="journal-image" class="custom-file-label">Attach Image</label><input type="file" id="journal-image" accept="image/*" onchange="document.getElementById('file-name').innerText = this.files[0].name"><button onclick="submitJournalEntry()" id="journal-submit-btn" class="portal-btn">Seal Memory</button></div><div id="file-name" style="font-size: 0.8em; color: rgba(191,149,63,0.7); margin-top: 5px; font-style: italic;"></div><div id="journal-status" style="font-size: 0.8em; color: #a89f91; margin-top: 5px;"></div></div>`;
    const notes = await loadData('family_notes');
    notes.forEach(note => {
        let imageHtml = '';
        if (note.image_url) {
            let pubUrl = note.image_url;
            if (db && !note.image_url.startsWith('http') && !note.image_url.startsWith('data:')) {
                const { data } = db.storage.from('note-images').getPublicUrl(note.image_url);
                pubUrl = data.publicUrl;
            }
            imageHtml = `<img src="${pubUrl}" style="max-width: 100%; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(191,149,63,0.3);" alt="Memory"/>`;
        }
        const dateStr = new Date(note.timestamp || note.created_at).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
        html += `<div class="tea-card"><div style="font-size: 0.85em; color: rgba(191,149,63,0.8); margin-bottom: 8px; border-bottom: 1px dashed rgba(191, 149, 63, 0.3); padding-bottom: 5px; display: flex; justify-content: space-between;"><span>${dateStr}</span><button class="action-btn" style="color: #ff6b6b;" onclick="deleteJournalEntry('${note.id}')">Delete</button></div><p style="margin: 0; white-space: pre-wrap; font-size: 1.05em;">${note.note}</p>${imageHtml}</div>`;
    });
    return html + `</div>`;
}

async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const transactions = await loadData('ledger_transactions', 'created_at', false);
    let balance = 0;
    transactions.forEach(t => balance += parseFloat(t.amount || 0));
    html += `<div style="text-align:center; font-size:1.8em; color:#fcf6ba; font-family:'Cinzel', serif; margin-bottom:20px; text-shadow: 0 0 10px rgba(191,149,63,0.5);">Vault Balance: $${balance.toFixed(2)}</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Hearth Upkeep</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-bill" placeholder="Add a bill..." class="portal-input"><button onclick="addDynamicItem('hearth_upkeep', 'new-bill', 'ledger')" class="portal-btn">Add</button></div>`;
    const bills = await loadData('hearth_upkeep');
    bills.forEach(item => {
        const isDone = item.is_completed ? 'completed' : '';
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('hearth_upkeep', '${item.id}', ${item.is_completed}, 'ledger')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('hearth_upkeep', '${item.id}', 'ledger')">✕</div></div>`;
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Trade & Cashflow</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="ledger-desc" placeholder="Description..." class="portal-input" style="flex: 2;"><input type="number" step="0.01" id="ledger-amt" placeholder="+/- $" class="portal-input" style="flex: 1;"><button onclick="addLedgerEntry('ledger_transactions', 'ledger-desc', 'ledger-amt', 'ledger')" class="portal-btn">Log</button></div>`;
    transactions.forEach(item => {
        const amtValue = parseFloat(item.amount);
        const amtClass = amtValue >= 0 ? 'color: #8fce00;' : 'color: #ff6b6b;';
        const sign = amtValue >= 0 ? '+' : '';
        html += `<div class="quest-item" style="cursor: default; padding: 10px 15px;"><div class="quest-details" style="display:flex; justify-content:space-between; width:100%; align-items:center;"><h3 class="quest-title" style="font-size:0.95em; margin:0;">${item.desc}</h3><div style="font-family:'Quicksand', sans-serif; font-weight:bold; font-size:1.1em; ${amtClass}">${sign}$${amtValue.toFixed(2)}</div></div><div class="delete-icon" style="margin-left: 10px;" onclick="deleteLedgerEntry('ledger_transactions', '${item.id}', 'ledger')">✕</div></div>`;
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Treasury Goals</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="goal-title" placeholder="Goal..." class="portal-input" style="margin-bottom: 10px;"><input type="text" id="goal-amount" placeholder="Amount..." class="portal-input" style="margin-bottom: 10px;"><button onclick="addDetailedItem('savings_goals', 'goal-title', 'goal-amount', 'ledger')" class="portal-btn" style="width: 100%;">Set Goal</button></div>`;
    const goals = await loadData('savings_goals');
    goals.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">💰 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('savings_goals', '${item.id}', 'ledger')">✕</button></div><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>Target:</strong> <span style="color:#e0e0e0;">${item.description}</span></div></div>`;
    });
    html += `</div></div>`;
    return html;
}

async function buildWorkshopHTML() {
    let html = `<h2 class="gold-text">Artisan's Workshop</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Project Blueprints</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-project" placeholder="New project name..." class="portal-input"><button onclick="addDynamicItem('workshop_projects', 'new-project', 'workshop')" class="portal-btn">Add</button></div>`;
    const projects = await loadData('workshop_projects');
    projects.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('workshop_projects', '${item.id}', ${item.is_completed}, 'workshop')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('workshop_projects', '${item.id}', 'workshop')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Tool Chest</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-tool" placeholder="Tool maintenance..." class="portal-input"><button onclick="addDynamicItem('tool_chest', 'new-tool', 'workshop')" class="portal-btn">Add</button></div>`;
    const tools = await loadData('tool_chest');
    tools.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('tool_chest', '${item.id}', ${item.is_completed}, 'workshop')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('tool_chest', '${item.id}', 'workshop')">✕</div></div>`; 
    });
    html += `</div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Material Pile</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="mat-name" placeholder="Material..." class="portal-input" style="margin-bottom: 10px;"><input type="text" id="mat-qty" placeholder="Quantity..." class="portal-input" style="margin-bottom: 10px;"><button onclick="addDetailedItem('material_pile', 'mat-name', 'mat-qty', 'workshop')" class="portal-btn" style="width: 100%;">Log Material</button></div>`;
    const mats = await loadData('material_pile');
    mats.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">🪵 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('material_pile', '${item.id}', 'workshop')">✕</button></div><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>In Stock:</strong> <span style="color:#e0e0e0;">${item.description}</span></div></div>`;
    });
    html += `</div></div>`;
    return html;
}

async function buildApothecaryHTML() {
    let html = `<h2 class="gold-text">Apothecary</h2><div class="portal-scroll-container">`;
    myApothecary.forEach(item => { html += `<div class="alchemy-card"><h3 class="alchemy-title">${item.icon} ${item.title}</h3><p style="color:#d4c8a8; font-style:italic; margin-top:0;">${item.description}</p><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>Components:</strong> <span style="color:#e0e0e0;">${item.ingredients}</span></div><p style="color:#d4c8a8; font-size:0.9em; margin:0;">${item.instructions}</p></div>`; });
    const apoth = await loadData('apothecary');
    apoth.forEach(item => { html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">🏺 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('apothecary', '${item.id}', 'alchemy')">✕</button></div><p style="color:#d4c8a8; font-size:0.9em; margin:0; white-space:pre-wrap;">${item.description}</p></div>`; }); 
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe Recipe</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="apo-title" placeholder="Name..." class="portal-input" style="margin-bottom: 10px;"><textarea id="apo-desc" placeholder="Instructions..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('apothecary', 'apo-title', 'apo-desc', 'alchemy')" class="portal-btn" style="width: 100%;">Add to Apothecary</button></div></div></div>`;
    return html;
}

async function buildHerbsHTML() {
    let html = `<h2 class="gold-text">The Drying Rack</h2><div class="portal-scroll-container"><div id="herbs-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">`;
    myHerbs.forEach(herb => { html += `<div class="herb-card"><div style="font-size: 2em; margin-bottom:8px;">${herb.icon}</div><h3 class="gold-text" style="font-size:1.1em; margin:0 0 5px 0; padding-bottom: 0;">${herb.title}</h3><div style="color:#fcf6ba; font-size:0.85em; font-style:italic; border-bottom:1px solid rgba(191,149,63,0.2); padding-bottom:8px; margin-bottom:10px;">${herb.properties}</div><p style="color:#d4c8a8; font-size:0.85em; margin:0;">${herb.description}</p></div>`; });
    const herbs = await loadData('herbs');
    herbs.forEach(item => { html += `<div class="herb-card"><div style="display:flex; justify-content:space-between;"><h3 class="gold-text" style="font-size:1.1em; margin:0; border:none; padding:0;">🌿 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('herbs', '${item.id}', 'herbs')">✕</button></div><p style="color:#d4c8a8; font-size:0.85em; margin-top:10px; white-space:pre-wrap; text-align:left;">${item.description}</p></div>`; });
    html += `</div><div class="section-header closed" onclick="toggleSection(this)">Record Herb Lore</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="herb-title" placeholder="Name..." class="portal-input" style="margin-bottom: 10px;"><textarea id="herb-desc" placeholder="Lore..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('herbs', 'herb-title', 'herb-desc', 'herbs')" class="portal-btn" style="width: 100%;">Add to Rack</button></div></div></div>`;
    return html;
}

async function buildSewingHTML() {
    let html = `<h2 class="gold-text">Measurement Log</h2><div class="portal-scroll-container">`;
    mySewing.forEach(project => { html += `<div class="sewing-card"><h3 class="sewing-title">${project.title}</h3><div style="display:inline-block; background:rgba(191,149,63,0.15); color:#fcf6ba; padding:3px 10px; border-radius:12px; font-size:0.75em; text-transform:uppercase; margin-bottom:10px; border:1px solid rgba(191,149,63,0.4);">${project.status}</div><div style="color:#bf953f; font-size:0.9em; margin-bottom:8px;"><strong>Fabric:</strong> ${project.fabric}</div><div style="color:#d4c8a8; font-size:0.9em; background:rgba(0,0,0,0.4); padding:10px; border-left:2px solid rgba(191,149,63,0.5);">${project.notes}</div></div>`; });
    const sewing = await loadData('sewing');
    sewing.forEach(item => { html += `<div class="sewing-card"><div style="display:flex; justify-content:space-between;"><h3 class="sewing-title">✂️ ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('sewing', '${item.id}', 'sewing')">✕</button></div><div style="color:#d4c8a8; font-size:0.9em; background:rgba(0,0,0,0.4); padding:10px; border-left:2px solid rgba(191,149,63,0.5); white-space:pre-wrap;">${item.description}</div></div>`; });
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe Project</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="sew-title" placeholder="Name..." class="portal-input" style="margin-bottom: 10px;"><textarea id="sew-desc" placeholder="Notes..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('sewing', 'sew-title', 'sew-desc', 'sewing')" class="portal-btn" style="width: 100%;">Add to Log</button></div></div></div>`;
    return html;
}

async function buildApprenticeHTML() {
    let html = `<h2 class="gold-text">Apprentices' Ledger</h2><div class="portal-scroll-container">`;

    const dateDay = new Date().getDate(); 
    const indoorActivities = [
        "Build a magnificent blanket fort sanctuary and read a story inside with flashlights.",
        "Kitchen Alchemy: Bake a sweet treat and have the apprentices measure the ingredients.",
        "Construct an indoor obstacle course using pillows, chairs, and soft boundaries.",
        "Create a magical map of your house and hide a small 'treasure' for them to find.",
        "Hold a shadow-puppet theater using a flashlight and a blank wall.",
        "The Floor is Lava! Navigate the living room using only designated safe zones.",
        "Science Magic: Create a baking soda and vinegar volcano in the sink.",
        "Indoor Scavenger Hunt: Find 5 things that are red, 4 that are soft, and 3 that are round.",
        "Scribe a collaborative story: Take turns adding one sentence at a time.",
        "Put on an impromptu living room play or talent show.",
        "Have an indoor picnic on a blanket in the living room for lunch.",
        "DIY Instruments: Make shakers from dry beans and containers, or drums from pots.",
        "Cardboard Engineering: Turn an old box into a spaceship, castle, or car.",
        "Play a classic board game or put together a jigsaw puzzle.",
        "Tape a web of yarn across a hallway to create a 'laser maze' to navigate through.",
        "Sock Skating: Put on smooth socks and have a sliding contest on hard floors.",
        "Create 'stained glass' art using tissue paper and tape it to the window.",
        "Play 'Keep the Balloon Up' - don't let it touch the ground!",
        "Draw a life-sized self-portrait by tracing each other on large paper or cardboard.",
        "Have a living room dance party to freeze dance music.",
        "Hide and Seek, but hide a specific stuffed animal instead of people.",
        "Origami Hour: Learn to fold paper boats, hats, or jumping frogs.",
        "Write a letter or draw a picture to mail to a family member or friend.",
        "Host an indoor 'camping' trip with sleeping bags and ghost stories.",
        "Play 'Simon Says' or 'Follow the Leader'.",
        "Setup a mini 'store' and practice counting coins to buy snacks or toys.",
        "Make homemade playdough or slime using flour, water, and salt.",
        "Have a paper airplane making contest to see whose flies the farthest.",
        "Build the tallest tower possible out of plastic cups, books, or blocks.",
        "Look through old photo albums and tell stories about the memories.",
        "Quiet hour: Put on the Bardic Soundscapes and do independent drawing or reading."
    ];
    
    const dailyPrompt = indoorActivities[dateDay - 1]; 

    html += `<div class="alchemy-card" style="border-left: 3px solid #fcf6ba; background: rgba(191,149,63,0.15);">
                <h3 class="alchemy-title" style="color: #fff; font-size: 1.05em;">✨ Today's Inspiration</h3>
                <p style="color:#fcf6ba; font-style:italic; margin: 5px 0; font-size: 1.1em;">"${dailyPrompt}"</p>
             </div>`;

    html += `<div class="section-header closed" onclick="toggleSection(this)">Curriculum Quests</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-lesson" placeholder="Assign a lesson or task..." class="portal-input"><button onclick="addDynamicItem('apprentice_lessons', 'new-lesson', 'apprentice')" class="portal-btn">Assign</button></div>`;
    const lessons = await loadData('apprentice_lessons');
    lessons.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('apprentice_lessons', '${item.id}', ${item.is_completed}, 'apprentice')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('apprentice_lessons', '${item.id}', 'apprentice')">✕</div></div>`; 
    });
    html += `</div>`;

    html += `<div class="section-header closed" onclick="toggleSection(this)">Milestones & Notes</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="milestone-title" placeholder="Subject or Milestone..." class="portal-input" style="margin-bottom: 10px;"><textarea id="milestone-desc" placeholder="Notes on their progress..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('apprentice_milestones', 'milestone-title', 'milestone-desc', 'apprentice')" class="portal-btn" style="width: 100%;">Record Note</button></div>`;
    const milestones = await loadData('apprentice_milestones');
    milestones.forEach(item => {
        html += `<div class="alchemy-card"><div style="display:flex; justify-content:space-between;"><h3 class="alchemy-title">📜 ${item.title}</h3><button class="action-btn" style="color: #ff6b6b;" onclick="deleteDetailedItem('apprentice_milestones', '${item.id}', 'apprentice')">✕</button></div><p style="color:#d4c8a8; font-size:0.9em; margin:0; white-space:pre-wrap;">${item.description}</p></div>`;
    });
    html += `</div></div>`;

    return html;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2 class="gold-text">Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div style="color:rgba(191,149,63,0.5); margin:15px 0; font-size:0.9em; letter-spacing:2px;">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div style="color:#fcf6ba; font-size:1.3em; font-family:'Cinzel', serif; margin:15px 0;">Daily Focus: ${dynamicAlmanac.focus}</div><p style="color:#d4c8a8; font-style:italic; margin-bottom:15px;">"${dynamicAlmanac.entry}"</p><div style="color:#bf953f; font-size:0.95em; font-style:italic; margin-top:10px; border-top:1px dashed rgba(191,149,63,0.3); padding-top:10px;"><strong>Nature's Lore:</strong> ${dynamicAlmanac.planting}</div></div>`;
}

// ====================================================
// === THE ARCHITECT'S STUDIO & TROPHY SYSTEM ===
// ====================================================

let isForging = false;
let editingItem = null;
let draftBgUrl = '';

async function buildInventoryHTML() {
    let html = `<h2 class="gold-text">Architect's Studio</h2><div class="portal-scroll-container">`;
    
    html += `<div class="section-header closed" onclick="toggleSection(this)">Trophy Gallery</div><div class="section-panel closed"><div style="margin-top: 10px;">`;
    const rooms = await loadData('trophy_rooms');
    if (rooms.length === 0) html += `<p style="color: rgba(191,149,63,0.5); font-style: italic; text-align:center;">No sanctuaries forged yet.</p>`;
    rooms.forEach(room => {
        html += `<div class="alchemy-card" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 15px;">
                    <span style="color:#fcf6ba; font-family:'Cinzel';">${room.name}</span>
                    <div>
                        <button class="portal-btn" style="padding: 4px 8px; font-size: 0.7em; border-color:#8fce00; color:#8fce00;" onclick="loadTrophy('${room.id}', '${room.bg_url}')">Apply</button>
                        <button class="action-btn" style="color: #ff6b6b; margin-left:10px;" onclick="deleteTrophy('${room.id}')">✕</button>
                    </div>
                 </div>`;
    });
    html += `</div></div>`;

    html += `<div class="section-header closed" onclick="toggleSection(this)">Forge New Sanctuary</div><div class="section-panel closed">
                <div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; text-align:center;">
                    <p style="color:#d4c8a8; font-size:0.85em; margin-top:0;">Upload a base background to enter the Forge.</p>
                    <label for="room-bg-upload" class="custom-file-label" style="width:100%; box-sizing:border-box;">Select Background Image</label>
                    <input type="file" id="room-bg-upload" accept="image/*" onchange="startForging(this)">
                </div>
             </div>`;

    html += `<div class="section-header closed" onclick="toggleSection(this)">The Grand Stash</div><div class="section-panel closed">
                <div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px;">
                    <input type="text" id="asset-name" placeholder="Asset Name..." class="portal-input" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <label for="asset-image" class="custom-file-label">Select .PNG</label>
                        <input type="file" id="asset-image" accept="image/png, image/webp" onchange="document.getElementById('asset-file-name').innerText = this.files[0].name">
                        <button onclick="uploadAsset()" class="portal-btn">Store</button>
                    </div><div id="asset-file-name" style="font-size: 0.8em; color: #bf953f; margin-top: 5px; font-style: italic;"></div>
                </div>
                <h3 style="color:#fcf6ba; font-family:'Cinzel'; font-size:0.9em; margin-top:15px; border-bottom:1px solid rgba(191,149,63,0.3); padding-bottom:5px;">Current Stash</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 10px; margin-top: 10px;">`;
    
    const stash = await loadData('inventory_stash');
    stash.forEach(item => {
        html += `<div style="text-align:center; background: rgba(0,0,0,0.4); padding: 5px; border: 1px dashed rgba(191,149,63,0.3); border-radius:4px; position:relative;">
                    <img src="${item.image_url}" style="width:100%; height:40px; object-fit:contain;">
                    <button class="action-btn" style="position:absolute; top:-5px; right:-5px; background:#000; border-radius:50%; width:18px; height:18px; font-size:10px; color:#ff6b6b; padding:0; border:1px solid #ff6b6b;" onclick="event.stopPropagation(); deleteDynamicItem('inventory_stash', '${item.id}', 'inventory')">✕</button>
                 </div>`;
    });
    html += `</div></div>`;

    return html + `</div>`;
}

async function uploadAsset() {
    const nameInput = document.getElementById('asset-name').value.trim();
    const fileInput = document.getElementById('asset-image').files[0];
    if (!nameInput || !fileInput) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        await insertData('inventory_stash', { name: nameInput, image_url: e.target.result });
        openPortal('inventory'); 
    };
    reader.readAsDataURL(fileInput);
}

async function startForging(input) {
    if(!input.files[0]) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        draftBgUrl = e.target.result;
        const bgArt = document.getElementById('bg-art');
        if(bgArt) bgArt.src = draftBgUrl; 
        
        document.body.classList.add('building-mode'); 
        
        const layer = document.getElementById('furnishing-layer');
        if(layer) layer.innerHTML = ''; 
        
        closePortal(); 
        
        const stash = await loadData('inventory_stash');
        const toolbox = document.getElementById('toolbox-stash');
        if(toolbox) {
            toolbox.innerHTML = '';
            stash.forEach(item => {
                toolbox.innerHTML += `<div style="cursor:pointer; background:rgba(0,0,0,0.6); padding:5px; border:1px solid #bf953f; border-radius:4px;" onclick="spawnToForge('${item.image_url}')">
                                         <img src="${item.image_url}" style="width:100%; height:40px; object-fit:contain;">
                                      </div>`;
            });
        }
        
        const archToolbox = document.getElementById('architect-toolbox');
        if(archToolbox) archToolbox.style.display = 'block';
        
        const itemControls = document.getElementById('item-controls');
        if(itemControls) itemControls.style.display = 'none';
        
        isForging = true;
    };
    reader.readAsDataURL(input.files[0]);
}

function spawnToForge(imageUrl) {
    const layer = document.getElementById('furnishing-layer');
    if(!layer) return;
    const img = document.createElement('img');
    img.src = imageUrl;
    img.className = 'furnishing-item';
    img.style.left = '50%';
    img.style.top = '50%';
    img.style.zIndex = layer.children.length + 10;
    img.style.transform = `translate(-50%, -50%) scale(1)`; 
    img.dataset.scale = 1;
    img.onmousedown = selectItemForEdit;
    layer.appendChild(img);
}

function selectItemForEdit(e) {
    if (!isForging) return;
    e.preventDefault();
    editingItem = e.target;
    
    const itemControls = document.getElementById('item-controls');
    if(itemControls) itemControls.style.display = 'block';
    
    const forgeScale = document.getElementById('forge-scale');
    if(forgeScale) forgeScale.value = editingItem.dataset.scale;
    
    document.onmousemove = dragItem;
    document.onmouseup = stopDrag;
}

function dragItem(e) {
    if (!editingItem) return;
    editingItem.style.left = e.clientX + 'px';
    editingItem.style.top = e.clientY + 'px';
}
function stopDrag() { document.onmousemove = null; document.onmouseup = null; }

function deleteSelected() {
    if(editingItem) {
        editingItem.remove();
        editingItem = null;
        const itemControls = document.getElementById('item-controls');
        if(itemControls) itemControls.style.display = 'none';
    }
}

async function sealTrophy() {
    const nameInput = document.getElementById('trophy-name');
    const roomName = (nameInput && nameInput.value.trim() !== '') ? nameInput.value.trim() : "Nameless Sanctuary";
    
    const newRoom = { name: roomName, bg_url: draftBgUrl, created_at: new Date().toISOString(), id: Date.now().toString() };
    let savedRooms = JSON.parse(localStorage.getItem('trophy_rooms') || '[]');
    savedRooms.push(newRoom);
    localStorage.setItem('trophy_rooms', JSON.stringify(savedRooms));

    const layer = document.getElementById('furnishing-layer');
    if(layer) {
        let savedFurniture = JSON.parse(localStorage.getItem('trophy_furnishings') || '[]');
        Array.from(layer.children).forEach(img => {
            savedFurniture.push({
                room_id: newRoom.id,
                image_url: img.src,
                pos_x: img.style.left,
                pos_y: img.style.top,
                scale: img.dataset.scale,
                z_index: img.style.zIndex || 10
            });
        });
        localStorage.setItem('trophy_furnishings', JSON.stringify(savedFurniture));
    }
    
    document.body.classList.remove('building-mode');
    const archToolbox = document.getElementById('architect-toolbox');
    if(archToolbox) archToolbox.style.display = 'none';
    isForging = false;
    editingItem = null;

    loadTrophy(newRoom.id, newRoom.bg_url);
}

function cancelForging() {
    document.body.classList.remove('building-mode');
    const archToolbox = document.getElementById('architect-toolbox');
    if(archToolbox) archToolbox.style.display = 'none';
    isForging = false;
    editingItem = null;
    loadActiveTrophy(); 
}

function loadTrophy(roomId, bgUrl) {
    localStorage.setItem('active_trophy_id', roomId);
    localStorage.setItem('active_trophy_bg', bgUrl);
    loadActiveTrophy();
    closePortal();
}

function loadActiveTrophy() {
    const activeBg = localStorage.getItem('active_trophy_bg') || 'sanctuary.jpg';
    const activeId = localStorage.getItem('active_trophy_id');
    
    const bgArt = document.getElementById('bg-art');
    if(bgArt) bgArt.src = activeBg;
    
    const layer = document.getElementById('furnishing-layer');
    if(!layer) return;
    layer.innerHTML = ''; 
    
    if(activeId) {
        const allFurniture = JSON.parse(localStorage.getItem('trophy_furnishings') || '[]');
        const roomFurniture = allFurniture.filter(f => f.room_id === activeId);
        roomFurniture.forEach(f => {
            const img = document.createElement('img');
            img.src = f.image_url;
            img.className = 'furnishing-item';
            img.style.left = f.pos_x;
            img.style.top = f.pos_y;
            img.style.zIndex = f.z_index;
            img.style.transform = `translate(-50%, -50%) scale(${f.scale})`; 
            layer.appendChild(img);
        });
    }
}

async function deleteTrophy(roomId) {
    await removeData('trophy_rooms', roomId);
    let allFurniture = JSON.parse(localStorage.getItem('trophy_furnishings') || '[]');
    allFurniture = allFurniture.filter(f => f.room_id !== roomId);
    localStorage.setItem('trophy_furnishings', JSON.stringify(allFurniture));
    
    if (localStorage.getItem('active_trophy_id') === roomId) {
        localStorage.removeItem('active_trophy_id');
        localStorage.removeItem('active_trophy_bg');
        loadActiveTrophy();
    }
    openPortal('inventory');
}

// === 5. UI LOGIC ===
function toggleAccordion(button) {
    button.classList.toggle('active');
    const panel = button.nextElementSibling;
    if (panel.style.maxHeight) { panel.style.maxHeight = null; panel.style.padding = "0 15px"; } 
    else { panel.style.maxHeight = panel.scrollHeight + 30 + "px"; panel.style.padding = "10px 15px"; }
}

function toggleSection(headerBtn) {
    headerBtn.classList.toggle('closed');
    const panel = headerBtn.nextElementSibling;
    panel.classList.toggle('closed');
}

// === 6. INTERACTIVE ACTIONS ===
async function addDynamicItem(table, inputId, portal) {
    const text = document.getElementById(inputId).value.trim();
    if (!text) return;
    await insertData(table, { text: text, is_completed: false });
    if(portal) openPortal(portal); 
}

async function toggleDynamicItem(table, id, currentState, portal) {
    await updateData(table, id, { is_completed: !currentState });
    if (!currentState) feedFamiliar();
    if(portal) openPortal(portal); 
}

async function deleteDynamicItem(table, id, portal) {
    await removeData(table, id);
    if(portal) openPortal(portal);
}

async function addDetailedItem(table, titleId, descId, portal) {
    const title = document.getElementById(titleId).value.trim();
    const desc = document.getElementById(descId).value.trim();
    if (!title) return;
    await insertData(table, { title: title, description: desc });
    if(portal) openPortal(portal);
}

async function deleteDetailedItem(table, id, portal) {
    await removeData(table, id);
    if(portal) openPortal(portal);
}

// === LEDGER MATH FUNCTIONS ===
async function addLedgerEntry(table, descId, amtId, portal) {
    const desc = document.getElementById(descId).value.trim();
    const amtStr = document.getElementById(amtId).value.trim();
    const amount = parseFloat(amtStr);
    if (!desc || isNaN(amount)) return; 
    await insertData(table, { desc: desc, amount: amount });
    feedFamiliar();
    if(portal) openPortal(portal); 
}

async function deleteLedgerEntry(table, id, portal) {
    await removeData(table, id);
    if(portal) openPortal(portal);
}

async function addEvent() {
    const title = document.getElementById('ev-title').value.trim();
    const date = document.getElementById('ev-date').value;
    if (!title) return;
    document.getElementById('ev-status').innerText = "Scribing...";
    await insertData('calendar_events', { title: title, start_date: date, text: 'pending' });
    openPortal('cat');
}

async function deleteEvent(id) {
    await removeData('calendar_events', id);
    openPortal('cat');
}

async function toggleEvent(id, currentText) {
    const newState = currentText === 'completed' ? 'pending' : 'completed';
    await updateData('calendar_events', id, { text: newState });
    if (newState === 'completed') feedFamiliar();
    openPortal('cat');
}

async function submitJournalEntry() {
    const textInput = document.getElementById('journal-text').value.trim();
    const fileInput = document.getElementById('journal-image').files[0];
    const submitBtn = document.getElementById('journal-submit-btn');
    if (!textInput && !fileInput) return;
    submitBtn.innerText = "Sealing..."; submitBtn.disabled = true;
    try {
        let imageUrl = null;
        if (fileInput && db) {
            const fileName = `${Math.random()}.${fileInput.name.split('.').pop()}`;
            const { error } = await db.storage.from('note-images').upload(fileName, fileInput);
            if (!error) imageUrl = fileName;
        } else if (fileInput) {
             const reader = new FileReader();
             reader.onload = async (e) => {
                 await insertData('family_notes', { note: textInput, image_url: e.target.result });
                 openPortal('teacup');
             };
             reader.readAsDataURL(fileInput);
             return;
        }
        await insertData('family_notes', { note: textInput, image_url: imageUrl });
        openPortal('teacup');
    } catch (error) { submitBtn.innerText = "Seal Memory"; submitBtn.disabled = false; }
}

async function deleteJournalEntry(id) {
    await removeData('family_notes', id);
    openPortal('teacup');
}

// === 7. OPEN & CLOSE PORTALS ===
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container'); 
    overlay.classList.add('active'); if (bg) bg.classList.add('dimmed');

    if (portalName === 'audio') {
        content.innerHTML = portalData['audio']; 
        if (soundscape) { content.appendChild(soundscape); soundscape.style.display = 'grid'; }
        return; 
    }

    content.innerHTML = `<h2 class="gold-text" style="text-align: center; margin-top: 20px;">Consulting... ⏳</h2>`;
    if (soundscape) { soundscape.style.display = 'none'; document.body.appendChild(soundscape); }

    if (portalName === 'grimoire') content.innerHTML = await buildGrimoireHTML();
    else if (portalName === 'cat') content.innerHTML = await buildBountyBoardHTML();
    else if (portalName === 'teacup') content.innerHTML = await buildTeacupHTML();
    else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
    else if (portalName === 'alchemy') content.innerHTML = await buildApothecaryHTML(); 
    else if (portalName === 'herbs') content.innerHTML = await buildHerbsHTML(); 
    else if (portalName === 'sewing') content.innerHTML = await buildSewingHTML();
    else if (portalName === 'ledger') content.innerHTML = await buildLedgerHTML();
    else if (portalName === 'workshop') content.innerHTML = await buildWorkshopHTML();
    else if (portalName === 'apprentice') content.innerHTML = await buildApprenticeHTML(); 
    else if (portalName === 'inventory') content.innerHTML = await buildInventoryHTML();
}

function closePortal() {
    const overlay = document.getElementById('parchment-overlay');
    const bg = document.getElementById('bg-art');
    const soundscape = document.getElementById('soundscape-container');
    overlay.classList.remove('active');
    if (bg) bg.classList.remove('dimmed');
    if (soundscape) { soundscape.style.display = 'none'; document.body.appendChild(soundscape); }
    calMonth = new Date().getMonth(); calYear = new Date().getFullYear();
}

// === 8. BARDIC SOUNDSCAPES ===
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('play-btn') && e.target.hasAttribute('data-target')) {
        const audioId = e.target.getAttribute('data-target');
        const audioEl = document.getElementById(audioId);
        if (audioEl) {
            if (audioEl.paused) {
                audioEl.play().catch(err => console.error("Audio playback failed:", err));
                e.target.classList.add('active'); e.target.style.color = "#fff";
            } else {
                audioEl.pause(); e.target.classList.remove('active'); e.target.style.color = "#d4c8a8";
            }
        }
    }
});

document.addEventListener('input', function(e) {
    if (e.target.classList.contains('volume-slider') && e.target.hasAttribute('data-target')) {
        const audioId = e.target.getAttribute('data-target');
        const audioEl = document.getElementById(audioId);
        if (audioEl) { audioEl.volume = e.target.value; }
    }
});

// === 9. THE FAMILIAR ===
let familiarXP = 0;
const maxXP = 5;

function feedFamiliar() {
    if (familiarXP < maxXP) { familiarXP++; updateFamiliarUI(); }
}

function updateFamiliarUI() {
    const xpCircle = document.getElementById('xp-circle');
    const avatar = document.getElementById('familiar-avatar');
    if (!xpCircle || !avatar) return;
    const offset = 289 - (289 * (familiarXP / maxXP));
    xpCircle.style.strokeDashoffset = offset;
    avatar.className = '';
    if (familiarXP === 0) {
        avatar.src = "cat_sleep.jpg"; avatar.classList.add('state-sleeping');
        xpCircle.style.stroke = "#bf953f";
    } else if (familiarXP > 0 && familiarXP < maxXP) {
        avatar.src = "cat_sit.jpg"; avatar.classList.add('state-awake');
        xpCircle.style.stroke = "#bf953f";
    } else if (familiarXP === maxXP) {
        avatar.src = "cat_play.jpg"; avatar.classList.add('state-zoomies');
        xpCircle.style.stroke = "#fcf6ba";
    }
}

function claimFamiliarLoot() {
    const speech = document.getElementById('familiar-speech');
    if (!speech) return;
    if (familiarXP < maxXP) { feedFamiliar(); return; }
    const lootMessages = ["✨ Purring shadows.", "🦇 Rare gold!", "🔮 Glimmering magic.", "📜 New spells.", "🐾 Headbutt!"];
    speech.innerText = lootMessages[Math.floor(Math.random() * lootMessages.length)];
    speech.classList.remove('hidden');
    setTimeout(() => { speech.classList.add('hidden'); familiarXP = 0; updateFamiliarUI(); }, 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    const forgeScale = document.getElementById('forge-scale');
    if(forgeScale) {
        forgeScale.addEventListener('input', function(e) {
            if (editingItem) {
                editingItem.style.transform = `translate(-50%, -50%) scale(${e.target.value})`;
                editingItem.dataset.scale = e.target.value;
            }
        });
    }
    updateFamiliarUI();
});

// === 10. SEASONAL & HOLIDAY TIME-WEAVER ===
function applySeasonalDecor() {
    const today = new Date();
    const month = today.getMonth(); 
    const day = today.getDate();
    const body = document.body;

    if (month === 11 || month === 0 || month === 1) body.classList.add('season-winter');
    else if (month >= 2 && month <= 4) body.classList.add('season-spring');
    else if (month >= 5 && month <= 7) body.classList.add('season-summer');
    else if (month >= 8 && month <= 10) body.classList.add('season-autumn');

    if (month === 9 && day >= 24 && day <= 31) body.classList.add('holiday-halloween');
    if (month === 11 && day >= 15 && day <= 26) body.classList.add('holiday-yule');
    if (month === 1 && day >= 10 && day <= 15) body.classList.add('holiday-valentines');
}

applySeasonalDecor();
setTimeout(loadActiveTrophy, 500);
