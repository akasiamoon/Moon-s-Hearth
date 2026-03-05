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

// === 0.5 DATA MANAGER (WITH 404 SILENCER) ===
async function loadData(tableName, orderBy = 'created_at', asc = false) {
    let results = null;
    if (db) {
        try {
            const { data, error } = await db.from(tableName).select('*').order(orderBy, { ascending: asc });
            if (error) {
                console.warn(`📜 Note: Cloud table '${tableName}' is missing or empty. Falling back to local storage.`);
            } else if (data) {
                results = data;
            }
        } catch (e) {
            console.warn(`Network shift for '${tableName}'. Falling back to local.`);
        }
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

// === THE MASTER SCRIBE ===
async function scribeToArchive(tableName, formId, portalToReload) {
    const container = document.getElementById(formId);
    if (!container) return;
    const inputs = container.querySelectorAll('input, textarea, select');
    const entry = {};

    inputs.forEach(input => {
        const fieldName = input.id.replace('inp-', ''); 
        entry[fieldName] = input.value;
    });

    if (!entry.title && !entry.item_name && !entry.plant_name && !entry.note && !entry.text) {
        return alert("The scroll requires a name or content!");
    }

    if (db) {
        await db.from(tableName).insert([entry]);
    } else {
        const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
        localData.push({ ...entry, id: Date.now().toString(), created_at: new Date().toISOString() });
        localStorage.setItem(tableName, JSON.stringify(localData));
    }

    feedFamiliar();
    openPortal(portalToReload); 
}

// === 1. LOCAL DATA ===
const myRecipes = [
    { title: "🌿 Highland Potato Stew", description: "A hearty, warming broth perfect for cold evenings.", ingredients: ["4 large potatoes, peeled and diced", "Wild garlic, leeks, and a heavy pour of cream", "A pinch of salt and cracked black pepper"], instructions: "Simmer over a low hearth fire until the potatoes yield." },
    { title: "🍌 Mistral Banana Bread", description: "Sweet, dense, and perfect for traveling or a morning study session.", ingredients: ["3 overripe bananas, mashed", "Brown sugar, melted butter, and a dash of vanilla", "Flour and a pinch of cinnamon"], instructions: "Bake until the crust is a deep golden brown. Serve warm with butter." },
    { title: "🍋 Summerset Lemon Blueberry Loaf", description: "A bright, citrus-infused sweet bread studded with bursts of fresh wild berries.", ingredients: ["2 cups flour, sifted", "1 cup sugar and a generous squeeze of fresh lemon juice", "1 cup fresh blueberries, dusted in flour", "Butter, eggs, and a splash of milk"], instructions: "Fold the berries in gently so they don't burst. Bake in a hearth oven until a wooden skewer comes out clean, then drizzle with lemon glaze." },
    { title: "🍎 Hearthfire Fried Apple Pies", description: "Warm, hand-held pastries filled with spiced fruit, perfect for a quick snack on a long journey.", ingredients: ["Handmade pie dough, rolled thin", "Dried apples reconstituted with cinnamon, nutmeg, and brown sugar", "A deep pan of hot oil or butter for frying"], instructions: "Spoon the spiced fruit onto the dough, fold over, and crimp the edges tightly. Fry until golden and blistered, then drain on parchment." },
    { title: "🍫 Midnight Chocolate Cobbler", description: "A rich, self-saucing dessert where a molten chocolate river hides beneath a cakey crust.", ingredients: ["Flour, sugar, cocoa powder, and milk for the batter", "A dry mix of sugar and cocoa sprinkled on top", "1.5 cups boiling water poured over the entire dish"], instructions: "Do not stir the water into the batter! Let the oven do the magic. Bake until the top is set but the bottom bubbles with thick, dark chocolate." },
    { title: "🍲 Wayrest Rustic Bean Stew", description: "A humble, deeply satisfying soup made from the staples of the pantry.", ingredients: ["Robust beans (navy, pinto, or great northern)", "A rich stock, simmered with root vegetables", "Smoked meat or thick bacon for flavor", "Crusty bread for dipping"], instructions: "Simmer everything together in an iron pot until the beans are tender and the broth has thickened. Best served on a rainy evening." },
    { title: "🧁 Legendary Sweetrolls", description: "A beloved, pillowy pastry topped with a thick, sweet icing. Guard it closely so it isn't stolen by passing adventurers.", ingredients: ["Soft yeast dough, enriched with butter and honey", "A thick glaze made from powdered sugar, milk, and vanilla extract"], instructions: "Bake in specialized fluted tins until golden. Let cool slightly before drowning the tops in the sweet white glaze." },
    { title: "🍏 Skyrim Apple Cabbage Stew", description: "A staple of the frozen north, balancing the savory depth of broth with the tart sweetness of orchard fruit.", ingredients: ["1 head of green cabbage, roughly chopped", "2 tart apples, cored and diced", "Chicken or vegetable broth, with a splash of apple cider", "Salt, pepper, and caraway seeds"], instructions: "Sauté the cabbage until wilted, add the apples and liquids, and simmer until everything is tender and deeply flavorful." },
    { title: "🍠 Ashlander Spiced 'Ash Yams'", description: "A fiery and sweet preparation of robust root vegetables, inspired by the harsh, volcanic beauty of Morrowind.", ingredients: ["Large sweet potatoes (ash yams), cubed", "Olive oil, smoked paprika, cumin, and a pinch of cayenne", "A drizzle of dark honey"], instructions: "Toss the yams in the oil and spices. Roast in a hot hearth oven until the edges are caramelized and crispy, then finish with honey." },
    { title: "🍖 Valenwood Honey-Roasted Ribs", description: "A succulent, slow-cooked meat dish honoring the Wood Elves' strict meat-based Green Pact.", ingredients: ["A rack of pork ribs", "A glaze of wild honey, minced garlic, and crushed rosemary", "Coarse sea salt"], instructions: "Rub the ribs with salt and herbs, then roast low and slow. Baste generously with honey in the final moments to create a sticky, caramelized crust." },
    { title: "🍈 Elsweyr Melon-Jelly", description: "A shimmering, translucent dessert favored by Khajiiti travelers for its cooling properties in the desert heat.", ingredients: ["2 cups honeydew or cantaloupe juice, strained", "Honey to sweeten", "Unflavored gelatin or agar-agar", "Mint leaves for garnish"], instructions: "Dissive the honey and thickener into the warmed juice. Pour into shallow glass bowls and let set in a cool cellar until firm. Garnish with mint before serving." },
    { title: "🧀 Colovian Goat Cheese & Apples", description: "A simple, rustic pairing found on the tables of Imperial estates and humble farmsteads alike.", ingredients: ["A wheel of sharp, aged goat cheese", "2 crisp red apples, sliced thin", "A handful of walnuts", "A drizzle of wildflower honey"], instructions: "Arrange the cheese and fruit on a wooden board. Drizzle with honey and serve with nuts for a perfectly balanced provision." },
    { title: "🦀 Jagga-Drenched 'Mudcrab' Cakes", description: "A Bosmer delicacy (Green Pact friendly!) that uses fermented pig's milk (Jagga) for a unique, tangy kick.", ingredients: ["1 lb crab meat (or white fish), flaked", "1/2 cup buttermilk (our Jagga substitute)", "Breadcrumbs, egg, and old bay seasoning", "Minced green onions"], instructions: "Mix the meat with seasoning, egg, and buttermilk. Form into small cakes and sear in a hot iron skillet until the exterior is golden and crisp." },
    { title: "🥣 Orsinium Venison Haunch", description: "A dense, powerful meal designed to sustain an Orc through the freezing winters of the Wrothgarian Mountains.", ingredients: ["Venison roast (or beef chuck)", "Juniper berries, crushed", "Root vegetables (carrots, parsnips, onions)", "Dark ale or heavy stout"], instructions: "Rub the meat with crushed berries and salt. Sear well, then braise in the dark ale with root vegetables for 4-6 hours until it falls apart with a fork." },
    { title: "🥣 Kwama Egg Quiche", description: "A staple of the Dunmer diet in Morrowind, this savory pie is rich, earthy, and provides lasting energy for trekking through ash storms.", ingredients: ["4 large 'Kwama' eggs (chicken eggs)", "1/2 cup heavy cream", "Handful of 'Scrib Jelly' (mushrooms or soft cheese)", "1 cup chopped spinach", "Salt and crushed peppercorns"], instructions: "Whisk eggs and cream until frothy. Fold in the mushrooms and greens. Pour into a flaky crust and bake in a steady hearth until the center is set and the top is a pale gold." },
    { title: "🍮 Argonian 'Mud-Ball' Truffles", description: "A surprisingly sweet treat from the Black Marsh. These dense, dark chocolate morsels are rolled in cocoa 'mud' for a decadent finish.", ingredients: ["1 cup dark chocolate, melted", "1/4 cup heavy cream", "A pinch of sea salt", "1 teaspoon espresso powder (for that swampy depth)", "Cocoa powder for rolling"], instructions: "Heat the cream and pour over the chocolate and espresso powder. Let sit, then stir until smooth. Chill until firm, roll into small balls, and coat heavily in cocoa powder." },
    { title: "🍞 Breton 'Sun's Height' Biscuits", description: "Light, airy, and golden—these High Rock biscuits are served warm with plenty of butter during the midsummer festivals.", ingredients: ["2 cups self-rising flour", "1 cup buttermilk", "1/2 cup cold butter, grated", "1 tablespoon honey"], instructions: "Cut the cold butter into the flour until crumbly. Stir in buttermilk and honey just until combined. Pat into circles, bake at a high heat until they rise like the summer sun, and brush with extra honey-butter." },
    { title: "🥗 Bosmer 'Rite of Passage' Salad", description: "For the Wood Elf who adheres to the Green Pact but craves texture, this salad uses only animal-based fats and proteins.", ingredients: ["Smoked turkey or chicken strips", "Hard-boiled egg slices", "Crispy bacon crumbles", "Dressing: Sour cream mixed with chives and lemon zest"], instructions: "Layer the smoked meats and eggs. Top with a mountain of crispy bacon. Drizzle with the herb-cream dressing for a meal that honors the forest without harming a single leaf." },
    { title: "🍷 Altmer 'Firsthold' Fruit Wine Sauce", description: "An elegant, sophisticated reduction used to glaze poultry or desserts, embodying the refined tastes of the High Elves.", ingredients: ["1 cup red grape juice or non-alcoholic wine", "1/4 cup blackberries", "1 star anise", "2 tablespoons honey"], instructions: "Simmer all ingredients in a small copper pot over low heat until the liquid reduces by half and coats the back of a spoon. Strain and drizzle over roasted bird or vanilla sponge cake." },
    { title: "🥣 Nord 'Hrothgar' Venison Chili", description: "A thick, spicy, and incredibly filling bowl designed to warm the bones after a climb up the 7,000 steps.", ingredients: ["1 lb ground venison (or lean beef)", "1 onion, diced", "2 cloves garlic, smashed", "1 can kidney beans", "Chili powder, cumin, and a splash of strong coffee"], instructions: "Brown the meat with onions and garlic. Stir in the beans, spices, and coffee. Let it low-simmer on the hearth for at least an hour until the flavors are as bold as a Dragonborn's shout." },
    { title: "🍪 Khajiit 'Sweet-Sabbath' Mooncakes", description: "This one has no skooma, but plenty of sugar! A dense, spice-filled cookie that Khajiiti caravans trade across the borders.", ingredients: ["2 cups flour", "1/2 cup butter, softened", "1/4 cup sugar and 1/4 cup molasses", "1 tsp ginger and 1 tsp cinnamon", "A pinch of cloves"], instructions: "Cream the butter and sugars. Mix in the dry spices and flour until a stiff dough forms. Roll into balls, flatten slightly with a fork, and bake until the edges are crisp but the centers remain chewy." },
    { title: "🥧 Redguard 'Sentinel' Savory Pastries", description: "Flaky, golden triangles filled with spiced meat and vegetables, durable enough for desert travel across the Alik'r.", ingredients: ["Puff pastry sheets", "1/2 lb ground lamb or beef", "1/2 cup peas", "Curry powder, turmeric, and coriander"], instructions: "Sauté the meat with the desert spices and peas. Cut pastry into squares, place a spoonful of filling in the center, and fold into triangles. Bake until the pastry rises into golden, buttery layers." },
    { title: "🍵 Imperial 'Gold Coast' Spiced Tea", description: "A warming, aromatic brew favored by merchants and nobility in Anvil and Kvatch to shake off the coastal chill.", ingredients: ["2 cups black tea, brewed strong", "2 cinnamon sticks", "4 whole cloves", "A generous dollop of honey", "A slice of orange"], instructions: "Simmer the spices in the tea for ten minutes. Stir in the honey until dissolved and garnish with the orange slice. Serve in your finest ceramic mug." },
    { title: "🥘 Wood Orc 'Wrothgar' Succotash", description: "A hearty, rustic side dish that combines the last of the season's corn and beans with savory smoked fats.", ingredients: ["2 cups corn kernels", "1 cup lima beans or edamame", "4 strips of thick-cut bacon, diced", "1 red bell pepper, chopped", "A pinch of dried thyme"], instructions: "Fry the bacon until crisp. Sauté the vegetables in the rendered fat until tender. Season with thyme, salt, and pepper for a dish that tastes of the mountain foothills." },
    { title: "🥧 Hammerfell 'Stros M'kai' Fish Pie", description: "A coastal staple featuring fresh white fish and a golden, buttery crust—perfect for a weary sailor returning to port.", ingredients: ["1 lb white fish (cod or tilapia), cubed", "1 cup frozen peas", "1 cup leeks, sliced", "2 cups mashed potatoes for the 'crust'", "A splash of heavy cream"], instructions: "Simmer the fish, leeks, and peas in the cream until the fish is flaky. Pour into a baking dish, spread the mashed potatoes over the top, and bake until the peaks are toasted golden brown." },
    { title: "🥣 Dunmer 'Vivec City' Ash-Roasted Roots", description: "A smoky, savory preparation of root vegetables that mimics the traditional cooking method of burying food in hot volcanic ash.", ingredients: ["3 large carrots, halved", "2 parsnips, quartered", "Olive oil and smoked sea salt", "1 tsp dried rosemary"], instructions: "Toss the roots in oil, rosemary, and smoked salt. Roast at a high heat until the edges are slightly charred and the insides are tender, providing that authentic 'ash-grown' flavor." },
    { title: "🍵 Khajiit 'Senche-Tiger' Chai", description: "A bold, heavily spiced tea that provides a sharp kick of energy, favored by the nomadic Baandari Pedlars.", ingredients: ["2 cups strong black tea", "1/4 cup heavy cream", "3 cardamom pods, crushed", "2 slices of fresh ginger", "A pinch of saffron (if the vault allows)"], instructions: "Boil the tea with the ginger and cardamom. Stir in the cream and honey to taste. Let the saffron steep at the very end to release its golden color and royal aroma." },
    { title: "🥧 Bosmer 'Falinesti' Meat Pie", description: "A dense, savory pie made entirely without grain or vegetable, strictly adhering to the Green Pact of Valenwood.", ingredients: ["1 lb ground venison or beef", "1/2 lb suet or animal fat, chilled", "2 egg yolks", "Coarse salt and crushed juniper berries"], instructions: "Press a 'crust' of seasoned ground meat into a small tin. Fill with a mixture of meat and suet. Seal the top with more meat, brush with egg yolk, and bake until the juices run clear." },
    { title: "🍲 Nord 'Windhelm' Venison Stew", description: "A thick, iron-rich stew designed to keep a warrior's blood warm during a blizzard in the Eastmarch.", ingredients: ["1 lb venison or beef chuck, cubed", "2 large potatoes, peeled", "1 cup hardy kale", "Beef bone broth", "A splash of dark, peppery ale"], instructions: "Sear the meat in a hot pot. Add the broth, ale, and potatoes. Low-simmer for hours until the meat is tender enough to eat with a spoon, then toss in the kale at the very end." },
    { title: "🍮 Altmer 'Alinor' Honey Mousse", description: "A light, ethereal dessert served in the high spires of the Summerset Isles, delicate and perfectly balanced.", ingredients: ["1 cup heavy whipping cream", "3 tablespoons wildflower honey", "1 teaspoon orange flower water", "Fresh raspberries for the top"], instructions: "Whip the cream until soft peaks form. Slowly fold in the honey and orange flower water. Chill in crystal glasses for two hours and serve topped with a single, perfect berry." }
];

const myTeas = [
    { title: "Lady Grey's Respite", icon: "☕", brew: "Steep 3 mins at 212°F", description: "A classic, elegant blend brightened with citrus and a touch of honey." },
    { title: "Lavender Chamomile Nightcap", icon: "🍵", brew: "Steep 5 mins at 200°F", description: "A deeply soothing floral blend meant to quiet a racing mind after a busy day." },
    { title: "Argonian 'Hist-Sap' Herbal", icon: "🧪", brew: "Steep 7 mins at 212°F", description: "A thick, earthy brew of Rooibos and vanilla that provides grounding energy for deep focus sessions." },
    { title: "Khajiit 'Moon-Sugar' Chai", icon: "🐯", brew: "Steep 5 mins at 212°F", description: "A spicy, invigorating black tea with ginger and cinnamon. Perfect for staying alert on the road." },
    { title: "Altmer 'Crystal Tower' White Tea", icon: "💎", brew: "Steep 2 mins at 175°F", description: "A delicate, high-caffeine silver needle tea for mental clarity during Unity or Python coding." },
    { title: "Nord 'Meadow-Sweet' Infusion", icon: "🏔️", brew: "Steep 6 mins at 200°F", description: "A wild-crafted blend of peppermint and red clover to bolster physical stamina." },
    { title: "Road-Warrior's Yerba Mate", icon: "🧉", brew: "Steep 5 mins at 165°F", description: "A potent, earthy stimulant. Provides a steady, jitter-free energy kick for delivery runs." },
    { title: "Matcha Focus Fuel", icon: "🍵", brew: "Whisk in 175°F water", description: "Pure powdered green tea. High in L-theanine for calm alertness while navigating traffic." },
    { title: "Iron Goddess Oolong", icon: "🐉", brew: "Steep 3 mins at 190°F", description: "Ti Kuan Yin Oolong. Known for sharpening the mind—perfect for troubleshooting complex code." },
    { title: "Ginkgo & Gotu Kola Infusion", icon: "🌿", brew: "Steep 10 mins at 212°F", description: "A non-caffeinated herbal blend designed to support memory and cognitive endurance." },
    { title: "Crimson Berry Spark", icon: "🍓", brew: "Steep 5 mins at 212°F", description: "A vibrant blend of hibiscus and berries. High in Vitamin C and naturally sweet for the kids." },
    { title: "Rooibos 'Lion's Mane' Vanilla", icon: "🦁", brew: "Steep 7 mins at 212°F", description: "Smooth, red bush tea that tastes like a treat. Great for staying hydrated during homeschooling." },
    { title: "White Peony Skin Shield", icon: "🌸", brew: "Steep 3 mins at 175°F", description: "A minimally processed white tea packed with antioxidants that help protect vibrant ink." },
    { title: "Nettle & Oatstraw Tonic", icon: "🌾", brew: "Steep 15 mins at 212°F", description: "A mineral-rich infusion that supports overall skin health and resilience." },
    { title: "Midnight Lapsang Souchong", icon: "🖤", brew: "Steep 4 mins at 212°F", description: "A 'gothic' tea. Pine-smoked black tea leaves create a campfire-scented brew for rainy evenings." },
    { title: "Velvet Cacao Pu-erh", icon: "🍫", brew: "Steep 5 mins at 212°F", description: "A deep, fermented dark tea with a rich chocolate aroma. Indulgent and grounding." }
];

const myApothecary = [
    { title: "Vibrant Ink Protectant Salve", icon: "🏺", description: "A deeply nourishing balm to protect and preserve skin artwork.", ingredients: "Beeswax, Shea Butter, Calendula Oil, Vitamin E", instructions: "Melt the wax and butter over a low hearth. Remove from heat, stir in the oils, and pour into a glass tin to set." },
    { title: "Soothe-and-Seal Tattoo Wash", icon: "🧼", description: "A gentle, antimicrobial cleanser for fresh ink.", ingredients: "Liquid Castille Soap, Distilled Water, Lavender Essential Oil, Tea Tree Oil", instructions: "Dilute the soap with water (1:3 ratio). Add 5 drops of each oil. Shake gently before use." },
    { title: "Dasher’s Focus Temple Balm", icon: "🧠", description: "A cooling, aromatic balm to rub on temples during long delivery shifts.", ingredients: "Coconut Oil, Peppermint Oil, Rosemary Oil, Eucalyptus Oil", instructions: "Blend oils into softened coconut oil. Apply to pressure points for an instant mental 'refresh'." },
    { title: "Anti-Traffic Tension Roll-On", icon: "🚗", description: "A portable oil blend to soothe the nerves during heavy traffic.", ingredients: "Jojoba Oil, Bergamot Essential Oil, Frankincense Oil", instructions: "Combine in a 10ml roller bottle. Apply to wrists and breathe deeply." },
    { title: "Hearth-Bound Muscle Soak", icon: "🛁", description: "A powerful recovery salt blend for tired legs and backs.", ingredients: "Epsom Salts, Pink Himalayan Salt, Ginger Powder, Juniper Berry Oil", instructions: "Mix salts and powder in a jar. Add 10 drops of oil. Dissolve 1 cup into a hot bath." },
    { title: "Quiet-Mind Pillow Spray", icon: "💤", description: "A gentle mist to transition the apprentices from lessons to sleep.", ingredients: "Witch Hazel, Distilled Water, Chamomile Oil, Clary Sage Oil", instructions: "Combine in a dark glass spray bottle. Lightly mist bed linens ten minutes before sleep." },
    { title: "Gilded Immunity Elderberry Syrup", icon: "🍷", description: "A daily tonic to bolster the family’s defenses.", ingredients: "Dried Elderberries, Cinnamon Sticks, Cloves, Fresh Ginger, Raw Honey", instructions: "Simmer berries and spices for 45 mins. Strain, let cool, and stir in honey." },
    { title: "Focus-Fire Study Mist", icon: "📚", description: "A bright, clarifying room spray to help the children focus.", ingredients: "Distilled Water, Lemon Oil, Rosemary Oil, Peppermint Oil", instructions: "Combine in a spray bottle. Shake and spritz the air at the start of a lesson." },
    { title: "Blonde-Streak Brightening Rinse", icon: "✨", description: "A natural rinse to keep your blonde streak vibrant.", ingredients: "Strongly brewed Chamomile tea, Lemon juice, Apple Cider Vinegar", instructions: "Mix cooled tea with a splash of juice and vinegar. Use as a final rinse." },
    { title: "Velvet Midnight Hair Mask", icon: "🌙", description: "A deep conditioning treatment for your graduated bob.", ingredients: "Argan Oil, Avocado Oil, Rosemary Essential Oil", instructions: "Warm the oils slightly. Massage through damp hair. Wrap in a warm towel for 20 mins." },
    { title: "Neon-Flora Lip Glaze", icon: "💄", description: "A vibrant, Lisa Frank-inspired tinted balm.", ingredients: "Beeswax, Coconut Oil, Beetroot Powder, Sweet Orange Oil", instructions: "Melt wax and oil. Stir in beetroot powder for tint. Add oil and pour into tins." },
    { title: "Gothic Velvet Facial Serum", icon: "🖤", description: "A luxurious, dark-themed oil for nighttime skin repair.", ingredients: "Rosehip Seed Oil, Argan Oil, Frankincense Resin, Dried Rose Petals", instructions: "Infuse petals in oils for one full moon cycle. Strain and apply 3 drops before sleep." },
    { title: "Iron-Heart Blade Oil", icon: "⚔️", description: "A protective oil to prevent rust on workshop tools.", ingredients: "Mineral Oil, Clove Essential Oil", instructions: "Mix a few drops of clove oil into the mineral oil. Apply a thin layer to metal surfaces." },
    { title: "Scribe’s Screen & Glass Cleanser", icon: "🖥️", description: "A streak-free, gentle cleaner for development monitors.", ingredients: "Distilled Water, Isopropyl Alcohol (70%), 1 drop Dish Soap", instructions: "Mix in a fine-mist spray bottle. Spray onto a microfiber cloth and wipe." },
    { title: "Storm-Soothe Chest Rub", icon: "🌬️", description: "A warming rub for the damp chill of an ice storm.", ingredients: "Olive Oil, Beeswax, Eucalyptus Oil, Camphor Oil", instructions: "Melt oil and wax. Stir in essential oils as it cools. Massage onto chest." },
    { title: "Hearth-Fire Hand Salve", icon: "🧤", description: "A heavy-duty repair cream for dry, cracked skin.", ingredients: "Lanolin, Coconut Oil, Honey, Calendula Petals", instructions: "Infuse oil with petals, strain, then whisk in lanolin and honey." },
    { title: "Fresh-Air Car Diffuser Blend", icon: "🌬️", description: "A bright, deodorizing blend to keep the car smelling like a sanctuary.", ingredients: "Lemon Oil, Grapefruit Oil, Pine Oil", instructions: "Drop onto a hanging clay ornament. Citrus cuts through food odors." },
    { title: "Road-Steady Eye Compress", icon: "👁️", description: "A cooling treatment for tired eyes after night driving.", ingredients: "Dried Cornflowers or Green Tea bags, Chilled Water", instructions: "Steep the herbs/tea, then chill. Soak cotton pads and rest over eyes for 10 minutes." },
    { title: "Gothic Rose Floor Wash", icon: "🥀", description: "A traditional cleansing wash to refresh the home's energy.", ingredients: "Hot Water, White Vinegar, Rose Water, Sea Salt", instructions: "Add ingredients to mop bucket. Salt and vinegar clear the space." },
    { title: "Lisa Frank 'Electric' Room Spray", icon: "🌈", description: "A high-vibe scent profile that makes the homeschooling area feel fun.", ingredients: "Witch Hazel, Orange Oil, Ylang Ylang, Vanilla Extract", instructions: "Combine in a spray bottle. Spritz during math lessons." },
    { title: "Minor Burn Butter", icon: "🔥", description: "A cooling balm for minor kitchen mishaps.", ingredients: "Aloe Vera Gel, Lavender Oil, Vitamin E Oil", instructions: "Whisk together until emulsified. Keep in the refrigerator for cooling effect." },
    { title: "The 'Bruise-Be-Gone' Liniment", icon: "🩹", description: "Speeds up healing of bumps and bruises.", ingredients: "Witch Hazel, Arnica Flowers (Infused), St. John’s Wort Oil", instructions: "Soak arnica in witch hazel for 2 weeks. Strain and mix with oil. Rub onto bruises." },
    { title: "Obsidian Velvet Lip Stain", icon: "💄", description: "A deep, berry-to-black lip stain with a matte finish.", ingredients: "Beeswax, Jojoba Oil, Activated Charcoal", instructions: "Melt wax and oil. Whisk in charcoal. Pour into a pot to set." },
    { title: "Raven's Wing Eye Coal", icon: "👁️", description: "A smudgeable cream eyeliner providing a dramatic frame for glasses.", ingredients: "Activated Charcoal, Shea Butter, a drop of Vitamin E Oil", instructions: "Fold charcoal into softened shea butter. Apply with a fine brush." },
    { title: "Electric Prism Highlighter", icon: "🌈", description: "A multi-tonal, shimmering cream that catches the light.", ingredients: "Magnesium Stearate, Neon Micas (Pink/Purple), Coconut Oil", instructions: "Press micas into magnesium stearate. Add oil drop by drop to form paste." },
    { title: "Neon-Flora Cheek Tint", icon: "🌸", description: "A bright, 'Electric Pink' cream blush.", ingredients: "Alkanet Root Infused Oil, White Kaolin Clay, Beeswax", instructions: "Melt wax into infused oil. Stir in clay to create opaque pink cream." },
    { title: "Cyber-Frost Eye Glaze", icon: "❄️", description: "A frosty, shimmering white-silver cream eyeshadow.", ingredients: "Aloe Vera Gel, Silver Mica Powder, Vegetable Glycerin", instructions: "Whisk silver mica into the aloe gel and glycerin." },
    { title: "Millennium Glitz Lip Gloss", icon: "✨", description: "A high-shine clear gloss with holographic glitter.", ingredients: "Castor Oil, Lanolin, Biodegradable Holographic Glitter", instructions: "Mix castor oil and lanolin until smooth. Stir in glitter." },
    { title: "Obsidian Armor Nail Tonic", icon: "💅", description: "A strengthening oil to keep nails resilient.", ingredients: "Horsetail-infused Olive Oil, Lemon Essential Oil, Myrrh Resin", instructions: "Soak myrrh resin in oil for one week. Strain and add lemon oil." },
    { title: "Spectral Setting Mist", icon: "🌫️", description: "A lightweight spray providing a faint, ethereal glow.", ingredients: "Rose Water, Witch Hazel, a tiny pinch of Pearl Mica", instructions: "Combine in a fine-mist bottle. Shake well before each use." },
    { title: "Midnight Velvet Body Butter", icon: "🌑", description: "A thick, luxurious cream for night-time restoration.", ingredients: "Mango Butter, Grapeseed Oil, Dried Hibiscus, Vanilla Bean", instructions: "Infuse oil with hibiscus/vanilla. Strain and whip with mango butter." },
    { title: "Neon Glow Shimmer Lotion", icon: "🌈", description: "A bright body lotion leaving a holographic shimmer.", ingredients: "Aloe Vera Gel, Sweet Almond Oil, Pink and Blue Eco-Glitter", instructions: "Emulsify aloe and oil. Fold in eco-glitter and peach essence." },
    { title: "Dasher’s Heel & Pedal Shield", icon: "👣", description: "A heavy-duty barrier balm for foot fatigue.", ingredients: "Beeswax, Neem Oil, Peppermint Essential Oil, Arnica Infusion", instructions: "Melt beeswax and arnica oil. Add neem and peppermint." },
    { title: "Graveyard Dirt Coffee Scrub", icon: "⚰️", description: "A gritty, dark-themed scrub that uses caffeine to tighten skin.", ingredients: "Spent Coffee Grounds, Brown Sugar, Activated Charcoal, Coconut Oil", instructions: "Mix dry ingredients. Fold in coconut oil until texture resembles soil." },
    { title: "Cyber-Frost Peppermint Scrub", icon: "❄️", description: "A Y2K-inspired, tingly sugar scrub.", ingredients: "White Sugar, Fractionated Coconut Oil, Blue Spirulina, Peppermint Oil", instructions: "Blend sugar and oil. Add blue spirulina for color." },
    { title: "Apprentice 'Candy-Shop' Salt Scrub", icon: "🍭", description: "A gentle, colorful scrub for the kids.", ingredients: "Fine Sea Salt, Jojoba Oil, Watermelon Extract, Beetroot Powder", instructions: "Divide salt into two bowls. Tint one pink. Layer in a jar with oil." },
    { title: "Phantom Color-Shift Lip Gloss", icon: "🔮", description: "A gothic gloss that shifts based on skin pH.", ingredients: "Castor Oil, Red 27, Gold Mica", instructions: "Mix pigment into castor oil. Add a pinch of gold mica." },
    { title: "Stardust Setting Powder", icon: "✨", description: "A lightweight powder that blurs imperfections.", ingredients: "Arrowroot Powder, Kaolin Clay, French Green Clay", instructions: "Sift powders together three times. Store in a shaker jar." }
];

const myHerbs = [
    { title: "Rosemary", icon: "🌿", properties: "Memory & Mental Clarity", description: "The 'Herb of Remembrance.' Burn as incense or keep fresh at your workstation." },
    { title: "Gotu Kola", icon: "🍀", properties: "Cognitive Support", description: "A staple for deep focus. Helps sustain mental energy for long coding sessions." },
    { title: "Ginkgo Biloba", icon: "🍃", properties: "Circulation & Vision", description: "Supports blood flow to the brain and eye health." },
    { title: "Sage", icon: "🍂", properties: "Wisdom & Clearing", description: "Used to clear mental fog and 'stale' energy from a workspace." },
    { title: "Holy Basil (Tulsi)", icon: "🌿", properties: "Stress Resilience", description: "An adaptogen that helps the mind stay calm during a chaotic schedule." },
    { title: "Peppermint", icon: "🌱", properties: "Vigilance & Digestion", description: "A bright, waking herb. Perfect as a mid-shift tea during DoorDash runs." },
    { title: "Nettle", icon: "🌿", properties: "Nutrient Density & Vitality", description: "Rich in iron and minerals. Brew as a nourishing infusion for winter." },
    { title: "Ginseng", icon: "🪵", properties: "Adrenal Support", description: "A powerful adaptogen that helps the body manage stress and fatigue." },
    { title: "Oatstraw", icon: "🌾", properties: "Nervous System Support", description: "Gently restorative. Drink after a long day of driving to soothe road frazzle." },
    { title: "Ginger", icon: "🫚", properties: "Warmth & Circulation", description: "Excellent for cold weather shifts. Keeps the inner fire burning." },
    { title: "Lavender", icon: "🪻", properties: "Restoration & Calm", description: "Excellent for sleep pillows and soothing teas." },
    { title: "Chamomile", icon: "🌼", properties: "Gentle Sleep & Ease", description: "The ultimate 'quiet time' herb. Use to transition apprentices to rest." },
    { title: "Lemon Balm", icon: "🍋", properties: "Bright Mood & Anxiety Relief", description: "A gentle, sunny herb that lifts the spirit." },
    { title: "Catnip", icon: "🐈", properties: "Relaxation (For Humans Too!)", description: "While it makes your Familiar zoomy, as a tea it is incredibly soothing for humans." },
    { title: "Passionflower", icon: "🟣", properties: "Deep Quietude", description: "A stronger ally for those nights when the mind won't stop racing." },
    { title: "Elderberry", icon: "🫐", properties: "Immunity & Seasonal Shield", description: "A powerful ally for the changing seasons." },
    { title: "Echinacea", icon: "🌸", properties: "Immune Activation", description: "Used at the first sign of a 'glitch' in your health." },
    { title: "Calendula", icon: "🧡", properties: "Skin Healing", description: "A bright orange bloom used in salves to soothe skin." },
    { title: "Yarrow", icon: "🦴", properties: "Boundaries & Stopping Flow", description: "A traditional 'wound-wort' used metaphorically for energetic protection." },
    { title: "Mullein", icon: "🕯️", properties: "Breath & Air", description: "Soothing for the lungs. Excellent for clearing the chest." },
    { title: "Ashwagandha", icon: "🪴", properties: "Stress Adaptation & Strength", description: "Helps the body manage physical and mental stress." },
    { title: "Dandelion Root", icon: "🌼", properties: "Detoxification & Digestion", description: "A resilient 'weed.' The root is a powerful ally for clearing the system." },
    { title: "Hawthorn Berry", icon: "🍒", properties: "Heart Health & Emotional Courage", description: "Supports the physical heart and provides steadying energy." },
    { title: "Astragalus", icon: "🎋", properties: "Deep Immunity & Vitality", description: "A slow-acting but powerful tonic for the immune system." }
];

const mySewing = [
    { title: "Hearth Apron", status: "Completed", fabric: "Sturdy Canvas", notes: "Added deep pockets for gathering herbs." }
];

// === 2. LORE & ATMOSPHERE ===
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

// --- KITCHEN GRIMOIRE ---
let currentGrimoireData = [];
async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">Kitchen Grimoire</h2>`;
    const dbRecipes = await loadData('recipes');
    let localG = (typeof myRecipes !== 'undefined') ? myRecipes : [];
    
    currentGrimoireData = [...localG, ...myTeas, ...(dbRecipes || [])];
    currentGrimoireData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    html += `
    <div class="grimoire-tome-container">
        <div class="grimoire-page-wrapper">
            <div class="grimoire-page" id="grimoire-left-page">
                <div class="alphabet-nav">
                    ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(L => 
                        `<button class="letter-btn" onclick="filterByLetter('${L}')">${L}</button>`
                    ).join('')}
                    <button class="letter-btn" onclick="openPortal('grimoire')" style="width:auto; padding:0 5px;">All</button>
                </div>
                <input type="text" id="grimoire-search" class="grimoire-search-bar" placeholder="Search archives..." oninput="filterGrimoire()">
                <div id="grimoire-index-list">${renderGrimoireIndex('')}</div>
            </div>
            <div class="grimoire-page" id="grimoire-right-page">
                <p style="text-align:center; font-style:italic; margin-top:50px; opacity:0.6;">Select a recipe to read its lore.</p>
            </div>
        </div>
    </div>
    <div class="section-header closed" onclick="toggleSection(this)">Scribe New Recipe</div>
    <div class="section-panel closed" id="form-recipe">
        <div style="margin-top: 10px; margin-bottom: 15px;">
            <input type="text" id="inp-title" placeholder="Recipe Title..." class="portal-input" style="margin-bottom: 10px;">
            <textarea id="inp-description" placeholder="Brief Description..." class="portal-input" style="height: 40px; resize: none; margin-bottom: 10px;"></textarea>
            <textarea id="inp-ingredients" placeholder="Ingredients..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea>
            <textarea id="inp-instructions" placeholder="Instructions..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea>
            <button onclick="scribeToArchive('recipes', 'form-recipe', 'grimoire')" class="portal-btn" style="width: 100%;">Bind to Grimoire</button>
        </div>
    </div>`;
    return html;
}

window.renderGrimoireIndex = function(query) {
    let listHTML = ''; let currentLetter = ''; const q = (query || "").toLowerCase();
    currentGrimoireData.forEach((recipe, i) => {
        if (q === '' || (recipe.title && recipe.title.toLowerCase().includes(q))) {
            if (q === '') {
                const firstLetter = (recipe.title ? recipe.title.charAt(0).toUpperCase() : '?');
                if (firstLetter !== currentLetter) { listHTML += `<div class="toc-header">- ${firstLetter} -</div>`; currentLetter = firstLetter; }
            }
            listHTML += `<div class="grimoire-index-item" onclick="readGrimoirePage(${i})">${recipe.title}</div>`;
        }
    });
    return listHTML || `<div style="text-align:center; margin-top:20px; opacity:0.5;">Archives empty.</div>`;
};

window.filterByLetter = function(letter) {
    const filtered = currentGrimoireData.filter(r => r.title.toUpperCase().startsWith(letter));
    let listHTML = `<div class="toc-header">- ${letter} -</div>`;
    filtered.forEach((recipe) => {
        const originalIndex = currentGrimoireData.findIndex(r => r.title === recipe.title);
        listHTML += `<div class="grimoire-index-item" onclick="readGrimoirePage(${originalIndex})">${recipe.title}</div>`;
    });
    document.getElementById('grimoire-index-list').innerHTML = filtered.length ? listHTML : `<div style="text-align:center; margin-top:20px; opacity:0.5;">No lore under ${letter}.</div>`;
};
window.filterGrimoire = function() { document.getElementById('grimoire-index-list').innerHTML = renderGrimoireIndex(document.getElementById('grimoire-search').value); };
window.readGrimoirePage = function(index) {
    const recipe = currentGrimoireData[index];
    let ingList = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => `<li>${ing}</li>`).join('') : recipe.ingredients || 'Properties recorded.';
    document.getElementById('grimoire-right-page').innerHTML = `<h3 class="page-title">${recipe.title}</h3><p class="page-text" style="font-style:italic;">${recipe.description || ''}</p><h4 class="page-header">Ingredients</h4><ul class="page-text">${ingList}</ul><h4 class="page-header">Instructions</h4><p class="page-text">${recipe.instructions || 'Lore recorded.'}</p>`;
};

