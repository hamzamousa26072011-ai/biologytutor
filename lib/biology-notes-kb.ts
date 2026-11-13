export interface SyllabusTopic {
  id: string;
  topicNumber: string;
  title: string;
  keywords: string[];
  summary: string;
  coreConcepts: string[];
  examTips: string[];
}

export const BIOLOGY_SYLLABUS_NOTES: SyllabusTopic[] = [
  {
    id: 'topic-2-organisation',
    topicNumber: 'Topic 2',
    title: 'Organisation of the Organism',
    keywords: [
      'cell',
      'nucleus',
      'cytoplasm',
      'cell membrane',
      'cell wall',
      'chloroplast',
      'vacuole',
      'mitochondria',
      'ribosome',
      'magnification',
      'tissue',
      'organ',
      'organ system',
      'palisade',
      'ciliated',
      'root hair',
      'red blood cell',
      'xylem',
      'sperm',
      'egg',
    ],
    summary:
      'Cell structure of animal, plant, and bacterial cells; specialised cells and levels of biological organisation; magnification calculations.',
    coreConcepts: [
      'Animal and plant cells share a nucleus, cytoplasm, cell membrane, mitochondria (for aerobic respiration), and ribosomes (for protein synthesis).',
      'Plant cells additionally contain a cellulose cell wall, chloroplasts (site of photosynthesis containing chlorophyll), and a large permanent vacuole containing cell sap.',
      'Bacterial cells lack a true nucleus and instead have a circular loop of DNA plus small rings called plasmids, surrounded by cytoplasm, a cell membrane, and a cell wall.',
      'Specialised cells: Ciliated cells move mucus in airways; Root hair cells have a large surface area for mineral ion and water uptake; Xylem vessels have thick lignified walls and no end walls for water transport; Palisade mesophyll cells are packed with chloroplasts; Red blood cells have a biconcave shape, no nucleus, and haemoglobin.',
      'Levels of organisation: Cell -> Tissue (group of similar cells working together for a specific function) -> Organ -> Organ system -> Organism.',
      'Magnification formula: Magnification = Image size / Actual size (M = I / A). Convert units consistently: 1 mm = 1000 um (micrometres).',
    ],
    examTips: [
      'Always convert Image size and Actual size into the same unit (usually mm -> um by multiplying by 1000) BEFORE dividing.',
      'State both the structure and how it directly enables the function when asked how a specialised cell is adapted.',
    ],
  },
  {
    id: 'topic-3-movement',
    topicNumber: 'Topic 3',
    title: 'Movement into and out of Cells',
    keywords: [
      'diffusion',
      'osmosis',
      'active transport',
      'concentration gradient',
      'water potential',
      'partially permeable',
      'turgid',
      'turgor',
      'flaccid',
      'plasmolysed',
      'plasmolysis',
      'lysis',
      'surface area',
      'carrier protein',
    ],
    summary:
      'Transport across membranes by diffusion, osmosis, and active transport, and the effects of water potential on plant and animal cells.',
    coreConcepts: [
      'Diffusion is the net movement of particles from a region of higher concentration to a region of lower concentration (down a concentration gradient) as a result of random kinetic movement.',
      'Rate of diffusion increases with a steeper concentration gradient, larger surface area, higher temperature (more kinetic energy), and shorter diffusion distance.',
      'Osmosis is the net movement of water molecules from a region of higher water potential (dilute solution) to a region of lower water potential (concentrated solution) through a partially permeable membrane.',
      'In pure water or a dilute solution (higher water potential outside): plant cells absorb water by osmosis, become turgid (cytoplasm presses against the inelastic cellulose cell wall, providing support). Animal cells burst (lysis) because they lack a cell wall.',
      'In concentrated solution (lower water potential outside): water leaves plant cells by osmosis; they lose turgor pressure, become flaccid, and if the cell membrane pulls away from the cell wall, become plasmolysed.',
      'Active transport is the movement of particles through a cell membrane from a region of lower concentration to a region of higher concentration (against a concentration gradient), using energy from respiration and carrier proteins in the membrane.',
    ],
    examTips: [
      'For osmosis, ALWAYS write "water potential" and "partially permeable membrane" — never say "water moves down a concentration gradient" for Extended 0610.',
      'For active transport, mention BOTH "against a concentration gradient" (lower to higher concentration) AND "using energy from respiration" (plus carrier proteins).',
    ],
  },
  {
    id: 'topic-4-molecules',
    topicNumber: 'Topic 4',
    title: 'Biological Molecules',
    keywords: [
      'carbohydrate',
      'glucose',
      'starch',
      'glycogen',
      'cellulose',
      'protein',
      'amino acid',
      'lipid',
      'fat',
      'fatty acid',
      'glycerol',
      'benedict',
      'iodine',
      'biuret',
      'ethanol',
      'dcip',
      'dna',
      'base pairing',
      'nucleotide',
    ],
    summary:
      'Chemical elements and building blocks of carbohydrates, lipids, proteins, DNA structure, and food tests.',
    coreConcepts: [
      'Carbohydrates contain C, H, O. Simple sugars (glucose) join to form starch (plant storage), glycogen (animal storage), and cellulose (plant cell walls).',
      'Fats and oils (lipids) contain C, H, O and are made from 1 glycerol molecule and 3 fatty acid molecules.',
      'Proteins contain C, H, O, N (and sometimes S) and are made of long chains of amino acids folded into specific 3D shapes.',
      'Food tests: Starch -> Iodine solution turns blue-black (remains brown-yellow if negative); Reducing sugars -> Benedict’s solution + heat turns brick-red (through green/yellow/orange); Protein -> Biuret reagent turns purple/lilac; Lipids -> Ethanol emulsion test gives a milky white emulsion; Vitamin C -> DCPIP turns from blue to colourless.',
      'DNA consists of two strands coiled into a double helix with complementary base pairs: A pairs with T, and C pairs with G.',
    ],
    examTips: [
      'Remember to state "heat / water bath" when describing the Benedict’s test for reducing sugars.',
      'State both the starting colour AND final positive colour for food test questions.',
    ],
  },
  {
    id: 'topic-5-enzymes',
    topicNumber: 'Topic 5',
    title: 'Enzymes',
    keywords: [
      'enzyme',
      'catalyst',
      'substrate',
      'active site',
      'complementary',
      'enzyme-substrate complex',
      'denatured',
      'denaturation',
      'optimum',
      'temperature',
      'ph',
      'kinetic energy',
      'collision',
    ],
    summary:
      'Lock-and-key mechanism of enzyme specificity and the effects of temperature and pH on enzyme activity.',
    coreConcepts: [
      'Enzymes are proteins that act as biological catalysts, speeding up chemical reactions without being permanently changed or used up.',
      'Specificity: The substrate molecule has a shape complementary to the enzyme’s active site, fitting together like a lock and key to form an enzyme-substrate complex before products are released.',
      'Effect of temperature: Below the optimum, increasing temperature increases kinetic energy of enzyme and substrate molecules, causing more frequent effective collisions and a higher rate of reaction.',
      'Above the optimum temperature (or at extreme pH), the enzyme is denatured: the active site permanently changes shape so it is no longer complementary to the substrate and no enzyme-substrate complex can form.',
    ],
    examTips: [
      'NEVER say an enzyme is "killed" at high temperature — enzymes are non-living proteins; write that the enzyme is "denatured" and its "active site changes shape".',
      'Always state that the substrate is "complementary in shape" to the active site (do not say "same shape").',
    ],
  },
  {
    id: 'topic-6-plant-nutrition',
    topicNumber: 'Topic 6',
    title: 'Plant Nutrition',
    keywords: [
      'photosynthesis',
      'chlorophyll',
      'limiting factor',
      'light intensity',
      'carbon dioxide',
      'leaf',
      'palisade',
      'spongy mesophyll',
      'stomata',
      'guard cell',
      'waxy cuticle',
      'nitrate',
      'magnesium',
      'starch test',
    ],
    summary:
      'Photosynthesis equation, limiting factors, leaf adaptations, and mineral ion requirements in plants.',
    coreConcepts: [
      'Word equation: carbon dioxide + water -> glucose + oxygen (in the presence of light and chlorophyll). Balanced symbol equation: 6CO2 + 6H2O -> C6H12O6 + 6O2.',
      'Chlorophyll transfers light energy into chemical energy for the synthesis of carbohydrates.',
      'Leaf adaptations: Large surface area and thin lamina (short diffusion distance); waxy cuticle reduces water loss; upper epidermis is transparent; palisade mesophyll is packed with chloroplasts near the top; spongy mesophyll has air spaces for gas diffusion; stomata allow CO2 entry and O2 exit.',
      'Limiting factors: A factor that directly limits the rate of photosynthesis when in short supply (light intensity, CO2 concentration, or temperature).',
      'Mineral ions: Nitrate ions are needed to make amino acids for proteins (deficiency causes stunted growth); Magnesium ions are needed to make chlorophyll (deficiency causes yellowing/chlorosis of leaves).',
    ],
    examTips: [
      'When explaining why a photosynthesis graph plateaus even though light intensity increases, state clearly that another factor (such as CO2 concentration or temperature) has become the limiting factor.',
    ],
  },
  {
    id: 'topic-7-human-nutrition',
    topicNumber: 'Topic 7',
    title: 'Human Nutrition',
    keywords: [
      'digestion',
      'balanced diet',
      'amylase',
      'protease',
      'pepsin',
      'trypsin',
      'lipase',
      'maltase',
      'bile',
      'emulsification',
      'hydrochloric acid',
      'peristalsis',
      'villi',
      'microvilli',
      'lacteal',
      'small intestine',
      'assimilation',
      'egestion',
    ],
    summary:
      'Balanced diet, physical and chemical digestion along the alimentary canal, enzyme action, bile, and absorption in the ileum.',
    coreConcepts: [
      'Physical digestion breaks large pieces of food into smaller pieces without chemical change, increasing surface area for enzymes (teeth, stomach churning, bile emulsification).',
      'Bile is made in the liver, stored in the gall bladder, and released into the small intestine. It is alkaline to neutralise stomach acid (giving optimum pH for intestinal enzymes) and emulsifies fats into tiny droplets to increase surface area for lipase.',
      'Starch -> (amylase in mouth/pancreas) -> maltose -> (maltase on small intestine epithelium) -> glucose.',
      'Proteins -> (pepsin in stomach at pH 2; trypsin in small intestine at pH 8) -> amino acids.',
      'Fats -> (lipase from pancreas) -> fatty acids and glycerol.',
      'Villi adaptations in the small intestine (ileum): Millions of villi and microvilli give a huge surface area; epithelium is one cell thick for a short diffusion distance; dense capillary network absorbs glucose and amino acids while maintaining a steep concentration gradient; lacteals absorb fatty acids and glycerol.',
    ],
    examTips: [
      'Bile does NOT chemically digest fat and is NOT an enzyme — it physically emulsifies lipids into smaller droplets.',
      'Distinguish clearly between egestion (removal of undigested faeces from anus) and excretion (removal of metabolic waste products).',
    ],
  },
  {
    id: 'topic-8-transport-plants',
    topicNumber: 'Topic 8',
    title: 'Transport in Plants',
    keywords: [
      'xylem',
      'phloem',
      'transpiration',
      'translocation',
      'root hair',
      'water vapour',
      'stomata',
      'potometer',
      'humidity',
      'wind',
      'wilting',
      'source',
      'sink',
      'sucrose',
    ],
    summary:
      'Water uptake by root hairs, xylem transport, transpiration stream and its environmental factors, and translocation in phloem.',
    coreConcepts: [
      'Water enters root hair cells from soil water (higher water potential) by osmosis down a water potential gradient across the cortex into xylem vessels.',
      'Transpiration is the loss of water vapour from leaves: water evaporates from the surfaces of mesophyll cells into the air spaces and then diffuses out of the leaves through the stomata down a water potential gradient.',
      'Transpiration pull draws a continuous column of water up xylem vessels due to cohesion (attraction between water molecules) and adhesion.',
      'Factors increasing transpiration rate: higher temperature (faster evaporation & diffusion), higher wind speed (blows humid air away, keeping water potential gradient steep), lower humidity (steeper water potential gradient), higher light intensity (stomata open wider).',
      'Wilting occurs when the rate of water loss exceeds water uptake; cells become flaccid and lose turgor.',
      'Translocation is the movement of sucrose and amino acids in phloem from regions of production (sources, e.g. photosynthesising leaves) to regions of storage or respiration (sinks, e.g. roots, growing shoots).',
    ],
    examTips: [
      'For transpiration definitions, always state "loss of water VAPOUR from leaves" (evaporation from mesophyll cell surfaces followed by diffusion through stomata).',
    ],
  },
  {
    id: 'topic-9-transport-animals',
    topicNumber: 'Topic 9',
    title: 'Transport in Animals',
    keywords: [
      'heart',
      'double circulation',
      'ventricle',
      'atrium',
      'valve',
      'septum',
      'coronary artery',
      'artery',
      'vein',
      'capillary',
      'red blood cell',
      'white blood cell',
      'phagocyte',
      'lymphocyte',
      'platelet',
      'plasma',
      'fibrinogen',
      'fibrin',
    ],
    summary:
      'Mammalian double circulation, heart structure and cardiac cycle, blood vessels, blood components, and clotting.',
    coreConcepts: [
      'Double circulation means blood passes through the heart twice for each complete circuit: pulmonary circulation to the lungs (low pressure, prevents capillary damage) and systemic circulation to the body (high pressure for rapid oxygen delivery).',
      'Left ventricle has a thicker muscular wall than the right ventricle because it must pump blood at higher pressure around the entire body, whereas the right ventricle only pumps to the nearby lungs.',
      'Valves (atrioventricular and semilunar) prevent the backflow of blood; the septum separates oxygenated and deoxygenated blood.',
      'Arteries have thick elastic and muscular walls with a narrow lumen to withstand high pressure; veins have thinner walls, a wider lumen, and valves to prevent backflow at low pressure; capillaries are one cell thick for rapid exchange by diffusion.',
      'Blood components: Plasma (transports dissolved nutrients, CO2, urea, hormones, heat); Red blood cells (haemoglobin binds O2 to form oxyhaemoglobin); Phagocytes (engulf and digest pathogens by phagocytosis); Lymphocytes (produce specific antibodies); Platelets (blood clotting — fibrinogen is converted into insoluble fibrin mesh).',
    ],
    examTips: [
      'Coronary heart disease (CHD) involves blockage of the coronary arteries supplying oxygen and glucose to the heart muscle itself.',
    ],
  },
  {
    id: 'topic-10-disease',
    topicNumber: 'Topic 10',
    title: 'Diseases and Immunity',
    keywords: [
      'pathogen',
      'antigen',
      'antibody',
      'active immunity',
      'passive immunity',
      'vaccination',
      'vaccine',
      'memory cell',
      'cholera',
      'toxin',
      'chloride ion',
      'hygiene',
    ],
    summary:
      'Pathogens, transmission routes, active and passive immunity, vaccination, and cholera mechanism.',
    coreConcepts: [
      'A pathogen is a disease-causing organism (bacteria, viruses, fungi, protoctists) transmitted directly (blood/body fluids) or indirectly (contaminated food/water, vectors, airborne droplets).',
      'Antigens are specific proteins on the surface of pathogens. Lymphocytes with complementary receptors divide and produce antibodies that bind to antigens, destroying pathogens or marking them for phagocytes.',
      'Active immunity is the defence against a pathogen by antibody production in the body (acquired after natural infection or vaccination with weakened/dead antigens), producing memory cells for rapid secondary response and long-term immunity.',
      'Passive immunity is short-term defence achieved by acquiring ready-made antibodies from another individual (across the placenta, in breast milk, or via injection); no memory cells are produced.',
      'Cholera bacteria secrete a toxin that causes chloride ions to be secreted into the small intestine, lowering water potential in the lumen so water leaves blood/cells by osmosis, causing watery diarrhoea and dehydration.',
    ],
    examTips: [
      'Always mention "specific / complementary shape" when describing antibodies binding to antigens, and mention "memory cells" for long-term immunity after vaccination.',
    ],
  },
  {
    id: 'topic-11-12-gas-respiration',
    topicNumber: 'Topics 11 & 12',
    title: 'Gas Exchange and Respiration',
    keywords: [
      'alveoli',
      'trachea',
      'bronchi',
      'diaphragm',
      'intercostal',
      'ventilation',
      'limewater',
      'hydrogencarbonate',
      'aerobic',
      'anaerobic',
      'lactic acid',
      'oxygen debt',
      'yeast',
      'ethanol',
    ],
    summary:
      'Human gas exchange system, breathing mechanics, aerobic vs anaerobic respiration, and oxygen debt recovery.',
    coreConcepts: [
      'Alveoli adaptations: Huge total surface area, walls one cell thick, moist inner surface, rich capillary network maintaining steep concentration gradients for O2 and CO2.',
      'Inhalation: External intercostal muscles contract (ribs move up and out), diaphragm contracts and flattens -> thorax volume increases -> pressure drops below atmospheric pressure -> air rushes in.',
      'Aerobic respiration: glucose + oxygen -> carbon dioxide + water (C6H12O6 + 6O2 -> 6CO2 + 6H2O), releasing a large amount of energy.',
      'Anaerobic respiration in muscles during vigorous exercise: glucose -> lactic acid (releases much less energy per glucose molecule).',
      'Anaerobic respiration in yeast: glucose -> alcohol (ethanol) + carbon dioxide (C6H12O6 -> 2C2H5OH + 2CO2).',
      'Oxygen debt: After vigorous exercise, heart rate and breathing rate remain high to supply oxygen to transport lactic acid in blood to the liver, where it is broken down (oxidised) via aerobic respiration.',
    ],
    examTips: [
      'Respiration is a chemical reaction inside living cells that RELEASES energy (never write "produces energy" or confuse respiration with breathing).',
    ],
  },
  {
    id: 'topic-13-14-excretion-coordination',
    topicNumber: 'Topics 13 & 14',
    title: 'Excretion, Coordination and Homeostasis',
    keywords: [
      'excretion',
      'urea',
      'deamination',
      'kidney',
      'nephron',
      'glomerulus',
      'ultrafiltration',
      'reabsorption',
      'synapse',
      'neurotransmitter',
      'reflex arc',
      'sensory neurone',
      'relay neurone',
      'motor neurone',
      'eye',
      'retina',
      'iris',
      'accommodation',
      'insulin',
      'glucagon',
      'adrenaline',
      'homeostasis',
      'negative feedback',
      'vasodilation',
      'vasoconstriction',
      'auxin',
      'gravitropism',
      'phototropism',
    ],
    summary:
      'Liver deamination and kidney ultrafiltration/reabsorption, nervous vs hormonal control, eye accommodation, blood glucose & temperature homeostasis, and plant tropisms.',
    coreConcepts: [
      'Deamination occurs in the liver: removal of the nitrogen-containing part of excess amino acids to form urea, which is transported in plasma to the kidneys.',
      'Nephron function: High blood pressure in the glomerulus forces water, glucose, urea, and ions into Bowman’s capsule (ultrafiltration). All glucose and required water/ions are selectively reabsorbed back into blood; excess water, urea, and ions form urine.',
      'Reflex arc: Stimulus -> Receptor -> Sensory neurone -> Relay neurone (in CNS) -> Motor neurone -> Effector -> Response. Synapses ensure impulses travel in one direction using neurotransmitters diffusing across the synaptic gap.',
      'Homeostasis maintains a constant internal environment by negative feedback: High blood glucose triggers insulin secretion from pancreas -> liver converts glucose to glycogen; Low blood glucose triggers glucagon -> glycogen broken down to glucose.',
      'Thermoregulation: When hot, skin arterioles undergo vasodilation (more blood near surface for heat loss by radiation) and sweat evaporates (cooling). When cold, vasoconstriction and shivering occur.',
      'Phototropism & Gravitropism: Auxin is made in shoot tips, diffuses away from light to the shaded side, and stimulates faster cell elongation so the shoot bends toward light.',
    ],
    examTips: [
      'In synapses, specify: vesicles release neurotransmitter -> DIFFUSES across synaptic gap -> binds to specific receptors on the next neurone.',
      'Always state that vasodilation/vasoconstriction happens in ARTERIOLES near the skin surface (blood vessels do NOT move up or down!).',
    ],
  },
  {
    id: 'topic-15-16-drugs-reproduction',
    topicNumber: 'Topics 15 & 16',
    title: 'Drugs and Reproduction',
    keywords: [
      'antibiotic',
      'resistant',
      'mrsa',
      'virus',
      'mitosis',
      'meiosis',
      'diploid',
      'haploid',
      'gamete',
      'fertilisation',
      'zygote',
      'pollination',
      'placenta',
      'umbilical cord',
      'amniotic fluid',
      'oestrogen',
      'progesterone',
      'fsh',
      'lh',
    ],
    summary:
      'Antibiotics vs viruses and antibiotic resistance; asexual vs sexual reproduction; plant and human reproduction, placenta, and menstrual hormones.',
    coreConcepts: [
      'Antibiotics kill bacteria by disrupting cell walls or metabolism; they do NOT affect viruses because viruses lack cell walls and replicate inside host cells.',
      'Mitosis produces genetically identical diploid cells (growth, repair, asexual reproduction). Meiosis is reduction division producing genetically different haploid gametes.',
      'Pollination: Wind-pollinated flowers have dull small petals, exposed feathery stigmas and anthers, and light smooth pollen. Insect-pollinated flowers have large bright petals, nectar, enclosed sticky stigma, and larger sticky/spiky pollen.',
      'Placenta allows diffusion of oxygen, glucose, amino acids, and antibodies from mother’s blood to fetus, and CO2 and urea from fetus to mother’s blood, while keeping maternal and fetal blood separate.',
      'Menstrual cycle hormones: FSH stimulates follicle maturation and oestrogen secretion; Oestrogen thickens uterus lining and inhibits FSH while triggering LH surge (ovulation); Progesterone maintains the thickened uterus lining.',
    ],
    examTips: [
      'Never write that bacteria "become immune" to antibiotics — write that bacteria develop "resistance" via random mutation and natural selection.',
    ],
  },
  {
    id: 'topic-17-18-inheritance-selection',
    topicNumber: 'Topics 17 & 18',
    title: 'Inheritance, Variation and Selection',
    keywords: [
      'allele',
      'gene',
      'genotype',
      'phenotype',
      'dominant',
      'recessive',
      'codominance',
      'homozygous',
      'heterozygous',
      'punnett',
      'sex-linked',
      'mutation',
      'natural selection',
      'selective breeding',
      'adaptation',
      'xerophyte',
      'hydrophyte',
    ],
    summary:
      'Monohybrid inheritance, codominance, sex-linked characteristics, continuous vs discontinuous variation, and natural vs artificial selection.',
    coreConcepts: [
      'A gene is a length of DNA that codes for a protein. Alleles are alternative forms of a gene.',
      'Dominant alleles are expressed in the phenotype if at least one copy is present; recessive alleles are only expressed when two copies are present (homozygous recessive).',
      'Codominance occurs when both alleles in a heterozygote are expressed in the phenotype (e.g. IA and IB in ABO blood groups).',
      'Natural selection: Variation exists within a population (caused by mutation) -> individuals with advantageous alleles are better adapted to survive competition/predation/environmental change -> they survive, reproduce, and pass advantageous alleles to offspring -> frequency of advantageous allele increases over generations.',
      'Xerophytes (dry habitats) have sunken stomata, rolled leaves, thick waxy cuticles, and needle-like leaves (reduced surface area) to minimise transpiration.',
    ],
    examTips: [
      'For natural selection 4-mark or 5-mark answers, hit all five beats: variation -> mutation -> survival advantage -> reproduction -> passing alleles to offspring -> increased frequency over generations.',
    ],
  },
  {
    id: 'topic-19-21-ecology-biotech',
    topicNumber: 'Topics 19, 20 & 21',
    title: 'Organisms, Ecology, Human Influences and Biotechnology',
    keywords: [
      'food chain',
      'food web',
      'trophic level',
      'pyramid of energy',
      'carbon cycle',
      'nitrogen cycle',
      'nitrogen fixation',
      'nitrification',
      'denitrification',
      'eutrophication',
      'deforestation',
      'greenhouse',
      'genetic modification',
      'plasmid',
      'restriction enzyme',
      'ligase',
      'fermenter',
      'penicillin',
      'lactase',
      'pectinase',
    ],
    summary:
      'Energy flow in ecosystems, carbon and nitrogen cycles, eutrophication and conservation, fermenters, and genetic modification using plasmids.',
    coreConcepts: [
      'Energy flow is non-cyclical: about 90% of energy is lost between trophic levels via respiration (heat), movement, excretion, and uneaten/undigested material, limiting food chains to 4–5 trophic levels.',
      'Nitrogen cycle: Nitrogen-fixing bacteria convert N2 gas into ammonium/nitrates; decomposers break down dead protein into ammonium; nitrifying bacteria oxidise ammonium to nitrites then nitrates; denitrifying bacteria convert nitrates back to N2 in waterlogged (anaerobic) soils.',
      'Eutrophication: Excess nitrate/fertiliser washes into water -> rapid algal bloom blocks sunlight -> aquatic plants die -> aerobic bacteria decompose dead matter and respire rapidly -> dissolved oxygen depleted -> fish and aquatic animals suffocate and die.',
      'Genetic modification: Isolate human gene (e.g. insulin) using restriction enzymes -> cut bacterial plasmid with the SAME restriction enzyme to leave complementary sticky ends -> join using DNA ligase to form recombinant plasmid -> insert into bacteria and culture in fermenters.',
      'Fermenters control temperature (cooling jacket removes respiration heat), pH (acid/alkali probes & buffers), oxygen supply (sparger), mixing (paddles), and sterility (steam sterilisation).',
    ],
    examTips: [
      'In eutrophication questions, NEVER write that algae "use up all the oxygen by photosynthesis" — algae block light, plants die, and DECOMPOSER BACTERIA respire aerobically using up the dissolved oxygen.',
    ],
  },
];

