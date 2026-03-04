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
    } else {
        localStorage.setItem(tableName, JSON.stringify(results));
    }
    return results;
}

// === THE MASTER SCRIBE (Unified Input Logic) ===
async function scribeToArchive(tableName, formId, portalToReload) {
    const container = document.getElementById(formId);
    if (!container) return;
    const inputs = container.querySelectorAll('input, textarea, select');
    const entry = {};

    inputs.forEach(input => {
        const fieldName = input.id.replace('inp-', ''); 
        entry[fieldName] = input.value;
    });

    if (!entry.title && !entry.item_name && !entry.note && !entry.text) {
        return alert("The scroll requires a name or content!");
    }

    let error = null;
    if (db) {
        const { error: dbErr } = await db.from(tableName).insert([entry]);
        error = dbErr;
    } else {
        const localData = JSON.parse(localStorage.getItem(tableName) || '[]');
        localData.push({ ...entry, id: Date.now(), created_at: new Date().toISOString() });
        localStorage.setItem(tableName, JSON.stringify(localData));
    }

    if (error) {
        alert("The ink didn't take: " + error.message);
    } else {
        feedFamiliar();
        openPortal(portalToReload); 
    }
}

// === 1. LOCAL DATA (ALL 30 RECIPES RESTORED) ===
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

// --- APOTHECARY & TEA LISTS (RESTORED) ---
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

// === 2. LORE & ATMOSPHERE ===
let dynamicAlmanac = { season: "", moonPhase: "", temp: "--°F", weather: "", planting: "", focus: "", entry: "" };

function getMoonPhase(date) {
    let year = date.getFullYear(), month = date.getMonth() + 1, day = date.getDate();
    if (month < 3) { year--; month += 12; }
    let jd = 2 - Math.floor(year / 100) + Math.floor(Math.floor(year / 100) / 4) + day + Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) - 1524.5;
    let phaseDays = ((jd - 2451549.5) / 29.53 % 1) * 29.53;
    return phaseDays < 16.61 ? { phase: "Waxing Moon 🌔" } : { phase: "Waning Moon 🌘" };
}

function updateNatureLore() {
    const today = new Date(), month = today.getMonth();
    dynamicAlmanac.moonPhase = getMoonPhase(today).phase;
    dynamicAlmanac.season = ["Deep Winter", "Late Winter", "Early Spring", "High Spring", "Early Summer", "Midsummer", "Late Summer", "Early Autumn", "Deep Autumn", "Frostfall", "Early Winter", "Midwinter"][month];
    dynamicAlmanac.focus = "Intuition & Planning";
    dynamicAlmanac.entry = "Trust your instincts, outline your tasks, and step forward with quiet purpose.";
}

async function fetchLocalAtmosphere() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=34.93&longitude=-88.48&current_weather=true&temperature_unit=fahrenheit');
        const data = await res.json();
        dynamicAlmanac.temp = Math.round(data.current_weather.temperature) + "°F";
        dynamicAlmanac.weather = "The atmosphere holds a quiet energy.";
    } catch (e) { dynamicAlmanac.weather = "The magical currents are scrambled."; }
}

// === 3. PORTAL BUILDERS ===

let currentGrimoireData = [];

