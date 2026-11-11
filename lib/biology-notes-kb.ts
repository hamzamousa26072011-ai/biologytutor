export interface NoteTopic {
  id: string;
  topicNumber: number;
  title: string;
  keywords: string[];
  summary: string;
  content: string;
}

export interface SampleExamQuestion {
  id: string;
  title: string;
  topic: string;
  questionPrompt: string;
  studentAnswerSample: string;
  markSchemeSample: string;
}

export const QUICK_ASK_QUESTIONS: string[] = [
  'Compare animal and plant cells and their organelles',
  'Explain osmosis in plant cells (turgid, flaccid, plasmolysed)',
  'How do enzymes work (lock & key) and how do temperature & pH affect them?',
  'Describe the food tests for starch, reducing sugars, proteins, fats & vitamin C',
  'How does cholera cause diarrhoea and how is it treated?',
  'Explain how a leaf is adapted for photosynthesis and gas exchange',
  'Compare xylem vessels and phloem tubes in plant transport',
  'Why is the left ventricle wall thicker than the right ventricle?',
  'Explain active vs passive immunity and how vaccination works',
  'Compare aerobic and anaerobic respiration and explain oxygen debt',
  'Describe ultrafiltration and selective reabsorption in the nephron',
  'Explain the reflex arc and transmission across a synapse',
  'How does the eye accommodate for near and distant objects?',
  'Explain negative feedback in body temperature and blood glucose regulation',
  'Describe the roles of FSH, LH, oestrogen, and progesterone in the menstrual cycle',
  'Compare mitosis and meiosis and explain codominance & sex-linked inheritance',
  'How is human insulin produced by genetic engineering using bacteria?',
  'Explain eutrophication and the stages of the nitrogen cycle',
];

export const SAMPLE_EXAM_QUESTIONS: SampleExamQuestion[] = [
  {
    id: 'sample-osmosis-cells',
    title: 'Q1: Plant Cell Osmosis & Active Transport (0610 Paper 4)',
    topic: 'Topic 3: Movement In and Out of Cells',
    questionPrompt:
      'A student placed a strip of potato tissue into a concentrated sugar solution for 30 minutes.\n(a) Explain what happens to the cells of the potato tissue in this concentrated solution. [3]\n(b) Nitrate ions are absorbed by root hair cells from dilute soil solutions. Name this process and explain why root hair cells contain many mitochondria. [3]',
    studentAnswerSample:
      '(a) Water leaves the potato cells by osmosis because the sugar solution has a lower water potential than the cell sap. The cytoplasm and vacuole shrink and the cell becomes flaccid, though the cell wall bursts.\n(b) Active transport. Root hair cells have many mitochondria to carry out aerobic respiration to release energy needed to move nitrate ions against the concentration gradient.',
    markSchemeSample:
      '(a)\n[B1] Water moves out of the cell by osmosis through a partially permeable membrane;\n[B1] From a region of higher water potential (inside cell) to lower water potential (concentrated sugar solution);\n[B1] Cytoplasm/vacuole shrinks and cell membrane pulls away from cell wall (cell becomes flaccid / plasmolysed); (CON: cell wall bursts cancels this mark as cell wall is strong and prevents bursting)\n(b)\n[B1] Active transport;\n[B1] Mitochondria release energy by aerobic respiration;\n[B1] To move ions against a concentration gradient (from low to high concentration) through carrier proteins;',
  },
  {
    id: 'sample-ecg-unit-rule',
    title: 'Q2: ECG Heart Rate Calculation & Left Ventricle (Unit Rule Test)',
    topic: 'Topic 8: Animal Transport',
    questionPrompt:
      '(a) An ECG trace runs at 25 mm/sec. There are 20 small (1 mm) squares between two QRS complexes. Using the formula Heart Rate = 1500 / number of small squares, calculate the heart rate.\nAnswer line: ........................... beats / min [2]\n(b) Explain why the wall of the left ventricle is thicker than the wall of the right ventricle. [2]',
    studentAnswerSample:
      '(a) 1500 / 20 = 75\n(b) Because the left ventricle has to pump blood all around the whole body at high pressure, whereas the right ventricle only pumps blood a short distance to the lungs.',
    markSchemeSample:
      '(a)\n[M1] 1500 / 20;\n[A1] 75; (Note: unit "beats / min" is already printed on the answer line — award full accuracy mark for numerical value 75 without unit)\n(b)\n[B1] Left ventricle has stronger/more muscular wall to contract with greater pressure;\n[B1] To pump blood a longer distance to the whole body, while right ventricle pumps blood only to the lungs;',
  },
  {
    id: 'sample-genetic-engineering',
    title: 'Q3: Recombinant DNA & Human Insulin Production (0610 Paper 4)',
    topic: 'Topic 17: Biotechnology & Genetic Engineering',
    questionPrompt:
      'Describe how human insulin is produced using genetically engineered bacteria. [5]',
    studentAnswerSample:
      'The human insulin gene is cut from a human chromosome using a restriction enzyme. A bacterial plasmid is cut open using a different enzyme. They are joined together to make recombinant DNA, put into bacteria, and grown in a fermenter so the bacteria make human insulin.',
    markSchemeSample:
      '[B1] Insulin gene is cut from human chromosome using a restriction endonuclease enzyme, leaving sticky ends;\n[B1] Plasmid (vector) from bacteria is cut open using the SAME restriction endonuclease enzyme to leave complementary sticky ends;\n[B1] DNA ligase enzyme is used to join the insulin gene and plasmid together to form recombinant DNA;\n[B1] Recombinant plasmid is re-inserted into host bacterial cell;\n[B1] Bacteria are cultured in a fermenter with nutrients, optimum pH and temperature, reproducing by binary fission to produce human insulin;',
  },
];

