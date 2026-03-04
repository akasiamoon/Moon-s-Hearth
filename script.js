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
        let ingList = item.ingredients ? (Array.isArray(item.ingredients) ? item.ingredients.map(ing => `<li><span>${ing}</span></li>`).join('') : `<li><span>${item.ingredients}</span></li>`) : '';
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
            imageHtml = `<img src="${pubUrl}" style="max-width: 100%; border-radius: 4px; margin-top: 10px; border: 1px solid rgba(191, 149, 63, 0.3);" alt="Memory"/>`;
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

// === THE APOTHECARY (CRAFTER'S CABINET) LOGIC ===
async function buildApothecaryHTML() {
    let html = `<h2 class="gold-text">The Apothecary</h2><div class="portal-scroll-container">`;
    html += `<p style="text-align:center; color:#d4c8a8; font-style:italic; margin-top:0;">Click a concoction to open the recipe.</p>`;
    
    let dbMappedRecipes = [];
    
    // 1. Try to load from Supabase
    try {
        const dbRecipes = await loadData('apothecary');
        if (dbRecipes && dbRecipes.length > 0) {
            dbMappedRecipes = dbRecipes.map(r => ({
                title: r.title, 
                icon: r.icon || '🏺',
                category: r.category || 'General',
                description: r.description,
                ingredients: r.ingredients,
                instructions: r.instructions,
                isDbItem: true, 
                id: r.id 
            }));
        }
    } catch (error) {
        console.log("Archive note: No cloud recipes found or connection issue.");
    }
    
    // 2. Combine with hardcoded recipes (if you have them)
    let localApothecary = [];
    if (typeof myApothecary !== 'undefined') {
        localApothecary = myApothecary;
    }
    
    const allRecipes = [...localApothecary, ...dbMappedRecipes];
    
    // 3. Build the cabinet container
    html += `<div class="apothecary-cabinet-container">`;
        
    // Generate 24 slots (6 columns x 4 shelves)
    const totalSlots = 24;
    
    for (let i = 0; i < totalSlots; i++) {
        html += `<div class="alchemy-slot" id="alchemy-slot-${i}">`;
        
        if (allRecipes[i]) {
            // WE HAVE A RECIPE: Draw the glowing pot
            const recipe = allRecipes[i];
            
            let visualClass = 'general';
            const catLower = (recipe.category || "").toLowerCase();
            const titleLower = (recipe.title || "").toLowerCase();

            if(catLower.includes('heal') || titleLower.includes('cure') || titleLower.includes('recovery')) visualClass = 'healing';
            else if(catLower.includes('combat') || titleLower.includes('battle') || titleLower.includes('burn')) visualClass = 'combat';
            else if(catLower.includes('cosmetic') || titleLower.includes('stain') || titleLower.includes('highlighter')) visualClass = 'cosmetics';

            let icon = recipe.icon;
            if(recipe.isDbItem && !recipe.icon) {
                 if(titleLower.includes('obsidian') || titleLower.includes('raven')) icon = '🖤'; 
                 else icon = '🏺'; 
            }

            html += `
                <div class="alchemy-pot ${visualClass}" data-title="${recipe.title.replace(/'/g, "")}" id="recipe-${i}" onclick="toggleRecipeDetail('${i}')">
                    <div class="alchemy-icon">${icon || '🏺'}</div>
                    
                    <div class="herb-detail-tag" id="recipe-popup-${i}">
                        <h4 class="gold-text" style="font-size: 1em; margin: 0 0 10px 0; border:none; text-align: left; padding-bottom: 5px;">${recipe.title}</h4>
                        <p style="color:#d4c8a8; margin: 0; font-size: 0.95em;">${recipe.description}</p>
                        
                        <div style="background:rgba(0,0,0,0.4); padding: 10px; margin-top: 15px; border-radius: 4px; border: 1px solid rgba(191,149,63,0.3);">
                            <p style="color:#fcf6ba; font-style:italic; margin-top:0; margin-bottom: 5px;">Ingredients:</p>
                            <p style="color:#d4c8a8; margin: 0; font-size: 0.9em; line-height:1.4;">${recipe.ingredients || 'Properties recorded.'}</p>
                            <p style="color:#fcf6ba; font-style:italic; margin-top:10px; margin-bottom: 5px;">Instructions:</p>
                            <p style="color:#d4c8a8; margin: 0; font-size: 0.9em; line-height:1.4;">${recipe.instructions || 'Lore recorded.'}</p>
                        </div>
                        
                        ${recipe.isDbItem ? `<br><button class="action-btn" style="color:#ff6b6b; font-size: 0.75em; border: 1px solid #ff6b6b; padding: 3px 8px; border-radius: 4px; margin-top: 10px;" onclick="event.stopPropagation(); deleteDetailedItem('apothecary', '${recipe.id}', 'alchemy')">Purge</button>` : ''}
                    </div>
                </div>`;
        } else {
            // NO RECIPE: Draw an empty, faint glass vial so the shelf isn't bare
            html += `
                <div class="alchemy-pot" style="cursor: default; transform: none;">
                    <div class="alchemy-icon" style="opacity: 0.2; filter: grayscale(100%); font-size: 2em;">⚗️</div>
                </div>`;
        }
        
        html += `</div>`; // Close slot
    }
    
    html += `</div>`; // Close cabinet container
    
    // Quick Add Form
    html += `<div class="section-header closed" onclick="toggleSection(this)">Scribe New Recipe</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="recipe-title" placeholder="Recipe Title..." class="portal-input" style="margin-bottom: 10px;"><textarea id="recipe-desc" placeholder="Concoction Description..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea><textarea id="recipe-ingredients" placeholder="Ingredients List..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea><textarea id="recipe-instructions" placeholder="Mixing Instructions..." class="portal-input" style="height: 60px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addConcoction('apothecary', 'recipe-title', 'recipe-desc', 'recipe-ingredients', 'recipe-instructions', 'alchemy')" class="portal-btn" style="width: 100%;">Seal Recipe in Cabinet</button></div></div>`;
    
    return html + `</div>`; 
}

