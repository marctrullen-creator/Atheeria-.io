/* AETHERIA Parfums · datos de la tienda (ES / EN)
   Script clásico: expone window.__AE__ (sin módulos, funciona con file://). */
(function () {
  "use strict";
  var AE = (window.__AE__ = window.__AE__ || {});

  AE.shipping = { cost: 4.9, freeFrom: 120 };

  AE.products = [
    {
      id: "nocturne",
      name: "Nocturne d'Or",
      img: "assets/img/nocturne-dor.webp",
      liquid: "#C87A28",
      stone: "#141210",
      conc: { es: "Extrait de parfum · 32 %", en: "Extrait de parfum · 32%" },
      family: ["oriental", "especiada"],
      seasons: ["otono", "invierno"],
      lot: "0417",
      sizes: [
        { id: "100", label: { es: "100 ml", en: "100 ml" }, price: 265 },
        { id: "5", label: { es: "Muestra 5 ml", en: "5 ml sample" }, price: 18 }
      ],
      pyramid: {
        salida: { es: ["Bergamota negra de Calabria", "Cardamomo ahumado", "Pimienta rosa"], en: ["Black Calabrian bergamot", "Smoked cardamom", "Pink pepper"] },
        corazon: { es: ["Rosa de Damasco absoluta", "Incienso de Omán", "Raíz de lirio"], en: ["Damask rose absolute", "Omani frankincense", "Orris root"] },
        fondo: { es: ["Oud de Assam", "Ámbar gris botánico", "Vainilla negra de Madagascar", "Cuero envejecido"], en: ["Assam oud", "Botanical ambergris", "Black Madagascar vanilla", "Aged leather"] }
      },
      desc: {
        es: "Bergamota negra y cardamomo ahumado abren paso a una rosa de Damasco envuelta en incienso de Omán. Debajo quedan oud de Assam, vainilla negra y cuero, que siguen en la ropa al día siguiente.",
        en: "Black bergamot and smoked cardamom open onto a Damask rose wrapped in Omani frankincense. Underneath sit Assam oud, black vanilla and leather, still on your clothes the next day."
      },
      wear: { es: "10 a 12 h en piel", en: "10 to 12 h on skin" },
      stoneName: { es: "Tapón de mármol Nero Marquina con vetas doradas", en: "Nero Marquina marble stopper with gold veins" }
    },
    {
      id: "sylva",
      name: "Sylva Obscura",
      img: "assets/img/sylva-obscura.webp",
      liquid: "#2E4A3B",
      stone: "#123a26",
      conc: { es: "Eau de parfum intense · 24 %", en: "Eau de parfum intense · 24%" },
      family: ["amaderada"],
      seasons: ["otono", "primavera"],
      lot: "0522",
      sizes: [{ id: "100", label: { es: "100 ml", en: "100 ml" }, price: 210 }],
      pyramid: {
        salida: { es: ["Ciprés húmedo", "Higo negro"], en: ["Wet cypress", "Black fig"] },
        corazon: { es: ["Vetiver de Haití"], en: ["Haitian vetiver"] },
        fondo: { es: ["Musgo de roble", "Tierra mojada (geosmina)"], en: ["Oakmoss", "Wet earth (geosmin)"] }
      },
      desc: {
        es: "Un pinar justo después de llover: ciprés mojado y higo negro sobre vetiver de Haití, musgo de roble y el olor exacto de la tierra húmeda, que en perfumería se llama geosmina.",
        en: "A pine wood right after the rain: wet cypress and black fig over Haitian vetiver, oakmoss and the exact smell of damp soil, which perfumers call geosmin."
      },
      wear: { es: "8 a 10 h en piel", en: "8 to 10 h on skin" },
      stoneName: { es: "Tapón de mármol verde bosque", en: "Forest green marble stopper" }
    },
    {
      id: "sel",
      name: "Sel d'Argent",
      img: "assets/img/sel-dargent.webp",
      liquid: "#B8C9D4",
      stone: "#d9d7d1",
      conc: { es: "Eau de parfum · 20 %", en: "Eau de parfum · 20%" },
      family: ["mineral"],
      seasons: ["primavera", "verano"],
      lot: "0309",
      sizes: [{ id: "100", label: { es: "100 ml", en: "100 ml" }, price: 195 }],
      pyramid: {
        salida: { es: ["Sal marina del Atlántico", "Enebro"], en: ["Atlantic sea salt", "Juniper"] },
        corazon: { es: ["Algas tostadas"], en: ["Toasted seaweed"] },
        fondo: { es: ["Cedro blanco del Atlas", "Almizcle mineral"], en: ["White Atlas cedar", "Mineral musk"] }
      },
      desc: {
        es: "La piel con sal después de nadar en el Atlántico. Enebro y algas tostadas al principio, y un fondo limpio de cedro blanco del Atlas y almizcle mineral.",
        en: "Salt on your skin after a swim in the Atlantic. Juniper and toasted seaweed at first, then a clean base of white Atlas cedar and mineral musk."
      },
      wear: { es: "6 a 8 h en piel", en: "6 to 8 h on skin" },
      stoneName: { es: "Tapón de piedra blanca salina", en: "White saline stone stopper" }
    },
    {
      id: "fumee",
      name: "Fumée Céleste",
      img: "assets/img/fumee-celeste.webp",
      liquid: "#7B2D1F",
      stone: "#2a0d08",
      conc: { es: "Extrait de parfum · 30 %", en: "Extrait de parfum · 30%" },
      family: ["especiada", "amaderada"],
      seasons: ["invierno", "otono"],
      lot: "0611",
      sizes: [{ id: "100", label: { es: "100 ml", en: "100 ml" }, price: 250 }],
      pyramid: {
        salida: { es: ["Tabaco rubio curado", "Miel de brezo"], en: ["Cured blond tobacco", "Heather honey"] },
        corazon: { es: ["Mirra roja"], en: ["Red myrrh"] },
        fondo: { es: ["Haba tonka tostada", "Sándalo de Mysore"], en: ["Toasted tonka bean", "Mysore sandalwood"] }
      },
      desc: {
        es: "Tabaco rubio y miel de brezo junto a la chimenea. Mirra roja en el corazón y un fondo cálido de haba tonka tostada y sándalo de Mysore.",
        en: "Blond tobacco and heather honey by the fireplace. Red myrrh at the heart and a warm base of toasted tonka bean and Mysore sandalwood."
      },
      wear: { es: "10 a 12 h en piel", en: "10 to 12 h on skin" },
      stoneName: { es: "Tapón de obsidiana ahumada rojiza", en: "Smoky red obsidian stopper" }
    }
  ];

  AE.discovery = {
    id: "discovery",
    name: "Discovery Set",
    img: "assets/img/discovery-set.webp",
    sizes: [{ id: "set", label: { es: "4 × 5 ml + bono de 65 €", en: "4 × 5 ml + €65 voucher" }, price: 65 }]
  };

  AE.families = {
    amaderada: { es: "Amaderada", en: "Woody" },
    oriental: { es: "Oriental", en: "Oriental" },
    mineral: { es: "Mineral", en: "Mineral" },
    especiada: { es: "Especiada", en: "Spicy" }
  };
  AE.seasons = {
    primavera: { es: "Primavera", en: "Spring" },
    verano: { es: "Verano", en: "Summer" },
    otono: { es: "Otoño", en: "Autumn" },
    invierno: { es: "Invierno", en: "Winter" }
  };
  AE.tiers = {
    salida: { es: "Salida", en: "Top", time: { es: "0 a 15 min", en: "0 to 15 min" } },
    corazon: { es: "Corazón", en: "Heart", time: { es: "15 min a 4 h", en: "15 min to 4 h" } },
    fondo: { es: "Fondo", en: "Base", time: { es: "de 4 h al día siguiente", en: "4 h to the next day" } }
  };

  /* --- El Oráculo: cada respuesta suma puntos a cada perfume --- */
  AE.quiz = [
    {
      id: "textura",
      q: { es: "¿Qué textura te gustaría llevar puesta?", en: "Which texture would you like to wear?" },
      a: [
        { es: "Terciopelo negro y seda", en: "Black velvet and silk", w: { nocturne: 3, fumee: 2 }, why: { es: "terciopelo", en: "velvet" } },
        { es: "Lana húmeda y musgo", en: "Damp wool and moss", w: { sylva: 3, fumee: 1 }, why: { es: "lana húmeda", en: "damp wool" } },
        { es: "Lino al sol, con sal", en: "Sun-dried linen with salt", w: { sel: 3, sylva: 1 }, why: { es: "lino con sal", en: "salty linen" } },
        { es: "Cuero gastado", en: "Worn leather", w: { fumee: 2, nocturne: 2 }, why: { es: "cuero gastado", en: "worn leather" } }
      ]
    },
    {
      id: "hora",
      q: { es: "¿A qué hora del día perteneces?", en: "Which time of day do you belong to?" },
      a: [
        { es: "Al amanecer", en: "Dawn", w: { sel: 2, sylva: 2 }, why: { es: "el amanecer", en: "dawn" } },
        { es: "Al mediodía", en: "Midday", w: { sel: 3 }, why: { es: "el mediodía", en: "midday" } },
        { es: "Al crepúsculo", en: "Dusk", w: { sylva: 2, fumee: 2 }, why: { es: "el crepúsculo", en: "dusk" } },
        { es: "A la medianoche", en: "Midnight", w: { nocturne: 3, fumee: 1 }, why: { es: "la medianoche", en: "midnight" } }
      ]
    },
    {
      id: "lugar",
      q: { es: "¿Qué lugar te gustaría volver a pisar?", en: "Which place would you like to walk into again?" },
      a: [
        { es: "Una biblioteca con chimenea", en: "A library with a fireplace", w: { fumee: 3, nocturne: 1 }, why: { es: "una biblioteca con chimenea", en: "a library with a fireplace" } },
        { es: "Un bosque después de la lluvia", en: "A forest after the rain", w: { sylva: 3 }, why: { es: "un bosque después de la lluvia", en: "a forest after the rain" } },
        { es: "Un acantilado sobre el Atlántico", en: "A cliff above the Atlantic", w: { sel: 3 }, why: { es: "un acantilado sobre el Atlántico", en: "a cliff above the Atlantic" } },
        { es: "Un templo con incienso al anochecer", en: "A temple with incense at nightfall", w: { nocturne: 3, fumee: 1 }, why: { es: "un templo con incienso", en: "a temple with incense" } }
      ]
    },
    {
      id: "intensidad",
      q: { es: "¿Cómo quieres que te recuerden?", en: "How do you want to be remembered?" },
      a: [
        { es: "Como un susurro, a un palmo", en: "As a whisper, a hand's width away", w: { sel: 3, sylva: 1 }, why: { es: "un susurro", en: "a whisper" } },
        { es: "Como una presencia al pasar", en: "As a presence as you walk by", w: { sylva: 2, sel: 1 }, why: { es: "una presencia al pasar", en: "a presence as you pass" } },
        { es: "Como una estela que llena la sala", en: "As a trail that fills the room", w: { nocturne: 3, fumee: 1 }, why: { es: "una estela que llena la sala", en: "a trail that fills the room" } },
        { es: "Como la huella en una bufanda al día siguiente", en: "As the trace on a scarf the next day", w: { fumee: 3, nocturne: 2 }, why: { es: "la huella del día siguiente", en: "the next-day trace" } }
      ]
    }
  ];

  AE.quizResult = {
    nocturne: {
      es: "Nocturne d'Or abre con bergamota negra, se vuelve rosa e incienso hacia el minuto veinte y termina en oud y cuero. Es el más intenso de la colección: con una pulverización tienes para toda la noche.",
      en: "Nocturne d'Or opens with black bergamot, turns into rose and frankincense around minute twenty and ends in oud and leather. It is the most intense of the collection: one spray lasts the whole night."
    },
    sylva: {
      es: "Sylva Obscura huele a pinar mojado: ciprés e higo negro al principio, vetiver en el centro y un fondo de musgo de roble y tierra húmeda. Callado de cerca, muy reconocible al pasar.",
      en: "Sylva Obscura smells of a wet pine wood: cypress and black fig at first, vetiver at the centre and a base of oakmoss and damp soil. Quiet up close, very recognisable as you pass."
    },
    sel: {
      es: "Sel d'Argent es sal, enebro y algas tostadas sobre cedro blanco. El más ligero de los cuatro: se queda cerca de la piel y funciona igual en una oficina que en la playa.",
      en: "Sel d'Argent is salt, juniper and toasted seaweed over white cedar. The lightest of the four: it stays close to the skin and works as well in an office as on a beach."
    },
    fumee: {
      es: "Fumée Céleste empieza con tabaco rubio y miel de brezo, pasa por mirra roja y se asienta en haba tonka y sándalo. Es el que mejor se queda en la lana: lo notarás en la bufanda días después.",
      en: "Fumée Céleste starts with blond tobacco and heather honey, moves through red myrrh and settles into tonka bean and sandalwood. It clings best to wool: you will notice it on your scarf days later."
    }
  };

  /* --- Diario: artículos completos --- */
  AE.journal = [
    {
      id: "incienso",
      img: "assets/img/diario-incienso.webp",
      date: { es: "12 sep 2026", en: "12 Sep 2026" },
      kicker: { es: "Materias · 4 min", en: "Materials · 4 min" },
      author: { es: "Inès Laurent, nariz de AETHERIA", en: "Inès Laurent, AETHERIA perfumer" },
      title: { es: "Las lágrimas de Omán: así se recoge el incienso", en: "The tears of Oman: how frankincense is harvested" },
      body: {
        es: [
          "El incienso del corazón de Nocturne d'Or sale de un árbol bajo y retorcido que crece en las laderas secas de Dhofar, al sur de Omán: la Boswellia sacra.",
          "Los recolectores hacen pequeñas incisiones en la corteza. El árbol responde con una resina lechosa que se seca al aire durante unas dos semanas y se endurece en gotas: las lágrimas. La primera sangría se descarta; las siguientes, más claras, son las que se venden.",
          "El color dice mucho. Las lágrimas de hojari, las más apreciadas, tienen un verde pálido casi translúcido y huelen a limón, a pino y a piedra caliente. Las más oscuras son más resinosas y más dulces.",
          "En perfumería no se usa la lágrima tal cual. La destilamos para obtener el aceite esencial de olíbano, que conserva la parte cítrica y fresca, y lo combinamos con un resinoide más denso que aporta el fondo ahumado.",
          "Por eso el incienso de Nocturne d'Or no huele a iglesia. Aparece hacia el minuto veinte, cuando la bergamota ya se ha ido, y se queda pegado a la rosa durante horas: primero brillante, luego cálido y al final casi como madera.",
          "Si quieres reconocerlo, ponte una gota en el dorso de la mano y espera media hora. La primera nota que te recuerde a piedra caliente y a limón es él."
        ],
        en: [
          "The frankincense at the heart of Nocturne d'Or comes from a short, twisted tree that grows on the dry slopes of Dhofar, in southern Oman: Boswellia sacra.",
          "Harvesters make small cuts in the bark. The tree answers with a milky resin that dries in the air for about two weeks and hardens into drops: the tears. The first tapping is discarded; the later, paler ones are the ones that are sold.",
          "Colour tells you a lot. Hojari tears, the most prized, are a pale, almost translucent green and smell of lemon, pine and warm stone. Darker tears are more resinous and sweeter.",
          "Perfumers do not use the tear as it is. We distil it into olibanum essential oil, which keeps the fresh citrus side, and blend it with a denser resinoid that brings the smoky base.",
          "That is why the frankincense in Nocturne d'Or does not smell like a church. It shows up around minute twenty, once the bergamot has gone, and stays close to the rose for hours: bright at first, then warm, and in the end almost like wood.",
          "If you want to recognise it, put a drop on the back of your hand and wait half an hour. The first note that reminds you of warm stone and lemon is the frankincense."
        ]
      }
    },
    {
      id: "alambique",
      img: "assets/img/diario-cobre.webp",
      date: { es: "3 oct 2026", en: "3 Oct 2026" },
      kicker: { es: "Oficio · 5 min", en: "Craft · 5 min" },
      author: { es: "Pablo Arrieta, destilador en Grasse", en: "Pablo Arrieta, distiller in Grasse" },
      title: { es: "Un alambique de 1890: lo que el cobre hace por una planta", en: "An 1890 still: what copper does for a plant" },
      body: {
        es: [
          "En el taller de Grasse trabajamos con un alambique de cobre martillado fechado en 1890. Tiene una caldera redonda, un capitel en forma de cebolla y un cuello de cisne que baja hasta el condensador.",
          "El cobre está ahí por razones prácticas. Reparte el calor de forma muy uniforme, así que la planta no se quema contra el fondo, y reacciona con los compuestos de azufre que liberan algunas materias al calentarse. Lo que sale por el cuello de cisne huele más limpio.",
          "Destilamos al vapor: el agua hierve en la caldera, el vapor atraviesa la planta y arrastra sus aceites. Al enfriarse en el condensador, agua y aceite se separan solos porque no se mezclan, y la mayoría de los aceites quedan flotando. Se recogen a mano.",
          "Con este alambique destilamos el ciprés de Sylva Obscura, el enebro de Sel d'Argent y el vetiver. La rosa de Nocturne d'Or se trabaja de otra manera: es un absoluto, obtenido por extracción, porque el vapor se lleva parte de su perfume más dulce.",
          "Las cifras ayudan a entender el precio de un extrait. Hacen falta unas tres toneladas de pétalos de rosa de Damasco para obtener un kilo de aceite, y la cosecha se hace a mano, al amanecer, antes de que el calor se lleve el aroma.",
          "Cuando termina una destilación, el cobre se limpia con vinagre y sal, como hace un siglo. Es la parte más lenta del oficio y la única que no se puede saltar."
        ],
        en: [
          "In our Grasse workshop we use a hammered copper still dated 1890. It has a round boiler, an onion-shaped helmet and a swan neck that runs down to the condenser.",
          "The copper is there for practical reasons. It spreads heat very evenly, so the plant does not scorch against the bottom, and it reacts with the sulphur compounds some materials release when heated. What comes out of the swan neck smells cleaner.",
          "We steam distil: water boils in the boiler, the steam passes through the plant and carries its oils with it. As it cools in the condenser, water and oil separate on their own because they do not mix, and most oils float on top. They are collected by hand.",
          "With this still we distil the cypress in Sylva Obscura, the juniper in Sel d'Argent and the vetiver. The rose in Nocturne d'Or is handled differently: it is an absolute, made by extraction, because steam takes away part of its sweetest scent.",
          "The numbers help explain the price of an extrait. It takes about three tonnes of Damask rose petals to make one kilo of oil, and the harvest is done by hand at dawn, before the heat takes the scent away.",
          "When a distillation ends, the copper is cleaned with vinegar and salt, as it was a century ago. It is the slowest part of the craft and the only one you cannot skip."
        ]
      }
    },
    {
      id: "extrait",
      img: "assets/img/diario-atomizador.webp",
      date: { es: "21 oct 2026", en: "21 Oct 2026" },
      kicker: { es: "Ritual · 3 min", en: "Ritual · 3 min" },
      author: { es: "Inès Laurent, nariz de AETHERIA", en: "Inès Laurent, AETHERIA perfumer" },
      title: { es: "Cómo llevar un extrait: menos pulverizaciones, más horas", en: "How to wear an extrait: fewer sprays, more hours" },
      body: {
        es: [
          "Un extrait de parfum lleva más aceite que una eau de parfum: un 32 % en Nocturne d'Or frente al 20 % de Sel d'Argent. Eso cambia la forma de ponérselo.",
          "Con una o dos pulverizaciones basta. Apunta a la base del cuello y a la cara interna de la muñeca, a unos quince centímetros, para que el perfume caiga como una nube fina y no como una gota.",
          "No frotes las muñecas. El calor del roce acelera la evaporación de la salida y te pierdes la bergamota y el cardamomo, que solo duran un cuarto de hora.",
          "La piel hidratada sujeta mejor el perfume que la piel seca. Si usas crema, que sea sin olor y aplícala unos minutos antes.",
          "La lana y el algodón guardan el fondo mucho más tiempo que la piel. Una pulverización en una bufanda puede seguir oliendo a oud y a vainilla dos o tres días después. Evita la seda clara: los aceites pueden dejar marca.",
          "Guarda el frasco lejos de la luz y del calor, mejor en su caja. El vidrio ahumado y la base gruesa protegen el líquido, pero una ventana al sur en verano lo envejece en pocos meses.",
          "Y antes de abrir el frasco de 100 ml, prueba la muestra de 2 ml que viene con tu pedido. Un día entero en tu piel dice más que cualquier descripción."
        ],
        en: [
          "An extrait de parfum carries more oil than an eau de parfum: 32% in Nocturne d'Or against 20% in Sel d'Argent. That changes how you wear it.",
          "One or two sprays are enough. Aim at the base of the neck and the inside of the wrist, about fifteen centimetres away, so the perfume lands as a fine mist and not as a drop.",
          "Do not rub your wrists. The heat from rubbing speeds up the top notes and you miss the bergamot and cardamom, which only last a quarter of an hour.",
          "Moisturised skin holds perfume better than dry skin. If you use a cream, choose an unscented one and apply it a few minutes before.",
          "Wool and cotton keep the base far longer than skin does. One spray on a scarf can still smell of oud and vanilla two or three days later. Avoid pale silk: the oils can leave a mark.",
          "Keep the bottle away from light and heat, ideally in its box. The smoked glass and the thick base protect the liquid, but a south-facing window in summer ages it within a few months.",
          "And before you open the 100 ml bottle, try the 2 ml sample that comes with your order. A full day on your skin says more than any description."
        ]
      }
    }
  ];
})();
