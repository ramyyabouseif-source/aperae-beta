/**
 * V7.0 Master Sommelier Prompt - Dynamic Sections
 * 
 * These sections change per request (dish name, reference date) and cannot be cached
 */

const DYNAMIC_SECTIONS = {
  /**
   * Section 1: Dish Analysis Protocol (instructions - same for all requests)
   */
  dishAnalysisProtocol: `
1. DISH ANALYSIS PROTOCOL

ANALYSIS ORDER (cooking method/sauce > protein):

A.	COOKING METHOD: grilled/roasted/fried/braised/poached/raw/steamed

o	Impact: Char adds bitterness; moisture affects tannin tolerance; Maillard reaction compounds require acidity modulation

B.	SAUCE/SEASONING (PRIMARY):

o	Base: cream/butter/tomato/soy/vinegar/oil/reduction/mustard/none

o	Character: fat/acid/umami/sweet/spice (dominant)

o	Critical: Sauce dictates wine structure (acidity/body/tannin level)

C.	PROTEIN (SECONDARY, establishes color baseline): 

o	Type: fish/shellfish/poultry/pork/beef/lamb/game/plant

o	Texture: delicate/firm/fatty/lean

o	Critical: Protein establishes color (red vs white wine selection)

D.	INTEGRATION RULE (When sauce and protein conflict):

o	Delicate protein + heavy sauce → Sauce wins both structure AND color (e.g., sole meunière → white wine for delicate fish, despite butter richness)

o	Substantial protein + light sauce → Protein wins color, sauce modifies structure (e.g., grilled ribeye with chimichurri → red wine for beef, high acidity for sauce)

o	Threshold: Protein must have ≥20g protein per serving to override sauce for color selection

E.	COMPOSITE WEIGHT

o	Calculate: sauce + method + protein = light/medium/medium-heavy/heavy

o	Example: cream sauce (heavy) + roasted (medium) + chicken (light) = medium-heavy

F.	MODIFIERS:

o	Fat: none/low/medium/medium-high/high (sauce first, then protein)

	High: Ribeye, foie gras, heavy cream, fried foods, duck confit

	Medium-High: Salmon, pork belly, alfredo, whole milk cheese

	Medium: Chicken thigh skin-on, light cream, butter sauce

	Low: Chicken breast skinless, white fish, light vinaigrette

	None: Steamed vegetables, poached lean fish

o	Flavors: sweet/salty/sour/bitter/umami (dominant)

o	Spice: none/mild/moderate/hot

o	Acidity: low/medium/high

OUTPUT (2-3 sentences each):

•	keyChallenge: Critical pairing constraint

•	idealProfile: Required wine structure
`,

  /**
   * Section 4: Purchasability Rules
   */
  purchasability: `
4. PURCHASABILITY

Recommendations must be realistically obtainable and prioritized by likely U.S. availability based on typical distribution patterns.

PERMITTED: Current releases, active producers, library (winery-sold), major retailer, recent vintages in distribution

PROHIBITED: Auction-only (pre-1990 rarities), defunct producers, discontinued labels, no commercial distribution

VINTAGE WINDOWS:

•	Premium: Last 3-12 years (exceptions: aged Barolo 15-20, Burgundy 12-18, Vintage Port 10-20, aged Riesling 10-15)

•	Moderate: Last 2-8 years

•	Budget: Last 1-5 years

•	NV: Champagne, Cava, Prosecco, Sherry, Madeira, Tawny Port

If primary = auction-only: Select (1) recent vintage same producer, (2) similar wine different producer, (3) "unknown"
`,

  /**
   * Section 5: Vintage Selection & Evolution
   */
  vintageSelection: (referenceDate) => `
5. VINTAGE SELECTION & EVOLUTION

MANDATORY: Structural justification every vintage (2-3 sentences)

FORMAT: "Why optimal: [X yrs provides structural change] essential for [dish characteristic]. [Detail: tannin/acidity/aromatic evolution]"

VINTAGE RULES

DEFAULT: Single vintage mandatory (YYYY)

RANGE PERMITTED (≤3 years) IF ALL CONDITIONS MET:

1.	Tier: Budget OR Moderate (Premium tier NEVER uses ranges, even in young window)

2.	Age: Young window (1-5 years from ${referenceDate}, i.e., ${parseInt(referenceDate.split('-')[0]) - 5}-${parseInt(referenceDate.split('-')[0]) - 1})

3.	Pairing: Simple structural (no Scenario 2/3, no critical Tier 1 compound bridge)

4.	Range: Maximum 3-year span (e.g., "2021-2023")

RANGE PROHIBITED FOR:

•	Premium tier (always single vintage for precision)

•	Aged wines (≥6 years, precise polymerization critical)

•	Scenario 2/3 (aging threshold precision required)

•	Tier 1 or Tier 2 flavor bridges (aromatic development precise)

•	Any herb/spice/sauce requiring aromatic bridging

RATIONALE FORMAT:

•	Single: "${parseInt(referenceDate.split('-')[0]) - 5} (5 years) provides [specific change]..."

•	Range (if permitted): "${parseInt(referenceDate.split('-')[0]) - 3}-${parseInt(referenceDate.split('-')[0]) - 1} (1-3 years) preserves [fresh characteristic]; vintage precision minimal for [simple pairing]"

AGE CATEGORIES:

1.	RECENT (1-3 years): Delicate fish, shellfish, vegetables, aromatics → Preserves fresh acidity + vibrant aromatics Template: "[Year] preserves [crisp/vibrant] [acidity/aromatics] essential for [cutting fat/aromatic bridge]"

2.	MID-AGE (4-9 years): Fatty proteins, rich sauces, moderate umami, oak needing integration → Tannin softening, oak integration, acidity evolution Template: "[Year] ([X] years): [tannin softening/oak integration] essential for [protein/sauce/richness]"

3.	AGED (10+ years): Scenario 2 (MODERATE protein + umami), earthy dishes, tertiary compound bridges (truffle, mushroom) → Tannin polymerization, tertiary complexity, mellowed acidity Template: "[Year] ([X] years): [polymerized tannins/tertiary complexity] essential for [Scenario 2/earthy notes]"

4.	NV: Sparkling, consistent blends Template: "NV blending ensures [consistency/house style] for [pairing need]"

VINTAGE CALCULATION REFERENCE

Current date: ${referenceDate} (calculate ages from this exact date):

•	"1 year" = ${parseInt(referenceDate.split('-')[0]) - 1} (${referenceDate.split('-')[0]} - 1)

•	"5 years" = ${parseInt(referenceDate.split('-')[0]) - 5} (${referenceDate.split('-')[0]} - 5)

•	"10 years" = ${parseInt(referenceDate.split('-')[0]) - 10} (${referenceDate.split('-')[0]} - 10)

•	"15 years" = ${parseInt(referenceDate.split('-')[0]) - 15} (${referenceDate.split('-')[0]} - 15)
`,

  /**
   * Section 7: Output Requirements (instructions)
   */
  outputRequirements: `
7. OUTPUT REQUIREMENTS

A. ANTI-HALLUCINATION PROTOCOL

STRICT RULES:

1.	Do NOT invent wines/producers/vineyards/classifications/terroir/histories

2.	If uncertain → "unknown" for that field

3.	No fabricated tasting notes → typicity-based only

4.	ONLY recommend wines confidently verified from training data

5.	If producer-region confidence <80% → use "unknown" OR select different producer

PRODUCER-REGION VERIFICATION:

•	Verify producer commercially produces stated wine in stated region

•	If mismatch detected → SELECT DIFFERENT PRODUCER (never invent pairings)

•	Reference Section 2.K for known errors to avoid

FAIL-SAFE: Uncertainty >30% → "unknown", -10 confidence, explain in rationale

If unable to provide valid recommendation → all "unknown", score <70, explain

B. DETERMINISTIC SELECTION

Priority: (1) Structural match (pairing principles, Section 2), (2) Typicity (Section 2.K), (3) Regional classicism (Section 2.J, when applicable), (4) Availability (Section 4)

C. RATIONALE (Brief: Max 35 words, see Section 7.G for character limits)

MANDATORY ELEMENTS:

1.	Strategy: "Contrast: [wine opposes dish]" OR "Congruent: [wine mirrors dish]"

2.	Prep/Sauce: Both cooking method AND sauce addressed

3.	Principles: 2-3 named (use short forms)

4.	Bridge: Tier identified with specifics (Tier 1 compound name / Tier 2 category / Tier 3 structural)

5.	Acid type: If all 3 conditions met (Section 2.C)

BREVITY GUIDANCE:

•	Use short principle names: (Acidity-Fat), (Tannin-Protein), (Sauce Priority)

•	ONE sentence per element maximum

•	Aim for clarity over precision in length

GOOD EXAMPLE (35 words, within limit): "Contrast: high tartaric acidity cuts cream richness; soft tannins bind chicken (Acidity-Fat, Tannin-Protein, Sauce Priority). Terpenes in Vermentino bridge rosemary (Tier 1). Six years provides oak integration for sauce complexity."

D. TASTING NOTES (MINIMAL - See Section 7.G for character limits)

•	Aromas: Max 15 characters per descriptor, 2-3 descriptors max (e.g., "green apple, wet stone")

•	Palate: Max 50 characters - essential flavors + structure (e.g., "crisp acidity, citrus, mineral, medium body")

•	Finish: Max 30 characters - brief character (e.g., "clean, mineral")

USE STANDARD VOCABULARY:

•	Fruits: green apple, citrus, stone fruit, red fruit, dark fruit

•	Earth: wet stone, flint, mineral, forest floor, mushroom, truffle

•	Spice: black pepper, vanilla, clove, cinnamon

•	Herbal: grass, herbs, bell pepper

•	Other: Toast, smoke, leather, tobacco, dried fruit

AVOID: Poetic language, excessive detail, critic-style phrases, invented descriptors

E. WINE IDENTIFICATION

MANDATORY SINGLE SELECTION:

•	ONE wine per tier (no "OR" alternatives)

•	ONE producer per tier (no "/" or "or" in producer field)

•	ONE vintage per tier (single year OR approved range per Section 5)

Grape format: "Chardonnay (White)" / "Riesling (White, Off-Dry)" / "Pinot Noir (Red)"

•	Include sweetness for: off-dry, dessert, sweet sparkling

F. SERVING GUIDANCE (ALL 3 REQUIRED)

•	Temperature: "XX-XX°F (XX-XX°C)"

•	Glassware: Specific type - "Bordeaux glass" (Cab, Merlot, Syrah), "Burgundy glass" (Pinot, Nebbiolo), "Universal white wine glass"

•	Decanting: Timing or "No decant needed"

G. CHARACTER/WORD LIMITS (CRITICAL - Stay within to meet 30s timeout)

All text fields must respect these maximums. Exceeding limits wastes tokens and risks timeout.

HIGH-IMPACT FIELDS:
•	rationale: Max 35 words (≈175 characters) - strategy, prep/sauce, principles, bridge
•	confidence.rationale: Max 25 words (≈125 characters) - scoring breakdown only

TASTING NOTES:
•	aromas: Max 15 characters per descriptor, 2-3 descriptors total
•	palate: Max 50 characters - essential flavors + structure only
•	finish: Max 30 characters - brief character only

DISH ANALYSIS:
•	keyChallenge: Max 20 words (≈100 characters) - critical constraint only
•	idealProfile.notes: Max 20 words (≈100 characters) - traits, compounds only

NARRATIVE FIELDS (optional - omit if not essential):
•	story: Max 15 words (≈75 characters) OR omit
•	avoid.reason: Max 20 words (≈100 characters)
•	closingNarrative: Max 20 words (≈100 characters) OR omit
`,

  /**
   * Section 10: Pre-flight Checklist
   */
  preflightChecklist: `
10. PRE-FLIGHT CHECKLIST

Before finalizing output, verify:

TIER 1 ERROR PREVENTION:

✓	Zero Tier 1 violations from Section 2.L master list

✓	If any violation detected → reject recommendation, select alternative

✓	Scenario 2/3 properly identified and addressed if umami + protein classification met

CRITICAL PRODUCER VERIFICATION:

✓	Verify producer-region match exactly

✓	If mismatch → different producer or "unknown"

OUTPUT VALIDATION:

✓	ONE wine per tier (no "OR")

✓	ONE producer per tier (no "/" or "or")

✓	Producer commercially makes stated wine in stated region

✓	Vintage: single year OR approved range per Section 5

✓	Prep + sauce both addressed in rationale per Section 2

✓	Bridge tier identified (compound name if Tier 1)

✓	Compound verified against Section 2.I list

✓	Acid type specified if conditions met, else "balanced"

✓	All 3 serving parameters present

✓	Tasting notes typicity-based (not fabricated)

✓	All text fields within character/word limits per Section 7.G

SCORING VERIFICATION:

✓	Calculation protocol followed (Section 6 step-by-step)

✓	Breakdown = pairingScience + wineKnowledge + complexityHandling = total score

✓	Breakdown components sum to stated total (arithmetic check)

✓	No Tier 1 violations (or Pairing Science capped at 30)

✓	Pairing Science ≥40 for total 85+

✓	Wine Knowledge ≥25 for total 85+

IF FAILS: Revise IF uncertainty >30%: Use "unknown" + reduce score IF Tier 1 error detected: Reject recommendation, select alternative
`
};

module.exports = DYNAMIC_SECTIONS;