// --- BARDIC SOUNDSCAPES (YOUR EXACT REPO TRACKS) ---
let activeSoundscapes = {};
async function buildAudioHTML() {
    let html = `<h2 class="gold-text">Bardic Soundscapes</h2><div class="portal-scroll-container">`;
    html += `<p style="text-align:center; color: #d4c8a8; font-style:italic; margin-bottom: 15px;">Weave your atmosphere.</p>`;
    
    const tracks = [
        { id: "binary", name: "Binary Box", url: "binarymusicbox.mp3" },
        { id: "cat", name: "Purring Cat", url: "cat.mp3" },
        { id: "clock", name: "Ticking Clock", url: "clock.mp3" },
        { id: "crickets", name: "Night Crickets", url: "crickets.mp3" },
        { id: "darkmusic", name: "Dark Atmosphere", url: "darkmusic1.mp3" },
        { id: "fire", name: "Hearth Fire", url: "fire.mp3" },
        { id: "frogs", name: "Swamp Frogs", url: "frogs.mp3" },
        { id: "musicbox1", name: "Music Box I", url: "musicbox1.mp3" },
        { id: "musicbox2", name: "Music Box II", url: "musicbox2.mp3" },
        { id: "musicbox3", name: "Music Box III", url: "musicbox3.mp3" },
        { id: "owls", name: "Midnight Owls", url: "owls.mp3" },
        { id: "rain", name: "Gentle Rain", url: "rain.mp3" },
        { id: "raven", name: "Raven Calls", url: "raven.mp3" },
        { id: "simmering", name: "Simmering Pot", url: "simmeringpot.mp3" },
        { id: "teacup", name: "Teacup Clinks", url: "teacup.mp3" },
        { id: "thunder", name: "Thunderstorm", url: "thunder.mp3" },
        { id: "windchimes", name: "Wind Chimes", url: "windchimes.mp3" },
        { id: "winterwind", name: "Winter Wind", url: "winterwind.mp3" },
        { id: "xmas1", name: "Yule Box I", url: "xmasmusicbox1.mp3" },
        { id: "xmas2", name: "Yule Box II", url: "xmasmusicbox2.mp3" },
        { id: "xmas3", name: "Yule Box III", url: "xmasmusicbox3.mp3" }
    ];

    html += `<div style="text-align:center; margin-bottom: 15px;"><button class="portal-btn" style="border-color:#ff6b6b; color:#ff6b6b;" onclick="stopAllTracks()">Silence All</button></div><div id="soundscape-container">`;
    tracks.forEach(track => {
        const isActive = activeSoundscapes[track.id] ? 'active' : '';
        const currentVol = activeSoundscapes[track.id] ? activeSoundscapes[track.id].volume : 0.5;
        html += `<div class="sound-card ${isActive}"><button class="sound-btn" onclick="toggleTrack('${track.id}', '${track.url}')">${track.name}</button><input type="range" class="volume-slider" min="0" max="1" step="0.05" value="${currentVol}" onchange="changeVolume('${track.id}', this.value)"></div>`;
    });
    return html + `</div></div>`;
}