export function searchBiologyNotes(query: string): {
  matches: SyllabusTopic[];
  isOutOfScope: boolean;
} {
  const normalized = query.toLowerCase().trim();
  if (!normalized) {
    return { matches: BIOLOGY_SYLLABUS_NOTES.slice(0, 3), isOutOfScope: false };
  }

  const outOfScopeIndicators = [
    'history',
    'world war',
    'napoleon',
    'algebra',
    'quadratic',
    'calculus',
    'python',
    'javascript',
    'react',
    'quantum',
    'relativity',
    'stoichiometry',
    'electrolysis',
    'titration',
    'periodic table',
    'shakespeare',
    'poem',
    'geography',
    'economics',
    'accounting',
    'recipe',
    'football',
    'movie',
    'politics',
  ];

  const biologyIndicators = [
    'bio',
    'igcse',
    '0610',
    'cell',
    'enzyme',
    'osmosis',
    'diffusion',
    'active transport',
    'photosynthesis',
    'respiration',
    'heart',
    'blood',
    'kidney',
    'nephron',
    'dna',
    'gene',
    'allele',
    'mitosis',
    'meiosis',
    'xylem',
    'phloem',
    'transpiration',
    'translocation',
    'digestion',
    'bile',
    'villi',
    'alveoli',
    'synapse',
    'neurone',
    'reflex',
    'insulin',
    'glucagon',
    'hormone',
    'placenta',
    'vaccine',
    'immunity',
    'antibody',
    'antigen',
    'pathogen',
    'cholera',
    'eutrophication',
    'nitrogen',
    'carbon',
    'food chain',
    'plasmid',
    'fermenter',
    'auxin',
    'tropism',
    'natural selection',
    'punnett',
    'homeostasis',
    'urea',
    'deamination',
    'stoma',
    'stomata',
    'chloroplast',
    'leaf',
    'protein',
    'starch',
    'glucose',
    'lipid',
    'benedict',
    'biuret',
    'iodine',
    'atrium',
    'ventricle',
    'artery',
    'vein',
    'capillary',
    'platelet',
    'phagocyte',
    'lymphocyte',
    'lactic',
    'yeast',
    'antibiotic',
  ];

  const hasBioTerm = biologyIndicators.some((term) => normalized.includes(term));
  const hasNonBioTerm = outOfScopeIndicators.some((term) => normalized.includes(term));

  if (hasNonBioTerm && !hasBioTerm) {
    return { matches: [], isOutOfScope: true };
  }

  const scored = BIOLOGY_SYLLABUS_NOTES.map((topic) => {
    let score = 0;
    const titleLower = topic.title.toLowerCase();
    const summaryLower = topic.summary.toLowerCase();

    if (titleLower.includes(normalized)) score += 10;
    for (const kw of topic.keywords) {
      if (normalized.includes(kw)) {
        score += kw.includes(' ') ? 6 : 4;
      }
    }
    const tokens = normalized.split(/[^a-z0-9]+/).filter((t) => t.length >= 3);
    for (const token of tokens) {
      if (titleLower.includes(token)) score += 3;
      if (summaryLower.includes(token)) score += 1;
      for (const concept of topic.coreConcepts) {
        if (concept.toLowerCase().includes(token)) score += 1;
      }
    }
    return { topic, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) {
    if (!hasBioTerm && normalized.split(/\s+/).length >= 2) {
      return { matches: [], isOutOfScope: true };
    }
    return { matches: BIOLOGY_SYLLABUS_NOTES.slice(0, 2), isOutOfScope: false };
  }

  return {
    matches: scored.slice(0, 3).map((item) => item.topic),
    isOutOfScope: false,
  };
}