// Ensure this is here too!
function toggleRecipeDetail(id) {
    const popup = document.getElementById(`recipe-popup-${id}`);
    const isOpen = popup ? popup.classList.contains('show-details') : false;
    document.querySelectorAll('.alchemy-pot .herb-detail-tag').forEach(b => b.classList.remove('show-details'));
    if (!isOpen && popup) popup.classList.add('show-details');
}

// === THE HANGING DRYING RACK LOGIC ===
async function buildHerbsHTML() {
    let html = `<h2 class="gold-text">The Drying Rack</h2><div class="portal-scroll-container">`;
    
    const dbHerbs = await loadData('herbs');
    
    const dbMappedHerbs = dbHerbs.map(h => ({
        title: h.title, 
        icon: h.icon || '🌿', 
        properties: h.category || 'Lore recorded.',
        description: h.description, 
        isDbItem: true, 
        id: h.id 
    }));
    
    // Combine local and cloud herbs
    const allHerbsToHang = [...myHerbs, ...dbMappedHerbs];
    
    html += `<div class="herbs-rack-container">`;
        
    // Generate a hook for EVERY herb you own, no limits.
    allHerbsToHang.forEach((herb, i) => {
        let icon = herb.icon || '🌿';
        if (herb.isDbItem && !herb.icon) {
             const titleLower = herb.title.toLowerCase();
             if(titleLower.includes('chamomile')) icon = '🌼';
             else if(titleLower.includes('poppy')) icon = '🪻';
        }

        html += `
            <div class="herb-slot" id="herb-slot-${i}">
                <div class="herb-bundle" id="bundle-${i}" onclick="toggleHerbDetail('${i}')">
                    <div class="herb-icon">${icon}</div>
                    <div class="herb-tag">${herb.title}</div>
                    
                    <div class="herb-detail-tag">
                        <h4 class="gold-text" style="font-size: 1em; margin: 0 0 8px 0; border:none; text-align: left; padding-bottom: 5px;">${herb.title}</h4>
                        <p style="color:#fcf6ba; font-style:italic; border-bottom:1px solid rgba(191,149,63,0.3); padding-bottom:5px; margin-top:0; margin-bottom:8px;">${herb.properties}</p>
                        <p style="color:#d4c8a8; margin: 0; font-size: 0.95em;">${herb.description}</p>
                        ${herb.isDbItem ? `<br><button class="action-btn" style="color:#ff6b6b; font-size: 0.75em; border: 1px solid #ff6b6b; padding: 3px 8px; border-radius: 4px; margin-top: 10px;" onclick="event.stopPropagation(); deleteDetailedItem('herbs', '${herb.id}', 'herbs')">Purge</button>` : ''}
                    </div>
                </div>
            </div>`;
    });
    
    html += `</div>`; // Close rack container
    
    // Quick Add Form (Now safe below the rack!)
    html += `<div class="section-header closed" onclick="toggleSection(this)">Record Herb Lore</div><div class="section-panel closed"><div style="margin-top: 10px; margin-bottom: 15px;"><input type="text" id="herb-title" placeholder="Name..." class="portal-input" style="margin-bottom: 10px;"><textarea id="herb-desc" placeholder="Lore & Properties..." class="portal-input" style="height: 80px; resize: none; margin-bottom: 10px;"></textarea><button onclick="addDetailedItem('herbs', 'herb-title', 'herb-desc', 'herbs')" class="portal-btn" style="width: 100%;">Add to Rack</button></div></div>`;
    
    return html + `</div>`; 
}