window.toggleTrack = function(id, url) {
    if (activeSoundscapes[id]) {
        activeSoundscapes[id].pause();
        delete activeSoundscapes[id];
        openPortal('audio'); 
    } else {
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().then(() => { activeSoundscapes[id] = audio; openPortal('audio'); }).catch(e => { console.error("Audio error:", e); alert("Could not load: " + url); });
    }
};

window.changeVolume = function(id, vol) { if (activeSoundscapes[id]) activeSoundscapes[id].volume = vol; };
window.stopAllTracks = function() { for (let id in activeSoundscapes) { activeSoundscapes[id].pause(); } activeSoundscapes = {}; openPortal('audio'); };

// --- BOUNTY BOARD (CAT) ---
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
    html += `<div id="scribe-section" class="section-header closed" onclick="toggleSection(this)">Scribe Alignment</div><div id="scribe-panel" class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="ev-title" placeholder="Alignment Title..." class="portal-input" style="margin-bottom: 10px;"><input type="datetime-local" id="ev-date" class="portal-input" style="margin-bottom: 10px;"><button onclick="addEvent()" class="portal-btn" style="width: 100%;">Seal in the Stars</button></div></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-quest-item" placeholder="Scribe a quick chore..." class="portal-input"><button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Add</button></div>`;
    const quests = await loadData('daily_quests');
    quests.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div></div>`; 
    });
    return html + `</div></div>`; 
}

// === ARCHITECT'S FORGE: CORE MECHANICS ===

window.startForging = async function(input) {
    if(!input.files[0]) return;
    
    // Change the label text so you know it's working
    const label = input.nextElementSibling;
    const originalText = label.innerText;
    label.innerText = "✨ Weaving Background into the Cloud...";

    // Upload the background straight to Supabase
    const bgUrl = await uploadImageToSupabase(input.files[0], 'trophy_bg', label.id);
    
    if(!bgUrl) {
        label.innerText = "🚫 Upload Failed.";
        setTimeout(() => label.innerText = originalText, 2000);
        return;
    }

    draftBgUrl = bgUrl;
    const bgArt = document.getElementById('bg-art');
    if(bgArt) bgArt.src = draftBgUrl; 
    
    document.body.classList.add('building-mode'); 
    const layer = document.getElementById('furnishing-layer');
    if(layer) layer.innerHTML = ''; // Clear current room
    
    closePortal(); 
    isForging = true;
    
    // SPAWN THE MISSING TOOLBOX!
    await buildForgeToolbox();
};

window.buildForgeToolbox = async function() {
    let toolbox = document.getElementById('forge-toolbox');
    if (!toolbox) {
        toolbox = document.createElement('div');
        toolbox.id = 'forge-toolbox';
        document.body.appendChild(toolbox);
    }

    const stash = await loadData('inventory_stash');
    let stashHtml = stash.map(item => 
        `<div style="text-align:center; margin:5px;">
            <img src="${item.image_url}" onclick="spawnToForge('${item.image_url}')" style="width:60px; height:60px; object-fit:contain; cursor:pointer; background:rgba(0,0,0,0.5); border:1px solid rgba(191,149,63,0.5); border-radius:4px; transition: transform 0.2s;">
        </div>`
    ).join('');

    if(stash.length === 0) stashHtml = `<p style="color:rgba(191,149,63,0.6); font-style:italic; font-size:0.85em; text-align:center; width:100%;">Your stash is empty. Add items from the main portal first!</p>`;

    toolbox.innerHTML = `
        <div style="background: rgba(16, 12, 9, 0.95); border: 2px solid #bf953f; border-radius: 6px; padding: 15px; width: 320px; box-shadow: 0 10px 30px rgba(0,0,0,0.9); pointer-events: auto;">
            <h3 style="color:#fcf6ba; font-family:'Cinzel', serif; margin:0 0 15px 0; text-align:center; border-bottom:1px solid rgba(191,149,63,0.3); padding-bottom:10px;">Architect's Toolbox</h3>
            
            <div style="margin-bottom: 15px;">
                <div style="display:flex; justify-content:space-between; color:#bf953f; font-size:0.8em; margin-bottom:5px;"><span>Item Scale</span><span id="scale-readout">1.0x</span></div>
                <input type="range" id="forge-scale" min="0.2" max="3" step="0.1" value="1" style="width:100%; cursor:pointer;">
            </div>
            
            <div style="max-height: 250px; overflow-y: auto; display:flex; flex-wrap:wrap; justify-content:center; margin-bottom: 20px; background:rgba(0,0,0,0.3); border:1px inset rgba(191,149,63,0.2); padding:10px; border-radius:4px;">
                ${stashHtml}
            </div>
            
            <input type="text" id="forge-room-name" placeholder="Name this Room..." class="portal-input" style="margin-bottom:10px;">
            
            <div style="display:flex; gap:10px;">
                <button onclick="saveForgedRoom()" class="portal-btn" style="flex:2; background:#8fce00; color:#000; border-color:#8fce00;">Seal Room</button>
                <button onclick="exitForge()" class="portal-btn" style="flex:1; background:#ff6b6b; color:#000; border-color:#ff6b6b;">Cancel</button>
            </div>
        </div>
    `;

    // Make the toolbox float beautifully on the screen
    toolbox.style.position = 'fixed';
    toolbox.style.top = '20px';
    toolbox.style.right = '20px';
    toolbox.style.zIndex = '9999';
    toolbox.style.display = 'block';

    // Hook up the scale slider dynamically
    document.getElementById('forge-scale').addEventListener('input', (e) => {
        document.getElementById('scale-readout').innerText = e.target.value + 'x';
        if (editingItem) {
            editingItem.style.transform = `translate(-50%, -50%) scale(${e.target.value})`;
            editingItem.dataset.scale = e.target.value;
        }
    });
};

window.spawnToForge = function(imageUrl) {
    const layer = document.getElementById('furnishing-layer');
    if(!layer) return;
    const img = document.createElement('img');
    img.src = imageUrl; 
    img.className = 'furnishing-item';
    img.style.position = 'absolute'; // Critical for drag-and-drop!
    img.style.left = '50%'; 
    img.style.top = '50%';
    img.style.cursor = 'grab';
    img.style.transform = 'translate(-50%, -50%) scale(1)';
    img.dataset.scale = 1;
    
    // Add glowing border to indicate it is selected
    img.style.filter = 'drop-shadow(0 0 10px rgba(191,149,63,0.8))';
    if(editingItem) editingItem.style.filter = 'none'; // Deselect old item
    editingItem = img;
    
    // Reset scale slider to 1 when spawning a new item
    document.getElementById('forge-scale').value = 1;
    document.getElementById('scale-readout').innerText = '1.0x';

    img.onmousedown = selectItemForEdit;
    layer.appendChild(img);
};

function selectItemForEdit(e) { 
    if (!isForging) return; 
    e.preventDefault(); 
    
    if(editingItem) editingItem.style.filter = 'none'; // Deselect previous
    editingItem = e.target; 
    editingItem.style.filter = 'drop-shadow(0 0 10px rgba(191,149,63,0.8))';
    editingItem.style.cursor = 'grabbing';
    
    // Update the slider to match the clicked item's scale
    const currentScale = editingItem.dataset.scale || 1;
    document.getElementById('forge-scale').value = currentScale;
    document.getElementById('scale-readout').innerText = currentScale + 'x';

    document.onmousemove = dragItem; 
    document.onmouseup = stopDrag; 
}

function dragItem(e) { 
    if (editingItem) { 
        editingItem.style.left = e.clientX + 'px'; 
        editingItem.style.top = e.clientY + 'px'; 
    } 
}

function stopDrag() { 
    if(editingItem) editingItem.style.cursor = 'grab';
    document.onmousemove = null; 
    document.onmouseup = null; 
}

window.saveForgedRoom = async function() {
    const roomName = document.getElementById('forge-room-name').value.trim();
    if(!roomName) return alert("The Architect must name this chamber!");

    // 1. Save the Room Background
    const roomId = Date.now().toString();
    await insertData('trophy_rooms', {
        id: roomId,
        name: roomName,
        bg_url: draftBgUrl
    });

    // 2. Save all the Furniture Placements
    const layer = document.getElementById('furnishing-layer');
    const items = layer.querySelectorAll('.furnishing-item');

    for (let item of items) {
        await insertData('trophy_furnishings', {
            room_id: roomId,
            image_url: item.src,
            pos_x: item.style.left,
            pos_y: item.style.top,
            scale: parseFloat(item.dataset.scale || 1),
            z_index: parseInt(item.style.zIndex || 10)
        });
    }

    exitForge();
    openPortal('inventory'); // Re-open portal to see the new room in the Gallery
};

window.exitForge = function() {
    isForging = false;
    document.body.classList.remove('building-mode');
    const toolbox = document.getElementById('forge-toolbox');
    if(toolbox) toolbox.style.display = 'none';
    
    // Deselect any active item
    if(editingItem) editingItem.style.filter = 'none';
    editingItem = null;
    
    // Reload whatever the previously active room was
    if(typeof loadActiveTrophy === 'function') loadActiveTrophy();
};
// --- THE STILLNESS (TEACUP) ---
async function buildTeacupHTML() {
    let html = `<h2 class="gold-text">The Stillness</h2><div class="portal-scroll-container">`;
    html += `<div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-bottom: 20px;" id="form-teacup">
                <textarea id="inp-note" placeholder="Record your visions..." class="portal-input" style="height: 100px; resize: none; margin-bottom: 10px;"></textarea>
                <button onclick="scribeToArchive('family_notes', 'form-teacup', 'teacup')" class="portal-btn">Seal Memory</button>
             </div>`;
    const notes = await loadData('family_notes');
    notes.forEach(note => {
        const dateStr = new Date(note.created_at).toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'});
        html += `<div class="tea-card"><div style="font-size: 0.85em; color: rgba(191,149,63,0.8); margin-bottom: 8px;"><span>${dateStr}</span></div><p style="margin: 0; white-space: pre-wrap;">${note.note}</p></div>`;
    });
    return html + `</div>`;
}

// --- APOTHECARY (BULLETPROOF CABINET & UPLOADS) ---
async function buildApothecaryHTML() {
    try {
        let html = `<h2 class="gold-text">Apothecary</h2><div class="portal-scroll-container">`;
        html += `<p style="text-align:center; color:#d4c8a8; font-style:italic; margin-top:0;">Select a phial to read its contents.</p>`;
        
        // --- ADD NEW RECIPE FORM ---
        html += `
        <div class="section-header closed" onclick="toggleSection(this)">Scribe New Concoction</div>
        <div class="section-panel closed">
            <div style="background: rgba(8, 8, 10, 0.6); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; margin-bottom: 20px;">
                <input type="text" id="apo-title" placeholder="Concoction Name..." class="portal-input" style="margin-bottom: 10px;">
                <textarea id="apo-desc" placeholder="Brief Description..." class="portal-input" style="height: 40px; resize: none; margin-bottom: 10px;"></textarea>
                <textarea id="apo-ingredients" placeholder="Ingredients..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea>
                <textarea id="apo-instructions" placeholder="Instructions..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(0,0,0,0.4); padding:10px; border:1px dashed rgba(191,149,63,0.3); border-radius:4px;">
                    <label for="apo-image" class="custom-file-label" style="margin:0;">Attach Image</label>
                    <input type="file" id="apo-image" accept="image/*" onchange="document.getElementById('apo-file-status').innerText = this.files[0].name">
                    <span id="apo-file-status" style="font-size:0.8em; color:#bf953f; font-style:italic; max-width:50%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">No file chosen</span>
                </div>
                
                <button onclick="addApothecaryRecipe()" class="portal-btn" style="width: 100%;">Add to Cabinet</button>
            </div>
        </div>`;

        // --- SAFE CLOUD LOADING & DEDUPLICATION ---
        let dbRecipes = [];
        if (db) {
            try {
                const { data } = await db.from('apothecary').select('*').order('created_at', { ascending: false });
                if (data) dbRecipes = data;
            } catch (err) { console.warn("Could not reach cloud apothecary."); }
        }

        // Merge local baseline + cloud without creating duplicates!
        const localApo = (typeof myApothecary !== 'undefined') ? myApothecary : [];
        const uniqueRecipes = new Map();
        
        // Add local first
        localApo.forEach(r => uniqueRecipes.set(r.title, r));
        // Add cloud second (cloud versions will overwrite local versions if they share a name)
        dbRecipes.forEach(r => uniqueRecipes.set(r.title, r));
        
        const allRecipes = Array.from(uniqueRecipes.values());
        
        // Ensure we generate enough shelf slots to fit everything perfectly (multiples of 6)
        const totalSlots = Math.max(Math.ceil(allRecipes.length / 6) * 6, 24);

        // HARDCODED INLINE CSS CABINET (Forced to Render)
        html += `<div style="display: grid; grid-template-columns: repeat(6, 1fr); grid-auto-rows: 100px; min-height: 450px; background: url('apothecary_cabinet_v2.jpg') top center/100% auto repeat-y, #0c0c0e; border: 5px solid #3e2723; border-radius: 4px; margin: 20px auto 40px auto; box-shadow: 0 10px 20px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,1); padding: 50px 15px 15px 15px;">`;
        
        for (let i = 0; i < totalSlots; i++) {
            html += `<div style="display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 5px;">`;
            if (allRecipes[i]) {
                const recipe = allRecipes[i];
                const safeTitle = encodeURIComponent(recipe.title || '');
                const safeDesc = encodeURIComponent(recipe.description || '');
                const safeIng = encodeURIComponent(recipe.ingredients || '');
                const safeInst = encodeURIComponent(recipe.instructions || '');
                const safeImg = encodeURIComponent(recipe.image_url || '');
                const icon = recipe.icon || '🏺';
                
                html += `<div onclick="openReadingDesk('${safeTitle}', '${safeDesc}', '${safeIng}', '${safeInst}', '${safeImg}', '${recipe.id || ''}')" style="cursor:pointer; text-align:center; width:100%; transition: transform 0.2s;">
                            <div title="${recipe.title}" style="width: 26px; height: 38px; border-radius: 10px 10px 15px 15px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); position: relative; margin: 0 auto; box-shadow: inset 0 0 5px rgba(255,255,255,0.2);">
                                <span style="position:absolute; top:40%; left:50%; transform:translate(-50%,-50%); font-size:14px; z-index:2;">${icon}</span>
                                <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 50%; border-radius: 0 0 13px 13px; background: #8fce00; box-shadow: 0 0 10px #8fce00; opacity: 0.8;"></div>
                            </div>
                            <div style="font-size:0.55em; color:#bf953f; margin-top:6px; line-height:1.2; max-width:100%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; background:rgba(0,0,0,0.8); border-radius:2px; padding:2px;">${recipe.title}</div>
                        </div>`;
            } else {
                // Empty Bottle Outline
                html += `<div style="width: 26px; height: 38px; border-radius: 10px 10px 15px 15px; border: 2px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); margin: 0 auto;"></div>`;
            }
            html += `</div>`; 
        }
        
        return html + `</div><div id="apothecary-reading-desk" style="margin-bottom: 20px;"></div></div>`;
        
    } catch (error) {
        console.error("Apothecary crashed:", error);
        return `<h2 class="gold-text">Apothecary</h2><p style="color:#ff6b6b; text-align:center;">The magic failed to render the cabinet. Check console.</p>`;
    }
}

window.addApothecaryRecipe = async function() {
    const title = document.getElementById('apo-title').value.trim();
    if (!title) return alert("The concoction needs a name!");
    
    const description = document.getElementById('apo-desc').value.trim();
    const ingredients = document.getElementById('apo-ingredients').value.trim();
    const instructions = document.getElementById('apo-instructions').value.trim();
    const fileInput = document.getElementById('apo-image');
    
    let imageUrl = null;
    if (fileInput && fileInput.files.length > 0) {
        // Uses the global image uploader we built in the last step
        imageUrl = await uploadImageToSupabase(fileInput.files[0], 'apothecary', 'apo-file-status');
    }

    await insertData('apothecary', { title, description, ingredients, instructions, image_url: imageUrl, icon: '🏺' });
    openPortal('alchemy'); 
};

window.openReadingDesk = function(encTitle, encDesc, encIng, encInst, encImg, id) {
    const title = decodeURIComponent(encTitle); 
    const desc = decodeURIComponent(encDesc);
    const ing = decodeURIComponent(encIng); 
    const inst = decodeURIComponent(encInst);
    const img = decodeURIComponent(encImg);

    let imgHtml = (img && img !== 'null' && img !== 'undefined' && img !== '') ? `<img src="${img}" style="width:100%; max-height:250px; object-fit:cover; border-radius:4px; margin-bottom:15px; border:1px solid rgba(191,149,63,0.3);">` : '';
    let delBtn = (id && id !== 'null' && id !== 'undefined' && id !== '') ? `<button class="action-btn" style="position:absolute; top:15px; right:15px; color:#ff6b6b; font-size:16px;" onclick="removeData('apothecary', '${id}'); openPortal('alchemy'); document.getElementById('apothecary-reading-desk').innerHTML='';">✕</button>` : '';

    const desk = document.getElementById('apothecary-reading-desk');
    desk.innerHTML = `
    <div class="alchemy-card" style="position:relative;">
        ${delBtn}
        <h3 class="alchemy-title" style="padding-right: 20px;">${title}</h3>
        ${imgHtml}
        <p style="color:#d4c8a8; font-style: italic;">${desc}</p>
        <div style="background:rgba(0,0,0,0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191,149,63,0.3);">
            <p style="color:#bf953f; margin:0 0 5px 0; font-weight:bold;">Ingredients</p>
            <p style="color:#d4c8a8; margin:0 0 15px 0; white-space:pre-wrap;">${ing}</p>
            <p style="color:#bf953f; margin:0 0 5px 0; font-weight:bold;">Instructions</p>
            <p style="color:#d4c8a8; margin:0; white-space:pre-wrap;">${inst}</p>
        </div>
    </div>`;
    desk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
// --- THE DRYING RACK ---
async function buildHerbsHTML() {
    let html = `<h2 class="gold-text">The Drying Rack</h2><div class="portal-scroll-container"><div class="herbs-rack-container">`;
    const dbHerbs = await loadData('herbs');
    const allHerbs = [...myHerbs, ...(dbHerbs || [])];
    allHerbs.forEach((herb, i) => {
        html += `<div class="herb-slot" id="herb-slot-${i}"><div class="herb-bundle" id="bundle-${i}" onclick="toggleHerbDetail('${i}')"><div class="herb-icon">${herb.icon || '🌿'}</div><div class="herb-tag">${herb.title}</div><div class="herb-detail-tag"><h4 class="gold-text" style="font-size: 1em;">${herb.title}</h4><p style="color:#fcf6ba; font-style:italic;">${herb.properties || ''}</p><p style="color:#d4c8a8; margin: 0;">${herb.description}</p></div></div></div>`;
    });
    return html + `</div></div>`;
}

window.toggleHerbDetail = function(id) {
    const bundle = document.getElementById(`bundle-${id}`);
    const isOpen = bundle.classList.contains('show-details');
    document.querySelectorAll('.herb-bundle').forEach(b => b.classList.remove('show-details'));
    if (!isOpen) bundle.classList.add('show-details');
};

// --- THE LIVING BEDS ---
let currentBedName = localStorage.getItem('active_garden_bed') || 'Main Bed';
async function buildGardenHTML() {
    let html = `<h2 class="gold-text">Living Beds</h2><div class="portal-scroll-container">`;
    let allBeds = JSON.parse(localStorage.getItem('garden_bed_names') || '["Main Bed"]');
    html += `<div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;"><select id="bed-select" class="portal-input" onchange="switchBed(this.value)">${allBeds.map(b => `<option value="${b}" ${b===currentBedName?'selected':''}>${b}</option>`).join('')}</select></div><div class="garden-bed-container">`;
    const plots = await loadData('garden_plots');
    const active = plots.filter(p => (p.bed_name || 'Main Bed') === currentBedName);
    for (let i = 1; i <= 8; i++) {
        const gridId = `cell-${i}`; const plot = active.find(p => p.grid_id === gridId);
        if (plot) {
            const days = Math.floor((new Date() - new Date(plot.created_at)) / (1000 * 60 * 60 * 24));
            let icon = days >= 3 ? plot.plant_icon : (days >= 1 ? '🌿' : '🌱');
            html += `<div class="garden-cell" onclick="tendPlot('${plot.id}', '${encodeURIComponent(plot.plant_name)}')"><div class="plant-icon">${icon}</div><div class="plant-name">${plot.plant_name}</div></div>`;
        } else {
            html += `<div class="garden-cell" onclick="plantSeed('${gridId}')"><div class="plant-icon" style="opacity:0.2;">🌱</div></div>`;
        }
    }
    return html + `</div><div id="garden-action-panel"></div></div>`;
}