async function buildGrimoireHTML() {
    let html = `<h2 class="gold-text">The Kitchen Grimoire</h2>`;
    
    // Fetch Data (Recipes Table)
    const dbRecipes = await loadData('recipes');
    currentGrimoireData = [...myRecipes, ...(dbRecipes || [])];
    currentGrimoireData.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    html += `
    <div class="grimoire-tome-container">
        <div class="grimoire-page-wrapper">
            <div class="grimoire-page" id="grimoire-left-page">
                <div class="alphabet-nav">
                    ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(L => `<button class="letter-btn" onclick="filterByLetter('${L}')">${L}</button>`).join('')}
                    <button class="letter-btn" onclick="openPortal('grimoire')" style="width:auto; padding:0 5px;">All</button>
                </div>
                <input type="text" id="grimoire-search" class="grimoire-search-bar" placeholder="Search archives..." oninput="filterGrimoire()">
                <div id="grimoire-index-list">${renderGrimoireIndex('')}</div>
            </div>
            <div class="grimoire-page" id="grimoire-right-page">
                <p style="text-align:center; font-style:italic; margin-top:50px; opacity:0.6;">Select a recipe to reveal its secrets.</p>
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
    let listHTML = '';
    let currentLetter = '';
    const q = (query || "").toLowerCase();
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
    filtered.forEach(recipe => {
        const idx = currentGrimoireData.findIndex(r => r.title === recipe.title);
        listHTML += `<div class="grimoire-index-item" onclick="readGrimoirePage(${idx})">${recipe.title}</div>`;
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
    rightPage.innerHTML = `
        <h3 class="page-title">${recipe.title}</h3>
        <p class="page-text" style="font-style:italic;">${recipe.description || ''}</p>
        <h4 class="page-header">Ingredients</h4>
        <p class="page-text">${recipe.ingredients || 'Properties recorded.'}</p>
        <h4 class="page-header">Instructions</h4>
        <p class="page-text">${recipe.instructions || 'Lore recorded.'}</p>
    `;
};

// --- ADDITIONAL PORTALS (FIXED) ---
async function buildTeacupHTML() {
    let html = `<h2 class="gold-text">The Steeping Teacup</h2><div class="portal-scroll-container">`;
    const notes = await loadData('family_notes');
    notes.forEach(n => {
        html += `<div class="alchemy-card">
                    <div style="display:flex; justify-content:space-between;">
                        <p style="margin:0;">${n.note}</p>
                        <button class="action-btn" style="color:#ff6b6b;" onclick="removeData('family_notes', '${n.id}'); openPortal('teacup');">✕</button>
                    </div>
                 </div>`;
    });
    html += `</div>
    <div class="section-panel" id="form-teacup">
        <textarea id="inp-note" placeholder="Daily spirit check..." class="portal-input" style="height:60px;"></textarea>
        <button onclick="scribeToArchive('family_notes', 'form-teacup', 'teacup')" class="portal-btn">Reflect</button>
    </div>`;
    return html;
}

async function buildLedgerHTML() {
    let html = `<h2 class="gold-text">Merchant's Ledger</h2><div class="portal-scroll-container">`;
    const logs = await loadData('merchant_ledger');
    logs.forEach(l => {
        html += `<div class="market-item">
                    <span>${l.title}: $${l.amount}</span>
                    <button class="action-btn" onclick="removeData('merchant_ledger', '${l.id}'); openPortal('ledger');">✕</button>
                 </div>`;
    });
    html += `</div>
    <div class="section-panel" id="form-ledger">
        <input type="text" id="inp-title" placeholder="Delivery/Task..." class="portal-input">
        <input type="number" id="inp-amount" placeholder="Gold..." class="portal-input">
        <button onclick="scribeToArchive('merchant_ledger', 'form-ledger', 'ledger')" class="portal-btn">Log Gold</button>
    </div>`;
    return html;
}

async function buildMarketListHTML() {
    let html = `<h2 class="gold-text">Market Provisions</h2><div class="portal-scroll-container">`;
    const items = await loadData('market_list');
    items.forEach(i => {
        html += `<div class="market-item">
                    <span>${i.item_name} (${i.quantity || '1'})</span>
                    <button class="action-btn" onclick="removeData('market_list', '${i.id}'); openPortal('market-list');">✕</button>
                 </div>`;
    });
    html += `</div>
    <div class="section-panel" id="form-market">
        <input type="text" id="inp-item_name" placeholder="Provision..." class="portal-input">
        <input type="text" id="inp-quantity" placeholder="Qty..." class="portal-input">
        <button onclick="scribeToArchive('market_list', 'form-market', 'market-list')" class="portal-btn">Add to Basket</button>
    </div>`;
    return html;
}

// (All other buildApothecary, buildHerbs, buildGarden etc. functions from your previous paste go here!)

// === 4. CORE UI CONTROLLER ===
async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    overlay.classList.add('active');
    
    switch(portalName) {
        case 'grimoire': content.innerHTML = await buildGrimoireHTML(); break;
        case 'teacup': content.innerHTML = await buildTeacupHTML(); break;
        case 'ledger': content.innerHTML = await buildLedgerHTML(); break;
        case 'market-list': content.innerHTML = await buildMarketListHTML(); break;
        case 'alchemy': content.innerHTML = await buildApothecaryHTML(); break;
        case 'herbs': content.innerHTML = await buildHerbsHTML(); break;
        case 'garden': content.innerHTML = await buildGardenHTML(); break;
        case 'apprentice': content.innerHTML = await buildApprenticeHTML(); break;
        case 'workshop': content.innerHTML = await buildWorkshopHTML(); break;
        case 'inventory': content.innerHTML = await buildInventoryHTML(); break;
        case 'window': content.innerHTML = buildAlmanacHTML(); break;
        default: content.innerHTML = "<h2>The portal is hazy.</h2>";
    }
}

function closePortal() { document.getElementById('parchment-overlay').classList.remove('active'); }
function toggleSection(btn) { btn.classList.toggle('closed'); btn.nextElementSibling.classList.toggle('closed'); }

// === 5. FAMILIAR ===
let familiarXP = 0;
function feedFamiliar() { if (familiarXP < 5) { familiarXP++; updateFamiliarUI(); } }
function updateFamiliarUI() {
    const ring = document.getElementById('xp-ring-fill');
    if (ring) ring.style.strokeDashoffset = 289 - (289 * (familiarXP / 5));
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateNatureLore();
    fetchLocalAtmosphere();
    updateFamiliarUI();
});