// Keep your existing toggleHerbDetail function right below this!
function toggleHerbDetail(id) {
    const bundle = document.getElementById(`bundle-${id}`);
    const isOpen = bundle.classList.contains('show-details');
    document.querySelectorAll('.herb-bundle').forEach(b => b.classList.remove('show-details'));
    if (!isOpen) bundle.classList.add('show-details');
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
        "Build a magnificent blanket fort sanctuary.", "Kitchen Alchemy: Bake a sweet treat.", "Construct an indoor obstacle course.",
        "Create a magical map and hide treasure.", "Hold a shadow-puppet theater.", "The Floor is Lava!",
        "Science Magic: Baking soda volcano.", "Indoor Scavenger hunt.", "Scribe a story.", "Put on a play.",
        "Indoor picnic.", "DIY Instruments.", "Cardboard Engineering.", "Play a board game.",
        "Yarn Laser maze.", "Sock Skating.", "Stained glass art.", "Keep the Balloon Up.",
        "Self-portraits.", "Dance party.", "Hide and Seek.", "Origami.", "Write a letter.",
        "Indoor camping.", "Simon Says.", "Mini store.", "Make playdough.", "Paper airplanes.",
        "Tallest tower.", "Old photo albums.", "Quiet hour."
    ];
    const dailyPrompt = indoorActivities[dateDay % indoorActivities.length]; 
    html += `<div class="alchemy-card" style="border-left: 3px solid #fcf6ba; background: rgba(191,149,63,0.15);"><h3 class="alchemy-title">✨ Inspiration</h3><p style="color:#fcf6ba; font-style:italic;">"${dailyPrompt}"</p></div>`;
    html += `<div class="section-header closed" onclick="toggleSection(this)">Curriculum Quests</div><div class="section-panel closed"><div style="display: flex; gap: 10px; margin-bottom: 15px;"><input type="text" id="new-lesson" placeholder="Assign a task..." class="portal-input"><button onclick="addDynamicItem('apprentice_lessons', 'new-lesson', 'apprentice')" class="portal-btn">Assign</button></div>`;
    const lessons = await loadData('apprentice_lessons');
    lessons.forEach(item => { 
        const isDone = item.is_completed ? 'completed' : ''; 
        html += `<div class="quest-item ${isDone}" onclick="toggleDynamicItem('apprentice_lessons', '${item.id}', ${item.is_completed}, 'apprentice')"><div class="quest-checkbox"></div><div class="quest-details"><h3 class="quest-title">${item.text}</h3></div><div class="delete-icon" onclick="event.stopPropagation(); deleteDynamicItem('apprentice_lessons', '${item.id}', 'apprentice')">✕</div></div>`; 
    });
    html += `</div>`;
    return html + `</div>`;
}