window.plantSeed = function(gridId) {
    document.getElementById('garden-action-panel').innerHTML = `<div class="alchemy-card" id="form-garden"><h3 class="alchemy-title">Sow Seed</h3><input type="text" id="inp-plant_name" placeholder="Name..." class="portal-input"><input type="hidden" id="inp-grid_id" value="${gridId}"><input type="hidden" id="inp-bed_name" value="${currentBedName}"><button onclick="scribeToArchive('garden_plots', 'form-garden', 'garden')" class="portal-btn">Plant</button></div>`;
};
window.tendPlot = function(plotId, encPlantName) {
    const plantName = decodeURIComponent(encPlantName);
    document.getElementById('garden-action-panel').innerHTML = `<div class="alchemy-card"><h3 class="alchemy-title">Tending: ${plantName}</h3><div style="display:flex; gap:10px;"><button onclick="removeData('garden_plots', '${plotId}'); openPortal('garden');" class="portal-btn" style="color:#ff6b6b; border-color:#ff6b6b; flex:1;">Uproot</button><button onclick="document.getElementById('garden-action-panel').innerHTML='';" class="portal-btn" style="flex:1;">Cancel</button></div></div>`;
};
window.switchBed = function(name) { currentBedName = name; localStorage.setItem('active_garden_bed', name); openPortal('garden'); };

