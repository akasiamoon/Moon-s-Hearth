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
        try {
            const { data, error } = await db.from(tableName).select('*').order(orderBy, { ascending: asc });
            if (!error && data) results = data;
        } catch (e) { console.warn(`Table ${tableName} not found in cloud.`); }
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

// === THE MASTER SCRIBE (Painless Unified Input) ===
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

    let error = null;
    if (db) {
        const { error: dbErr } = await db.from(tableName).insert([entry]);
        error = dbErr;
    } else {
        const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
        localData.push({ ...entry, id: Date.now().toString(), created_at: new Date().toISOString() });
        localStorage.setItem(tableName, JSON.stringify(localData));
    }

    if (error) {
        alert("The ink didn't take: " + error.message);
    } else {
        feedFamiliar();
        openPortal(portalToReload); 
    }
}

// === 1. LOCAL DATA (ALL 30 RECIPES RESTORED UNABRIDGED) ===
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

// --- APOTHECARY & TEAS (RESTORING ALL 38+ ITEMS) ---
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

// === 4. HTML BUILDERS (THE CHAMBERS RESTORED UNABRIDGED) ===

// --- KITCHEN GRIMOIRE (CAGED & ALPHABETIZED) ---
let currentGrimoireData = [];

async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">The Kitchen Grimoire</h2>`;
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

                <input type="text" id="grimoire-search" class="grimoire-search-bar" 
                       placeholder="Search archives..." oninput="filterGrimoire()">
                
                <div id="grimoire-index-list">
                    ${renderGrimoireIndex('')} 
                </div>
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
                if (firstLetter !== currentLetter) {
                    listHTML += `<div class="toc-header">- ${firstLetter} -</div>`;
                    currentLetter = firstLetter;
                }
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

window.filterGrimoire = function() {
    const query = document.getElementById('grimoire-search').value;
    document.getElementById('grimoire-index-list').innerHTML = renderGrimoireIndex(query);
};

window.readGrimoirePage = function(index) {
    const recipe = currentGrimoireData[index];
    const rightPage = document.getElementById('grimoire-right-page');
    let ingList = Array.isArray(recipe.ingredients) ? recipe.ingredients.map(ing => `<li>${ing}</li>`).join('') : recipe.ingredients || 'Properties recorded.';
    rightPage.innerHTML = `
        <h3 class="page-title">${recipe.title}</h3>
        <p class="page-text" style="font-style:italic;">${recipe.description || ''}</p>
        <h4 class="page-header">Ingredients</h4>
        <ul class="page-text">${ingList}</ul>
        <h4 class="page-header">Instructions</h4>
        <p class="page-text">${recipe.instructions || 'Lore recorded.'}</p>
    `;
};

// --- BARDIC SOUNDSCAPES (RESTORED ALL 20+ TRACKS) ---
let activeSoundscapes = {};

async function buildAudioHTML() {
    let html = `<h2 class="gold-text">Bardic Soundscapes</h2><div class="portal-scroll-container">`;
    html += `<p style="text-align:center; color: rgba(191,149,63,0.8); font-style:italic;">Select your ambient mix for the Sanctuary.</p>`;
    
    const tracks = [
        { id: 'rain', name: 'Gentle Rainfall', url: 'rain.mp3' },
        { id: 'fire', name: 'Hearth Fire', url: 'fire.mp3' },
        { id: 'tavern', name: 'Busy Tavern', url: 'tavern.mp3' },
        { id: 'forest', name: 'Deep Forest', url: 'forest.mp3' },
        { id: 'library', name: 'Arcane Library', url: 'library.mp3' },
        { id: 'storm', name: 'Thunderstorm', url: 'storm.mp3' },
        { id: 'meadow', name: 'Summer Meadow', url: 'meadow.mp3' },
        { id: 'ocean', name: 'Distant Shores', url: 'ocean.mp3' },
        { id: 'crypt', name: 'Echoing Crypt', url: 'crypt.mp3' },
        { id: 'market', name: 'Bazaar Hubbub', url: 'market.mp3' },
        { id: 'snow', name: 'Blizzard Wind', url: 'snow.mp3' },
        { id: 'monks', name: 'Chanting Monks', url: 'monks.mp3' },
        { id: 'alchemy', name: 'Bubbling Vials', url: 'alchemy.mp3' },
        { id: 'blacksmith', name: 'Iron Forge', url: 'forge.mp3' },
        { id: 'cat', name: 'Purring Familiar', url: 'cat.mp3' },
        { id: 'study', name: 'Scribe\'s Study', url: 'study.mp3' },
        { id: 'celestial', name: 'Stellar Wind', url: 'celestial.mp3' },
        { id: 'garden', name: 'Night Garden', url: 'garden_amb.mp3' },
        { id: 'underwater', name: 'Abyssal Depths', url: 'underwater.mp3' },
        { id: 'birds', name: 'Morning Chorus', url: 'birds.mp3' }
    ];

    html += `<div id="soundscape-container">`;
    tracks.forEach(track => {
        const isActive = activeSoundscapes[track.id] ? 'active' : '';
        html += `<div class="sound-item">
                    <button class="play-btn ${isActive}" onclick="toggleTrack('${track.id}', '${track.url}')">${track.name}</button>
                    <input type="range" class="volume-slider" min="0" max="1" step="0.1" value="0.5" onchange="changeVolume('${track.id}', this.value)">
                 </div>`;
    });
    html += `</div></div>`;
    return html;
}