function buildAlmanacHTML() {
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const currentTime = new Date().toLocaleTimeString('en-US', timeOptions);
    return `<h2 class="gold-text">Fen Almanac</h2><div id="almanac-container"><div class="almanac-temp">${dynamicAlmanac.temp}</div><div class="almanac-stat"><span>Time:</span> ${currentTime}</div><div class="almanac-stat"><span>Season:</span> ${dynamicAlmanac.season}</div><div class="almanac-stat"><span>Moon Phase:</span> ${dynamicAlmanac.moonPhase}</div><div class="almanac-stat"><span>Atmosphere:</span> ${dynamicAlmanac.weather}</div><div style="color:rgba(191,149,63,0.5); margin:15px 0; font-size:0.9em; letter-spacing:2px;">◈━━━━━━༺ ❦ ༻━━━━━━◈</div><div style="color:#fcf6ba; font-size:1.3em; font-family:'Cinzel', serif; margin:15px 0;">Daily Focus: ${dynamicAlmanac.focus}</div><p style="color:#d4c8a8; font-style:italic; margin-bottom:15px;">"${dynamicAlmanac.entry}"</p></div>`;
}

// ====================================================
// === THE ARCHITECT'S STUDIO (INTERACTIVE FORGE) ===
// ====================================================
let isForging = false;
let editingItem = null;
let draftBgUrl = '';

async function buildInventoryHTML() {
    let html = `<h2 class="gold-text">Architect's Studio</h2><div class="portal-scroll-container">`;
    
    // --- Trophy Gallery ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">Trophy Gallery</div><div class="section-panel closed"><div style="margin-top: 10px;">`;
    const rooms = await loadData('trophy_rooms');
    if (!rooms || rooms.length === 0) {
        html += `<p style="color: rgba(191,149,63,0.5); font-style: italic; text-align:center;">No sanctuaries forged yet.</p>`;
    } else {
        rooms.forEach(room => {
            html += `<div class="alchemy-card" style="display:flex; justify-content:space-between; align-items:center; padding: 10px 15px;">
                        <span style="color:#fcf6ba; font-family:'Cinzel';">${room.name}</span>
                        <div>
                            <button class="portal-btn" style="padding: 4px 8px; font-size: 0.7em; border-color:#8fce00; color:#8fce00;" onclick="loadTrophy('${room.id}', '${room.bg_url}')">Apply</button>
                            <button class="action-btn" style="color: #ff6b6b; margin-left:10px;" onclick="deleteTrophy('${room.id}')">✕</button>
                        </div>
                     </div>`;
        });
    }
    html += `</div></div>`;

    // --- Forge Section ---
    html += `<div class="section-header closed" onclick="toggleSection(this)">Forge New Sanctuary</div><div class="section-panel closed">
                <div style="background: rgba(8, 8, 10, 0.5); padding: 15px; border-radius: 4px; border: 1px solid rgba(191, 149, 63, 0.3); margin-top: 10px; text-align:center;">
                    <p style="color:#d4c8a8; font-size:0.85em; margin-top:0;">Upload a base background to enter the Forge.</p>
                    <label for="room-bg-upload" class="custom-file-label" style="width:100%; box-sizing:border-box;">Select Background Image</label>
                    <input type="file" id="room-bg-upload" accept="image/*" onchange="startForging(this)">
                </div>
             </div>`;

    // --- The Grand Stash ---
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
                <div id="stash-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 10px;">`;
    
    const stash = await loadData('inventory_stash');
    
    if (!stash || stash.length === 0) {
        html += `<p style="color: rgba(191,149,63,0.5); font-style: italic; text-align:center; grid-column: 1/-1;">Your stash is empty. Upload a PNG above.</p>`;
    } else {
        stash.forEach(item => {
            html += `<div style="text-align:center; background: rgba(0,0,0,0.4); padding: 5px; border: 1px dashed rgba(191,149,63,0.3); border-radius:4px; position:relative;">
                        <img src="${item.image_url}" style="width:100%; height:60px; object-fit:contain; cursor:pointer;" onclick="spawnToForge('${item.image_url}')">
                        <div style="font-size:0.6em; color:#bf953f; margin-top:2px;">${item.name}</div>
                        <button class="action-btn" style="position:absolute; top:-5px; right:-5px; background:#000; border-radius:50%; width:18px; height:18px; font-size:10px; color:#ff6b6b; padding:0; border:1px solid #ff6b6b;" onclick="event.stopPropagation(); deleteDynamicItem('inventory_stash', '${item.id}', 'inventory')">✕</button>
                     </div>`;
        });
    }
    html += `</div></div>`;

    return html + `</div>`;
}

// --- THE AUTO-SHRINK UPLOAD RITUAL ---
async function uploadAsset() {
    const nameInput = document.getElementById('asset-name').value.trim();
    const fileInput = document.getElementById('asset-image');
    const statusDiv = document.getElementById('asset-file-name'); 
    const file = fileInput.files[0];

    // Use 'db' if it exists, otherwise fall back to 'supabase'
    const vault = (db !== null) ? db : (typeof supabase !== 'undefined' ? supabase : null);

    if (!nameInput || !file || !vault) {
        statusDiv.innerText = "⚠️ Missing info or connection!";
        return;
    }

    statusDiv.innerText = "✨ Resizing...";

    resizeImage(file, 800, async (resizedBlob) => {
        try {
            // Create a unique filename
            const fileName = `stash_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
            
            statusDiv.innerText = "🚀 Sending to cloud...";
            const { data, error: uploadError } = await vault.storage
                .from('assets')
                .upload(fileName, resizedBlob, { contentType: 'image/png' });

            if (uploadError) throw uploadError;

            // Get the URL for the image we just uploaded
            const { data: urlData } = vault.storage.from('assets').getPublicUrl(fileName);
            const publicUrl = urlData.publicUrl;

            statusDiv.innerText = "📜 Recording...";

            // SAVE TO DATABASE
            const { error: dbError } = await vault.from('inventory_stash').insert([
                { 
                    name: nameInput, 
                    image_url: publicUrl, 
                    category: 'Furniture' // This matches the column we just added
                }
            ]);

            if (dbError) {
                // If it still complains about 'category', try saving without it as a backup
                console.warn("Category column issue, attempting save without it...");
                const { error: retryError } = await vault.from('inventory_stash').insert([
                    { name: nameInput, image_url: publicUrl }
                ]);
                if (retryError) throw retryError;
            }

            statusDiv.innerText = "✅ Stashed successfully!";
            fileInput.value = ""; 
            document.getElementById('asset-name').value = "";
            
            // Refresh the portal so the new item shows up in the grid
            openPortal('inventory');

        } catch (err) {
            console.error("Forge Error:", err);
            statusDiv.innerText = "🚫 Forge failed: " + err.message;
        }
    });
}