// --- THE VAULT (LEDGER) ---
async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const transactions = await loadData('ledger_transactions', 'created_at', false);
    let balance = 0; transactions.forEach(t => balance += parseFloat(t.amount || 0));
    html += `<div style="text-align:center; font-size:1.8em; color:#fcf6ba; font-family:'Cinzel', serif; margin-bottom:20px; text-shadow: 0 0 10px rgba(191,149,63,0.5);">Vault Balance: $${balance.toFixed(2)}</div>`;
    html += `<div class="section-panel" id="form-ledger"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="inp-desc" placeholder="Desc..." class="portal-input" style="flex: 2;"><input type="number" step="0.01" id="inp-amount" placeholder="+/- $" class="portal-input" style="flex: 1;"><button onclick="scribeToArchive('ledger_transactions', 'form-ledger', 'ledger')" class="portal-btn">Log</button></div></div>`;
    transactions.forEach(item => {
        html += `<div class="quest-item"><div class="quest-details" style="display:flex; justify-content:space-between; width:100%; align-items:center;"><h3 class="quest-title" style="font-size:0.95em; margin:0;">${item.desc}</h3><div style="font-weight:bold;">$${parseFloat(item.amount).toFixed(2)}</div></div></div>`;
    });
    return html + `</div>`;
}

