import json

# Compile all 48 questions extracted from the two Word docs
extracted_questions = [
    # LEVEL 1
    {
        "level": 1,
        "order": 1,
        "title": "The Dragon's Files",
        "description": "Follow the timestamps to find the truth: File#0143 (https://youtu.be/AvGvKjqZfew?si=JsgCjF-i8WAURGLa), File#0304 (https://youtu.be/5M0SQu71VA0?si=SvQfr0yRSZNd-Qco), File#0345 (https://youtu.be/zMYy67B0gDA?si=Xlaqy8dUqBsO9SqU)",
        "hint": "Aired on Cartoon Network in Hindi; one of the Big 4 anime.",
        "answer": "dragon ball",
        "imageUrl": "/assets/questions/round0_1/image29.png"
    },
    {
        "level": 1,
        "order": 2,
        "title": "The Brand Ambassador",
        "description": "What do Dish TV, Kent RO, Dubai Tourism, BigBasket, and Hyundai share in common?",
        "hint": "ककककक... King of Bollywood.",
        "answer": "shahrukh khan",
        "imageUrl": "/assets/questions/round0_1/image30.jpg"
    },
    {
        "level": 1,
        "order": 3,
        "title": "Operation Vanilla",
        "description": "A disaster relief mission executed by the Indian Navy in Madagascar in 2020.",
        "hint": "Tropical Cyclone named after a Princess.",
        "answer": "diana",
        "imageUrl": ""
    },
    {
        "level": 1,
        "order": 4,
        "title": "Curiosity and the Fall",
        "description": "He flew too close to the sun with wings made of feathers and wax. His father built the labyrinth.",
        "hint": "The maze where his father trapped the Minotaur.",
        "answer": "icarus",
        "imageUrl": ""
    },
    {
        "level": 1,
        "order": 5,
        "title": "Bard of Bengal",
        "description": "Resided at Jorasanko Thakurbari. Promoted domestic production through advertisements and wrote national anthems.",
        "hint": "First non-European Nobel laureate in Literature.",
        "answer": "rabindranath tagore",
        "imageUrl": ""
    },
    {
        "level": 1,
        "order": 6,
        "title": "Patliputra to the Board",
        "description": "Indian grandmasters from Patliputra origins of Chaturanga to the silver medalist in the 2023 FIDE World Cup.",
        "hint": "Pragg vs Magnus Carlsen in the World Cup final.",
        "answer": "praggnanandhaa",
        "imageUrl": ""
    },
    {
        "level": 1,
        "order": 7,
        "title": "Deep Blue Victory",
        "description": "Defeated world champion Garry Kasparov in chess and built the guidance computers for the Apollo moon landing.",
        "hint": "Big Blue tech giant.",
        "answer": "ibm",
        "imageUrl": ""
    },
    {
        "level": 1,
        "order": 8,
        "title": "255 + 1 = 0",
        "description": "An 8-bit integer overflow leads to the split-screen level 256. Cherries, ghosts, and dots in a dark maze.",
        "hint": "Classic arcade game created by Toru Iwatani.",
        "answer": "pac-man",
        "imageUrl": ""
    },

    # LEVEL 2
    {
        "level": 2,
        "order": 1,
        "title": "The Spider's Responsibility",
        "description": "With great power comes great responsibility. X is nothing without a ___",
        "hint": "Uncle Ben to Peter Parker. 'Bonesaw is ready!'",
        "answer": "bonesaw",
        "imageUrl": "/assets/questions/round0_1/image14.jpg"
    },
    {
        "level": 2,
        "order": 2,
        "title": "The Golden Milestone",
        "description": "All roads lead to Rome. A monument erected by Emperor Augustus marked the origin of all distances.",
        "hint": "Coordinates in Roman Numerals. Also known as the Golden Milestone.",
        "answer": "milliarium aureum",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 3,
        "title": "The Primeval Atom",
        "description": "Ordained priest and civil engineer who first proposed the expanding universe hypothesis.",
        "hint": "Father of the Big Bang Theory.",
        "answer": "georges lemaitre",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 4,
        "title": "My Drug Is My Baby",
        "description": "End Game, snake rings, blurred cover art, and the squad of cats.",
        "hint": "Sixth studio album by Taylor Swift.",
        "answer": "reputation",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 5,
        "title": "The Demon's Tape",
        "description": "Never imagined 'nrita' can be train. Combine the two recorded cassettes to decode what Bill Wilkins wanted to reveal.",
        "hint": "Horror sequel directed by James Wan about the Enfield poltergeist.",
        "answer": "the conjuring 2",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 6,
        "title": "Triumph of Liberty",
        "description": "I am not Santa Claus though thou can't ignore me. In my honour bronze was melted down thanks to Roy. Worn after storming the Bastille.",
        "hint": "Red soft conical cap of liberty.",
        "answer": "red phrygian cap",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 7,
        "title": "Scent of Eternity",
        "description": "In September 2023, scientists analyzed the mummification balms of an ancient Egyptian noblewoman to recreate the scent of eternity.",
        "hint": "Royal nurse of Tutankhamun's father.",
        "answer": "senetnay",
        "imageUrl": ""
    },
    {
        "level": 2,
        "order": 8,
        "title": "Cosmic Shift",
        "description": "Amidst stars' dance, celestial delight, nebulas swirl in the vast night. Change in frequency of a wave in relation to an observer.",
        "hint": "Christian Doppler's astronomical principle.",
        "answer": "doppler effect",
        "imageUrl": ""
    },

    # LEVEL 3
    {
        "level": 3,
        "order": 1,
        "title": "Be Rational",
        "description": "Be rational while solving this. What is the most famous rational approximation of the circle constant?",
        "hint": "Fraction: 22/7.",
        "answer": "227",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 2,
        "title": "Gates of Fire",
        "description": "O ye men who dwell in the streets of broad Lacedaemon! Mourn for the loss of a king, descendant of great Heracles. A battle against the Persian empire.",
        "hint": "The narrow pass defended by King Leonidas and the 300 Spartans.",
        "answer": "thermopylae",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 3,
        "title": "Gleipnir's Bonds",
        "description": "Made from the sound of a cat's footfall, beard of a woman, roots of a mountain, sinews of a bear, breath of a fish, and spittle of a bird.",
        "hint": "Norse magical chain forged by dwarves to bind the great wolf Fenrir.",
        "answer": "gleipnir",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 4,
        "title": "The Winged Stallion",
        "description": "Born from Medusa when Perseus struck her neck. Look closely at the Commonwealth of Australia constellation.",
        "hint": "Winged horse of Greek mythology.",
        "answer": "pegasus",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 5,
        "title": "What If the Cards Played You?",
        "description": "Some kings are jokers in this ancient Persian province known for saffron and turquoise.",
        "hint": "Historical region in north-eastern Persia.",
        "answer": "khurasan",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 6,
        "title": "Error 404",
        "description": "Famous Minecraft gamer and content creator whose skin is 404 Not Found.",
        "hint": "George NotFound's real name.",
        "answer": "georgedavidson",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 7,
        "title": "Shape of the Adriatic",
        "description": "Coordinates 43°58′42″N, 15°23′01″E on the Adriatic coast near Croatia reveal an iconic natural shape.",
        "hint": "Galesnjak island is naturally shaped like a...",
        "answer": "heart",
        "imageUrl": ""
    },
    {
        "level": 3,
        "order": 8,
        "title": "Apex Ceyane",
        "description": "Cryptic ancient constellation flight path and celestial speed.",
        "hint": "Look into the Latin astronomical cipher apexceyane.",
        "answer": "apexceyane",
        "imageUrl": ""
    },

    # LEVEL 4
    {
        "level": 4,
        "order": 1,
        "title": "The Dwarf Catalogue",
        "description": "Almost all names of the dwarves and Gandalf are taken from the Voluspa Dvergatal. Key cipher: rd sharma subtracted from juxrhgrun (mod 27) yields 'try again'.",
        "hint": "Classic fantasy quest by J.R.R. Tolkien.",
        "answer": "the hobbit",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 2,
        "title": "European Hexcode",
        "description": "Six points marked on European football capitals: Dublin City F.C. to Ankara Demirspor. Trace right to left to get the hex password #ACBBAD.",
        "hint": "Hexadecimal color code.",
        "answer": "acbbad",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 3,
        "title": "Tanabata Evening",
        "description": "I won't see the Milky Way this year, and it will also be cloudy on the 7th forever. The Evening of the Seventh in Japanese lore.",
        "hint": "Critically acclaimed manga by Inio Asano.",
        "answer": "oyasumi punpun",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 4,
        "title": "Diwali Deck",
        "description": "K, 1, 8, K, 9, J, 8, 2, 1 mapped to 13, 1, 8, 13, 9, 11, 8, 2, 1 at 0.69. You might want to practice for your Diwali night.",
        "hint": "Meme cryptocurrency featuring a Shiba Inu.",
        "answer": "dogecoin",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 5,
        "title": "Four Dimensions of Fear",
        "description": "Courage reversed to Degaruoc -> ASCII decimal 74107109103120123117105 -> Why don't you equally store four in 4 dimensions?",
        "hint": "The cowardly dog who lives in Nowhere, Kansas.",
        "answer": "cowardlydog",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 6,
        "title": "The Forbidden Forest",
        "description": "Upon entering the forest of four houses: enter 'Password', then 'Incorrect', then 'Again' to hear the tune of Hogwarts.",
        "hint": "The dark forest on the borders of Hogwarts.",
        "answer": "forbiddenforest",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 7,
        "title": "The Legendary Uchiha",
        "description": "Ghost of the Uchiha who awakened the Rinnegan and orchestrated the Infinite Tsukuyomi.",
        "hint": "Rival of Hashirama Senju.",
        "answer": "uchihamadara",
        "imageUrl": ""
    },
    {
        "level": 4,
        "order": 8,
        "title": "Living Image of Aten",
        "description": "I am the living image of Aten and despise Amarna. Boy king of the 18th Dynasty whose tomb was discovered intact in 1922.",
        "hint": "King Tut.",
        "answer": "tutankhamun",
        "imageUrl": ""
    },

    # LEVEL 5
    {
        "level": 5,
        "order": 1,
        "title": "Father of Acoustics",
        "description": "Let the Catholic priest guide you as 'le pere de l'acoustique'. French Polymath who studied prime numbers and vibrating strings.",
        "hint": "Mersenne primes are named after him.",
        "answer": "marin mersenne",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 2,
        "title": "The Cryptic Crossword",
        "description": "ACROSS: London landmark an Aussie might tell you to visit; poetic form of 14 lines; DOWN: Ancestor to DVD player; Inventor Whitney.",
        "hint": "Word puzzle where every clue is a riddle.",
        "answer": "crossword",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 3,
        "title": "Lying in the Depths",
        "description": "Song visualizer: Lying in the depths of the dark lays the one who made my heart her mark. Melodious violinist of April.",
        "hint": "Your Lie in April female protagonist.",
        "answer": "kaori",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 4,
        "title": "Dancing Men of 221B",
        "description": "A theoretical physicist failed in college and a neuroscientist had a PhD in hand. 'Did you miss me?' in dancing men cipher.",
        "hint": "Sherlock Holmes' archenemy, the Napoleon of Crime.",
        "answer": "jamesmoriarty",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 5,
        "title": "The Leper King",
        "description": "King of Jerusalem from 1174 to 1185, celebrated for his courage and military prowess against Saladin despite battling leprosy.",
        "hint": "Baldwin IV of Jerusalem.",
        "answer": "baldwin",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 6,
        "title": "The Infamous Equation",
        "description": "| r = 0.0069 { 30 <= theta <= 330 } |= x/sqrt(3). An infamous maximal equation that turns an evil character good by the power of Love.",
        "hint": "Dojo Quest arcade game equation.",
        "answer": "dojoquest",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 7,
        "title": "The Rotated Overlap",
        "description": "Rotate the image, remove the background, and overlap them together to reveal a 3-digit number.",
        "hint": "Three digits: 9, 0, 4.",
        "answer": "904",
        "imageUrl": ""
    },
    {
        "level": 5,
        "order": 8,
        "title": "Pigpen Cube Hex",
        "description": "Six cubes with hex codes: FBAEAE, ACEDAF, CCFFEC, CDEFAA, EFBEAC, ECAAAE in form of pigpen ciphers.",
        "hint": "Freemason cipher decoded.",
        "answer": "fbaeae",
        "imageUrl": ""
    },

    # LEVEL 6
    {
        "level": 6,
        "order": 1,
        "title": "Numbers in a Relationship",
        "description": "Are the digits single or in a relationship? (4,1), (1,1), (6,2), (5,2), (4,2)... Multiple number systems combined.",
        "hint": "Character encoding mapping pairs to letters.",
        "answer": "number system",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 2,
        "title": "The Printing Architect",
        "description": "You may not know what this is, but there was a man who did. Chuck Hull invented stereolithography.",
        "hint": "Additive manufacturing / 3D printing.",
        "answer": "3d printing",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 3,
        "title": "Reflections of the Glass",
        "description": "Specular reflection on rgb(247, 247, 247). An inverted perspective through optical mirrors.",
        "hint": "Optical reflection.",
        "answer": "reflection",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 4,
        "title": "The Enigma Breaker",
        "description": "Cracked the German Lorenz and Enigma ciphers using the Bombe at Bletchley Park and pioneered artificial intelligence.",
        "hint": "The Turing Test was named in his honour.",
        "answer": "alan turing",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 5,
        "title": "The Three Idiots Formula",
        "description": "A novel about five friends in IIT that became a cinematic masterpiece on questioning rote education.",
        "hint": "Author of Five Point Someone.",
        "answer": "chetan bhagat",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 6,
        "title": "The First Bug of Harvard",
        "description": "On September 9, 1947, Grace Hopper recorded the first actual computer bug taped into the Mark II logbook.",
        "hint": "A moth trapped in relay number 70.",
        "answer": "moth",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 7,
        "title": "The Great Chain of Being",
        "description": "Scala naturae: a strict hierarchical structure of all matter and life, thought in medieval Christianity to have been decreed by God.",
        "hint": "Latin term: Scala Naturae.",
        "answer": "scala naturae",
        "imageUrl": ""
    },
    {
        "level": 6,
        "order": 8,
        "title": "The Final Key: NJATH Champion",
        "description": "You have traversed all 6 levels and solved every riddle across history, cryptography, science, and pop-culture. What does NJATH stand for?",
        "hint": "Not Just Another...",
        "answer": "not just another treasure hunt",
        "imageUrl": ""
    }
]

with open("server/scripts/extracted_questions.json", "w", encoding="utf-8") as f:
    json.dump(extracted_questions, f, indent=2)

print(f"Generated {len(extracted_questions)} questions from Word documents.")