function resizeImage(file, maxWidth, callback) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const scale = maxWidth / img.width;
            canvas.width = maxWidth;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.toBlob((blob) => { callback(blob); }, 'image/png');
        };
    };
}

// --- INTERACTIVE FORGE LOGIC ---
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
        document.getElementById('architect-toolbox').style.display = 'block';
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
    img.style.left = '50%'; img.style.top = '50%';
    img.style.zIndex = layer.children.length + 10;
    img.dataset.scale = 1;
    img.onmousedown = selectItemForEdit;
    layer.appendChild(img);
}

function selectItemForEdit(e) {
    if (!isForging) return;
    e.preventDefault();
    editingItem = e.target;
    document.getElementById('item-controls').style.display = 'block';
    document.getElementById('forge-scale').value = editingItem.dataset.scale;
    document.onmousemove = dragItem;
    document.onmouseup = stopDrag;
}

function dragItem(e) {
    if (editingItem) {
        editingItem.style.left = e.clientX + 'px';
        editingItem.style.top = e.clientY + 'px';
    }
}

function stopDrag() { document.onmousemove = null; document.onmouseup = null; }

function deleteSelected() {
    if(editingItem) {
        editingItem.remove();
        editingItem = null;
        document.getElementById('item-controls').style.display = 'none';
    }
}

async function sealTrophy() {
    const nameInput = document.getElementById('trophy-name');
    const roomName = (nameInput && nameInput.value.trim() !== '') ? nameInput.value.trim() : "New Sanctuary";
    const newRoom = { name: roomName, bg_url: draftBgUrl, id: Date.now().toString() };
    
    let savedRooms = JSON.parse(localStorage.getItem('trophy_rooms') || '[]');
    savedRooms.push(newRoom);
    localStorage.setItem('trophy_rooms', JSON.stringify(savedRooms));

    const layer = document.getElementById('furnishing-layer');
    let savedFurniture = JSON.parse(localStorage.getItem('trophy_furnishings') || '[]');
    Array.from(layer.children).forEach(img => {
        savedFurniture.push({
            room_id: newRoom.id,
            image_url: img.src,
            pos_x: img.style.left,
            pos_y: img.style.top,
            scale: img.dataset.scale,
            z_index: img.style.zIndex
        });
    });
    localStorage.setItem('trophy_furnishings', JSON.stringify(savedFurniture));
    cancelForging();
}