// --- THE MASTER APPRENTICE HUB (ROSTER, MAP, & LOGS) ---
let currentApprentice = localStorage.getItem('active_apprentice') || '';
let selectedMapQuest = null; 

async function buildApprenticeHTML() {
    let html = `<h2 class="gold-text">Apprentice Hub</h2><div class="portal-scroll-container" style="padding-right:15px;">`;
    
    // --- 1. THE ROSTER ---
    const roster = await loadData('apprentice_roster');
    if (roster.length > 0 && !roster.find(r => r.name === currentApprentice)) {
        currentApprentice = roster[0].name;
        localStorage.setItem('active_apprentice', currentApprentice);
    }

    let rosterOpts = roster.length ? roster.map(r => `<option value="${r.name}" ${r.name === currentApprentice ? 'selected' : ''}>${r.name}</option>`).join('') : `<option value="">No apprentices yet...</option>`;

    html += `<div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); padding:10px; border:1px solid rgba(191,149,63,0.3); border-radius:4px; margin-bottom:20px;">
                <select class="portal-input" style="width: 65%; margin:0; font-weight:bold; color:#fcf6ba;" onchange="switchApprenticeMap(this.value)">
                    ${rosterOpts}
                </select>
                <button onclick="addNewApprentice()" class="portal-btn" style="padding: 8px; font-size:0.8em; color:#8fce00; border-color:#8fce00;">+ Add Kid</button>
             </div>`;

    if (!currentApprentice) {
        return html + `<p style="text-align:center; color:rgba(191,149,63,0.5); font-style:italic;">Please add an apprentice to your roster to begin.</p></div>`;
    }

    // --- 2. THE MAP (Always visible so coordinate math doesn't break!) ---
    html += `<h3 style="color:#bf953f; font-family:'Cinzel'; margin: 0 0 10px 0; border-bottom:1px dashed rgba(191,149,63,0.3); padding-bottom:5px;">🗺️ Active Quests</h3>
             <div id="map-portal-container" onclick="mapClickAction(event)" style="margin-bottom: 25px;">
                <img src="quest_map.jpg" id="active-quest-map" alt="Curriculum Map">
                <div id="marker-layer"></div>
                
                <div id="map-quest-scroll">
                    <button class="action-btn" style="position:absolute; top:5px; right:10px; color:#ff6b6b; font-size:1.4em;" onclick="closeMapScroll()">✕</button>
                    <div id="scroll-subject-badge" class="subject-badge" style="background:#8fce00; color:#000; font-weight:bold; font-size:0.8em; margin-bottom:10px;"></div>
                    <h3 id="scroll-quest-title" style="font-family:'Cinzel', serif; color:#332211; margin:0 0 10px 0;"></h3>
                    <div id="scroll-xp-reward" style="font-weight:bold; color:#664422; margin-bottom:15px; border-bottom:1px solid #c9b089; padding-bottom:10px;"></div>
                    <div style="display:flex; gap:10px;">
                        <button id="complete-quest-btn" class="portal-btn" style="background:#8fce00; color:#000; border-color:#668800; flex:2;">Complete Quest</button>
                        <button id="delete-quest-btn" class="portal-btn" style="background:#ff6b6b; color:#000; border-color:#aa3333; flex:1;">Abandon</button>
                    </div>
                </div>
             </div>`;

    // --- 3. ATTENDANCE & WORK LOGS ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">Attendance & Work Logs</div>
             <div class="section-panel closed">
                
                <div style="background: rgba(8, 8, 10, 0.6); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; margin-bottom: 20px;">
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <select id="log-type" class="portal-input" style="flex:1; cursor:pointer;">
                            <option value="✅ Attendance">✅ Attendance</option>
                            <option value="📝 Note">📝 Note / Observation</option>
                            <option value="📸 Work Upload">📸 Work Upload</option>
                        </select>
                    </div>
                    <textarea id="log-text" placeholder="Details (e.g., Present, Mastered fractions...)" class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(0,0,0,0.4); padding:10px; border:1px dashed rgba(191,149,63,0.3); border-radius:4px;">
                        <label for="log-image" class="custom-file-label" style="margin:0;">Attach Photo of Work</label>
                        <input type="file" id="log-image" accept="image/*" onchange="document.getElementById('log-file-status').innerText = this.files[0].name">
                        <span id="log-file-status" style="font-size:0.8em; color:#bf953f; font-style:italic; max-width:50%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">No file chosen</span>
                    </div>
                    <button onclick="addApprenticeLog()" class="portal-btn" style="width: 100%;">Save Log for ${currentApprentice}</button>
                </div>`;
                
    // Render the past logs!
    const logs = await loadData('apprentice_logs');
    const activeLogs = logs.filter(l => l.apprentice_name === currentApprentice);
    
    if (activeLogs.length === 0) html += `<p style="color:rgba(191,149,63,0.5); font-style:italic; text-align:center;">No logs recorded yet.</p>`;
    
    activeLogs.forEach(log => {
        const dateStr = new Date(log.created_at).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'});
        const imgHtml = log.image_url ? `<img src="${log.image_url}" style="width:100%; max-height:300px; object-fit:contain; margin-top:10px; border-radius:4px; border:1px solid rgba(191,149,63,0.3); background:rgba(0,0,0,0.5);">` : '';
        html += `<div class="alchemy-card" style="position:relative; margin-bottom:12px;">
                    <button class="action-btn" style="position:absolute; top:10px; right:10px; color:#ff6b6b; font-size:16px;" onclick="removeData('apprentice_logs', '${log.id}'); openPortal('apprentice');">✕</button>
                    <div style="font-size:0.85em; color:#bf953f; font-weight:bold; margin-bottom:5px; border-bottom:1px dashed rgba(191,149,63,0.3); padding-bottom:5px;">${log.log_type} • <span style="color:#d4c8a8; font-weight:normal;">${dateStr}</span></div>
                    <div style="color:#e0e0e0; white-space:pre-wrap; font-size:0.95em;">${log.text_content}</div>
                    ${imgHtml}
                 </div>`;
    });

    html += `</div>`;

    setTimeout(loadMapMarkers, 50); 
    return html + `</div>`;
}

// === ROSTER HELPER ===
window.addNewApprentice = async function() {
    const name = prompt("Enter the Apprentice's name:");
    if (name && name.trim() !== '') {
        await insertData('apprentice_roster', { name: name.trim() });
        currentApprentice = name.trim();
        localStorage.setItem('active_apprentice', currentApprentice);
        openPortal('apprentice');
    }
};

window.switchApprenticeMap = function(name) {
    currentApprentice = name; localStorage.setItem('active_apprentice', name);
    openPortal('apprentice'); 
};

// === LOG HELPER ===
window.addApprenticeLog = async function() {
    const type = document.getElementById('log-type').value;
    const text = document.getElementById('log-text').value.trim();
    const fileInput = document.getElementById('log-image');
    
    if (!text && fileInput.files.length === 0) return alert("Please add a note or attach an image.");
    
    let imageUrl = null;
    if (fileInput.files.length > 0) {
        imageUrl = await uploadImageToSupabase(fileInput.files[0], 'work', 'log-file-status');
    }

    await insertData('apprentice_logs', { 
        apprentice_name: currentApprentice,
        log_type: type,
        text_content: text,
        image_url: imageUrl
    });
    
    feedFamiliar();
    openPortal('apprentice');
};

// === MAP HELPERS ===
window.mapClickAction = function(e) {
    if (e.target.classList.contains('quest-marker') || e.target.id === 'map-quest-scroll' || e.target.closest('#map-quest-scroll')) return;

    const container = document.getElementById('map-portal-container');
    const rect = container.getBoundingClientRect();
    
    // Prevent math crash if rect is 0 (shouldn't happen now that map isn't in an accordion)
    if(rect.width === 0) return;

    const posX = ((e.clientX - rect.left) / rect.width) * 100;
    const posY = ((e.clientY - rect.top) / rect.height) * 100;
    
    closeMapScroll(); 

    const scroll = document.getElementById('map-quest-scroll');
    scroll.innerHTML = `
        <button class="action-btn" style="position:absolute; top:5px; right:10px; color:#ff6b6b; font-size:1.4em;" onclick="closeMapScroll()">✕</button>
        <h3 style="font-family:'Cinzel', serif; color:#332211; margin:0 0 15px 0;">Assign to ${currentApprentice}</h3>
        <input type="text" id="map-inp-title" placeholder="Quest Name (e.g. Fractions)..." class="portal-input" style="background:#fcfaf0; border-color:#c9b089; color:#332211; margin-bottom:10px;">
        <div style="display:flex; gap:10px; margin-bottom:15px;">
            <select id="map-inp-subject" class="portal-input" style="background:#fcfaf0; border-color:#c9b089; color:#332211; flex:2;">
                <option value="🧮 Math">🧮 Math</option>
                <option value="📚 Reading">📚 Reading</option>
                <option value="🧪 Science">🧪 Science</option>
                <option value="🎨 Art">🎨 Art</option>
                <option value="🧹 Chores">🧹 Chores</option>
            </select>
            <select id="map-inp-diff" class="portal-input" style="background:#fcfaf0; border-color:#c9b089; color:#332211; flex:1;">
                <option value="Common">Common</option>
                <option value="Elite">Elite</option>
                <option value="Boss">Boss</option>
            </select>
        </div>
        <input type="hidden" id="map-inp-x" value="${posX}"><input type="hidden" id="map-inp-y" value="${posY}">
        <button onclick="saveQuestMarker()" class="portal-btn" style="width:100%; background:#bf953f; color:#fff; border-color:#664422;">Seal Quest</button>
    `;
    scroll.classList.add('active'); 
};

window.closeMapScroll = function() {
    const scroll = document.getElementById('map-quest-scroll');
    if (scroll) scroll.classList.remove('active');
    selectedMapQuest = null; 
};

window.saveQuestMarker = async function() {
    const title = document.getElementById('map-inp-title').value.trim();
    if (!title) return alert("The quest needs a title!");
    
    await insertData('apprentice_map_quests', {
        apprentice_name: currentApprentice,
        subject: document.getElementById('map-inp-subject').value,
        difficulty: document.getElementById('map-inp-diff').value,
        text: title, 
        is_completed: false,
        pos_x: parseFloat(document.getElementById('map-inp-x').value),
        pos_y: parseFloat(document.getElementById('map-inp-y').value)
    });
    
    closeMapScroll();
    openPortal('apprentice'); 
};

window.loadMapMarkers = async function() {
    const layer = document.getElementById('marker-layer');
    if (!layer) return;
    layer.innerHTML = ''; 

    const allQuests = await loadData('apprentice_map_quests');
    const activeQuests = allQuests.filter(q => q.apprentice_name === currentApprentice);

    activeQuests.forEach(quest => {
        if(!quest.pos_x || !quest.pos_y) return; // Skip broken markers
        const marker = document.createElement('div');
        marker.className = `quest-marker ${quest.difficulty.toLowerCase()}`;
        if (quest.is_completed) marker.classList.add('completed');
        
        marker.style.left = `${quest.pos_x}%`;
        marker.style.top = `${quest.pos_y}%`;
        marker.onclick = (e) => { e.stopPropagation(); openQuestDetail(quest); };
        
        layer.appendChild(marker);
    });
};

window.openQuestDetail = function(quest) {
    selectedMapQuest = quest; 
    const scroll = document.getElementById('map-quest-scroll');
    scroll.innerHTML = `<button class="action-btn" style="position:absolute; top:5px; right:10px; color:#ff6b6b; font-size:1.4em;" onclick="closeMapScroll()">✕</button><div id="scroll-subject-badge" class="subject-badge" style="background:#8fce00; color:#000; font-weight:bold; font-size:0.8em; margin-bottom:10px;">${quest.subject}</div><h3 id="scroll-quest-title" style="font-family:'Cinzel', serif; color:#332211; margin:0 0 10px 0;">${quest.text}</h3><div id="scroll-xp-reward" style="font-weight:bold; color:#664422; margin-bottom:15px; border-bottom:1px solid #c9b089; padding-bottom:10px;">Reward: +${quest.difficulty === 'Boss' ? 50 : (quest.difficulty === 'Elite' ? 25 : 10)} XP</div><div style="display:flex; gap:10px;"><button id="complete-quest-btn" class="portal-btn" style="background:#8fce00; color:#000; border-color:#668800; flex:2;">Complete Quest</button><button id="delete-quest-btn" class="portal-btn" style="background:#ff6b6b; color:#000; border-color:#aa3333; flex:1;">Abandon</button></div>`;

    document.getElementById('complete-quest-btn').onclick = async () => {
        if (selectedMapQuest) {
            await updateData('apprentice_map_quests', selectedMapQuest.id, { is_completed: true });
            feedFamiliar(); closeMapScroll(); openPortal('apprentice'); 
        }
    };
    
    document.getElementById('delete-quest-btn').onclick = async () => {
        if (selectedMapQuest && confirm("Abandon this quest forever?")) {
            await removeData('apprentice_map_quests', selectedMapQuest.id);
            closeMapScroll(); openPortal('apprentice');
        }
    };

    scroll.classList.add('active'); 
};;

// --- SEWING & WORKSHOP (UPGRADED WITH IMAGES) ---

// Helper for resizing and uploading anywhere in the Sanctuary
window.uploadImageToSupabase = async function(file, prefix, statusElementId) {
    const statusText = document.getElementById(statusElementId);
    if (statusText) statusText.innerText = "✨ Weaving image into the cloud...";
    
    return new Promise((resolve, reject) => {
        const vault = db || (typeof supabase !== 'undefined' ? supabase : null);
        if (!vault) {
            if (statusText) statusText.innerText = "⚠️ No cloud connection.";
            return resolve(null);
        }
        
        resizeImage(file, 800, async (resizedBlob) => {
            const fileName = `${prefix}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            const { data, error } = await vault.storage.from('assets').upload(fileName, resizedBlob, { contentType: file.type || 'image/png' });
            
            if (error) {
                console.error("Upload failed:", error);
                if (statusText) statusText.innerText = "🚫 Upload failed.";
                resolve(null);
            } else {
                const { data: urlData } = vault.storage.from('assets').getPublicUrl(fileName);
                if (statusText) statusText.innerText = "✅ Image sealed.";
                resolve(urlData.publicUrl);
            }
        });
    });
};