function toggleTrack(id, url) {
    if (activeSoundscapes[id]) {
        activeSoundscapes[id].pause();
        delete activeSoundscapes[id];
        openPortal('audio');
    } else {
        const audio = new Audio(url);
        audio.loop = true;
        audio.play();
        activeSoundscapes[id] = audio;
        openPortal('audio');
    }
}

function changeVolume(id, vol) {
    if (activeSoundscapes[id]) activeSoundscapes[id].volume = vol;
}

// --- BOUNTY BOARD (CAT RESTORED) ---
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
    } else { html += `<p style="text-align:center; opacity:0.5; font-style:italic;">No active bounties.</p>`; }
    html += `</div>`; 

    html += `<div class="section-header closed" onclick="toggleSection(this)">Daily Endeavors</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="new-quest-item" placeholder="Add a quick task..." class="portal-input"><button onclick="addDynamicItem('daily_quests', 'new-quest-item', 'cat')" class="portal-btn">Post</button></div>`;
    const quests = await loadData('daily_quests');
    quests.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('daily_quests', '${item.id}', ${item.is_completed}, 'cat')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('daily_quests', '${item.id}', 'cat')">✕</div></div>`; 
    });
    html += `</div></div>`; 
    return html;
}

// --- ARCHITECT'S FORGE (RESTORED INTERACTIVE FORGE) ---
let isForging = false; let editingItem = null; let draftBgUrl = '';