function cancelForging() {
    document.body.classList.remove('building-mode');
    document.getElementById('architect-toolbox').style.display = 'none';
    isForging = false;
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
            img.style.left = f.pos_x; img.style.top = f.pos_y;
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

// === 6. THE FAMILIAR ===
let familiarXP = 0; const maxXP = 5;
function feedFamiliar() { if (familiarXP < maxXP) { familiarXP++; updateFamiliarUI(); } }
function updateFamiliarUI() {
    const xpCircle = document.getElementById('xp-circle');
    const avatar = document.getElementById('familiar-avatar');
    if (!xpCircle || !avatar) return;
    const offset = 289 - (289 * (familiarXP / maxXP));
    xpCircle.style.strokeDashoffset = offset;
}

function claimFamiliarLoot() {
    const speech = document.getElementById('familiar-speech');
    if (familiarXP === maxXP) {
        const loot = ["✨ Purring shadows.", "🦇 Rare gold!", "🔮 Glimmering magic."];
        speech.innerText = loot[Math.floor(Math.random() * loot.length)];
        speech.classList.remove('hidden');
        setTimeout(() => { speech.classList.add('hidden'); familiarXP = 0; updateFamiliarUI(); }, 3000);
    }
}

// === 7. OTHER ACTION HELPERS ===
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

async function addLedgerEntry(table, descId, amtId, portal) {
    const desc = document.getElementById(descId).value.trim();
    const amount = parseFloat(document.getElementById(amtId).value);
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
    await insertData('calendar_events', { title: title, start_date: date, text: 'pending' });
    openPortal('cat');
}

async function deleteEvent(id) { await removeData('calendar_events', id); openPortal('cat'); }

async function toggleEvent(id, currentText) {
    const newState = currentText === 'completed' ? 'pending' : 'completed';
    await updateData('calendar_events', id, { text: newState });
    if (newState === 'completed') feedFamiliar();
    openPortal('cat');
}

async function submitJournalEntry() {
    const text = document.getElementById('journal-text').value.trim();
    await insertData('family_notes', { note: text });
    openPortal('teacup');
}

async function deleteJournalEntry(id) { await removeData('family_notes', id); openPortal('teacup'); }

// === 8. PORTALS & UI ===
function toggleAccordion(button) {
    button.classList.toggle('active');
    const panel = button.nextElementSibling;
    if (panel.style.maxHeight) { panel.style.maxHeight = null; } 
    else { panel.style.maxHeight = panel.scrollHeight + 30 + "px"; }
}

function toggleSection(headerBtn) {
    headerBtn.classList.toggle('closed');
    headerBtn.nextElementSibling.classList.toggle('closed');
}

async function openPortal(portalName) {
    const overlay = document.getElementById('parchment-overlay');
    const content = document.getElementById('portal-content');
    overlay.classList.add('active');
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
    else if (portalName === 'garden') content.innerHTML = await buildGardenHTML();
}

function closePortal() { document.getElementById('parchment-overlay').classList.remove('active'); }

// === 9. SEASONAL DECOR ===
function applySeasonalDecor() {
    const month = new Date().getMonth();
    const body = document.body;
    if (month === 11 || month === 0 || month === 1) body.classList.add('season-winter');
    else if (month >= 2 && month <= 4) body.classList.add('season-spring');
}

async function bulkScribeData() {
    if (!db) return;
    console.log("📜 Starting the Total Sanctuary Sync...");

    try {
        // 1. Sync Apothecary with all fields
        const { error: apoErr } = await db.from('apothecary').upsert(
            myApothecary.map(a => ({
                title: a.title, 
                description: a.description, 
                ingredients: a.ingredients, 
                instructions: a.instructions,
                icon: a.icon 
            }))
        );
        if (apoErr) throw apoErr;

        // 2. Sync Recipes with all fields
        const { error: recErr } = await db.from('recipes').upsert(
            myRecipes.map(r => ({
                title: r.title, 
                description: r.description, 
                ingredients: Array.isArray(r.ingredients) ? r.ingredients.join(', ') : r.ingredients, 
                instructions: r.instructions 
            }))
        );
        if (recErr) throw recErr;

        console.log("✅ SUCCESS: The Sanctuary is now fully populated!");
    } catch (err) {
        console.error("🚫 Ritual Failed:", err.message);
    }
}

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    updateFamiliarUI();
    updateNatureLore();
    fetchLocalAtmosphere();
    applySeasonalDecor();
    loadActiveTrophy();
    
    const forgeScale = document.getElementById('forge-scale');
    if(forgeScale) {
        forgeScale.addEventListener('input', (e) => {
            if (editingItem) {
                editingItem.style.transform = `translate(-50%, -50%) scale(${e.target.value})`;
                editingItem.dataset.scale = e.target.value;
            }
        });
    }
    console.log("🏰 Sanctuary Fully Reforged.");
});