async function buildSewingHTML() {
    let html = `<h2 class="gold-text">Measurement Log</h2><div class="portal-scroll-container">`;
    
    html += `
    <div class="section-header closed" onclick="toggleSection(this)">Scribe New Project</div>
    <div class="section-panel closed">
        <div style="background: rgba(8, 8, 10, 0.6); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px;">
            <input type="text" id="sew-title" placeholder="Project Name..." class="portal-input" style="margin-bottom: 10px;">
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" id="sew-fabric" placeholder="Fabric/Material..." class="portal-input" style="flex:1;">
                <select id="sew-status" class="portal-input" style="flex:1; cursor:pointer;">
                    <option value="Drafting">📐 Drafting</option>
                    <option value="In Progress">🧵 In Progress</option>
                    <option value="Completed">✨ Completed</option>
                </select>
            </div>
            <textarea id="sew-notes" placeholder="Notes & Measurements..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; background:rgba(0,0,0,0.4); padding:10px; border:1px dashed rgba(191,149,63,0.3); border-radius:4px;">
                <label for="sew-image" class="custom-file-label" style="margin:0;">Attach Sketch/Photo</label>
                <input type="file" id="sew-image" accept="image/*" onchange="document.getElementById('sew-file-status').innerText = this.files[0].name">
                <span id="sew-file-status" style="font-size:0.8em; color:#bf953f; font-style:italic; max-width:50%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">No file chosen</span>
            </div>
            
            <button onclick="addSewingProject()" class="portal-btn" style="width: 100%;">Log Project</button>
        </div>
    </div>`;

    const localSewing = (typeof mySewing !== 'undefined') ? mySewing : [];
    const savedSewing = await loadData('sewing_projects'); 
    const allSewing = [...localSewing, ...(savedSewing || [])];
    
    if (allSewing.length === 0) html += `<p style="text-align:center; color:rgba(191,149,63,0.5); font-style:italic; margin-top:20px;">Your log is empty.</p>`;
    
    allSewing.forEach(item => {
        let statusColor = item.status === 'Completed' ? '#8fce00' : (item.status === 'Drafting' ? '#4facfe' : '#bf953f');
        let delBtn = item.id ? `<button class="action-btn" style="position:absolute; top:10px; right:10px; color:#ff6b6b;" onclick="removeData('sewing_projects', '${item.id}'); openPortal('sewing');">✕</button>` : '';
        let imgHtml = item.image_url ? `<img src="${item.image_url}" style="width:100%; max-height:250px; object-fit:cover; border-radius:4px; margin-bottom:10px; border:1px solid rgba(191,149,63,0.3);">` : '';

        html += `
        <div style="position:relative; background: rgba(20, 15, 12, 0.8); border: 1px solid rgba(191, 149, 63, 0.4); border-top: 3px double ${statusColor}; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
            ${delBtn}
            <h3 style="color:#fcf6ba; font-family:'Cinzel', serif; margin:0 0 10px 0;">✂️ ${item.title}</h3>
            ${imgHtml}
            <div style="display:inline-block; background:rgba(0,0,0,0.5); color:${statusColor}; padding:4px 10px; border-radius:12px; font-size:0.75em; border:1px solid ${statusColor}; margin-bottom:12px; font-weight:bold;">${item.status || 'In Progress'}</div>
            <div style="color:#d4c8a8; font-size:0.9em; margin-bottom:8px;"><strong>Material:</strong> <span style="color:#bf953f;">${item.fabric || 'Unknown'}</span></div>
            <div style="background:rgba(0,0,0,0.4); padding:10px; border-left:2px solid rgba(191,149,63,0.5); color:#e0e0e0; font-size:0.9em; white-space:pre-wrap;">${item.notes || item.description || 'No notes.'}</div>
        </div>`;
    });
    return html + `</div>`;
}