export const BIOLOGY_SYLLABUS_NOTES: NoteTopic[] = [
  {
    id: 'topic-2-cells',
    topicNumber: 2,
    title: 'Topic 2: Cells, Organelles, Specialised Cells & Levels of Organisation',
    keywords: [
      'cell', 'cells', 'tissue', 'tissues', 'organ', 'organs', 'organ system', 'organism',
      'mrs gren', 'nutrition', 'respiration', 'excretion', 'growth', 'sensitivity', 'reproduction', 'movement',
      'cell wall', 'cell membrane', 'cytoplasm', 'nucleus', 'chloroplast', 'vacuole', 'mitochondria', 'ribosomes',
      'vesicles', 'starch grains', 'glycogen granules', 'palisade', 'root hair', 'xylem', 'ciliated', 'goblet',
      'red blood cell', 'muscle cell', 'nerve cell', 'sperm cell', 'egg cell', 'haemoglobin', 'biconcave'
    ],
    summary: 'Levels of organisation (MRS GREN), animal vs plant cell comparison, organelle functions, and adaptations of specialised plant and animal cells.',
    content: `### 1A. Levels of Organisation
• **Level 1 - Cells**: Basic unit of structure and function in living things. Contain organelles. Examples: blood cells, nerve cells, bone cells.
• **Level 2 - Tissues**: Made up of cells that are similar in structure and function and work together to perform a specific function. Examples: xylem tissue (water transport), palisade tissue (photosynthesis), muscle tissue in stomach wall (contracts to churn food), blood tissue (RBCs carry oxygen, WBCs destroy harmful bacteria).
• **Level 3 - Organs**: Made up of different tissues working together to perform a specific function or group of functions. Examples: heart, brain, skin, stomach, kidney, lungs in animals; leaf in plants (manufactures carbohydrates by photosynthesis).
• **Level 4 - Organ Systems**: A group of organs carrying out separate functions that combine to achieve a major process. Examples: circulatory system, nervous system, skeletal system; flower in plants (reproductive system formed of sepals, petals, stamen & carpels).
• **Level 5 - Organisms**: Entire living things that carry out all 7 basic life processes (**MRS. GREN**):
  1. **M**ovement: Move
  2. **R**espiration: Release energy from food
  3. **S**ensitivity: Respond to the environment
  4. **G**rowth: Grow (permanent increase in cell number/size and dry mass)
  5. **R**eproduction: Reproduce
  6. **E**xcretion: Release metabolic wastes
  7. **N**utrition: Take in materials for energy, growth and development
• **Order of Organisation**: \`cells --> tissues --> organs --> organ systems --> organisms\` (e.g., Cardiac muscle cell -> Cardiac muscle tissue -> Heart organ -> Circulatory system -> Human).

### 1B. Comparison of Animal and Plant Cells
• **Both Animal and Plant Cells have**:
  1. **Cell membrane**: Very thin layer of protein and fat; partially permeable; controls movement of substances in and out of the cell.
  2. **Cytoplasm**: Jelly made of ~70% water containing dissolved proteins; site where metabolic reactions (chemical reactions for life) take place.
  3. **Nucleus**: Contains genetic material (DNA making up genes on chromosomes); controls all cell activities and characteristics.
  4. **Mitochondria**: Found in almost all cells except prokaryotes; powerhouse of the cell where oxygen is used to release energy from glucose by aerobic respiration.
  5. **Ribosomes**: Tiny dots attached to rough endoplasmic reticulum; site where amino acids are joined together to form proteins (polypeptides).
• **Plant Cells ONLY have**:
  1. **Cell wall**: Made of cellulose; freely permeable; gives the plant cell strength, support, and protection (stops the cell bursting when it absorbs water and swells).
  2. **Chloroplasts**: Found in green parts (e.g., leaf palisade/spongy cells, guard cells, NOT root cells); contain green pigment **chlorophyll** that absorbs sunlight for photosynthesis.
  3. **Large permanent vacuole**: Surrounded by a membrane, containing solution of salts and sugars called **cell sap** which keeps the cell **turgid** (presses outwards on the rest of the cell to keep its shape).
  4. **Starch grains**: Carbohydrate storage inside chloroplast or cytoplasm.
  5. **Regular shape**.
• **Animal Cells features**:
  1. **Small temporary vacuoles (vesicles)**: Membrane-bound spaces containing food or water.
  2. **Glycogen granules**: Tiny grains in cytoplasm as the form of carbohydrate storage instead of starch.
  3. **Often irregular in shape**.

### 2. Specialised Cells and Their Adaptations
• **Palisade mesophyll cell** (below upper epidermis of leaf): Packed with chloroplasts; regular column-shaped, closely packed to form a continuous layer for efficient absorption of sunlight for photosynthesis.
• **Root hair cell** (near ends of plant roots):
  1. Long **finger-like projection** with very thin wall to increase surface area for faster water and mineral ion intake.
  2. Large number of **mitochondria** to release energy from glucose during aerobic respiration for **active transport** of mineral ions.
  3. Concentrated vacuole to help absorb water by **osmosis**.
  4. Covered with sticky material to slide easily between soil particles.
• **Xylem vessels** (in stem, roots, and leaves):
  1. **Transport**: Made of dead cells with no nucleus and no cytoplasm so water and mineral ions can pass freely; no end walls so many cells form a continuous hollow tube running from roots through stem to leaves.
  2. **Support**: Thick cell walls containing **lignin** (waterproof) which resists bending strains by wind.
• **Ciliated and Goblet cells** (lining trachea, bronchi, and oviduct): Goblet cells secrete sticky **mucus** that traps dust and bacteria. Ciliated cells have thin hair-like projections (**cilia**) that beat to sweep mucus out of the lungs up to the back of the throat to be swallowed and killed by stomach acid.
• **Red blood cell** (in mammal blood):
  1. Cytoplasm filled with **haemoglobin** (iron-containing protein) to carry oxygen from lungs to body tissues.
  2. **Biconcave disc shape** increases surface area to speed up diffusion of oxygen in and out.
  3. **No nucleus**, leaving more space for haemoglobin.
  4. **Flexible and small size** so it can squeeze through narrowest capillaries.
• **Muscle cell**: Long and thin; contains **protein fibres** in cytoplasm that shorten (contract) when energy is available; many **mitochondria** to release energy for contraction.
• **Nerve cell (neurone)**: Long fibre called an **axon** along which electrical impulses travel; **fatty myelin sheath** gives electrical insulation; many-branched endings (**dendrites**) connect with many other cells.
• **Sperm cell** (male gamete, produced in testes in huge numbers ~300 million per ejaculation):
  1. **Head**: Streamlined shape for faster swimming; haploid nucleus carrying genetic material; **acrosome** vesicle produces enzymes to digest and penetrate the egg cell membrane/jelly coat; no cytoplasm.
  2. **Middle piece**: Full of **mitochondria** to release energy for movement.
  3. **Tail (flagellum)**: Beats to swim (motile).
• **Egg cell (ovum)** (female gamete, produced in ovaries one per month): Non-motile (moved by cilia and peristalsis in oviduct); large cytoplasm containing **yolk (food store)** for early embryo development; haploid nucleus; **jelly coat** that changes after fertilisation so only one sperm nucleus can enter.`
  },
  {
    id: 'topic-3-movement',
    topicNumber: 3,
    title: 'Topic 3: Movement In and Out of Cells (Diffusion, Osmosis & Active Transport)',
    keywords: [
      'diffusion', 'osmosis', 'active transport', 'concentration gradient', 'water potential',
      'partially permeable', 'turgid', 'flaccid', 'plasmolysed', 'plasmolysis', 'crenated',
      'haemolysis', 'carrier protein', 'kinetic energy'
    ],
    summary: 'Definitions, mechanisms, and biological importance of diffusion, osmosis in plant and animal cells, and active transport.',
    content: `### 1. Diffusion (Passive Transport — No Energy Needed)
• **Definition**: The net movement of molecules and ions from a region of their **higher concentration** to a region of their **lower concentration down a concentration gradient**, as a result of their **random movement** (kinetic energy).
• **Factors Affecting Rate of Diffusion**:
  1. **Steepness of concentration gradient**: Steeper gradient = faster diffusion.
  2. **Surface area of exchange membrane**: Larger surface area (e.g., villi and microvilli in small intestine, folded placenta, alveoli) = faster diffusion.
  3. **Thickness of membrane (diffusion distance)**: Thinner membrane (e.g., one-cell-thick alveoli and capillary walls) = faster diffusion.
  4. **Temperature**: Higher temperature gives particles more **kinetic energy**, moving faster and increasing diffusion rate.
  5. **Maintenance of concentration gradient**: Circulating blood quickly removes absorbed glucose or oxygen so equilibrium is not reached.
  6. **Size of molecule**: Smaller molecules diffuse faster (large protein molecules cannot diffuse across cell membranes).
• **Importance of Diffusion**:
  - **In plants**: CO2 diffuses in and O2 diffuses out through stomata during photosynthesis.
  - **In animals & plants**: Gas exchange (O2 and CO2) for respiration across cell membranes and between alveoli and blood.
  - **In animals**: Absorption of some digested food products from ileum (through villi) into blood.

### 2. Osmosis (Passive Transport — No Energy Needed)
• **Definition**: The diffusion of **water molecules** from a region of **higher water potential** (dilute solution) to a region of **lower water potential** (concentrated solution), through a **partially permeable membrane**.
• **Plant Cells and Osmosis**:
  - **In higher water potential (dilute solution / pure water)**: Water enters the cell by osmosis through the partially permeable cell membrane -> cytoplasm and vacuole swell -> push hard against the strong cellulose cell wall -> cell becomes firm and **turgid** (needed for support to keep stems upright and leaves flat). The strong cell wall prevents the plant cell from bursting.
  - **In equal water potential**: No net movement of water (equilibrium).
  - **In lower water potential (concentrated solution)**: Water leaves the cell by osmosis -> cytoplasm shrinks and stops pushing on the cell wall -> cell becomes **flaccid** and the plant wilts.
  - **In very concentrated solution (Plasmolysis)**: A lot of water diffuses out -> cytoplasm and vacuole keep shrinking -> the cell membrane **pulls (tears) away from the cell wall** -> the cell is **plasmolysed**.
• **Animal Cells and Osmosis** (No cell wall, only a cell membrane):
  - **In higher water potential (dilute solution)**: Cell takes in water by osmosis, swells, and the cell membrane **bursts (haemolysis in RBCs)** because there is no cell wall to resist the increased internal pressure.
  - **In lower water potential (concentrated solution)**: Cell loses water by osmosis, shrinks, and the cell membrane becomes unevenly creased (**crenated**).
  - Therefore, mammals use the kidneys for **osmoregulation** to keep blood plasma at the same water potential as cell cytoplasm.

### 3. Active Transport (Requires Energy from Respiration)
• **Definition**: The movement of molecules and ions in or out of a cell through the cell membrane **against a concentration gradient** (from low to high concentration), using **energy from respiration** and **protein carriers** in the cell membrane.
• **Mechanism**:
  1. Molecule/ion (e.g., glucose or nitrate ion) enters the **carrier protein** in the cell membrane.
  2. The carrier protein **changes its shape** using energy provided by **respiration** in mitochondria.
  3. The carrier protein pushes the molecule/ion into (or out of) the cell against the concentration gradient.
• **Importance of Active Transport**:
  - **In plants**: Absorption of **nitrate ions** and **magnesium ions** (minerals) from dilute soil water by root hair cells.
  - **In animals**: Absorption of **glucose** from the lumen of the small intestine into villi epithelial cells, and selective reabsorption of glucose from kidney nephron tubules back into the blood.`
  },
  {
    id: 'topic-4-enzymes',
    topicNumber: 4,
    title: 'Topic 4: Enzymes (Mechanism, Properties & Limiting Factors)',
    keywords: [
      'enzyme', 'enzymes', 'catalyst', 'substrate', 'active site', 'lock and key',
      'enzyme-substrate complex', 'catabolic', 'anabolic', 'intracellular', 'extracellular',
      'denatured', 'denaturation', 'optimum temperature', 'optimum ph', 'pepsin', 'amylase',
      'catalase', 'limiting factor', 'activation energy'
    ],
    summary: 'Biological catalysts, lock and key mechanism, catabolic vs anabolic reactions, intracellular vs extracellular enzymes, and effects of temperature, pH, and concentration.',
    content: `### 1. Definitions & How Enzymes Work
• **Catalyst**: A substance that increases the rate of a chemical reaction without itself being changed or used up by the reaction.
• **Enzyme**: **Protein molecules** that function as **biological catalysts** without being changed, and are **specific** in their function (they lower the activation energy needed for metabolic reactions).
• **Substrate**: The substance acted upon by an enzyme at the beginning of the reaction to produce a **product**. The substrate has a **complementary shape** to the enzyme's **active site**.
• **Lock & Key Mechanism**:
  1. Each enzyme has a specific **active site** (the "lock") into which only one specific **substrate** (the "key") fits due to complementary shapes.
  2. They bind together to form an **enzyme-substrate complex**.
  3. The reaction occurs and **products** leave the active site, leaving the enzyme unchanged and ready to catalyse another reaction.
• **Types of Metabolic Reactions**:
  - **Catabolic reactions (Breaking down)**: Usually release energy. Examples: Respiration; Digestion (Starch -> Maltose by **amylase**; Proteins -> Amino acids by **protease**; Lipids -> Fatty acids & glycerol by **lipase**; Harmful hydrogen peroxide -> water + oxygen in liver cells by **catalase**).
  - **Anabolic reactions (Building up)**: Usually require energy. Examples: Photosynthesis; building glycogen from glucose in liver/muscles; building cellulose in plant cell walls; building starch from glucose in plants (by **starch phosphorylase**).
• **Intracellular vs Extracellular Enzymes**:
  - **Intracellular**: Made and work inside cells (e.g., catalase in liver cells, starch phosphorylase in plant storage cells).
  - **Extracellular**: Made inside cells and secreted outside to perform their function (e.g., digestive enzymes like amylase, pepsin, trypsin, lipase).

### 2. Factors Affecting Enzyme Activity
• **1. Temperature**:
  - As temperature increases up to the **optimum temperature**, molecules gain **kinetic energy** and move faster, causing **more frequent successful collisions** between enzymes and substrates, increasing reaction rate.
  - **Optimum temperatures**: Humans ~**37 °C**; Plants ~**28 °C to 30 °C**; Hot spring bacteria ~**75 °C**.
  - **Above optimum temperature**: High heat vibrations break bonds holding the protein structure -> the enzyme **loses the shape of its active site** -> substrate is no longer complementary and cannot fit -> the enzyme is **denatured**. **Denaturation is always irreversible**.
• **2. pH**:
  - Each enzyme has an **optimum pH** where it works fastest: **Pepsin** (protease in stomach) = **pH 2** (very acidic); **Amylase** (mouth/small intestine) = **pH 7.5** (slightly alkaline).
  - A pH very different from the optimum alters the shape of the active site and causes **denaturation**.
• **3. Substrate & Enzyme Concentration (Limiting Factors)**:
  - **Limiting factor**: The factor that limits the reaction rate in any physiological process controlled by multiple variables.
  - Increasing substrate concentration increases collision frequency and rate until all enzyme active sites are **saturated** (enzyme concentration becomes the limiting factor).`
  },
  {
    id: 'topic-5-nutrition-dna-digestion',
    topicNumber: 5,
    title: 'Topic 5: Nutrition, Biological Molecules, DNA, Food Tests & Human Digestion',
    keywords: [
      'carbohydrates', 'monosaccharide', 'disaccharide', 'polysaccharide', 'glucose', 'maltose',
      'glycogen', 'starch', 'cellulose', 'proteins', 'amino acids', 'fats', 'lipids', 'glycerol', 'fatty acids',
      'dna', 'nucleotides', 'adenine', 'thymine', 'cytosine', 'guanine', 'double helix', 'mrna', 'uracil',
      'transcription', 'translation', 'ribosome', 'trna', 'triplet', 'gene',
      'vitamin c', 'scurvy', 'vitamin d', 'rickets', 'osteomalacia', 'iron', 'anaemia', 'calcium', 'fibre', 'peristalsis',
      'iodine', 'benedict', 'biuret', 'ethanol emulsion', 'dcpip',
      'kwashiorkor', 'marasmus', 'obesity', 'chd',
      'ingestion', 'digestion', 'absorption', 'assimilation', 'egestion',
      'mouth', 'oesophagus', 'stomach', 'duodenum', 'ileum', 'villi', 'microvilli', 'lacteal', 'colon', 'rectum',
      'bile', 'emulsification', 'pancreatic juice', 'pepsin', 'trypsin', 'maltase', 'peptidase',
      'cholera', 'diarrhoea', 'oral rehydration therapy', 'chloride ions', 'liver', 'deamination', 'urea',
      'teeth', 'incisor', 'canine', 'premolar', 'molar', 'enamel', 'dentine', 'pulp', 'cement', 'plaque', 'tartar'
    ],
    summary: 'Carbohydrates, proteins, lipids, DNA & protein synthesis (transcription/translation), vitamins/minerals, food tests, malnutrition, human alimentary canal, cholera, liver functions, and teeth.',
    content: `### 1. Main Organic Nutrients
• **1. Carbohydrates (Elements: C, H, O)**:
  - **Monosaccharides**: Glucose (soluble, sweet, provides **17 kJ/g** energy in respiration).
  - **Disaccharides**: Maltose, sucrose, lactose (soluble).
  - **Polysaccharides**: Insoluble. **Glycogen** (storage in human liver and muscles); **Starch** (storage in plant seeds/tubers); **Cellulose** (forms plant cell walls, dietary fibre in humans).
• **2. Proteins (Elements: C, H, O, N and sometimes S)**:
  - Made of long chains of **amino acids** (20 different types; a typical protein is ~400 amino acids long).
  - The **sequence of amino acids** (coded by genes) determines how the chain curls into a **3D shape**, which determines its function (e.g., active site of an enzyme, binding site of an antibody).
  - **Functions**: Growth and repair of cells; making enzymes, hormones (insulin), antibodies, haemoglobin, cell membrane carrier proteins, and keratin.
  - **Excess amino acids**: Cannot be stored; **deaminated in the liver** and excreted as **urea**.
• **3. Fats / Lipids (Elements: C, H, O)**:
  - Made of **1 glycerol + 3 fatty acids**; water insoluble.
  - **Functions**: Energy store (**39 kJ/g**); thermal insulation (adipose tissue beneath skin); electrical insulation (myelin sheath around nerve cells); protects vital organs (heart/kidneys); forms part of cell membranes; cholesterol makes sex hormones.
  - Excess saturated animal fats & cholesterol cause **atherosclerosis** (plaque in coronary arteries), obesity, CHD, and high blood pressure.

### 2. Nucleic Acids (C, H, O, N, P), DNA Structure & Protein Synthesis
• **DNA (Deoxyribonucleic acid)**:
  - Made of **nucleotides**; each nucleotide has a **sugar-phosphate backbone** (deoxyribose sugar + phosphate) and a **nitrogenous base** (**A, T, C, or G**).
  - Forms a two-stranded ladder twisted into a **double helix**.
  - **Complementary Base Pairing**: **Adenine (A) always pairs with Thymine (T)**; **Guanine (G) always pairs with Cytosine (C)**.
  - **Gene**: A length of DNA (sequence of bases) that codes for a specific protein. Each **triplet** (3 bases) codes for **one specific amino acid**.
• **Protein Synthesis (Transcription & Translation)**:
  1. **Transcription (in the nucleus)**: The gene coding for the required protein untwists and unzips (H-bonds break). Free RNA nucleotides pair with one template strand of DNA to synthesize **messenger RNA (mRNA)**. **Important difference**: RNA never contains Thymine (T); instead it has **Uracil (U)**, so **A pairs with U**.
  2. **Movement**: mRNA leaves the nucleus through a pore in the nuclear membrane into the cytoplasm.
  3. **Translation (at ribosomes in cytoplasm)**: The mRNA attaches to a **ribosome**. As mRNA passes through the ribosome, **tRNA (transfer RNA)** brings free amino acids to the ribosome, linking them in the exact order specified by the mRNA base sequence to form the protein.

### 3. Vitamins, Minerals, Fibre, Water & Malnutrition
• **Vitamin C** (citrus fruits, tomatoes; water-soluble, destroyed by heat): Forms **collagen** in skin, bones, gums, and blood vessels. **Deficiency -> Scurvy** (bleeding gums, joint/muscle pain, poor wound healing).
• **Vitamin D** (butter, egg yolk, fish liver oil, sunlight; fat-soluble): Helps **calcium absorption** for bones and teeth. **Deficiency -> Rickets** in children (soft, bent bones) and **Osteomalacia** in adults (fragile bones).
• **Iron** (red meat, liver, spinach): Forms **haemoglobin** in RBCs for oxygen transport. **Deficiency -> Anaemia** (pale skin, shortness of breath, tiredness).
• **Calcium** (milk, cheese, bread): For bones, teeth, and **blood clotting**. **Deficiency -> Rickets, weak bones/teeth, poor blood clotting, muscle spasms**.
• **Fibre (roughage)**: Indigestible plant **cellulose** (cereals, vegetables); stimulates **peristalsis** (squeezes food along gut), preventing **constipation and colon cancer**.
• **Water** (70% of human body): Essential solvent for metabolic reactions, blood plasma transport, excretion of urea in urine, hydrolysis in digestion, and cooling by sweating.
• **Protein-Energy Malnutrition**:
  - **Kwashiorkor**: Diet too high in carbohydrates and almost no protein -> shrunken muscles, **swollen belly (oedema)**, and swollen liver.
  - **Marasmus**: Lack of both protein and energy food (starvation) -> all body tissues waste away, child becomes very thin with wrinkled skin.

### 4. Food Tests
• **Starch**: Add **Iodine solution** -> changes from yellow-brown to **blue-black** (Qualitative).
• **Reducing Sugars (e.g., glucose, maltose)**: Add **Benedict's reagent** and **heat in a boiling water bath** for 2–3 mins -> changes from **blue -> green -> yellow -> orange -> brick-red precipitate** (Quantitative: faster/redder = higher concentration).
• **Proteins**: Add **Biuret reagent** (equal volume dilute KOH + 2 drops CuSO4, shake gently) -> changes from blue to **mauve / purple / lilac** (Quantitative with colorimeter).
• **Fats & Oils (Ethanol Emulsion Test)**: Dissolve sample in **2 cm³ ethanol**, shake, then pour into a test tube of **cold water** -> forms a **cloudy milky-white emulsion** (Qualitative).
• **Vitamin C**: Add sample drop-by-drop into blue **DCPIP** solution -> **DCPIP loses its blue colour (becomes colourless)**. Fewer drops needed to decolourise DCPIP = higher Vitamin C concentration (Quantitative).

### 5. Human Alimentary Canal & Digestion
• **5 Key Processes**:
  1. **Ingestion**: Taking food and drink into the alimentary canal through the mouth.
  2. **Digestion**: Breakdown of large insoluble food molecules into small soluble molecules that can be absorbed into blood (**Mechanical**: teeth chewing, stomach churning, bile emulsification without chemical change to increase surface area; **Chemical**: hydrolysis of bonds by enzymes).
  3. **Absorption**: Movement of small soluble molecules and ions through the walls of the small intestine (**ileum**) into the blood or lymph.
  4. **Assimilation**: Movement of digested food molecules into body cells where they become part of the cell (e.g., amino acids used by muscles to make proteins).
  5. **Egestion**: Passing out of undigested, unabsorbed food as **faeces** through the anus.
• **Organs & Digestive Juices**:
  - **Mouth**: Teeth chew food; salivary glands secrete saliva containing **water**, **mucus** (lubricates into a **bolus**), and **salivary amylase** (digests starch -> maltose).
  - **Oesophagus**: Pushes bolus down to stomach by **peristalsis** (antagonistic contraction and relaxation of **circular** and **longitudinal** muscles).
  - **Stomach**: Muscular walls churn food into **chyme**. Gastric juice contains **Pepsin** (protease breaking proteins -> polypeptides, optimum pH 2) and **Hydrochloric acid (HCl)** (kills bacteria in food by denaturing their enzymes & provides acidic pH for pepsin). Goblet cells secrete protective mucus.
  - **Duodenum** (first part of small intestine): Receives:
    1. **Bile** (made in **liver**, stored in **gall bladder**, enters via bile duct): Contains **bile salts** (emulsify large fat globules into small droplets to increase surface area for lipase), **sodium hydrogen carbonate** (alkali that neutralises acidic chyme from pH 2 to ~pH 9), and **bile pigments** (from breakdown of old RBCs in liver, excreted in faeces).
    2. **Pancreatic juice** (from **pancreas** via pancreatic duct): Contains **pancreatic amylase** (starch -> maltose), **trypsin** (protease: proteins -> polypeptides), **lipase** (fats -> fatty acids + glycerol), and **sodium hydrogen carbonate** (neutralises acid).
  - **Ileum** (second part of small intestine — completes digestion & absorbs food):
    - **Enzymes on epithelial cell membranes of villi**: **Maltase** (maltose -> glucose), **Sucrase** (sucrose -> glucose + fructose), **Lactase** (lactose -> glucose + galactose), **Peptidase** (polypeptides -> amino acids), and **Lipase** (fats -> fatty acids + glycerol).
    - **Adaptations of Ileum & Villi**: Very long (5 m) and coiled with finger-like **villi** and **microvilli** (huge surface area); **one-cell-thick epithelium** (short diffusion distance); dense **network of blood capillaries** (absorbs glucose, amino acids, water, minerals, vitamins to **hepatic portal vein** -> liver); central **lacteal** (absorbs fatty acids and glycerol into lymphatic system); many **mitochondria** in epithelial cells (for active transport of glucose); **goblet cells** (secrete protective mucus).
  - **Large Intestine**: **Colon** reabsorbs remaining water and salts; **Rectum** stores faeces; **Anus** egests faeces.

### 6. Cholera & Diarrhoea
• **Diarrhoea**: Excessive loss of watery faeces (water and salts), leading to dehydration, drop in blood volume/pressure, and potential organ failure.
• **How Cholera Causes Diarrhoea**:
  1. **Cholera bacteria** are ingested (faecal-oral route via contaminated water/food) and multiply in the small intestine.
  2. Bacteria attach to the wall of the alimentary canal and release a **toxin**.
  3. The toxin stimulates the intestinal lining to secrete **chloride ions (Cl⁻)** into the lumen of the small intestine.
  4. This increases solute concentration in the lumen, **lowering the water potential** of the lumen fluid.
  5. **Water moves out of the blood into the lumen by osmosis**, producing large quantities of watery faeces.
• **Treatment**: **Oral Rehydration Therapy (ORT)** — a drink containing water with small, measured amounts of **salt and sugar (glucose)** dissolved in it to replace lost fluids and ions.

### 7. Liver Functions & Human Teeth
• **Liver Blood Supply**: Receives oxygenated blood via **hepatic artery**; receives nutrient-rich deoxygenated blood from gut via **hepatic portal vein**; blood leaves via **hepatic vein** to vena cava.
• **Functions of the Liver**:
  1. **Deamination**: Breaks down excess amino acids — nitrogen-containing amino group is converted to **urea** (excreted by kidneys), and remaining part is converted to glycogen/carbohydrate.
  2. **Detoxification**: Breaks down alcohol, drugs, and toxins.
  3. **Deactivation of hormones** after they finish their effect.
  4. **Destruction of old RBCs**: Stores iron and excretes haemoglobin remains as bile pigments.
  5. **Blood glucose regulation**: Converts excess glucose to **glycogen** (with **insulin**) or glycogen back to glucose (with **glucagon**).
  6. **Synthesis of plasma proteins** (e.g., fibrinogen for blood clotting) and **production of bile**.
  7. **Stores Vitamins A, B, D, E, K**, iron, and potassium.
• **Human Teeth (16 in each jaw = 32 total)**:
  - **Incisors** (4 per jaw, front): Chisel-shaped with sharp edge for **cutting and biting**.
  - **Canines** (2 per jaw): Pointed for **holding and tearing** food.
  - **Premolars** (4 per jaw) & **Molars** (6 per jaw, back): Broad with 2–3 or 4–5 cusps for **crushing, grinding, and chewing**.
  - **Tooth Structure**: **Enamel** (hardest tissue, non-living calcium salts, dissolved by bacterial acids); **Dentine** (harder than bone, has channels with living cytoplasm); **Pulp cavity** (blood vessels & pain nerve endings); **Cement** (covers root with fibres attaching tooth to jawbone).
  - **Tooth Decay**: Bacteria in **plaque** (food + bacteria + saliva mucus) feed on sugars and respire to produce **acid**, which dissolves calcium salts in **enamel**, then rapidly through **dentine** into the **pulp cavity** (causing severe toothache and abscess).`
  },
  {
    id: 'topic-6-plant-nutrition',
    topicNumber: 6,
    title: 'Topic 6: Plant Nutrition, Photosynthesis, Leaf Structure & Mineral Ions',
    keywords: [
      'photosynthesis', 'chlorophyll', 'carbon dioxide', 'word equation', 'balanced equation',
      'cuticle', 'upper epidermis', 'palisade mesophyll', 'spongy mesophyll', 'stomata', 'guard cells',
      'vascular bundle', 'nitrate', 'magnesium', 'glasshouse', 'greenhouse', 'eutrophication',
      'destarching', 'variegated leaf', 'soda lime', 'hydrogen carbonate', 'pondweed', 'gas syringe'
    ],
    summary: 'Photosynthesis equations, leaf cross-section adaptations, fate of glucose, limiting factors, glasshouse control, nitrate & magnesium ions, eutrophication, and practical starch/pondweed tests.',
    content: `### 1. Photosynthesis Equations & Process
• **Definition**: The process by which plants manufacture carbohydrates (organic substances) from raw materials (**carbon dioxide** and **water**) using **energy from light** trapped by **chlorophyll**.
• **Word Equation**: \`Carbon dioxide + Water --(Light energy / Chlorophyll)--> Glucose + Oxygen\`
• **Balanced Chemical Equation**: \`6CO2 + 6H2O -> C6H12O6 + 6O2\`
• **Process**: Chlorophyll in chloroplasts traps light energy and converts it into chemical energy. Light splits water into hydrogen and oxygen gas (released through stomata). Hydrogen reacts with CO2 (catalysed by enzymes) to form **glucose**.

### 2. Leaf Structure & Adaptations for Photosynthesis
• **Waxy Cuticle**: Waterproof layer that reduces water evaporation (transpiration) and prevents entry of pathogens; transparent to let light through.
• **Upper Epidermis**: Single layer of transparent cells with **no chloroplasts** to allow light directly through to the mesophyll layer; secretes waxy cuticle.
• **Palisade Mesophyll**: Tall, thin column-shaped cells arranged **end-on** (fewest cell walls for light to cross), tightly packed near the upper surface, and packed with **chloroplasts** to absorb maximum sunlight.
• **Spongy Mesophyll**: Rounded, loosely packed cells with **large air spaces** (saturated with water vapour) and thin water film on cell walls to allow rapid **diffusion of CO2 and O2** gases through the leaf.
• **Lower Epidermis, Stomata & Guard Cells**:
  - **Stomata**: Pores mostly on the lower epidermis allowing CO2 to diffuse in and O2 and water vapour to diffuse out.
  - **Guard Cells**: Pairs of cells containing chloroplasts that control stomatal opening. When the plant has plenty of water, guard cells become **turgid** and curve apart (inner cell wall is thicker and less elastic than outer wall), **opening the stoma**. When short of water, guard cells become **flaccid** and **close the stoma** to reduce transpiration.
• **Vascular Bundles (Veins)**: **Xylem vessels** bring water and mineral ions from roots; **Phloem tubes** translocate sucrose and amino acids away from the leaf.

### 3. Uses (Fate) of Glucose Produced in Photosynthesis
1. Used in **respiration** to release energy for metabolic processes and active transport.
2. Converted into **starch** for storage (starch is insoluble, so it does not affect the water potential of plant cells).
3. Converted into **cellulose** to build plant cell walls.
4. Converted into **sucrose** (soluble but less reactive than glucose) for **translocation** in phloem sap.
5. Combined with **nitrate ions** (nitrogen) to make **amino acids** and **proteins** for growth.
6. Converted into **lipids (oils)** for storage in seeds.
7. Used to make **nectar** (to attract pollinators) and **fruits** (for seed dispersal).

### 4. Limiting Factors, Glasshouses & Mineral Ions
• **Limiting Factors of Photosynthesis**:
  1. **Light intensity** (increases rate until CO2 or temperature becomes limiting).
  2. **Carbon dioxide concentration**.
  3. **Temperature** (affects photosynthesis enzymes; also in very hot weather stomata close to prevent water loss, restricting CO2 diffusion).
• **Glasshouses (Greenhouses)**: Control limiting factors for maximum crop yield using **thermostats/heaters**, **artificial lighting**, **shading**, **CO2 enrichment** (burning fuel or adding bicarbonate), **ventilation** (lowers temperature on hot days, lets CO2 in during day and O2 in at night, and reduces humidity to prevent fungal disease), and **fertilisers**.
• **Mineral Ions Needed by Plants** (absorbed by active transport in root hairs):
  - **Nitrate ions (NO3⁻)**: Source of **nitrogen** to combine with glucose to make **amino acids -> proteins** (enzymes, cytoplasm) and **DNA** for growth. **Deficiency**: Stunted/poor growth, thin stem, small **pale yellow leaves**.
  - **Magnesium ions (Mg²⁺)**: Needed to make **chlorophyll**. **Deficiency**: **Yellowing between the veins of leaves (chlorosis)**; plant cannot photosynthesise and dies.

### 5. Practical Investigations in Plant Nutrition
• **Testing a Leaf for Starch (Iodine Test)**:
  1. **Boil leaf in water (2 mins)**: Breaks down cell walls and partially permeable membranes, kills cytoplasm, and denatures enzymes to stop chemical reactions.
  2. **Heat leaf in ethanol (in a water bath — no naked flame as ethanol is flammable)**: Removes green **chlorophyll** pigment so colour change is clearly visible.
  3. **Dip leaf in warm water**: Softens the brittle leaf and allows iodine penetration.
  4. **Spread on white tile and add Iodine solution**: Turns **blue-black** where starch is present; stays yellow-brown where starch is absent.
• **Destarching**: Place plant in a dark cupboard for 48 hours so all stored starch is respired before starting experiments on light (black paper mask), CO2 (**soda lime / potassium hydroxide** absorbs CO2; **sodium hydrogen carbonate** releases CO2), or chlorophyll (**variegated leaf**).`
  },
  {
    id: 'topic-7-plant-transport',
    topicNumber: 7,
    title: 'Topic 7: Transport in Plants (Xylem, Phloem, Transpiration, Translocation & Adaptations)',
    keywords: [
      'xylem', 'phloem', 'vascular bundle', 'cambium', 'lignin', 'sieve tube', 'sieve plate',
      'companion cell', 'transpiration', 'transpiration pull', 'cohesion', 'adhesion',
      'potometer', 'cobalt chloride', 'translocation', 'source', 'sink', 'wilting',
      'hydrophytes', 'xerophytes', 'marram grass', 'sunken stomata', 'rolled leaves'
    ],
    summary: 'Xylem vs phloem structure, root/stem/leaf vascular bundle arrangement, transpiration pull & factors, potometer, translocation (sources & sinks), and hydrophyte/xerophyte adaptations.',
    content: `### 1. Xylem vs Phloem & Vascular Bundles
• **Xylem Vessels (Dead tissue)**:
  - **Functions**: Transport **water and dissolved mineral ions** unidirectional **upwards** from roots through stem to leaves; **support** the stem.
  - **Adaptations**: Made of **dead hollow cells** with no nucleus or cytoplasm; **no end walls** (continuous tube); thick cell walls strengthened with waterproof **lignin** to prevent collapse and resist wind strain; **pits** (thin unlignified areas) allow lateral water movement.
• **Phloem Tubes (Living tissue)**:
  - **Function**: **Translocation** — bidirectional transport of **sucrose and amino acids** dissolved in sap from **sources** to **sinks**.
  - **Adaptations**: Made of living **sieve tube elements** with thin cytoplasm layer but **no nucleus** so sugar flow is unimpeded; end walls perforated with pores forming **sieve plates**; adjacent **companion cells** have a nucleus and many mitochondria to carry out life processes and provide energy for active loading.
• **Positions of Vascular Bundles**:
  - **Root**: At the **centre** (star-shaped xylem with phloem between arms) to resist pulling forces.
  - **Stem**: Arranged in a **ring near the outside edge** (phloem outside, xylem inside, separated by cambium) to resist bending.
  - **Leaf**: In midrib and veins (**xylem on top**, **phloem on bottom**).

### 2. Water Uptake, Transpiration & Potometer
• **Pathway of Water**: Soil solution (high water potential) -> **Root hair cell** (by osmosis) -> **Root cortex cells** (by osmosis) -> **Xylem vessels** (pulled up stem by **transpiration pull**) -> **Mesophyll cells** in leaf (by osmosis) -> evaporates from spongy mesophyll surfaces into air spaces -> **diffuses out of stomata as water vapour**.
• **Transpiration**: The loss of water vapour from plant leaves by **evaporation of water at the surfaces of mesophyll cells** followed by **diffusion of water vapour through the stomata** down a water potential/concentration gradient.
• **Transpiration Pull**: Loss of water at leaves lowers hydrostatic pressure at the top of xylem vessels, pulling a continuous column of water upwards maintained by **cohesion** (attraction between water molecules) and **adhesion** (attraction of water molecules to xylem walls).
• **External Factors Affecting Transpiration Rate**:
  1. **Temperature (Higher -> Increases rate)**: More kinetic energy -> faster evaporation and faster diffusion out of stomata.
  2. **Humidity (Lower / Drier air -> Increases rate)**: Steeper water vapour concentration gradient between leaf air spaces and outside air.
  3. **Wind speed (Higher -> Increases rate)**: Blows water vapour away from leaf surface, maintaining a steep concentration gradient.
  4. **Light intensity (Higher -> Increases rate)**: Causes guard cells to open stomata wider for photosynthesis, allowing more water vapour to diffuse out.
• **Potometer**: Measures the **rate of water uptake** by a cut shoot (which closely estimates transpiration rate, though a small fraction of water is used in photosynthesis and maintaining turgidity). Must be assembled underwater and sealed with petroleum jelly to prevent airlocks; reservoir resets the air/water bubble to zero.
• **Cobalt Chloride Paper**: Turns from **blue (dry) to pink (wet)**; turns pink faster on the **lower epidermis** because it has more stomata.

### 3. Translocation (Sources and Sinks)
• **Source**: Region of production or release of sugar. **Sink**: Region of storage or utilisation in respiration/growth.
• **In Summer / Early Autumn**: **Leaves are the Source** (plenty of light -> photosynthesis -> glucose condensed to sucrose) and **Roots / Flowers / Fruits are Sinks** (roots store starch; fruits/growing tips use sugar for respiration and growth).
• **In Early Spring / Winter**: **Roots/Tubers are the Source** (stored starch broken down into sucrose) and **Growing Buds / New Leaves are the Sink** (need energy for growth before they can photosynthesise).

### 4. Plant Adaptations: Hydrophytes vs Xerophytes
• **Hydrophytes (Aquatic pond plants, e.g., water lily)**:
  1. **Large air spaces** in leaves and stems for buoyancy (floating) and gas diffusion.
  2. **Thin or no cuticle** (no need to conserve water).
  3. **Little/no lignin in xylem** (water supports the plant).
  4. **Stomata on the upper surface** of floating leaves to exchange gases with air.
  5. Small feathery roots.
• **Xerophytes (Desert plants, e.g., cactus, marram grass)**:
  1. **Leaves reduced to spines/needles**: Massively reduces surface area for transpiration.
  2. **Swollen succulent green stem**: Stores water and carries out photosynthesis.
  3. **Thick waxy cuticle**: Increases diffusion distance and prevents evaporation from epidermis.
  4. **Sunken stomata in grooves/pits** & **Leaf hairs (trichomes)** & **Rolled leaves** (marram grass): Trap a layer of moist air next to the stomata, reducing air movement and lowering the water vapour concentration gradient.
  5. **Deep roots** (to reach deep water table) or **wide shallow roots** (to absorb surface rainfall quickly before evaporation).`
  },
  {
    id: 'topic-8-animal-transport',
    topicNumber: 8,
    title: 'Topic 8: Animal Transport (Heart, Double Circulation, CHD, Blood Vessels & Blood)',
    keywords: [
      'heart', 'atria', 'atrium', 'ventricle', 'left ventricle', 'right ventricle', 'septum',
      'bicuspid', 'mitral', 'tricuspid', 'atrioventricular', 'semilunar', 'aorta', 'pulmonary artery',
      'pulmonary vein', 'vena cava', 'coronary arteries', 'coronary heart disease', 'chd',
      'atherosclerosis', 'double circulation', 'pulmonary circulation', 'systemic circulation',
      'systole', 'diastole', 'pacemaker', 'san', 'ecg', 'pulse',
      'arteries', 'veins', 'capillaries', 'plasma', 'lymphocytes', 'phagocytes', 'antibodies',
      'phagocytosis', 'platelets', 'clotting', 'fibrinogen', 'fibrin', 'thrombin'
    ],
    summary: 'Heart chambers, valves, septum, coronary arteries & CHD, double circulation, cardiac cycle, ECG calculation, arteries vs veins vs capillaries, and blood components/clotting.',
    content: `### 1. Structure and Function of the Heart
• **4 Chambers**: 2 upper thin-walled **Atria** (receive blood from veins) and 2 lower thick-walled **Ventricles** (pump blood out into arteries).
• **Why is the Left Ventricle wall thicker than the Right Ventricle wall?**
  - The **left ventricle** has a thicker, more muscular wall so it can contract with **greater force/pressure** to pump oxygenated blood a longer distance all around the **whole body** (systemic circulation), whereas the **right ventricle** has a thinner wall to pump deoxygenated blood at lower pressure only a short distance to the **lungs** (preventing damage to delicate lung capillaries).
• **Septum**: Muscular wall separating oxygenated blood on the left side from deoxygenated blood on the right side.
• **4 Valves** (prevent backflow of blood, ensuring one-way flow; attached to inner heart walls by **tendons** so they don't flip inside out):
  1. **Atrioventricular (Cuspid) Valves**: **Tricuspid valve** (between right atrium & right ventricle) and **Bicuspid / Mitral valve** (between left atrium & left ventricle). Close during ventricular systole ("**Lub**" sound).
  2. **Semilunar Valves**: **Pulmonary valve** (base of pulmonary artery) and **Aortic valve** (base of aorta). Close during ventricular diastole ("**Dub**" sound).
• **Cardiac Cycle**:
  - **Diastole**: Heart muscle relaxes; blood flows from veins into atria and trickles through open atrioventricular valves into ventricles (semilunar valves closed).
  - **Atrial Systole**: Atria contract to push blood into ventricles.
  - **Ventricular Systole**: Ventricles contract; high pressure closes atrioventricular valves and opens semilunar valves, forcing blood into the pulmonary artery and aorta.
• **Pacemaker (SAN in right atrium)**: Sends regular electrical impulses through heart muscle walls. During exercise, muscles respire faster -> produce more **CO2 (weak acid)** -> **lowers blood pH** -> detected by **brain receptors** -> sends more frequent nerve impulses to the pacemaker (and **adrenaline** hormone is secreted) -> increases **heart rate** and **stroke volume**.
• **Calculating Heart Rate from an ECG**:
  - ECG paper moves at **25 mm/sec** (1 small 1 mm square = 0.04 s; 1 large 5 mm square = 0.2 s).
  - \`Heart rate (beats/min) = (25 mm/s × 60 s/min) / number of small 1 mm squares between two QRS complexes = 1500 / number of small squares\`.

### 2. Coronary Arteries & Coronary Heart Disease (CHD)
• **Coronary Arteries**: Branch off the aorta to supply the thick cardiac muscle with **oxygen and glucose** for aerobic respiration (heart muscle is too thick for nutrients inside the chambers to diffuse to all muscle cells).
• **How CHD & Heart Attack Occur**:
  1. **Fatty deposits (cholesterol plaque)** build up inside coronary artery walls, hardening them (**atherosclerosis**).
  2. The **lumen narrows**, restricting blood flow and increasing blood pressure, or a **blood clot (thrombosis)** blocks the artery completely.
  3. Heart muscle cells receive **less oxygen and glucose**, so they cannot respire aerobically to release energy for contraction -> heart stops beating (**myocardial infarction / cardiac arrest**).
• **Risk Factors for CHD**: Smoking (nicotine), diet high in saturated fats/cholesterol/salt, obesity/lack of exercise, chronic stress, and genetic predisposition.

### 3. Double Circulation vs Single Circulation
• **Double Circulation (Mammals, Birds, Reptiles)**: Blood passes through the heart **twice** for each complete circuit of the body:
  1. **Pulmonary circulation**: Right ventricle -> Pulmonary artery (deoxygenated) -> Lungs -> Pulmonary vein (oxygenated) -> Left atrium.
  2. **Systemic circulation**: Left ventricle -> Aorta (oxygenated) -> Body organs -> Vena cava (deoxygenated) -> Right atrium.
• **Advantages of Double Circulation**:
  1. Blood loses pressure passing through lung capillaries, so returning to the heart boosts pressure again for fast delivery of oxygen to body tissues.
  2. Allows lower pressure to lungs so delicate lung capillaries are not damaged.
  3. Completely prevents mixing of oxygenated and deoxygenated blood.
• **Single Circulation (Fish)**: Heart (1 atrium, 1 ventricle) -> Gills -> Rest of body -> Heart (blood flows through heart once per circuit; pressure drops after gills).

### 4. Blood Vessels & Named Organ Vessels
• **Arteries**: Carry blood **away from heart** under **high pressure** (all carry oxygenated blood *except* **pulmonary artery** and umbilical artery). **Adaptations**: **Thick outer wall** with **thick layer of muscle and elastic fibres** (stretches and recoils with each pulse to maintain pressure); **narrow lumen**; **no valves**.
• **Capillaries**: Exchange materials (O2, CO2, glucose, urea, heat) between blood and tissue fluid. **Adaptations**: **One-cell-thick wall** with tiny **pores** (short diffusion distance and allows ultrafiltration/WBC exit); **very narrow lumen** (just wide enough for RBCs to pass single-file slowly); **huge branching network** (large surface area); **no valves**.
• **Veins**: Return blood **to the heart** under **low pressure** (all carry deoxygenated blood *except* **pulmonary vein** and umbilical vein). **Adaptations**: **Thin walls** (thin muscle/elastic layer); **wide lumen** (low resistance to flow); **semilunar valves** (prevent backflow, assisted by contraction of nearby skeletal muscles).
• **Key Named Vessels**: **Lungs** (Pulmonary artery / Pulmonary vein); **Liver** (Hepatic artery / Hepatic portal vein from gut / Hepatic vein); **Kidneys** (Renal artery / Renal vein).

### 5. Blood Components & Blood Clotting
• **Plasma (55% of blood)**: 90% water + 10% dissolved substances. Transports **blood cells**, **soluble nutrients** (glucose, amino acids, minerals, vitamins), **plasma proteins** (fibrinogen, antibodies), **hormones**, **waste products** (urea, CO2 as hydrogen carbonate ions), and **heat**.
• **Red Blood Cells**: Transport oxygen bound to haemoglobin as oxyhaemoglobin.
• **White Blood Cells** (have a nucleus, fight pathogens):
  1. **Phagocytes** (lobed nucleus): Leave capillaries at infection sites -> **engulf/ingest** bacteria by **phagocytosis** (forming pseudopodia around pathogen into a vacuole) -> secrete **digestive enzymes** to digest and destroy the pathogen.
  2. **Lymphocytes** (large round nucleus): Produce specific **antibodies** (glycoproteins) complementary to foreign **antigens** on pathogens.
• **Platelets & Blood Clotting**:
  1. When a blood vessel is cut and exposed to air, **platelets** release an enzyme (**thrombin** / clotting factors, requiring calcium ions and Vitamin K).
  2. **Thrombin** catalyses the conversion of soluble plasma protein **fibrinogen** into **insoluble fibrin fibres**.
  3. **Fibrin** forms a mesh/web that traps red blood cells and platelets, drying to form a **scab**.
  4. **Two Functions of a Clot/Scab**: Prevents **excess blood loss** and prevents **entry of pathogens (bacteria/viruses)**.`
  },
  {
    id: 'topic-9-immunity-disease',
    topicNumber: 9,
    title: 'Topic 9: Immunity, Pathogens, Disease Transmission, Vaccination & Type 1 Diabetes',
    keywords: [
      'pathogen', 'pathogens', 'antigen', 'antibody', 'antibodies', 'immune response',
      'memory cells', 'active immunity', 'passive immunity', 'vaccine', 'vaccination',
      'autoimmune', 'diabetes type 1', 'insulin', 'hyperglycemia', 'hypoglycemia',
      'mechanical barriers', 'chemical barriers', 'lysozyme', 'salmonella', 'malaria',
      'anopheles', 'plasmodium', 'tuberculosis', 'hiv', 'landfill', 'sewage'
    ],
    summary: 'Pathogens & transmission, food/personal hygiene, natural barriers, antigens & antibodies, primary vs secondary immune response, active vs passive immunity, vaccination, and Type 1 diabetes.',
    content: `### 1. Pathogens & Disease Transmission
• **Pathogen**: A disease-causing microorganism (Bacteria: cholera, TB, salmonella, tetanus, syphilis; Viruses: HIV, influenza, polio; Fungi: athlete's foot, ringworm; Protoctists: *Plasmodium* causing malaria via *Anopheles* mosquito vector).
• **First Line of Defence (Natural Barriers)**:
  - **Mechanical barriers**: **Skin** (thick outer layer of dead keratinised cells); **hairs in nostrils** (trap dust); **scabs** (blood clots).
  - **Chemical barriers**: **Stomach acid (HCl)** kills bacteria in food; **tears and saliva** contain **lysozyme** enzyme (destroys bacterial cell walls); **sticky mucus** in respiratory tract traps microbes (swept up by cilia); **ear wax** (bactericidal).

### 2. The Immune System (Second Line of Defence)
• **Antigen**: A foreign substance (surface protein/marker on a pathogen) that stimulates an immune response. Each pathogen has a specific antigen shape.
• **Antibody**: A specific **protein (glycoprotein)** produced by **lymphocytes** in response to a specific antigen; has a **complementary shape** that binds to the antigen.
• **How Antibodies Destroy Pathogens**:
  1. **Agglutination (clumping)**: Stick pathogens together so **phagocytes** can easily ingest and digest them.
  2. **Lysis**: Cause bacterial cell walls/membranes to burst.
  3. **Neutralise toxins** produced by bacteria.
  4. **Immobilisation**: Stop bacteria from moving (attach to flagella).
• **Memory Cells & Primary vs Secondary Response**:
  - **Primary response (first infection)**: Slow because very few lymphocytes are specific to the antigen; takes time for lymphocytes to recognise the antigen, divide by **mitosis** to form a clone, and secrete antibodies.
  - **Secondary response (second infection by same pathogen)**: **Much faster and produces a much higher concentration of antibodies** because long-lived **memory cells** remain in the blood and rapidly divide by mitosis to destroy the pathogen before symptoms appear.

### 3. Active vs Passive Immunity & Vaccination
• **Active Immunity (Long-term / Lifelong)**:
  - Gained when an **antigen** enters the body -> triggers an **immune response** -> body's own lymphocytes produce **antibodies** and **memory cells**.
  - **Natural Active**: Catching and recovering from an infection (e.g., cold/measles).
  - **Artificial Active (Vaccination)**: Injection of a **vaccine** containing **weakened or dead pathogens (or antigens)** -> stimulates lymphocytes to produce antibodies and **memory cells** without causing the disease. Booster doses stimulate a secondary response for long-lasting protection.
• **Passive Immunity (Short-term / Temporary)**:
  - Gained **without an immune response** — ready-made **antibodies** are transferred from another individual. **No memory cells are produced**, and the borrowed antibodies are eventually broken down.
  - **Natural Passive**: Maternal antibodies cross the **placenta** to the fetus or pass in **breast milk (colostrum)** to protect the newborn baby.
  - **Artificial Passive**: Injection of ready-made antibodies (antitoxin serum, e.g., anti-tetanus injection after a deep wound) for immediate protection.

### 4. Autoimmune Disease: Type 1 Diabetes
• **Cause**: Malfunction of the immune system where lymphocytes recognise the body's own **beta cells in the pancreas** as foreign (non-self) and produce antibodies that destroy them -> **insulin is no longer produced**.
• **Hyperglycemia** (high blood glucose): Excessive thirst, sweet-smelling breath, **glucose excreted in urine**, blurred vision.
• **Hypoglycemia** (low blood glucose when not eating): Tiredness, confusion, irrational behaviour (as liver has no glycogen stores).
• **Management**: Regular **insulin injections** (cannot be taken by mouth because insulin is a protein and would be digested by stomach protease enzymes), careful carbohydrate diet control, and monitoring blood glucose with a meter or urine dipstick.`
  },
  {
    id: 'topic-10-respiration-gas-exchange',
    topicNumber: 10,
    title: 'Topic 10: Respiration, Gas Exchange, Breathing & Effect of Exercise',
    keywords: [
      'respiration', 'aerobic respiration', 'anaerobic respiration', 'lactic acid',
      'oxygen debt', 'yeast', 'ethanol', 'bread', 'brewing', 'alveoli', 'alveolus',
      'trachea', 'cartilage', 'bronchi', 'bronchioles', 'diaphragm', 'intercostal muscles',
      'inhalation', 'exhalation', 'inspired air', 'expired air', 'respirometer', 'soda lime',
      'limewater', 'hydrogen carbonate indicator', 'spirometer'
    ],
    summary: 'Aerobic vs anaerobic respiration (yeast and human muscle), oxygen debt, human breathing system, inhalation vs exhalation, inspired vs expired air, exercise recovery, and respirometer experiments.',
    content: `### 1. Aerobic vs Anaerobic Respiration
• **Uses of Energy Released in Respiration**: Muscle contraction (movement), active transport, protein synthesis (growth/repair), cell division (mitosis), nerve impulse transmission, and maintenance of constant body temperature (37 °C).
• **Aerobic Respiration (in Mitochondria)**:
  - Complete breakdown of glucose in the **presence of oxygen** to release a **large amount of energy**.
  - **Word Equation**: \`Glucose + Oxygen -> Carbon dioxide + Water (+ large energy)\`
  - **Balanced Equation**: \`C6H12O6 + 6O2 -> 6CO2 + 6H2O\`
• **Anaerobic Respiration (in Cytoplasm — No Oxygen)**:
  - Incomplete breakdown of glucose in the **absence of oxygen**, releasing a **much smaller amount of energy** per glucose molecule.
  - **1. In Yeast & Plants (Alcoholic Fermentation)**:
    - **Word Equation**: \`Glucose -> Carbon dioxide + Ethanol (+ small energy)\`
    - **Balanced Equation**: \`C6H12O6 -> 2CO2 + 2C2H5OH\`
    - Used in **bread-making** (CO2 bubbles make dough rise; ethanol evaporates during baking) and **brewing** (ethanol makes beer/wine alcoholic; CO2 makes beer fizzy).
  - **2. In Human Muscle Cells (During vigorous exercise)**:
    - **Word Equation**: \`Glucose -> Lactic acid (+ small energy)\`
    - **Balanced Equation**: \`C6H12O6 -> 2C3H6O3\` (Note: **NO carbon dioxide** is produced in animal anaerobic respiration).
• **Lactic Acid & Oxygen Debt**:
  - Lactic acid is toxic and lowers pH in muscles, causing muscle fatigue/cramps.
  - **Oxygen Debt**: The extra amount of oxygen required after exercise to oxidise (break down) accumulated lactic acid.
  - **How Lactic Acid is Removed during Recovery**:
    1. **Heart rate stays high** to rapidly transport **lactic acid** in the blood from muscles to the **liver**, and to transport oxygen to the liver.
    2. **Breathing rate and depth stay high** (panting) to supply extra oxygen to repay the **oxygen debt**.
    3. In the **liver**, lactic acid is **oxidised by aerobic respiration** into carbon dioxide and water (\`Lactic acid + Oxygen -> CO2 + H2O\`).

### 2. Human Gas Exchange System & Breathing Mechanism
• **Key Structures**:
  - **Trachea & Bronchi**: Supported by **rings of cartilage** to keep airways open and prevent collapse when air pressure drops during inhalation; lined with **goblet cells** (secrete mucus) and **ciliated cells** (beat to sweep trapped dust/bacteria up to the throat).
  - **Alveoli (Air Sacs — Site of Gas Exchange)**: Adapted by having **one-cell-thick walls** (short diffusion distance), **huge total surface area** (millions of alveoli), **moist inner surface** (dissolves gases for diffusion), **dense network of blood capillaries** (maintains steep concentration gradient), and **good ventilation**.
• **Breathing (Ventilation) Mechanism**:
  - **Inhalation (Inspiration)**:
    1. **External intercostal muscles contract** and **internal intercostal muscles relax** -> pulls ribcage **upwards and outwards**.
    2. **Diaphragm muscles contract** -> diaphragm flattens (moves **downwards**).
    3. **Volume of thoracic cavity increases** -> **pressure inside lungs decreases** below atmospheric pressure -> air is forced **into** the lungs.
  - **Exhalation (Expiration)**:
    1. **External intercostal muscles relax** and **internal intercostal muscles contract** (during forced exhalation) -> ribcage moves **downwards and inwards**.
    2. **Diaphragm muscles relax** -> diaphragm returns to **upward dome shape**.
    3. **Volume of thoracic cavity decreases** -> **pressure inside lungs increases** above atmospheric pressure -> air is forced **out** of the lungs.
• **Composition of Inspired vs Expired Air**:
  - **Oxygen**: **21%** (inspired) vs **16%** (expired) — absorbed into blood across alveoli and used in aerobic respiration.
  - **Carbon dioxide**: **0.04%** (inspired) vs **4%** (expired) — produced by respiring cells and diffuses out of alveoli.
  - **Nitrogen**: **78%** (inspired) vs **78%** (expired) — insoluble and not used by body.
  - **Water vapour**: Variable (inspired) vs **Saturated / Always high** (expired) — evaporates from moist alveoli surfaces.
  - **Temperature**: Variable (inspired) vs **Warm (~37 °C)** (expired) — warmed by blood and metabolic heat.

### 3. Practical Respiration Experiments
• **Germinating Peas in Vacuum Flasks**: Live germinating peas release heat during respiration (temperature rises). Boiled peas act as control; **dilute disinfectant** kills surface bacteria/fungi so they don't produce heat; **cotton wool plug** allows gas exchange while preventing heat loss; flask left upside down because CO2 is a dense/heavy gas.
• **Respirometer**: Measures oxygen uptake by small organisms (e.g., woodlice/germinating seeds). **Soda lime (KOH)** absorbs CO2 produced, so gas volume decreases as O2 is consumed, pulling the **coloured oil droplet** towards the container along the graduated capillary scale.
• **CO2 Indicators**: **Limewater** turns from **clear to cloudy/milky** in CO2; **Hydrogen carbonate indicator** turns from **red/orange to yellow** in increased CO2 (acidic).`
  },
  {
    id: 'topic-11-excretion-kidney',
    topicNumber: 11,
    title: 'Topic 11: Excretion in Humans (Urea Formation, Kidney, Nephron & Osmoregulation)',
    keywords: [
      'excretion', 'urea', 'deamination', 'kidney', 'ureter', 'bladder', 'urethra', 'sphincter',
      'cortex', 'medulla', 'pelvis', 'nephron', 'glomerulus', 'bowman capsule', 'ultrafiltration',
      'selective reabsorption', 'coiled tubule', 'loop of henle', 'collecting duct',
      'osmoregulation', 'adh'
    ],
    summary: 'Excretory organs and waste products, deamination in the liver, kidney and nephron structure, ultrafiltration, selective reabsorption, and osmoregulation.',
    content: `### 1. Excretion & Urea Formation
• **Definition of Excretion**: The removal from organisms of **toxic materials**, the **waste products of metabolic reactions**, and **substances in excess of requirements** (Note: Egestion of faeces is NOT excretion because undigested cellulose has never entered cells or taken part in metabolic reactions).
• **Excretory Organs & Products**:
  1. **Lungs**: Excrete **carbon dioxide** and water vapour (from aerobic respiration) during exhalation.
  2. **Kidneys**: Excrete **urea**, **excess water**, and **excess salts/ions** in **urine**.
  3. **Skin**: Excretes **sweat** (water, salts, trace urea).
• **Deamination (in the Liver)**:
  - Excess amino acids cannot be stored in the body.
  - In the **liver**, the **nitrogen-containing amino group** is removed from excess amino acids and converted into **urea**, which enters the blood (via the hepatic vein) and is transported to the kidneys for excretion.
  - The remaining carbohydrate/energy part is converted into **glycogen** and stored in the liver.

### 2. Urinary System, Kidney & Nephron Function
• **Urinary System**: **Renal artery** (brings oxygenated blood with high urea to kidney) -> **Kidney** -> **Renal vein** (returns deoxygenated blood with lowest urea to vena cava); **Ureter** (carries urine from kidney to bladder) -> **Urinary bladder** (stores urine, controlled by sphincter muscle) -> **Urethra** (carries urine out of body).
• **Kidney Regions**: Outer **Cortex** (contains glomeruli, Bowman's capsules, and coiled tubules); inner **Medulla** (contains loops of Henle and collecting ducts); central **Pelvis** (collects urine into the ureter).
• **How the Nephron Forms Urine (3 Stages)**:
  1. **Ultrafiltration (in Glomerulus -> Bowman's Capsule)**:
     - High blood pressure in the **glomerulus** (knot of capillaries) forces small soluble molecules (**water, glucose, amino acids, salts/ions, and urea**) out of the blood into **Bowman's capsule** to form **filtrate**.
     - **Blood cells and large plasma proteins** are too large to pass through the capillary/capsule pores and remain in the blood.
  2. **Selective Reabsorption (in the Coiled Tubule)**:
     - Useful substances in the filtrate — **100% of glucose**, **amino acids**, and needed **salts and water** — are reabsorbed back into the surrounding blood capillaries by **diffusion and active transport** (epithelial cells have many mitochondria and microvilli).
  3. **Water Reabsorption & Urine Passage (in Loop of Henle & Collecting Duct)**:
     - Water is reabsorbed into the blood by **osmosis** according to the body's water needs (controlled by **ADH** from the pituitary gland).
     - The remaining fluid (**urine**: urea, excess water, excess salts) flows into the renal pelvis -> ureter -> bladder.

### 3. Osmoregulation
• **Hot Weather or Vigorous Exercise**: More water is lost in sweat -> blood water potential drops -> pituitary gland secretes more **ADH** -> collecting ducts reabsorb more water -> kidneys produce a **small volume of concentrated urine** to conserve water.
• **Cold Weather or Drinking Excess Water**: Less sweat is lost -> blood water potential rises -> kidneys reabsorb less water -> kidneys produce a **large volume of dilute urine** to remove excess water.`
  },
  {
    id: 'topic-12-coordination-homeostasis',
    topicNumber: 12,
    title: 'Topic 12: Coordination, Nervous System, Eye, Endocrine System, Homeostasis & Tropisms',
    keywords: [
      'nervous system', 'endocrine system', 'cns', 'pns', 'sensory neurone', 'relay neurone',
      'motor neurone', 'axon', 'dendron', 'myelin sheath', 'synapse', 'synaptic cleft',
      'neurotransmitter', 'vesicles', 'receptors', 'reflex arc', 'reflex action',
      'eye', 'cornea', 'iris', 'pupil', 'lens', 'ciliary muscle', 'suspensory ligaments',
      'retina', 'fovea', 'blind spot', 'optic nerve', 'rods', 'cones', 'pupil reflex',
      'accommodation', 'hormones', 'adrenaline', 'insulin', 'glucagon', 'oestrogen',
      'progesterone', 'testosterone', 'fsh', 'lh', 'adh',
      'homeostasis', 'negative feedback', 'vasodilation', 'vasoconstriction', 'sweating',
      'shivering', 'hypothalamus', 'tropism', 'phototropism', 'gravitropism', 'auxin', 'coleoptile'
    ],
    summary: 'Nervous vs endocrine systems, neurones, synapse transmission, reflex arc, eye structure/rods & cones/pupil reflex/accommodation, hormones, skin thermoregulation, blood glucose regulation, and plant tropisms (auxin).',
    content: `### 1. Nervous System vs Endocrine System
• **Nervous System**: **Electrical impulses** travel along **neurones (nerve fibres)**; **very fast** speed of action; **short-lived** duration; **localised** response (specific muscle or gland). Divided into **CNS** (Brain + Spinal cord) and **PNS** (Sensory + Motor nerves).
• **Endocrine System**: **Chemical messengers (hormones, protein/steroid)** secreted by ductless **endocrine glands** directly into the **bloodstream** (dissolved in plasma) to alter the activity of specific **target organs** (before being destroyed by the **liver**); **slower** speed; **long-lasting** duration; **widespread** effect.

### 2. Neurones, Reflex Arc & Synapse
• **3 Types of Neurones**:
  1. **Sensory neurone**: Carries electrical impulses from **receptors** (transducers converting stimulus energy into electrical impulses) to the **CNS**. Cell body is on a side branch (in dorsal root ganglion), with one long dendron and short axon; myelinated.
  2. **Relay (Connector) neurone**: Entirely inside the **grey matter of the CNS**; passes impulses from sensory to motor neurone; unmyelinated.
  3. **Motor neurone**: Carries impulses from **CNS** to an **effector** (muscle or gland). Cell body is at one end (in grey matter of spinal cord) with dendrites, a long myelinated axon, and motor end plates.
• **Reflex Arc Pathway**:
  \`Stimulus -> Receptor -> Sensory neurone -> Relay neurone (in CNS spinal cord) -> Motor neurone -> Effector (muscle contracts or gland secretes) -> Response\`.
  - **Reflex Action**: Rapid, automatic, involuntary response that protects the body from harm/injury.
• **Synapse Structure & One-Way Transmission**:
  1. When an electrical impulse arrives at the **presynaptic knob (motor end plate)**, it stimulates **vesicles** containing chemical **neurotransmitters** to move to and fuse with the presynaptic membrane.
  2. **Neurotransmitters** are released into the **synaptic cleft** (tiny gap) and **diffuse** across the gap.
  3. Neurotransmitters bind to specific **complementary protein receptor molecules** on the **postsynaptic membrane** (dendrite of the next neurone).
  4. This triggers a new **electrical impulse** in the postsynaptic neurone.
  5. **Why synapses act as one-way valves**: Vesicles containing neurotransmitters are **only present on the presynaptic side**, and receptors are **only present on the postsynaptic membrane**, ensuring impulses travel in one direction only.

### 3. The Human Eye: Structure, Rods & Cones, Pupil Reflex & Accommodation
• **Key Eye Structures**:
  - **Cornea**: Transparent front layer that causes **most of the refraction (bending)** of light rays entering the eye.
  - **Iris**: Coloured ring of **circular and radial muscles** that controls pupil diameter and light intensity entering the eye.
  - **Lens**: Elastic, transparent biconvex structure that fine-tunes light focusing (**accommodation**) onto the retina.
  - **Retina**: Inner light-sensitive layer containing photoreceptor cells (**rods and cones**).
  - **Fovea (Yellow Spot)**: Centre of retina packed densely with **cones only** for maximum visual sharpness/acuity.
  - **Blind Spot**: Exit point of the **optic nerve** where there are **no rods or cones**, so light falling here cannot be detected.
• **Rods vs Cones**:
  - **Rods (~120 million)**: Concentrated at edges of retina; sensitive to **dim light** (night vision); provide **black-and-white** vision with lower detail (several rods share one sensory neurone).
  - **Cones (~6 million)**: Concentrated in the **fovea**; sensitive to **bright light (high intensity)**; 3 types sensitive to **Red, Green, and Blue** wavelengths; provide **detailed colour vision** (each cone connects to its own sensory neurone).
• **Pupil Reflex (Antagonistic Iris Muscles)**:
  - **In Bright Light**: **Circular muscles contract** and **radial muscles relax** -> **pupil constricts (narrows)** -> reduces light entering the eye to protect the retina from damage.
  - **In Dim Light**: **Radial muscles contract** and **circular muscles relax** -> **pupil dilates (widens)** -> lets more light enter the eye.
• **Accommodation (Focusing on Near vs Distant Objects)**:
  - **Distant Object**: **Ciliary muscles relax** -> **suspensory ligaments tighten (pulled taut)** -> **lens is pulled thinner and less convex** -> **less refraction** of nearly parallel light rays.
  - **Near (Close) Object**: **Ciliary muscles contract** -> **suspensory ligaments slacken (loosen)** -> elastic **lens springs thicker and more convex** -> **more refraction** of diverging light rays to focus on the retina.

### 4. Endocrine Hormones & Homeostasis (Negative Feedback)
• **Adrenaline** (from **adrenal glands** above kidneys during 'fight or flight', fear, stress, or exercise):
  1. Increases **heart rate and stroke volume** & increases **breathing rate and depth** (delivers more O2 and glucose to muscles).
  2. Stimulates **liver to convert glycogen into glucose** and release it into blood for muscle respiration.
  3. **Dilates pupils** and increases mental alertness.
  4. Causes **vasoconstriction in gut and skin** and **vasodilation in skeletal muscles** to divert blood to muscles.
• **Homeostasis**: Maintaining a **constant internal environment** within narrow set limits via **negative feedback** (a deviation from the norm is detected by a receptor/detector, which triggers an effector to produce a response in the **opposite direction** to restore the norm).
• **1. Blood Glucose Regulation (Pancreas & Liver)**:
  - **When blood glucose is too HIGH (after a meal)**: Detected by **pancreas** -> secretes **insulin** into blood -> stimulates **liver and muscle cells** to absorb glucose, increase respiration, and convert **excess glucose into insoluble glycogen** for storage -> blood glucose falls back to normal.
  - **When blood glucose is too LOW (during fasting/exercise)**: Detected by **pancreas** -> secretes **glucagon** into blood -> stimulates **liver cells** to break down **stored glycogen into glucose** and release it into the blood -> blood glucose rises back to normal.
• **2. Body Temperature Regulation (Thermoregulation at 37 °C — Hypothalamus & Skin)**:
  - **When Body is Too HOT (>37 °C)**: Detected by thermoreceptors in skin and **hypothalamus** ->
    1. **Sweat glands** secrete sweat onto skin -> water **evaporates** using latent heat from the body, cooling blood.
    2. **Vasodilation**: **Skin arterioles dilate (widen)** (and shunt vessels narrow) -> more warm blood flows through surface capillaries -> increases heat loss by **radiation and convection**. (Note: Capillaries themselves do NOT move closer to the skin surface!).
    3. **Hair erector muscles relax** -> hairs lie flat so less insulating air is trapped.
  - **When Body is Too COLD (<37 °C)**:
    1. **Sweating stops**.
    2. **Vasoconstriction**: **Skin arterioles constrict (narrow)** (and shunt vessels dilate) -> less blood flows through surface capillaries -> reduces heat loss by radiation.
    3. **Hair erector muscles contract** -> hairs stand upright, trapping an insulating layer of warm air.
    4. **Shivering**: Skeletal muscles contract and relax rapidly, increasing aerobic respiration to release heat energy.

### 5. Plant Tropisms & Auxin
• **Phototropism**: Growth response to light (**Shoots = positively phototropic** to absorb light for photosynthesis; **Roots = negatively phototropic**).
• **Gravitropism (Geotropism)**: Growth response to gravity (**Roots = positively gravitropic** to anchor plant and absorb water/minerals; **Shoots = negatively gravitropic**).
• **Role of Auxin (Plant Growth Hormone)**:
  - **Auxin** is produced in the **shoot tip (coleoptile tip)** and diffuses backwards down the shoot.
  - **One-sided light on a shoot**: Auxin moves to and **accumulates on the shaded side** -> high auxin concentration **stimulates cell elongation** in shoots -> cells on the **shaded side absorb more water and elongate faster** than cells on the lit side -> the shoot **bends towards the light**.
  - **Horizontal root in gravity**: Auxin accumulates on the **lower side** due to gravity. In **roots**, high auxin concentration **inhibits cell elongation** -> cells on the **upper side elongate faster** than cells on the lower side -> the root **bends downwards towards gravity** (while in a horizontal shoot, high auxin on the lower side stimulates elongation so the shoot bends upwards).`
  },
  {
    id: 'topic-13-smoking-drugs-antibiotics',
    topicNumber: 13,
    title: 'Topic 13: Drugs, Antibiotics & Antibiotic Resistance (MRSA)',
    keywords: [
      'drug', 'drugs', 'antibiotic', 'antibiotics', 'penicillin', 'bactericidal', 'bacteriostatic',
      'mrsa', 'antibiotic resistance', 'natural selection', 'zone of inhibition', 'agar',
      'heroin', 'opium', 'depressant', 'stimulant'
    ],
    summary: 'Definition of drugs, medicinal antibiotics (penicillin) vs viruses, development of antibiotic-resistant bacteria (MRSA) by natural selection, and antibiotic sensitivity discs.',
    content: `### 1. Drugs & Antibiotics
• **Drug**: Any chemical substance taken into the body that modifies or affects chemical reactions in the body.
• **Antibiotics (e.g., Penicillin produced by the fungus *Penicillium*)**:
  - Medicinal drugs that kill (**bactericidal**: cause bacterial cell walls to burst/lyse) or stop the growth of (**bacteriostatic**: prevent formation of new cell walls) **bacteria** without harming human body cells.
  - **Why do antibiotics kill bacteria but NOT viruses or human cells?**
    - Antibiotics interfere with the synthesis or structure of the **bacterial cell wall**. **Viruses do not have a cell wall** (they have a protein coat and replicate inside host cells), and **human cells also lack cell walls**, so viruses and human cells are unaffected by antibiotics.

### 2. Evolution of Antibiotic-Resistant Bacteria (e.g., MRSA)
• **How Resistance Develops by Natural Selection**:
  1. In a large population of bacteria, a random **mutation** (change in DNA base sequence) occurs in one bacterium, giving it an allele for **antibiotic resistance**.
  2. When an **antibiotic** is applied, it acts as a **selection pressure**: all non-resistant (sensitive) bacteria are killed, while the **resistant mutant bacterium survives**.
  3. With no competition for nutrients or space, the resistant bacterium **reproduces rapidly** (by binary fission), passing on the resistance allele to its offspring.
  4. Over generations, the **entire bacterial population becomes antibiotic-resistant** (e.g., **MRSA**).
• **How to Reduce Development of Antibiotic Resistance**:
  1. Only take antibiotics when **strictly necessary and prescribed** by a doctor (never for viral infections like colds or influenza).
  2. Always **complete the full prescribed course** of antibiotics so all bacteria are killed and none survive to mutate/reproduce.
  3. Rotate/use different types of antibiotics and reduce routine antibiotic use in intensive livestock farming.
• **Antibiotic Sensitivity Test (Paper 6 Practical)**: Filter paper discs soaked in different antibiotics are placed on an agar petri dish seeded with bacteria. The **widest clear zone of inhibition** (no bacterial growth) indicates the **most effective antibiotic**. No clear zone indicates the bacteria are **resistant**.`
  },
  {
    id: 'topic-14-15-reproduction-growth',
    topicNumber: 14,
    title: 'Topics 14 & 15: Reproduction in Plants & Humans, Menstrual Cycle, Placenta, HIV & Growth',
    keywords: [
      'asexual reproduction', 'sexual reproduction', 'binary fission', 'tuber', 'spore',
      'mitosis', 'meiosis', 'gamete', 'zygote', 'diploid', 'haploid',
      'flower', 'sepal', 'petal', 'stamen', 'anther', 'filament', 'carpel', 'stigma', 'style',
      'ovary', 'ovule', 'micropyle', 'pollination', 'self pollination', 'cross pollination',
      'wind pollinated', 'insect pollinated', 'pollen tube', 'testa', 'cotyledon', 'plumule',
      'radicle', 'pericarp', 'germination', 'dry mass',
      'testes', 'scrotum', 'epididymis', 'vas deferens', 'sperm duct', 'prostate', 'seminal vesicle',
      'urethra', 'penis', 'oviduct', 'fallopian tube', 'uterus', 'cervix', 'vagina',
      'acrosome', 'puberty', 'menstrual cycle', 'fsh', 'lh', 'oestrogen', 'progesterone',
      'ovulation', 'graafian follicle', 'corpus luteum', 'implantation', 'placenta',
      'umbilical cord', 'amniotic fluid', 'amnion', 'antenatal', 'breastfeeding', 'hiv', 'aids'
    ],
    summary: 'Asexual vs sexual reproduction, flower structure, wind vs insect pollination, plant fertilisation & seed germination, human reproductive systems, menstrual cycle hormones, placenta & umbilical cord, breastfeeding, HIV/AIDS, and growth curves.',
    content: `### 1. Asexual vs Sexual Reproduction
• **Asexual Reproduction**: Involves **one parent** only; no gametes or fertilisation; cells divide by **mitosis** to produce **genetically identical offspring (clones)**. Examples: **Binary fission** in bacteria; **stem tubers** in potatoes (sucrose translocated in phloem from leaves to underground shoots and stored as starch); **spore formation** in sporangia of fungi.
  - **Advantages**: Fast; no mate or pollinators needed; less energy wasted; if parent is well-adapted to a stable environment, all offspring will be well-adapted.
  - **Disadvantages**: **No genetic variation**, so a change in environment or a new disease can wipe out the entire population; overcrowding and competition for resources.
• **Sexual Reproduction**: Involves **two parents** producing **haploid gametes (n)** by **meiosis**, followed by **fertilisation** (fusion of gamete nuclei) to form a **diploid zygote (2n)** that divides by **mitosis** into genetically **different** offspring.
  - **Advantages**: Produces **genetic variation**, allowing adaptation to changing environments (natural selection/evolution) and disease resistance; seed dispersal reduces competition.
  - **Disadvantages**: Slower; requires two parents/pollinators; wastes energy producing many gametes.

### 2. Sexual Reproduction in Flowering Plants
• **Flower Parts**: **Sepals** (protect bud); **Petals** (large, coloured, scented with nectar guides in insect-pollinated flowers); **Stamen (male)** = **Anther** (makes pollen grains containing male gametes) + **Filament**; **Carpel (female)** = **Stigma** (receives pollen) + **Style** + **Ovary** (contains **ovules** with female gametes and **micropyle** opening).
• **Self-Pollination vs Cross-Pollination**:
  - **Pollination**: Transfer of pollen grains from the **anther** to the **stigma**.
  - **Self-pollination**: Pollen transferred from anther to stigma of the **same flower or another flower on the same plant** (less reliance on pollinators, but **less genetic variation**).
  - **Cross-pollination**: Pollen transferred from anther of a flower to stigma of a flower on a **different plant of the same species** (requires pollinators/wind, but gives **more genetic variation**).
• **Insect-Pollinated vs Wind-Pollinated Flowers**:
  - **Insect-pollinated**: Large, brightly coloured, scented petals with **nectary**; anthers and **sticky stigma enclosed inside petals**; **smaller numbers of large, heavy, sticky/spiky pollen grains**.
  - **Wind-pollinated**: Small, dull, unscented petals with **no nectary**; **anthers hang loosely outside** flower; **large feathery stigma** hangs outside to trap airborne pollen; **huge numbers of small, light, smooth, dry pollen grains**.
• **Plant Fertilisation, Seed Formation & Germination**:
  1. Pollen grain lands on stigma of same species -> absorbs sugary fluid and grows a **pollen tube** down the style (secreting enzymes to digest a pathway).
  2. The **male gamete nucleus** travels down the pollen tube, enters the ovule through the **micropyle**, and fuses with the **female gamete nucleus** to form a **zygote**.
  3. **Zygote** divides by mitosis to form the **embryo** (**plumule** = future shoot; **radicle** = future root). **Ovule** becomes the **seed** (**cotyledons** store starch, protein & oil; integument becomes tough **testa** seed coat). **Ovary** swells to become the **fruit** (ovary wall becomes **pericarp**).
  4. **Conditions for Seed Germination (TWO)**:
     - **T**emperature: Warmth for optimum enzyme activity.
     - **W**ater: Absorbed through the **micropyle** to **activate enzymes** (**amylase** breaks insoluble starch -> maltose/glucose; **protease** breaks proteins -> amino acids for translocation to plumule/radicle) and swell tissues to split the testa.
     - **O**xygen: For **aerobic respiration** to release energy for cell division and growth. (Light is NOT needed for seed germination because underground seeds have no chlorophyll yet!).
  5. **Dry Mass During Germination**: Initially **decreases** as the seed respires stored starch in cotyledons without photosynthesising; once green **foliage leaves** emerge above ground, **dry mass increases** because the rate of photosynthesis exceeds the rate of respiration.

### 3. Human Reproduction, Menstrual Cycle Hormones & Pregnancy
• **Male System**: **Testes** (make sperm & **testosterone**; held in **scrotum** 2–3 °C below body temp); **Epididymis** (stores sperm); **Sperm duct / Vas deferens** (carries sperm by peristalsis); **Prostate gland & Seminal vesicles** (secrete sugary seminal fluid for sperm nutrition and swimming medium -> forms **semen**); **Urethra** (carries semen or urine through penis).
• **Female System**: **Ovaries** (release ovum at ovulation & secrete **oestrogen** and **progesterone**); **Oviduct / Fallopian tube** (**site of fertilisation** in first third; lined with **cilia** and muscular walls to move egg/zygote to uterus); **Uterus** (muscular womb where embryo **implants** in endometrium lining); **Cervix** (ring of muscle at base of uterus); **Vagina** (site of sperm deposition and birth canal).
• **Hormones of the Menstrual Cycle (~28 days)**:
  1. **Days 1–5 (Menstruation)**: If no egg was fertilised, progesterone drops and the uterus lining breaks down and is shed.
  2. **FSH (Follicle Stimulating Hormone — from Pituitary Gland)**: Stimulates a **Graafian follicle** (with an ovum inside) to mature in the ovary and stimulates the ovary to secrete **oestrogen**.
  3. **Oestrogen (from Ovary / Graafian Follicle — peaks around Day 12–13)**: **Repairs and thickens the uterus lining** (making it spongy and rich in blood vessels); inhibits FSH and **stimulates a surge of LH** from the pituitary gland.
  4. **LH (Luteinising Hormone — from Pituitary Gland)**: Triggers **ovulation (Day 14)** — release of the mature ovum from the Graafian follicle into the oviduct — and converts the empty follicle into the **corpus luteum**.
  5. **Progesterone (from Corpus Luteum — Days 14–28, and later from Placenta)**: **Maintains the thick uterus lining** ready for embryo implantation and **inhibits FSH and LH** so no further follicles mature during pregnancy.
• **Placenta, Umbilical Cord & Amniotic Sac**:
  - **Placenta** (disc-like organ with finger-like **villi** providing a huge surface area):
    1. Allows **oxygen, glucose, amino acids, vitamins, minerals, and maternal antibodies** to diffuse from mother's blood to fetus's blood.
    2. Allows **carbon dioxide and urea** to diffuse from fetus's blood to mother's blood for excretion.
    3. **Secretes progesterone** to maintain the uterus lining and prevent premature uterine contractions.
    4. **Acts as a barrier keeping maternal and fetal blood separate** (prevents mixing of different blood groups, protects delicate fetal capillaries from the mother's high blood pressure, and blocks many bacteria, though **nicotine, carbon monoxide, alcohol, and viruses like HIV and Rubella** can cross).
  - **Umbilical Cord**: **Umbilical artery** carries deoxygenated blood with **urea and CO2** from fetus to placenta; **Umbilical vein** carries oxygenated blood rich in **glucose and amino acids** from placenta to fetus.
  - **Amniotic Sac & Amniotic Fluid**: Protects the fetus against **mechanical shock (bumps)**, **temperature fluctuations**, and **drying out**, and allows the fetus to move.
• **Breastfeeding vs Bottle Feeding**:
  - **Advantages of Breast Milk**: Contains **maternal antibodies (passive immunity)**; at exact body temperature; **sterile** (no risk of waterborne bacteria); contains ideal balance of nutrients that are easy to digest; free; builds emotional bond.
  - **Disadvantages**: Can transmit **HIV** or drugs/alcohol; painful nipples; mother must be present.
• **HIV / AIDS**: **HIV** (virus) is transmitted via unprotected sexual intercourse, contaminated needles/syringes, contaminated blood transfusions, or mother-to-child across the placenta/breast milk. HIV infects and **destroys T-lymphocytes**, reducing antibody production and weakening the immune system until opportunistic infections (e.g., TB, pneumonia) develop (**AIDS**).`
  },
  {
    id: 'topic-16-inheritance-selection',
    topicNumber: 16,
    title: 'Topic 16: Inheritance, Mitosis vs Meiosis, Genetics, Variation & Selection',
    keywords: [
      'inheritance', 'chromosome', 'homologous', 'gene', 'allele', 'dominant', 'recessive',
      'homozygous', 'heterozygous', 'genotype', 'phenotype', 'punnett square', 'monohybrid',
      'test cross', 'codominance', 'blood group', 'sickle cell', 'malaria', 'sex linked',
      'colour blindness', 'haemophilia', 'stem cells', 'differentiation',
      'continuous variation', 'discontinuous variation', 'mutation', 'down syndrome',
      'natural selection', 'artificial selection', 'selective breeding', 'evolution'
    ],
    summary: 'Genetic definitions, mitosis vs meiosis, stem cells, monohybrid crosses, sex-linkage, codominance (ABO blood groups & sickle cell anemia), continuous vs discontinuous variation, mutations, and natural vs artificial selection.',
    content: `### 1. Genetic Terms, Mitosis vs Meiosis & Stem Cells
• **Key Definitions**:
  - **Chromosome**: A thread of DNA made up of a string of genes (human diploid body cells have **23 pairs = 46 chromosomes**; gametes have **23 unpaired chromosomes**).
  - **Gene**: A length of DNA that codes for a specific protein (unit of heredity).
  - **Allele**: Alternative forms of a gene that code for different versions of the same characteristic (e.g., dominant allele \`B\` vs recessive allele \`b\`).
  - **Homozygous**: Having two identical alleles of a particular gene (e.g., \`BB\` or \`bb\`; pure-breeding).
  - **Heterozygous**: Having two different alleles of a particular gene (e.g., \`Bb\`; carrier of recessive allele).
  - **Genotype**: The genetic makeup of an organism in terms of the alleles present (\`BB\`, \`Bb\`, or \`bb\`).
  - **Phenotype**: The observable/physical features of an organism resulting from its genotype and the environment.
• **Mitosis vs Meiosis**:
  - **Mitosis (Copying Division)**: Occurs in **body (somatic) cells** for **growth, repair of damaged tissues, and asexual reproduction**. Produces **2 genetically identical diploid (2n = 46) daughter cells** with no variation.
  - **Meiosis (Reduction Division)**: Occurs in **reproductive organs (testes, ovaries, anthers, ovules)** to produce **gametes**. Halves the chromosome number from diploid to haploid (**n = 23**) so chromosome number does not double at fertilisation, and produces **4 genetically different haploid daughter cells** (due to **crossing over** and random assortment of homologous chromosomes).
• **Cell Differentiation & Stem Cells**: Every cell in the body contains the **exact same genes**, but in specialised cells **only specific genes are switched on (expressed)** while others are switched off. **Stem cells** are unspecialised cells that divide by mitosis (**Embryonic stem cells** can differentiate into any cell type; **Adult stem cells** differentiate into a limited range of cell types; used medically to treat conditions like Type 1 diabetes).

### 2. Monohybrid Crosses, Codominance & Sex-Linked Inheritance
• **Monohybrid Ratios**:
  - Heterozygous × Heterozygous (\`Bb × Bb\`) -> **Genotype ratio 1 BB : 2 Bb : 1 bb**; **Phenotype ratio 3 dominant : 1 recessive** (75% : 25%).
  - Heterozygous × Homozygous recessive (\`Bb × bb\`, also used as a **Test Cross**) -> **1 Bb : 1 bb** (50% : 50%).
• **Sex Determination**: Females are **XX** (all eggs carry X); Males are **XY** (50% sperm carry X, 50% carry Y) -> always a **1 : 1 (50% : 50%)** ratio of male to female offspring.
• **Sex-Linked Characteristics (e.g., Red-Green Colour Blindness & Haemophilia)**:
  - The gene is located on the **non-homologous part of the X chromosome** (the Y chromosome is shorter and lacks this locus).
  - Recessive sex-linked conditions (\`X^b\`) are **much more common in males (\`X^b Y\`)** than females because males have **only one X chromosome**, so a single recessive allele is always expressed in their phenotype, whereas females (\`X^B X^b\`) can be unaffected **carriers**.
• **Codominance**:
  - Neither allele is dominant over the other; **both alleles are expressed in the phenotype of a heterozygous individual**.
  - **1. ABO Blood Groups**: Controlled by 3 alleles: \`I^A\` and \`I^B\` are **codominant**, and both are dominant over \`I^O\`. Genotypes: Blood Group A = \`I^A I^A\` or \`I^A I^O\`; Group B = \`I^B I^B\` or \`I^B I^O\`; Group AB = \`I^A I^B\`; Group O = \`I^O I^O\`.
  - **2. Sickle Cell Anaemia**:
    - \`Hb^A Hb^A\`: Normal haemoglobin (susceptible to malaria).
    - \`Hb^A Hb^S\`: Heterozygous **carrier** (sickle cell trait) — produces both normal and sickle haemoglobin; shows **no anaemia symptoms AND is resistant to malaria**.
    - \`Hb^S Hb^S\`: Sickle cell anaemia — faulty haemoglobin forms fibres at low O2, making RBCs sickle-shaped so they block capillaries, causing pain crises and reduced O2 transport.

### 3. Variation, Mutation & Selection (Natural vs Artificial)
• **Discontinuous vs Continuous Variation**:
  - **Discontinuous Variation**: Distinct categories with **no intermediates**; qualitative; caused by **genes only** (unaffected by environment); plotted as a bar chart. Examples: **ABO blood group, sex, eye colour, wrinkled vs smooth seed coat**.
  - **Continuous Variation**: Complete **range of phenotypes between two extremes**; quantitative (measurable); caused by **both genes and the environment**; plotted as a bell-shaped histogram. Examples: **Height, body mass/weight, hand span**.
• **Mutation**: A random change in a **gene** (base sequence of DNA, e.g., sickle cell anaemia) or **chromosome number** (e.g., **Down's syndrome** = **47 chromosomes** instead of 46 due to three copies of chromosome 21). Rate of mutation is increased by **ionising radiation** (X-rays, gamma rays, UV light) and **mutagenic chemicals** (tar in tobacco smoke, mustard gas).
• **Natural Selection (Darwin's Mechanism of Evolution)**:
  1. **Overproduction of offspring** & **Competition (struggle for existence)** for limited resources (food, space, mates).
  2. **Genetic variation** exists among individuals in the population (due to mutation, meiosis, and sexual reproduction).
  3. **Survival of the fittest**: Individuals with **adaptive features** best suited to the environment (e.g., dark peppered moths on soot-darkened trees, or \`Hb^A Hb^S\` carriers in malaria regions, or antibiotic-resistant bacteria) are more likely to survive.
  4. **Reproduction & Inheritance**: Survivors **reproduce** and **pass on their advantageous alleles** to their offspring.
  5. Over many generations, the frequency of the advantageous allele increases in the population (**Evolution**).
• **Artificial Selection (Selective Breeding)**:
  1. Humans select parent plants or animals showing desirable characteristics (e.g., high milk yield cattle, disease-resistant crops).
  2. Breed them together.
  3. Select the offspring showing the best expression of the desirable trait and breed them together.
  4. **Repeat over many generations**.`
  },
  {
    id: 'topic-17-biotechnology-genetic-engineering',
    topicNumber: 17,
    title: 'Topic 17: Biotechnology, Fermenters, Immobilised Enzymes & Genetic Engineering',
    keywords: [
      'biotechnology', 'yeast', 'biofuel', 'ethanol', 'fermenter', 'water jacket', 'paddles',
      'biological washing powder', 'protease', 'lipase', 'pectinase', 'lactase', 'immobilised',
      'alginate beads', 'lactose free', 'penicillium', 'penicillin',
      'genetic engineering', 'recombinant dna', 'plasmid', 'restriction enzyme',
      'restriction endonuclease', 'sticky ends', 'dna ligase', 'insulin', 'golden rice'
    ],
    summary: 'Yeast in bread/brewing/biofuels, industrial fermenters, biological washing powders, pectinase in fruit juice, immobilised lactase in alginate beads, penicillin production, and recombinant DNA human insulin.',
    content: `### 1. Why Microorganisms (Bacteria & Fungi) Are Used in Biotechnology
1. Very small and **easy to grow** in a laboratory/fermenter taking up little space.
2. **Reproduce very rapidly** (high production rate).
3. Can synthesize a **wide range of complex biological molecules**.
4. **No ethical issues** compared to using animals.
5. Share the **same universal genetic code (DNA)** as humans, so bacteria can transcribe and translate human genes.
6. Bacteria contain small circular loops of DNA called **plasmids** that are easy to transfer between cells.

### 2. Uses of Yeast & Industrial Enzymes
• **Biofuel (Ethanol)**: Maize starch is broken down into glucose by **amylase**, then **yeast** respires anaerobically (\`Glucose -> Ethanol + CO2\`), and ethanol is extracted by distillation.
  - *Pros*: Renewable energy resource; carbon-neutral aspects as growing crops absorb CO2.
  - *Cons*: Releases less energy per litre than fossil fuels; takes up agricultural land needed for food crops, raising food prices.
• **Biological Washing Powders**: Contain **protease** (breaks down insoluble protein stains like blood/egg into soluble amino acids) and **lipase** (breaks down insoluble fat/grease stains into soluble fatty acids and glycerol). Work best at lower temperatures (~40 °C), saving electricity and protecting delicate fabrics (though high boiling temperatures denature the enzymes unless sourced from thermophilic hot-spring bacteria).
• **Pectinase in Fruit Juice Production**: **Pectin** holds plant cell walls together. Adding **pectinase** breaks down pectin, making it easier to squeeze a **larger volume of juice** faster and making the juice **clear rather than cloudy**.
• **Immobilised Lactase for Lactose-Free Milk**:
  - **Lactase** converts disaccharide **lactose** in milk into soluble monosaccharides **glucose + galactose** (for lactose-intolerant people who otherwise suffer bloating/diarrhoea).
  - **Immobilisation Method**: Lactase is mixed with **sodium alginate** and dropped into **calcium chloride solution** to form **alginate beads** trapping the enzyme inside. Milk is poured through a column of these beads.
  - **Advantages of Immobilised Enzymes**:
    1. Beads can be **reused many times** (cost-saving).
    2. Product (milk) is **not contaminated with the enzyme** (no costly purification needed).
    3. Enzyme is **more stable to changes in temperature and pH** because the alginate matrix holds the protein molecules firmly in shape so they do not denature easily.

### 3. Industrial Fermenters (e.g., *Penicillium* fungus producing Penicillin)
• **Key Components of a Fermenter**:
  - **Sterilisation (steam)**: Kills unwanted microorganisms to prevent contamination and competition for nutrients.
  - **Nutrients**: Glucose/sugar (energy source for respiration; fed in small amounts continuously for penicillin) and amino acids/ammonium ions (for protein synthesis).
  - **Sterile Air Supply**: Provides **oxygen** for aerobic respiration of the fungus/bacteria.
  - **Paddle Stirrers**: Mix contents to keep microorganisms in contact with nutrients and oxygen, and ensure **even temperature** throughout the vessel.
  - **Water Jacket (cold water in)**: Removes excess heat released by respiration to maintain the **optimum temperature** so enzymes do not denature.
  - **pH and Temperature Probes**: Monitor conditions continuously to maintain optimum enzyme activity.

### 4. Genetic Engineering (Recombinant DNA Technology for Human Insulin)
• **Definition**: Changing the genetic material of an organism by removing, changing, or inserting individual genes from one species into another species.
• **5 Steps to Produce Human Insulin**:
  1. **Isolation**: The human **insulin gene** is cut out of a human chromosome using a specific **restriction endonuclease enzyme**, leaving unpaired bases called **sticky ends**.
  2. **Cutting the Vector**: A circular **plasmid** is removed from a bacterium and cut open using the **EXACT SAME restriction endonuclease enzyme** so that it has **complementary sticky ends**.
  3. **Joining (Ligation)**: The human insulin gene and open bacterial plasmid are mixed with **DNA ligase enzyme**, which joins the complementary sticky ends together to form a **recombinant plasmid (recombinant DNA)**.
  4. **Insertion**: The recombinant plasmid is inserted into a host **bacterial cell**.
  5. **Cloning in a Fermenter**: The genetically modified bacteria are cultured in an industrial **fermenter** under optimum temperature, pH, oxygen, and nutrients. As the bacteria reproduce asexually, they express the gene and synthesize pure **human insulin**, which is filtered and purified.
• **Other GM Examples**: **Golden Rice** (engineered to produce beta-carotene / Vitamin A to prevent blindness); **Herbicide-resistant soya**; **Insect-resistant Bt cotton** (produces toxin that kills insect pests, reducing pesticide spraying).`
  },
  {
    id: 'topic-18-ecology-conservation',
    topicNumber: 18,
    title: 'Topic 18: Ecology, Energy Flow, Nutrient Cycles, Population, Pollution & Conservation',
    keywords: [
      'population', 'community', 'ecosystem', 'habitat', 'biotic', 'abiotic',
      'food chain', 'food web', 'producer', 'consumer', 'herbivore', 'carnivore',
      'decomposer', 'trophic level', 'energy flow', 'pyramid of numbers', 'pyramid of biomass',
      'pyramid of energy', 'carbon cycle', 'water cycle', 'nitrogen cycle',
      'nitrogen fixation', 'nitrification', 'denitrification', 'legumes', 'root nodules',
      'sigmoid curve', 'lag phase', 'log phase', 'stationary phase', 'death phase', 'carrying capacity',
      'monoculture', 'intensive farming', 'deforestation', 'greenhouse effect', 'global warming',
      'methane', 'acid rain', 'sulfur dioxide', 'scrubbers', 'bioaccumulation', 'plastics',
      'conservation', 'captive breeding', 'seed bank', 'coppicing', 'sustainable fishing',
      'quotas', 'mesh size', 'recycling', 'ivf', 'artificial insemination'
    ],
    summary: 'Ecological definitions, food chains/webs, 10% energy transfer rule, pyramids of numbers/biomass/energy, carbon/water/nitrogen cycles, sigmoid population growth, human impacts, pollution, and conservation.',
    content: `### 1. Ecological Terms, Food Chains & Energy Flow (10% Rule)
• **Key Definitions**:
  - **Population**: A group of organisms of **one species**, living in the same area at the same time.
  - **Community**: All of the populations of **different species** in an ecosystem.
  - **Ecosystem**: A unit containing the **community of organisms (biotic)** and their **non-living environment (abiotic)**, interacting together.
  - **Producer (Trophic Level 1)**: An organism (green plant/algae) that makes its own organic nutrients using light energy from the sun by **photosynthesis** (only ~1% of sunlight is trapped).
  - **Consumers**: **Primary consumers** (herbivores, Trophic Level 2), **Secondary consumers** (carnivores/omnivores, Trophic Level 3), **Tertiary consumers** (top carnivores, Trophic Level 4). Arrows in a food chain (\`-->\`) always show the **direction of energy transfer**.
  - **Decomposers**: Fungi and saprophytic bacteria that get energy by breaking down dead organic matter and waste (faeces/urine), returning mineral ions to the soil.
• **Why Only ~10% of Energy is Transferred Between Trophic Levels (and why food chains have <5 levels)**:
  1. Energy is **lost as heat during respiration** and movement/muscle contraction.
  2. Not all of the organism at one trophic level is **eaten** (e.g., roots, bones, fur).
  3. Some eaten parts are **indigestible** (e.g., cellulose, lignin) and lost in **egestion (faeces)**.
  4. Energy is lost in **excretory products** (e.g., urea in urine).
  - *Implication*: Eating crop plants directly (human as primary consumer) is much more energy-efficient than feeding crops to livestock and eating meat.
• **Ecological Pyramids**:
  - **Pyramid of Numbers**: Shows the number of individual organisms at each trophic level. Can be **inverted** (e.g., 1 large oak tree feeding 10,000 insects).
  - **Pyramid of Biomass**: Shows the **total dry mass** (\`number of individuals × dry mass of each\`) at each trophic level. **Always pyramid-shaped** because biomass is lost at each level.
  - **Pyramid of Energy**: Shows energy transferred at each level; **always pyramid-shaped**.

### 2. Carbon, Water & Nitrogen Cycles
• **Carbon Cycle**:
  - **Removes CO2 from air**: **Photosynthesis** by green plants.
  - **Adds CO2 to air**: **Respiration** (plants, animals, decomposers), **Decomposition** (fungi/bacteria), and **Combustion** of fossil fuels/wood.
• **Nitrogen Cycle (4 Key Bacterial Processes)**:
  1. **Nitrogen Fixation** (\`N2 gas -> Ammonium / Nitrate ions\`): Carried out by **nitrogen-fixing bacteria** living in **root nodules of leguminous plants** (peas, beans, clover) or free-living in soil, and by **lightning** (combines N2 and O2 in air, washed into soil by rain).
  2. **Decomposition & Deamination** (\`Proteins / Urea -> Ammonium ions NH4⁺\`): **Saprophytic bacteria and fungi (decomposers)** secrete extracellular enzymes to digest dead proteins into amino acids, then deaminate them into ammonium ions.
  3. **Nitrification** (\`Ammonium ions -> Nitrites -> Nitrate ions NO3⁻\`): Carried out by **nitrifying bacteria** in **aerobic (well-aerated) soil**. Plants absorb nitrate ions by active transport to make amino acids and proteins.
  4. **Denitrification** (\`Nitrate ions -> N2 gas in air\`): Carried out by **denitrifying bacteria** in **anaerobic (waterlogged) soil**, reducing soil fertility (farmers drain and plough soil to aerate it and prevent denitrification).

### 3. Population Growth Curve (Sigmoid Curve)
1. **Lag Phase**: Population grows slowly as few individuals adjust to the environment.
2. **Log (Exponential) Phase**: Rapid population growth where **birth rate >> death rate** (abundant food, space, and no limiting factors).
3. **Stationary Phase**: Population levels off at the **carrying capacity (K)** where **birth rate = death rate** due to **limiting factors** (food shortage, disease, predators, accumulation of toxic waste, competition for space).
4. **Death (Decline) Phase**: **Death rate > birth rate** as resources are exhausted or toxins accumulate.

### 4. Human Influences, Pollution & Conservation
• **Monoculture**: Growing a single crop species over a large area year after year -> **reduces biodiversity**, depletes specific soil minerals, and allows **crop pests and diseases to spread rapidly** (solved by **mixed crop rotation** with legumes).
• **Deforestation**: Cutting down forests causes **soil erosion and leaching** (no tree roots to bind soil or canopy to break rainfall), **flooding** (more surface runoff), **reduced rainfall/drought** (less transpiration), **increased atmospheric CO2** (less photosynthesis + burning/rotting wood -> enhanced greenhouse effect), and **habitat loss / extinction**.
• **Eutrophication (caused by leached Nitrate/Phosphate Fertilisers or untreated Sewage)**:
  1. Excess nitrate/phosphate ions wash (leach) into rivers and lakes.
  2. Causes rapid growth of surface algae (**algal bloom**).
  3. Surface algae **block sunlight** from reaching submerged aquatic plants -> underwater plants cannot photosynthesise and **die**.
  4. **Aerobic bacteria (decomposers)** multiply rapidly as they feed on dead plants, **using up dissolved oxygen** in the water by aerobic respiration.
  5. Water becomes **anoxic (anaerobic)** -> fish and other aquatic animals **suffocate and die**.
• **Air Pollution**:
  - **Enhanced Greenhouse Effect**: **CO2** (fossil fuels, deforestation) and **Methane (CH4)** (cattle digestion, rice paddy fields, rotting landfill waste) trap long-wavelength infrared heat radiation -> **global warming**, melting polar ice caps, rising sea levels, flooding, and habitat loss.
  - **Acid Rain**: **Sulfur dioxide (SO2)** from burning coal in power stations and **Nitrogen oxides (NOx)** from car engines dissolve in rainwater to form sulfuric/nitric acid (pH ~4) -> acidifies soil (leaches Ca²⁺/Mg²⁺ and releases toxic **aluminium ions** that damage fish gills) and kills trees/aquatic life. *Solutions*: **Flue gas desulfurisation (scrubbers using alkaline limestone slurry)** in power stations and **catalytic converters** in cars.
• **Conservation Strategies**:
  - **Endangered Species**: **Captive breeding programmes** (maintaining genetic diversity), **seed banks** (storing dormant seeds at low temp/humidity), **IVF & Artificial Insemination** in zoos, and habitat protection.
  - **Sustainable Forestry**: **Coppicing** (cutting trees near base and allowing stumps to regrow), **selective felling** (cutting only mature trees), reforestation, and government quotas/licences.
  - **Sustainable Fishing**: **Legal catch quotas**, **controlling net mesh size** (larger diamond/square mesh lets juvenile/immature fish escape to grow and breed), closed breeding seasons, and **fish restocking** in hatcheries.`
  }
];