// === THE LIVING BEDS LOGIC ===
let currentBedName = localStorage.getItem('active_garden_bed') || 'Main Bed';

async function buildGardenHTML() {
    let html = `<h2 class="gold-text">The Living Beds</h2><div class="portal-scroll-container">`;
    
    // --- 1. BED SELECTOR & BUILDER ---
    let allBeds = JSON.parse(localStorage.getItem('garden_bed_names') || '["Main Bed"]');
    if (!allBeds.includes(currentBedName)) currentBedName = allBeds[0];

    let bedOptions = allBeds.map(b => `<option value="${b}" ${b === currentBedName ? 'selected' : ''}>${b}</option>`).join('');
    
    html += `
        <div style="display:flex; justify-content:center; gap:10px; margin-bottom:15px;">
            <select id="bed-select" class="portal-input" style="width:60%; cursor:pointer;" onchange="switchBed(this.value)">
                ${bedOptions}
            </select>
            <button class="portal-btn" onclick="buildNewBed()" style="width:35%; color:#8fce00; border-color:#8fce00;">+ Build Bed</button>
        </div>
        <p style="text-align:center; color:#d4c8a8; font-style:italic; margin-top:0;">Tending to: ${currentBedName}</p>
    `;

    // --- 2. BUILD THE GARDEN BOX ---
    html += `<div class="garden-bed-container">`;
    
    // Load the planted data and filter ONLY for the current bed
    const plots = await loadData('garden_plots');
    const activePlots = plots.filter(p => (p.bed_name || 'Main Bed') === currentBedName);
    
    // Generate 8 squares (4x2 grid)
    for (let i = 1; i <= 8; i++) {
        const gridId = `cell-${i}`;
        const plotData = activePlots.find(p => p.grid_id === gridId);
        
        if (plotData) {
            // --- TIME-WEAVER GROWTH MATH ---
            const plantedDate = new Date(plotData.created_at);
            const now = new Date();
            const daysOld = Math.floor((now - plantedDate) / (1000 * 60 * 60 * 24)); // Calculates full days passed
            
            let displayIcon = '🌱'; // Stage 1: Seedling (Day 0)
            let stageText = 'Sprouting';
            
            if (daysOld >= 1) { 
                displayIcon = '🌿'; // Stage 2: Vegetative (Day 1-2)
                stageText = 'Growing'; 
            }
            if (daysOld >= 3) { 
                displayIcon = plotData.plant_icon; // Stage 3: Blooming / Mature (Day 3+)
                stageText = 'Mature'; 
            }

            const fertDate = plotData.last_fertilized ? new Date(plotData.last_fertilized).toLocaleDateString([], {month:'short', day:'numeric'}) : 'Needs Food';
            
            html += `
                <div class="garden-cell" onclick="tendPlot('${plotData.id}', '${plotData.plant_name.replace(/'/g, "\\'")}')">
                    <div class="plant-icon">${displayIcon}</div>
                    <div class="plant-name">${plotData.plant_name} <span style="font-weight:normal; opacity:0.7;">(${stageText})</span></div>
                    <div class="fert-status">💧 ${fertDate}</div>
                </div>`;
        } else {
            // Empty dirt
            html += `
                <div class="garden-cell" onclick="plantSeed('${gridId}')">
                    <div class="plant-icon" style="opacity:0.2;">🌱</div>
                    <div class="plant-name" style="color:rgba(191,149,63,0.5);">Empty Soil</div>
                </div>`;
        }
    }
    html += `</div>`;
    
    // --- 3. ACTION PANEL ---
    html += `<div id="garden-action-panel" style="margin-top: 15px; min-height: 120px;"></div>`;
    html += `</div>`; 
    return html;
}