window.addSewingProject = async function() {
    const title = document.getElementById('sew-title').value.trim();
    if (!title) return alert("The project needs a name!");
    
    const fabric = document.getElementById('sew-fabric').value.trim();
    const status = document.getElementById('sew-status').value;
    const notes = document.getElementById('sew-notes').value.trim();
    const fileInput = document.getElementById('sew-image');
    
    let imageUrl = null;
    if (fileInput.files.length > 0) {
        imageUrl = await uploadImageToSupabase(fileInput.files[0], 'sewing', 'sew-file-status');
    }

    await insertData('sewing_projects', { title, fabric, status, notes, image_url: imageUrl });
    openPortal('sewing');
};

async function buildWorkshopHTML() {
    let html = `<h2 class="gold-text">Artisan's Workshop</h2><div class="portal-scroll-container">`;
    
    // --- BLUEPRINTS ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">Project Blueprints</div>
             <div class="section-panel closed">
                <div style="background: rgba(8, 8, 10, 0.6); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; margin-bottom: 15px;">
                    <input type="text" id="new-workshop-proj" placeholder="Blueprint Name..." class="portal-input" style="margin-bottom:10px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <label for="blueprint-image" class="custom-file-label" style="margin:0;">Attach Schematic</label>
                        <input type="file" id="blueprint-image" accept="image/*" onchange="document.getElementById('bp-file-status').innerText = this.files[0].name">
                        <span id="bp-file-status" style="font-size:0.8em; color:#bf953f; font-style:italic; max-width:50%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">No file chosen</span>
                    </div>
                    <button onclick="addBlueprintProject()" class="portal-btn" style="width:100%;">Draft Blueprint</button>
                </div>`;
                
    const projects = await loadData('workshop_projects');
    projects.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        const imgHtml = item.image_url ? `<img src="${item.image_url}" style="width:100%; border-radius:4px; margin-top:12px; border:1px solid rgba(191,149,63,0.3); max-height: 250px; object-fit: contain; background: rgba(0,0,0,0.5);">` : '';
        
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('workshop_projects', '${item.id}', ${item.is_completed}, 'workshop')" style="flex-direction: column;">
                    <div style="display:flex; width:100%; justify-content:space-between; align-items:flex-start;">
                        <div style="display:flex; gap:15px; align-items:center;">
                            <div class="quest-checkbox"></div>
                            <div class="quest-details"><h3 class="quest-title" style="font-size:0.95em;">${item.text}</h3></div>
                        </div>
                        <div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('workshop_projects', '${item.id}', 'workshop')">✕</div>
                    </div>
                    ${imgHtml}
                 </div>`; 
    });
    html += `</div>`;

    // --- MATERIAL STASH ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Material Stash</div><div class="section-panel closed"><div style="background:rgba(8, 8, 10, 0.6); padding:15px; border-radius:4px; border:1px solid rgba(191,149,63,0.3); margin-top:10px; margin-bottom:15px;"><div style="display:flex; gap:10px; margin-bottom:10px;"><select id="mat-icon" class="portal-input" style="flex:0.5; padding:8px; cursor:pointer;"><option value="🪵">🪵 Wood</option><option value="🪨">🪨 Stone</option><option value="⛓️">⛓️ Metal</option><option value="🧶">🧶 Yarn</option><option value="🎨">🎨 Pigment</option><option value="📦">📦 Misc</option></select><input type="text" id="mat-name" placeholder="Name..." class="portal-input" style="flex:2; margin:0;"></div><div style="display:flex; gap:10px;"><input type="text" id="mat-qty" placeholder="Quantity..." class="portal-input" style="flex:2; margin:0;"><button onclick="addMaterialStash()" class="portal-btn" style="flex:1;">Stash It</button></div></div><div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:10px;">`;
    const materials = await loadData('material_stash');
    materials.forEach(item => { html += `<div style="background:rgba(0,0,0,0.5); border:1px dashed rgba(191,149,63,0.4); border-radius:4px; padding:15px 10px; position:relative; text-align:center;"><button class="action-btn" style="position:absolute; top:2px; right:2px; font-size:12px; color:#ff6b6b;" onclick="removeData('material_stash', '${item.id}'); openPortal('workshop');">✕</button><div style="font-size:2.2em; margin-bottom:8px; filter:drop-shadow(2px 4px 4px #000);">${item.icon || '📦'}</div><div style="color:#fcf6ba; font-family:'Cinzel', serif; font-size:0.9em; margin-bottom:5px; line-height:1.2;">${item.name}</div><div style="color:#bf953f; font-size:0.75em; border-top:1px solid rgba(191,149,63,0.2); padding-top:5px;">${item.qty}</div></div>`; });
    html += `</div></div>`;

    // --- TOOLS ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">Tool Maintenance</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-tool" placeholder="e.g. Oil shears..." class="portal-input"><button onclick="addDynamicItem('tool_maintenance', 'new-tool', 'workshop')" class="portal-btn">Add</button></div>`;
    const tools = await loadData('tool_maintenance');
    tools.forEach(item => { const isDone = item.is_completed ? 'completed' : ''; html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('tool_maintenance', '${item.id}', ${item.is_completed}, 'workshop')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title" style="font-size:0.9em; color:#d4c8a8;">🛠️ ${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('tool_maintenance', '${item.id}', 'workshop')">✕</div></div>`; });
    return html + `</div></div>`;
}

window.addBlueprintProject = async function() {
    const text = document.getElementById('new-workshop-proj').value.trim();
    if (!text) return alert("The blueprint needs a title!");
    
    const fileInput = document.getElementById('blueprint-image');
    let imageUrl = null;

    if (fileInput.files.length > 0) {
        imageUrl = await uploadImageToSupabase(fileInput.files[0], 'blueprint', 'bp-file-status');
    }

    await insertData('workshop_projects', { text: text, is_completed: false, image_url: imageUrl });
    openPortal('workshop');
};

window.addMaterialStash = async function() {
    const icon = document.getElementById('mat-icon').value;
    const name = document.getElementById('mat-name').value.trim();
    const qty = document.getElementById('mat-qty').value.trim();
    if(!name) return alert("You must name the material!");
    await insertData('material_stash', { icon, name, qty });
    openPortal('workshop');
};
// === 5. MASTER CORE UI CONTROLLER ===
window.openPortal = async function(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    overlay.classList.add('active');
    
    try {
        if (portalName === 'grimoire') content.innerHTML = await buildGrimoireHTML();
        else if (portalName === 'cat') content.innerHTML = await buildBountyBoardHTML();
        else if (portalName === 'teacup') content.innerHTML = await buildTeacupHTML();
        else if (portalName === 'window') content.innerHTML = buildAlmanacHTML();
        else if (portalName === 'alchemy') content.innerHTML = await buildApothecaryHTML(); 
        else if (portalName === 'herbs') content.innerHTML = await buildHerbsHTML(); 
        else if (portalName === 'ledger') content.innerHTML = await buildLedgerHTML();
        else if (portalName === 'apprentice') content.innerHTML = await buildApprenticeHTML();
        else if (portalName === 'inventory') content.innerHTML = await buildInventoryHTML();
        else if (portalName === 'audio') content.innerHTML = await buildAudioHTML(); 
        else if (portalName === 'garden') content.innerHTML = await buildGardenHTML(); 
        else if (portalName === 'sewing') content.innerHTML = await buildSewingHTML();
        else if (portalName === 'workshop') content.innerHTML = await buildWorkshopHTML();
        else content.innerHTML = "<h2>Stabilizing Rift...</h2>";
    } catch (error) {
        console.error("Portal Rendering Error:", error);
        content.innerHTML = `<h2 class="gold-text">Rift Unstable</h2><p style="color:#ff6b6b;">The magic failed to weave correctly.</p>`;
    }
};

window.closePortal = function() { document.getElementById('parchment-overlay').classList.remove('active'); };
window.toggleAccordion = function(btn) { btn.classList.toggle('active'); let p = btn.nextElementSibling; if(p.style.maxHeight) p.style.maxHeight = null; else p.style.maxHeight = p.scrollHeight + 30 + "px"; };
window.toggleSection = function(headerBtn) { headerBtn.classList.toggle('closed'); headerBtn.nextElementSibling.classList.toggle('closed'); };

// ACTION HELPERS
window.addDynamicItem = async function(table, inputId, portal) { const text = document.getElementById(inputId).value.trim(); if (!text) return; await insertData(table, { text: text, is_completed: false }); if(portal) openPortal(portal); };
window.toggleDynamicItem = async function(table, id, currentState, portal) { await updateData(table, id, { is_completed: !currentState }); if (!currentState) feedFamiliar(); if(portal) openPortal(portal); };
window.deleteDynamicItem = async function(table, id, portal) { await removeData(table, id); if(portal) openPortal(portal); };
window.addEvent = async function() { const title = document.getElementById('ev-title').value.trim(); const date = document.getElementById('ev-date').value; if (!title) return; await insertData('calendar_events', { title: title, start_date: date, text: 'pending' }); openPortal('cat'); };
window.deleteEvent = async function(id) { await removeData('calendar_events', id); openPortal('cat'); };
window.toggleEvent = async function(id, currentText) { const newState = currentText === 'completed' ? 'pending' : 'completed'; await updateData('calendar_events', id, { text: newState }); if (newState === 'completed') feedFamiliar(); openPortal('cat'); };

// === THE FAMILIAR ===
let familiarXP = 0; const maxXP = 5;
function feedFamiliar() { if (familiarXP < maxXP) { familiarXP++; updateFamiliarUI(); } }
function updateFamiliarUI() {
    const fill = document.querySelector('.xp-ring-fill');
    if (fill) fill.style.strokeDashoffset = 289 - (289 * (familiarXP / maxXP));
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    updateFamiliarUI();
    updateNatureLore();
    fetchLocalAtmosphere();
    if (typeof loadActiveTrophy === "function") loadActiveTrophy();
    
    // The Architect's Forge Scale Slider
    const forgeScale = document.getElementById('forge-scale');
    if(forgeScale) {
        forgeScale.addEventListener('input', (e) => {
            if (editingItem) {
                editingItem.style.transform = `translate(-50%, -50%) scale(${e.target.value})`;
                editingItem.dataset.scale = e.target.value;
            }
        });
    }

    // === NEW: ESCAPE KEY TO CLOSE PORTALS ===
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") {
            // Check if the small map scroll is open first
            const mapScroll = document.getElementById('map-quest-scroll');
            if (mapScroll && mapScroll.classList.contains('active')) {
                closeMapScroll();
            } else {
                // Otherwise, close the main portal
                closePortal();
            }
        }
    });

    console.log("🏰 Sanctuary Fully Reforged.");
});