async function buildInventoryHTML() {
    let html = `<h2 class="gold-text">Architect's Studio</h2><div class="portal-scroll-container">`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Forge New Sanctuary</div><div class="section-panel closed">
                <div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; text-align:center;">
                    <p style="color:#d4c8a8; font-size:0.85em; margin-top:0;">Upload a base background to enter the Forge.</p>
                    <label for="room-bg-upload" class="custom-file-label" style="width:100%; box-sizing:border-box;">Select Background Image</label>
                    <input type="file" id="room-bg-upload" accept="image/*" onchange="startForging(this)">
                </div>
             </div>`;
    const stash = await loadData('inventory_stash');
    html += `<div class="section-header closed" onclick="toggleSection(this)">The Grand Stash</div><div class="section-panel closed"><div id="stash-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 10px;">`;
    stash.forEach(item => {
        html += `<div style="text-align:center; background: rgba(0,0,0,0.4); padding: 5px; border: 1px dashed rgba(191, 149, 63, 0.3); border-radius:4px; position:relative;">
                    <img src="${item.image_url}" style="width:100%; height:60px; object-fit:contain; cursor:pointer;" onclick="spawnToForge('${item.image_url}')">
                    <div style="font-size:0.6em; color:#bf953f; margin-top:2px;">${item.name}</div>
                    <button class="action-btn" style="position:absolute; top:-5px; right:-5px; background:#000; border-radius:50%; width:18px; height:18px; font-size:10px; color:#ff6b6b; padding:0; border:1px solid #ff6b6b;" onclick="event.stopPropagation(); deleteDynamicItem('inventory_stash', '${item.id}', 'inventory')">✕</button>
                 </div>`;
    });
    html += `</div></div><button class="portal-btn" onclick="cancelForging()" style="width:100%; margin-top:20px;">Exit Forge Mode</button></div>`;
    return html;
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
        if(layer) layer.innerHTML = ''; closePortal();
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
        document.getElementById('architect-toolbox').style.display = 'block';
        isForging = true;
    };
    reader.readAsDataURL(input.files[0]);
}

function spawnToForge(imageUrl) {
    const layer = document.getElementById('furnishing-layer');
    if(!layer) return;
    const img = document.createElement('img');
    img.src = imageUrl; img.className = 'furnishing-item';
    img.style.left = '50%'; img.style.top = '50%';
    img.style.zIndex = layer.children.length + 10;
    img.dataset.scale = 1;
    img.onmousedown = selectItemForEdit;
    layer.appendChild(img);
}

function selectItemForEdit(e) {
    if (!isForging) return; e.preventDefault(); editingItem = e.target;
    document.getElementById('item-controls').style.display = 'block';
    document.getElementById('forge-scale').value = editingItem.dataset.scale;
    document.onmousemove = dragItem; document.onmouseup = stopDrag;
}

function dragItem(e) { if (editingItem) { editingItem.style.left = e.clientX + 'px'; editingItem.style.top = e.clientY + 'px'; } }
function stopDrag() { document.onmousemove = null; document.onmouseup = null; }

// --- APOTHECARY CHAMBER (RESTORED SHELVES & PHIALS) ---
async function buildApothecaryHTML() {
    let html = `<h2 class="gold-text">Apothecary</h2><div class="portal-scroll-container">`;
    html += `<p style="text-align:center; color:#d4c8a8; font-style:italic; margin-top:0;">Select a phial to read its contents.</p>`;
    const dbRecipes = await loadData('apothecary');
    const allRecipes = [...myApothecary, ...(dbRecipes || [])];
    
    html += `<div class="apothecary-cabinet-container">`;
    for (let i = 0; i < 24; i++) {
        html += `<div class="alchemy-slot">`;
        if (allRecipes[i]) {
            const recipe = allRecipes[i];
            const safeTitle = recipe.title.replace(/'/g, "\\'");
            const safeDesc = (recipe.description || '').replace(/'/g, "\\'");
            const safeIng = (recipe.ingredients || '').replace(/'/g, "\\'");
            const safeInst = (recipe.instructions || '').replace(/'/g, "\\'");
            html += `<div class="alchemy-pot healing" onclick="openReadingDesk('${safeTitle}', '${safeDesc}', '${safeIng}', '${safeInst}', '${recipe.id || ''}', true)">
                        <div class="css-phial"></div>
                    </div>`;
        } else {
            html += `<div class="alchemy-pot empty"><div class="css-phial" style="opacity: 0.3;"></div></div>`;
        }
        html += `</div>`; 
    }
    html += `</div><div id="apothecary-reading-desk" style="margin-bottom: 20px;"></div></div>`;
    return html;
}

window.openReadingDesk = function(title, desc, ing, inst, id, isDb) {
    const desk = document.getElementById('apothecary-reading-desk');
    desk.innerHTML = `<div class="alchemy-card" style="border-color: #bf953f; box-shadow: 0 0 20px rgba(191,149,63,0.2);"><h3 class="alchemy-title" style="color: #fcf6ba;">${title}</h3><p style="color:#d4c8a8; font-style: italic;">${desc}</p><div style="background:rgba(0,0,0,0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191,149,63,0.3);"><p style="color:#bf953f; margin:0 0 5px 0;">Ingredients</p><p style="color:#d4c8a8; margin:0 0 15px 0;">${ing}</p><p style="color:#bf953f; margin:0 0 5px 0;">Instructions</p><p style="color:#d4c8a8; margin:0;">${inst}</p></div></div>`;
    desk.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

// --- THE STILLNESS (TEACUP RESTORED) ---
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

// --- MERCHANT'S LEDGER (RESTORED VAULT) ---
async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const transactions = await loadData('ledger_transactions', 'created_at', false);
    let balance = 0; transactions.forEach(t => balance += parseFloat(t.amount || 0));
    html += `<div style="text-align:center; font-size:1.8em; color:#fcf6ba; font-family:'Cinzel', serif; margin-bottom:20px; text-shadow: 0 0 10px rgba(191,149,63,0.5);">Vault: $${balance.toFixed(2)}</div>`;
    html += `<div class="section-panel" id="form-ledger"><div style="display: flex; gap: 10px; margin-bottom: 15px; margin-top: 10px;"><input type="text" id="inp-desc" placeholder="Desc..." class="portal-input" style="flex: 2;"><input type="number" step="0.01" id="inp-amount" placeholder="+/- $" class="portal-input" style="flex: 1;"><button onclick="scribeToArchive('ledger_transactions', 'form-ledger', 'ledger')" class="portal-btn">Log</button></div></div>`;
    transactions.forEach(item => {
        html += `<div class="quest-item"><div class="quest-details" style="display:flex; justify-content:space-between; width:100%; align-items:center;"><h3 class="quest-title" style="font-size:0.95em; margin:0;">${item.desc}</h3><div style="font-weight:bold;">$${parseFloat(item.amount).toFixed(2)}</div></div></div>`;
    });
    return html + `</div>`;
}

// --- THE LIVING BEDS (GARDEN GRID RESTORED) ---
let currentBedName = localStorage.getItem('active_garden_bed') || 'Main Bed';

async function buildGardenHTML() {
    let html = `<h2 class="gold-text">The Living Beds</h2><div class="portal-scroll-container">`;
    let allBeds = JSON.parse(localStorage.getItem('garden_bed_names') || '["Main Bed"]');
    html += `<div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;"><select id="bed-select" class="portal-input" onchange="switchBed(this.value)">${allBeds.map(b => `<option value="${b}" ${b===currentBedName?'selected':''}>${b}</option>`).join('')}</select><button class="portal-btn" onclick="buildNewBed()">+ Build Bed</button></div>`;
    html += `<div class="garden-bed-container">`;
    const plots = await loadData('garden_plots');
    const active = plots.filter(p => (p.bed_name || 'Main Bed') === currentBedName);
    for (let i = 1; i <= 8; i++) {
        const gridId = `cell-${i}`; const plot = active.find(p => p.grid_id === gridId);
        if (plot) {
            const days = Math.floor((new Date() - new Date(plot.created_at)) / (1000 * 60 * 60 * 24));
            let icon = days >= 3 ? plot.plant_icon : (days >= 1 ? '🌿' : '🌱');
            html += `<div class="garden-cell" onclick="tendPlot('${plot.id}', '${plot.plant_name}')"><div class="plant-icon">${icon}</div><div class="plant-name">${plot.plant_name}</div></div>`;
        } else { html += `<div class="garden-cell" onclick="plantSeed('${gridId}')"><div class="plant-icon" style="opacity:0.2;">🌱</div></div>`; }
    }
    return html + `</div><div id="garden-action-panel"></div></div>`;
}