// --- BED MANAGEMENT ---
function switchBed(name) {
    currentBedName = name;
    localStorage.setItem('active_garden_bed', name);
    openPortal('garden');
}

function buildNewBed() {
    const newName = prompt("Name your new raised bed (e.g., North Box, Herb Garden):");
    if (newName && newName.trim() !== '') {
        let allBeds = JSON.parse(localStorage.getItem('garden_bed_names') || '["Main Bed"]');
        if (!allBeds.includes(newName.trim())) {
            allBeds.push(newName.trim());
            localStorage.setItem('garden_bed_names', JSON.stringify(allBeds));
        }
        switchBed(newName.trim());
    }
}

// --- NEW BEAUTIFUL ACTIONS ---
function plantSeed(gridId) {
    const panel = document.getElementById('garden-action-panel');
    panel.innerHTML = `
        <div class="alchemy-card" style="border-color: #8fce00;">
            <h3 class="alchemy-title" style="color: #8fce00;">🌱 Sow a New Seed</h3>
            <input type="text" id="seed-name-input" placeholder="e.g., Midnight Poppy, Lavender..." class="portal-input" style="margin-bottom: 10px;">
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="confirmPlantSeed('${gridId}')" class="portal-btn" style="color: #8fce00; border-color: #8fce00; flex: 1;">Plant</button>
                <button onclick="cancelGardenAction()" class="portal-btn" style="color: #ff6b6b; border-color: #ff6b6b; flex: 1;">Cancel</button>
            </div>
        </div>
    `;
    document.getElementById('seed-name-input').focus();
}

async function confirmPlantSeed(gridId) {
    const plantName = document.getElementById('seed-name-input').value.trim();
    if (!plantName) return;
    
    // Smart Icon Logic
    let icon = '🌱';
    const nameLower = plantName.toLowerCase();
    if(nameLower.includes('tomato')) icon = '🍅';
    else if(nameLower.includes('carrot') || nameLower.includes('root')) icon = '🥕';
    else if(nameLower.includes('flower') || nameLower.includes('lavender') || nameLower.includes('poppy') || nameLower.includes('chamomile')) icon = '🪻';
    else if(nameLower.includes('herb') || nameLower.includes('rosemary') || nameLower.includes('thyme') || nameLower.includes('mint')) icon = '🌿';
    else if(nameLower.includes('berry')) icon = '🫐';
    else if(nameLower.includes('moon')) icon = '🌙';

    // Note the addition of bed_name here so it saves to the right box!
    await insertData('garden_plots', { bed_name: currentBedName, grid_id: gridId, plant_name: plantName, plant_icon: icon });
    openPortal('garden'); 
}

function tendPlot(plotId, plantName) {
    const panel = document.getElementById('garden-action-panel');
    panel.innerHTML = `
        <div class="alchemy-card" style="border-color: #bf953f;">
            <h3 class="alchemy-title">Tending: ${plantName}</h3>
            <p style="color: #d4c8a8; font-size: 0.9em; margin-top: 0; margin-bottom: 15px;">What does this plot need?</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="confirmFeed('${plotId}')" class="portal-btn" style="color: #4facfe; border-color: #4facfe; flex: 1;">💧 Water / Feed</button>
                <button onclick="confirmUproot('${plotId}')" class="portal-btn" style="color: #ff6b6b; border-color: #ff6b6b; flex: 1;">⛏️ Uproot</button>
                <button onclick="cancelGardenAction()" class="portal-btn" style="flex: 1;">Cancel</button>
            </div>
        </div>
    `;
}

async function confirmFeed(plotId) {
    await updateData('garden_plots', plotId, { last_fertilized: new Date().toISOString() });
    feedFamiliar(); 
    openPortal('garden');
}

async function confirmUproot(plotId) {
    await removeData('garden_plots', plotId);
    openPortal('garden');
}

function cancelGardenAction() {
    document.getElementById('garden-action-panel').innerHTML = '';
}
