// ─────────────────────────────────────────────────────────────────────────────
// INDIABITES — SAMPLE RESTAURANT DATASET
//
// ⚠ THIS IS SAMPLE DATA FOR ACADEMIC DEMONSTRATION.
// Restaurant names are fictional. Ratings, review counts, prices, descriptions
// and dishes are generated for demonstration and do not describe any real
// business. Cities, localities and PIN codes are real so that location search
// behaves realistically.
//
// Street addresses, phone numbers, opening hours and map coordinates are
// deliberately NOT included — those appear only when a verified data source
// is connected (see restaurant.html).
//
// To swap in a real dataset (e.g. a Zomato/Swiggy Kaggle export), replace this
// array. Required fields per record are documented in README-DATA.md.
// ─────────────────────────────────────────────────────────────────────────────

const RESTAURANTS = [
  // ── Chennai ────────────────────────────────────────────────────────────
  { id:"r001", name:"Kaveri Tiffin Room", city:"Chennai", locality:"T. Nagar", pin:"600017",
    cuisines:["South Indian","Tamil"], cost:220, rating:4.4, reviews:1840,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual","traditional"],
    desc:"Long-running tiffin room known for ghee-roast dosai and strong filter coffee served through the day.",
    dishes:["Ghee podi idli","Ghee roast dosai","Filter coffee","Rava kesari"] },

  { id:"r002", name:"Marina Chettinad House", city:"Chennai", locality:"Mylapore", pin:"600004",
    cuisines:["Chettinad","Tamil","South Indian"], cost:650, rating:4.5, reviews:2310,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","fine-dining"], ambience:["traditional","lively"],
    desc:"Pepper-forward Chettinad cooking with clay-pot curries and freshly pounded masalas.",
    dishes:["Chicken Chettinad","Nathai pirattal","Kari dosai","Paal paniyaram"] },

  { id:"r003", name:"Besant Brew Works", city:"Chennai", locality:"Besant Nagar", pin:"600090",
    cuisines:["Cafe","Continental","Desserts"], cost:750, rating:4.2, reviews:960,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["cafe","outdoor","dine-in","delivery"], ambience:["modern","quiet"],
    desc:"Beachside cafe with single-origin pour-overs, all-day breakfast and a shaded terrace.",
    dishes:["Cold brew","Shakshuka","Belgian waffle","Pesto sandwich"] },

  { id:"r004", name:"Adyar Andhra Mess", city:"Chennai", locality:"Adyar", pin:"600020",
    cuisines:["Andhra","South Indian"], cost:300, rating:4.1, reviews:1120,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway"], ambience:["casual","lively"],
    desc:"No-frills Andhra meals counter where unlimited rice and fiery gongura arrive fast.",
    dishes:["Andhra meals","Gongura mutton","Royyala vepudu","Pappu charu"] },

  { id:"r005", name:"Anna Nagar Biryani Co.", city:"Chennai", locality:"Anna Nagar", pin:"600040",
    cuisines:["Hyderabadi Biryani","Mughlai"], cost:480, rating:4.0, reviews:1540,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual"],
    desc:"Dum-cooked biryani in sealed handis, with a short menu of kebabs and raita.",
    dishes:["Mutton dum biryani","Chicken 65","Seekh kebab","Double ka meetha"] },

  // ── Bengaluru ──────────────────────────────────────────────────────────
  { id:"r006", name:"Malleshwaram Tiffin Hall", city:"Bengaluru", locality:"Malleshwaram", pin:"560003",
    cuisines:["South Indian","Tamil"], cost:180, rating:4.6, reviews:3050,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional","lively"],
    desc:"Standing-counter tiffin hall famous for butter-soaked khali dosa and chutney refills.",
    dishes:["Khali dosa","Rava idli","Kesari bath","Bisi bele bath"] },

  { id:"r007", name:"Indiranagar Social Table", city:"Bengaluru", locality:"Indiranagar", pin:"560038",
    cuisines:["Continental","Italian","Cafe"], cost:1400, rating:4.3, reviews:2140,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["cafe","outdoor","dine-in","fine-dining"], ambience:["modern","lively"],
    desc:"Industrial-style all-day diner with wood-fired pizza and a long cocktail list.",
    dishes:["Margherita pizza","Truffle fries","Burrata salad","Tiramisu"] },

  { id:"r008", name:"Koramangala Coastal Curry", city:"Bengaluru", locality:"Koramangala", pin:"560034",
    cuisines:["Kerala","Chettinad","South Indian"], cost:700, rating:4.4, reviews:1680,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","delivery","takeaway"], ambience:["casual","modern"],
    desc:"Coastal seafood kitchen with daily catch, coconut-heavy curries and appam.",
    dishes:["Meen moilee","Appam with stew","Karimeen pollichathu","Neer dosa"] },

  { id:"r009", name:"Jayanagar Thali House", city:"Bengaluru", locality:"Jayanagar", pin:"560011",
    cuisines:["North Indian","Gujarati","Rajasthani"], cost:420, rating:4.2, reviews:1290,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional","quiet"],
    desc:"Unlimited vegetarian thali with rotating sabzis, hot phulkas and a Jain-friendly kitchen.",
    dishes:["Rajasthani thali","Dal baati churma","Gatte ki sabzi","Shrikhand"] },

  { id:"r010", name:"Whitefield Wok House", city:"Bengaluru", locality:"Whitefield", pin:"560066",
    cuisines:["Chinese","Continental"], cost:850, rating:3.9, reviews:870,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["dine-in","delivery","takeaway"], ambience:["modern","casual"],
    desc:"Wok-tossed Sichuan and Cantonese plates aimed at the weekday office crowd.",
    dishes:["Kung pao chicken","Burnt garlic noodles","Dim sum basket","Chilli paneer"] },

  // ── Hyderabad ──────────────────────────────────────────────────────────
  { id:"r011", name:"Deccan Dum Biryani", city:"Hyderabad", locality:"Charminar", pin:"500002",
    cuisines:["Hyderabadi Biryani","Mughlai"], cost:520, rating:4.7, reviews:4210,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["traditional","lively"],
    desc:"Old-city dum biryani finished over coal, served with mirchi ka salan and dahi chutney.",
    dishes:["Kacchi gosht biryani","Mirchi ka salan","Haleem (seasonal)","Qubani ka meetha"] },

  { id:"r012", name:"Banjara Kebab Court", city:"Hyderabad", locality:"Banjara Hills", pin:"500034",
    cuisines:["Mughlai","North Indian"], cost:1100, rating:4.4, reviews:1960,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["fine-dining","dine-in","outdoor","family"], ambience:["modern","quiet"],
    desc:"Charcoal grill specialising in slow-marinated kebabs and saffron-scented breads.",
    dishes:["Galouti kebab","Murgh malai tikka","Sheermal","Phirni"] },

  { id:"r013", name:"Jubilee Vegan Kitchen", city:"Hyderabad", locality:"Jubilee Hills", pin:"500033",
    cuisines:["Continental","Cafe","Desserts"], cost:900, rating:4.1, reviews:640,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["cafe","outdoor","dine-in","delivery"], ambience:["modern","quiet"],
    desc:"Fully plant-based kitchen with cashew-cream pastas, cold-pressed juices and vegan bakes.",
    dishes:["Cashew alfredo","Beetroot hummus bowl","Oat-milk latte","Vegan brownie"] },

  { id:"r014", name:"Gachibowli Tandoor Express", city:"Hyderabad", locality:"Gachibowli", pin:"500032",
    cuisines:["North Indian","Punjabi"], cost:600, rating:4.0, reviews:1150,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["dine-in","delivery","takeaway","family"], ambience:["casual"],
    desc:"Quick-turnaround tandoor kitchen built around butter chicken, dal makhani and naan.",
    dishes:["Butter chicken","Dal makhani","Garlic naan","Paneer tikka"] },

  { id:"r015", name:"Secunderabad Street Bites", city:"Hyderabad", locality:"Secunderabad", pin:"500003",
    cuisines:["Street Food","Chinese"], cost:160, rating:3.8, reviews:980,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["takeaway","outdoor","delivery"], ambience:["lively","casual"],
    desc:"Evening street-food counter running chaat, rolls and Indo-Chinese off a single griddle.",
    dishes:["Pani puri","Egg roll","Chilli chicken","Masala fries"] },

  // ── Mumbai ─────────────────────────────────────────────────────────────
  { id:"r016", name:"Bandra Bombay Canteen Co.", city:"Mumbai", locality:"Bandra West", pin:"400050",
    cuisines:["Continental","North Indian","Cafe"], cost:1600, rating:4.5, reviews:2870,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["fine-dining","outdoor","dine-in","cafe"], ambience:["modern","lively"],
    desc:"Seasonal regional plates reworked for a modern menu, with a bar-forward evening service.",
    dishes:["Kejriwal toast","Pork vindaloo bao","Hyderabadi khichdi","Masala chai cheesecake"] },

  { id:"r017", name:"Colaba Irani Cafe", city:"Mumbai", locality:"Colaba", pin:"400005",
    cuisines:["Cafe","Mughlai","Desserts"], cost:380, rating:4.3, reviews:3410,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["cafe","dine-in","takeaway","family"], ambience:["traditional","lively"],
    desc:"Bentwood chairs and checked tablecloths, running on bun maska and kheema pav since morning.",
    dishes:["Bun maska","Irani chai","Kheema pav","Mawa cake"] },

  { id:"r018", name:"Lower Parel Street Chaat", city:"Mumbai", locality:"Lower Parel", pin:"400013",
    cuisines:["Street Food","Gujarati"], cost:200, rating:4.0, reviews:1560,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","outdoor","delivery"], ambience:["lively","casual"],
    desc:"Chaat counter turning out sev puri and ragda pattice to the mill-district lunch rush.",
    dishes:["Sev puri","Ragda pattice","Vada pav","Falooda"] },

  { id:"r019", name:"Andheri Gujarati Bhojanalaya", city:"Mumbai", locality:"Andheri West", pin:"400058",
    cuisines:["Gujarati","Rajasthani"], cost:350, rating:4.2, reviews:1080,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional","quiet"],
    desc:"Unlimited Gujarati thali with rotating farsan, two sweets and a dedicated Jain kitchen.",
    dishes:["Gujarati thali","Undhiyu (seasonal)","Khandvi","Basundi"] },

  { id:"r020", name:"Dadar Coastal Catch", city:"Mumbai", locality:"Dadar", pin:"400014",
    cuisines:["Kerala","South Indian","Chettinad"], cost:780, rating:4.1, reviews:1240,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual"],
    desc:"Malvani-leaning seafood counter with daily catch chalked up on the board.",
    dishes:["Bombil fry","Prawn gassi","Solkadhi","Neer dosa"] },

  // ── Delhi ──────────────────────────────────────────────────────────────
  { id:"r021", name:"Chandni Chowk Paratha Gali", city:"Delhi", locality:"Chandni Chowk", pin:"110006",
    cuisines:["North Indian","Street Food","Punjabi"], cost:240, rating:4.4, reviews:5120,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","dine-in","family"], ambience:["traditional","lively"],
    desc:"Ghee-fried stuffed parathas served with four chutneys on steel plates in a narrow lane.",
    dishes:["Aloo paratha","Rabri paratha","Paneer paratha","Lassi"] },

  { id:"r022", name:"Connaught Mughlai Durbar", city:"Delhi", locality:"Connaught Place", pin:"110001",
    cuisines:["Mughlai","North Indian"], cost:1300, rating:4.3, reviews:2650,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["fine-dining","dine-in","family"], ambience:["traditional","quiet"],
    desc:"Formal Mughlai dining room with slow-cooked korma, biryani and clay-oven breads.",
    dishes:["Nihari","Mutton korma","Sheermal","Shahi tukda"] },

  { id:"r023", name:"Hauz Khas Garden Cafe", city:"Delhi", locality:"Hauz Khas", pin:"110016",
    cuisines:["Cafe","Italian","Desserts"], cost:1100, rating:4.1, reviews:1830,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["cafe","outdoor","dine-in"], ambience:["modern","quiet"],
    desc:"Terrace cafe overlooking the lake, with handmade pasta and a long dessert counter.",
    dishes:["Mushroom risotto","Penne arrabbiata","Lemon tart","Iced americano"] },

  { id:"r024", name:"Karol Bagh Punjabi Dhaba", city:"Delhi", locality:"Karol Bagh", pin:"110005",
    cuisines:["Punjabi","North Indian"], cost:400, rating:4.2, reviews:2040,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual","lively"],
    desc:"Roadside dhaba with tandoor running late, heavy on butter, cream and fresh rotis.",
    dishes:["Sarson da saag","Makki di roti","Amritsari kulcha","Lassi"] },

  { id:"r025", name:"Saket Pan-Asian Wok", city:"Delhi", locality:"Saket", pin:"110017",
    cuisines:["Chinese","Continental"], cost:950, rating:3.9, reviews:720,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["dine-in","delivery","takeaway"], ambience:["modern"],
    desc:"Pan-Asian menu spanning Sichuan, Thai and Indo-Chinese, built for sharing.",
    dishes:["Hakka noodles","Thai green curry","Crispy chilli potato","Mango sticky rice"] },

  // ── Kolkata ────────────────────────────────────────────────────────────
  { id:"r026", name:"Park Street Bengal Kitchen", city:"Kolkata", locality:"Park Street", pin:"700016",
    cuisines:["Bengali"], cost:560, rating:4.6, reviews:2480,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","fine-dining"], ambience:["traditional","quiet"],
    desc:"Classical Bengali courses served in order, from shukto through to mishti doi.",
    dishes:["Shorshe ilish","Kosha mangsho","Shukto","Mishti doi"] },

  { id:"r027", name:"Gariahat Roll Corner", city:"Kolkata", locality:"Gariahat", pin:"700019",
    cuisines:["Street Food","Mughlai"], cost:150, rating:4.3, reviews:3180,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["takeaway","outdoor","delivery"], ambience:["lively","casual"],
    desc:"Griddle-fried kathi rolls wrapped to order, with raw onion and a squeeze of lime.",
    dishes:["Double egg chicken roll","Mutton kathi roll","Paneer roll","Lemon soda"] },

  { id:"r028", name:"Ballygunge Sweet House", city:"Kolkata", locality:"Ballygunge", pin:"700019",
    cuisines:["Desserts","Bengali"], cost:220, rating:4.5, reviews:1920,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","family","dine-in"], ambience:["traditional"],
    desc:"Sweet shop working in chhena and nolen gur, with a seasonal winter counter.",
    dishes:["Nolen gur sandesh","Rosogolla","Mishti doi","Kheer kadam"] },

  { id:"r029", name:"Salt Lake Chinatown Wok", city:"Kolkata", locality:"Salt Lake", pin:"700064",
    cuisines:["Chinese"], cost:650, rating:4.0, reviews:1040,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:true},
    facilities:["dine-in","delivery","takeaway","family"], ambience:["casual"],
    desc:"Kolkata-Chinese cooking with hot garlic sauces and griddle-charred noodles.",
    dishes:["Chilli garlic noodles","Hot garlic fish","Wonton soup","Chicken lollipop"] },

  // ── Pune ───────────────────────────────────────────────────────────────
  { id:"r030", name:"Koregaon Park Bistro", city:"Pune", locality:"Koregaon Park", pin:"411001",
    cuisines:["Italian","Continental","Cafe"], cost:1250, rating:4.3, reviews:1460,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["fine-dining","outdoor","cafe","dine-in"], ambience:["modern","quiet"],
    desc:"Tree-shaded bistro with house-made pasta, wood-fired bread and a small wine list.",
    dishes:["Ravioli burro e salvia","Focaccia","Pan-seared fish","Affogato"] },

  { id:"r031", name:"Deccan Misal House", city:"Pune", locality:"Deccan Gymkhana", pin:"411004",
    cuisines:["Street Food","North Indian"], cost:140, rating:4.5, reviews:2760,
    diet:{veg:true,nonVeg:false,vegan:true,jain:false,halal:false},
    facilities:["takeaway","dine-in","family"], ambience:["casual","lively"],
    desc:"Morning misal counter with adjustable heat, served with pav and buttermilk.",
    dishes:["Kolhapuri misal","Sabudana khichdi","Pohe","Solkadhi"] },

  { id:"r032", name:"Viman Nagar Biryani Point", city:"Pune", locality:"Viman Nagar", pin:"411014",
    cuisines:["Hyderabadi Biryani","Mughlai"], cost:450, rating:4.0, reviews:1190,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["delivery","takeaway","dine-in"], ambience:["casual"],
    desc:"Biryani-led delivery kitchen with handi portions sized for one or for four.",
    dishes:["Chicken dum biryani","Veg biryani","Chicken 65","Raita"] },

  { id:"r033", name:"Kothrud Thali Ghar", city:"Pune", locality:"Kothrud", pin:"411038",
    cuisines:["North Indian","Rajasthani","Gujarati"], cost:380, rating:4.1, reviews:890,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional"],
    desc:"Unlimited vegetarian thali with Maharashtrian and Rajasthani plates alternating daily.",
    dishes:["Maharashtrian thali","Puran poli","Dal baati","Amti"] },

  // ── Coimbatore ─────────────────────────────────────────────────────────
  { id:"r034", name:"R.S. Puram Tiffin Centre", city:"Coimbatore", locality:"R.S. Puram", pin:"641002",
    cuisines:["South Indian","Tamil"], cost:160, rating:4.5, reviews:1670,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional","casual"],
    desc:"Neighbourhood tiffin centre with steam-fresh idli from 6am and evening dosai service.",
    dishes:["Idli vada","Onion uthappam","Filter coffee","Sambar vada"] },

  { id:"r035", name:"Peelamedu Kongu Kitchen", city:"Coimbatore", locality:"Peelamedu", pin:"641004",
    cuisines:["Tamil","Chettinad","South Indian"], cost:420, rating:4.3, reviews:1130,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual","traditional"],
    desc:"Kongunadu regional cooking with arisi paruppu sadam and dry-roasted meat plates.",
    dishes:["Kongu chicken","Arisi paruppu sadam","Kari kuzhambu","Ulundhu kali"] },

  { id:"r036", name:"Gandhipuram Grill Street", city:"Coimbatore", locality:"Gandhipuram", pin:"641012",
    cuisines:["Street Food","Chinese","Mughlai"], cost:230, rating:3.9, reviews:760,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["takeaway","outdoor","delivery"], ambience:["lively"],
    desc:"Evening grill strip running shawarma, fried rice and griddle chicken side by side.",
    dishes:["Chicken shawarma","Schezwan fried rice","Grilled chicken","Falooda"] },

  // ── Madurai ────────────────────────────────────────────────────────────
  { id:"r037", name:"Simmakkal Jigarthanda Stall", city:"Madurai", locality:"Simmakkal", pin:"625001",
    cuisines:["Desserts","Street Food"], cost:120, rating:4.7, reviews:3920,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","outdoor"], ambience:["lively","traditional"],
    desc:"Jigarthanda counter working late into the night, with house-churned ice cream.",
    dishes:["Jigarthanda","Badam milk","Falooda","Nannari sarbath"] },

  { id:"r038", name:"Goripalayam Kari Dosai", city:"Madurai", locality:"Goripalayam", pin:"625002",
    cuisines:["Tamil","Chettinad","Street Food"], cost:190, rating:4.4, reviews:2180,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["takeaway","dine-in","outdoor"], ambience:["lively","casual"],
    desc:"Late-night griddle turning out kari dosai and mutton chukka to a steady queue.",
    dishes:["Kari dosai","Mutton chukka","Egg kalakki","Paruthi paal"] },

  { id:"r039", name:"K.K. Nagar Meals Hall", city:"Madurai", locality:"K.K. Nagar", pin:"625020",
    cuisines:["Tamil","South Indian"], cost:200, rating:4.2, reviews:940,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional"],
    desc:"Banana-leaf vegetarian meals at lunch, with unlimited rice and four kuzhambu.",
    dishes:["Banana leaf meals","Vathal kuzhambu","Appalam","Payasam"] },

  // ── Kochi ──────────────────────────────────────────────────────────────
  { id:"r040", name:"Fort Kochi Fish Grill", city:"Kochi", locality:"Fort Kochi", pin:"682001",
    cuisines:["Kerala","South Indian"], cost:820, rating:4.6, reviews:2340,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["outdoor","dine-in","family","fine-dining"], ambience:["traditional","quiet"],
    desc:"Harbour-side grill where the day's catch is picked at the counter and cooked to order.",
    dishes:["Karimeen pollichathu","Fish molee","Appam","Kerala parotta"] },

  { id:"r041", name:"Panampilly Appam House", city:"Kochi", locality:"Panampilly Nagar", pin:"682036",
    cuisines:["Kerala","South Indian"], cost:340, rating:4.3, reviews:1280,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual"],
    desc:"Breakfast-to-dinner appam counter with vegetable stew and coconut-milk curries.",
    dishes:["Appam with stew","Puttu kadala","Beef fry","Payasam"] },

  { id:"r042", name:"Kakkanad Cafe Kahwa", city:"Kochi", locality:"Kakkanad", pin:"682030",
    cuisines:["Cafe","Continental","Desserts"], cost:680, rating:4.0, reviews:590,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["cafe","outdoor","dine-in","delivery"], ambience:["modern","quiet"],
    desc:"Tech-park cafe with filter and specialty brews, bakes and a quiet work-friendly floor.",
    dishes:["Flat white","Banana bread","Club sandwich","Chocolate cake"] },

  // ── Jaipur ─────────────────────────────────────────────────────────────
  { id:"r043", name:"C-Scheme Rajputana Rasoi", city:"Jaipur", locality:"C-Scheme", pin:"302001",
    cuisines:["Rajasthani","North Indian"], cost:980, rating:4.5, reviews:1870,
    diet:{veg:true,nonVeg:true,vegan:false,jain:true,halal:true},
    facilities:["fine-dining","family","dine-in"], ambience:["traditional","quiet"],
    desc:"Royal Rajasthani dining with laal maas, ker sangri and hand-churned ghee breads.",
    dishes:["Laal maas","Dal baati churma","Ker sangri","Ghevar"] },

  { id:"r044", name:"Bani Park Kachori Corner", city:"Jaipur", locality:"Bani Park", pin:"302016",
    cuisines:["Street Food","Rajasthani","Desserts"], cost:130, rating:4.4, reviews:2610,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","outdoor"], ambience:["lively","traditional"],
    desc:"Morning kachori counter frying to order, with a sweets case running all day.",
    dishes:["Pyaaz kachori","Mirchi vada","Mawa kachori","Ghevar"] },

  { id:"r045", name:"Malviya Nagar Thali Mahal", city:"Jaipur", locality:"Malviya Nagar", pin:"302017",
    cuisines:["Rajasthani","Gujarati","North Indian"], cost:450, rating:4.1, reviews:1020,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["family","dine-in","takeaway"], ambience:["traditional","casual"],
    desc:"Unlimited Rajasthani thali with bajra roti, four sabzis and seasonal sweets.",
    dishes:["Rajasthani thali","Gatte ki sabzi","Bajra roti","Malpua"] },

  // ── Ahmedabad ──────────────────────────────────────────────────────────
  { id:"r046", name:"Navrangpura Gujarati Thal", city:"Ahmedabad", locality:"Navrangpura", pin:"380009",
    cuisines:["Gujarati","Rajasthani"], cost:420, rating:4.6, reviews:2530,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["family","dine-in","fine-dining"], ambience:["traditional","quiet"],
    desc:"Full Gujarati thal served in sequence, with farsan, two sweets and unlimited refills.",
    dishes:["Gujarati thal","Undhiyu (seasonal)","Dhokla","Basundi"] },

  { id:"r047", name:"Satellite Street Khaugalli", city:"Ahmedabad", locality:"Satellite", pin:"380015",
    cuisines:["Street Food","Chinese"], cost:180, rating:4.2, reviews:1740,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","outdoor","delivery"], ambience:["lively","casual"],
    desc:"Evening food lane with pav bhaji griddles, sandwich counters and Indo-Chinese woks.",
    dishes:["Pav bhaji","Grilled sandwich","Manchurian","Kulfi"] },

  { id:"r048", name:"Bodakdev Cafe Mocha House", city:"Ahmedabad", locality:"Bodakdev", pin:"380054",
    cuisines:["Cafe","Italian","Desserts"], cost:720, rating:4.0, reviews:810,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["cafe","outdoor","dine-in","delivery"], ambience:["modern","quiet"],
    desc:"All-vegetarian cafe with wood-fired pizza, cold coffee and a late dessert counter.",
    dishes:["Margherita pizza","Cold coffee","Garlic bread","Sizzling brownie"] },

  // ── Additional spread ──────────────────────────────────────────────────
  { id:"r049", name:"Velachery Vegan Bowl", city:"Chennai", locality:"Velachery", pin:"600042",
    cuisines:["Continental","Cafe"], cost:560, rating:4.0, reviews:430,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["cafe","delivery","takeaway","dine-in"], ambience:["modern","quiet"],
    desc:"Plant-based bowls, millet salads and cold-pressed juices with calorie counts listed.",
    dishes:["Millet buddha bowl","Peanut tofu wrap","Green smoothie","Date brownie"] },

  { id:"r050", name:"HSR Layout Dosa Lab", city:"Bengaluru", locality:"HSR Layout", pin:"560102",
    cuisines:["South Indian","Street Food"], cost:280, rating:4.2, reviews:1340,
    diet:{veg:true,nonVeg:false,vegan:true,jain:false,halal:false},
    facilities:["delivery","takeaway","dine-in","cafe"], ambience:["modern","casual"],
    desc:"Modern dosa counter with unconventional fillings alongside the classic plain roast.",
    dishes:["Cheese masala dosa","Podi idli","Schezwan dosa","Filter coffee"] },

  { id:"r051", name:"Mylapore Mithai Bhavan", city:"Chennai", locality:"Mylapore", pin:"600004",
    cuisines:["Desserts","South Indian"], cost:180, rating:4.3, reviews:1460,
    diet:{veg:true,nonVeg:false,vegan:false,jain:true,halal:false},
    facilities:["takeaway","family","dine-in"], ambience:["traditional"],
    desc:"Sweet counter working in ghee and jaggery, busiest through the festival calendar.",
    dishes:["Mysore pak","Adhirasam","Badusha","Jangiri"] },

  { id:"r052", name:"Indiranagar Ramen Bar", city:"Bengaluru", locality:"Indiranagar", pin:"560038",
    cuisines:["Chinese","Continental"], cost:1150, rating:4.1, reviews:680,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["dine-in","fine-dining","delivery"], ambience:["modern","quiet"],
    desc:"Counter-seating ramen bar with twelve-hour broths and a short small-plates list.",
    dishes:["Shoyu ramen","Miso veg ramen","Gyoza","Matcha pudding"] },

  { id:"r053", name:"Jubilee Hills Pizza Forno", city:"Hyderabad", locality:"Jubilee Hills", pin:"500033",
    cuisines:["Italian","Continental"], cost:1050, rating:4.2, reviews:1260,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:true},
    facilities:["fine-dining","outdoor","dine-in","delivery"], ambience:["modern","lively"],
    desc:"Neapolitan-style wood-fired pizza with a 48-hour dough and imported tinned tomato.",
    dishes:["Marinara","Diavola","Burrata","Panna cotta"] },

  { id:"r054", name:"Bandra Taqueria Sur", city:"Mumbai", locality:"Bandra West", pin:"400050",
    cuisines:["Mexican","Continental"], cost:980, rating:4.0, reviews:740,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["dine-in","outdoor","delivery","cafe"], ambience:["lively","modern"],
    desc:"Small taqueria pressing corn tortillas to order, with three salsas on every table.",
    dishes:["Al pastor taco","Jackfruit taco","Elote","Churros"] },

  { id:"r055", name:"Hauz Khas Taco Cantina", city:"Delhi", locality:"Hauz Khas", pin:"110016",
    cuisines:["Mexican","Continental"], cost:850, rating:3.9, reviews:560,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:false},
    facilities:["dine-in","outdoor","delivery"], ambience:["lively","casual"],
    desc:"Loud, late cantina with build-your-own burrito bowls and a long margarita list.",
    dishes:["Burrito bowl","Quesadilla","Nachos grande","Horchata"] },

  { id:"r056", name:"Salt Lake Bengali Bhoj", city:"Kolkata", locality:"Salt Lake", pin:"700064",
    cuisines:["Bengali","Street Food"], cost:320, rating:4.2, reviews:1150,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual"],
    desc:"Everyday Bengali plates — bhaat, daal, maachher jhol — priced for a weekday lunch.",
    dishes:["Maachher jhol","Aloo posto","Begun bhaja","Payesh"] },

  { id:"r057", name:"Koregaon Vegan Greens", city:"Pune", locality:"Koregaon Park", pin:"411001",
    cuisines:["Continental","Cafe","Desserts"], cost:740, rating:4.1, reviews:520,
    diet:{veg:true,nonVeg:false,vegan:true,jain:true,halal:false},
    facilities:["cafe","outdoor","delivery","dine-in"], ambience:["quiet","modern"],
    desc:"Entirely plant-based kitchen with seasonal salads, house nut-milks and raw desserts.",
    dishes:["Quinoa salad","Tempeh wrap","Almond-milk latte","Raw cheesecake"] },

  { id:"r058", name:"Fort Kochi Spice Cafe", city:"Kochi", locality:"Fort Kochi", pin:"682001",
    cuisines:["Cafe","Continental","Kerala"], cost:520, rating:4.2, reviews:870,
    diet:{veg:true,nonVeg:true,vegan:true,jain:false,halal:true},
    facilities:["cafe","outdoor","dine-in"], ambience:["quiet","traditional"],
    desc:"Courtyard cafe in a restored godown, pairing local spice blends with espresso drinks.",
    dishes:["Cardamom latte","Kerala breakfast plate","Banana fritters","Lime soda"] },

  { id:"r059", name:"Gandhipuram Punjabi Rasoi", city:"Coimbatore", locality:"Gandhipuram", pin:"641012",
    cuisines:["Punjabi","North Indian"], cost:430, rating:4.0, reviews:650,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["family","dine-in","takeaway","delivery"], ambience:["casual"],
    desc:"North Indian kitchen in the south, running tandoor breads and cream-finished gravies.",
    dishes:["Butter chicken","Paneer butter masala","Tandoori roti","Gulab jamun"] },

  { id:"r060", name:"Navrangpura Biryani Darbar", city:"Ahmedabad", locality:"Navrangpura", pin:"380009",
    cuisines:["Hyderabadi Biryani","Mughlai"], cost:520, rating:4.1, reviews:980,
    diet:{veg:true,nonVeg:true,vegan:false,jain:false,halal:true},
    facilities:["dine-in","delivery","takeaway","family"], ambience:["casual","lively"],
    desc:"Dum biryani kitchen with separate veg and non-veg handis and late-evening service.",
    dishes:["Hyderabadi dum biryani","Veg dum biryani","Chicken 65","Mirchi ka salan"] },
];

// Cuisine catalogue used by the filters and the content-based arm.
const CUISINES = [
  "South Indian","North Indian","Chettinad","Tamil","Andhra","Kerala","Bengali",
  "Punjabi","Gujarati","Rajasthani","Mughlai","Hyderabadi Biryani","Chinese",
  "Italian","Mexican","Continental","Street Food","Cafe","Desserts",
];

const CITIES = [
  "Chennai","Bengaluru","Hyderabad","Mumbai","Delhi","Kolkata",
  "Pune","Coimbatore","Madurai","Kochi","Jaipur","Ahmedabad",
];

const BUDGET_BANDS = [
  { id:"b1", label:"Under ₹200",      min:0,    max:200   },
  { id:"b2", label:"₹200 – ₹500",     min:200,  max:500   },
  { id:"b3", label:"₹500 – ₹1,000",   min:500,  max:1000  },
  { id:"b4", label:"₹1,000 – ₹2,000", min:1000, max:2000  },
  { id:"b5", label:"Above ₹2,000",    min:2000, max:1e9   },
];