// --- MASTER CORE UI CONTROLLER ---
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    overlay.classList.add('active');
    
    switch(portalName) {
        case 'grimoire': content.innerHTML = await buildGrimoireHTML(); break;
        case 'cat': content.innerHTML = await buildBountyBoardHTML(); break;
        case 'teacup': content.innerHTML = await buildTeacupHTML(); break;
        case 'ledger': content.innerHTML = await buildLedgerHTML(); break;
        case 'alchemy': content.innerHTML = await buildApothecaryHTML(); break;
        case 'herbs': content.innerHTML = await buildHerbsHTML(); break;
        case 'sewing': content.innerHTML = await buildSewingHTML(); break;
        case 'workshop': content.innerHTML = await buildWorkshopHTML(); break;
        case 'apprentice': content.innerHTML = await buildApprenticeHTML(); break;
        case 'inventory': content.innerHTML = await buildInventoryHTML(); break;
        case 'garden': content.innerHTML = await buildGardenHTML(); break;
        case 'audio': content.innerHTML = await buildAudioHTML(); break;
        case 'window': content.innerHTML = buildAlmanacHTML(); break;
        default: content.innerHTML = "<h2>Stabilizing Rift...</h2>";
    }
}

// UI HELPERS (UNABRIDGED)
function closePortal() { document.getElementById('parchment-overlay').classList.remove('active'); }
function toggleSection(btn) { btn.classList.toggle('closed'); btn.nextElementSibling.classList.toggle('closed'); }
function toggleAccordion(btn) { btn.classList.toggle('active'); let p = btn.nextElementSibling; if(p.style.maxHeight) p.style.maxHeight = null; else p.style.maxHeight = p.scrollHeight + 30 + "px"; }
let familiarXP = 0; function feedFamiliar() { if(familiarXP < 5) { familiarXP++; updateFamiliarUI(); } }
function updateFamiliarUI() { let f = document.getElementById('xp-ring-fill'); if(f) f.style.strokeDashoffset = 289 - (289 * (familiarXP / 5)); }
document.addEventListener('DOMContentLoaded', () => { updateFamiliarUI(); updateNatureLore(); fetchLocalAtmosphere(); console.log("🏰 Sanctuary Fully Reforged."); });