/**
 * Searches the Cambridge IGCSE Biology (0610) syllabus notes for matching topics.
 * Returns the top matching topics and a flag indicating whether the query is within the syllabus notes.
 */
export function searchBiologyNotes(query: string): {
  matches: NoteTopic[];
  isOutOfScope: boolean;
} {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return { matches: BIOLOGY_SYLLABUS_NOTES.slice(0, 3), isOutOfScope: false };
  }

  // Check for explicitly non-biology / out-of-syllabus subjects when no biology keywords match
  const nonBiologySubjects = [
    'quantum physics', 'relativity', 'astrophysics', 'trigonometry', 'calculus',
    'javascript', 'python code', 'french revolution', 'world war', 'cryptocurrency',
    'stock market', 'shakespeare', 'electromagnetism', 'thermodynamics', 'organic chemistry synthesis'
  ];

  const scored = BIOLOGY_SYLLABUS_NOTES.map((topic) => {
    let score = 0;
    const titleLower = topic.title.toLowerCase();
    const contentLower = topic.content.toLowerCase();

    for (const kw of topic.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 5;
      }
    }

    const words = normalized
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);

    for (const word of words) {
      if (titleLower.includes(word)) score += 3;
      if (contentLower.includes(word)) score += 1;
    }

    return { topic, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.topic);

  const hasExplicitNonBio = nonBiologySubjects.some((subj) =>
    normalized.includes(subj)
  );

  if (hasExplicitNonBio && (scored[0]?.score ?? 0) < 4) {
    return { matches: [], isOutOfScope: true };
  }

  if (topMatches.length === 0) {
    // Check if general biology / greeting / exam tip question
    const generalAllowed = [
      'hello', 'hi', 'help', '0610', 'biology', 'igcse', 'cambridge', 'topic',
      'topics', 'notes', 'syllabus', 'exam', 'question', 'define', 'explain'
    ];
    if (generalAllowed.some((g) => normalized.includes(g))) {
      return { matches: BIOLOGY_SYLLABUS_NOTES.slice(0, 4), isOutOfScope: false };
    }
    return { matches: [], isOutOfScope: true };
  }

  return {
    matches: topMatches.slice(0, 4),
    isOutOfScope: false,
  };
}
