import { useState, useEffect, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ToolShell } from "@/components/tools/shared/tool-shell"
import { Minimize2, Copy, RotateCcw, Info, Zap } from "lucide-react"
import { ToolComponentProps } from "@/components/workspace/tool-panel"
import { useWorkspace } from "@/context/workspace-context"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// =============================================================================
// CAVEMAN-STYLE PROMPT COMPRESSION ENGINE v2.0
// Aggressive semantic compression - removes predictable grammar
// =============================================================================

// Filler words - add no semantic value (expanded)
const FILLERS = new Set([
  // Intensifiers (meaningless emphasis)
  "very", "really", "quite", "rather", "somewhat", "fairly", "extremely",
  "incredibly", "tremendously", "remarkably", "exceptionally", "hugely",
  // Hedging (weak language)
  "just", "simply", "basically", "essentially", "actually", "technically",
  "literally", "definitely", "certainly", "obviously", "clearly", "apparently",
  "presumably", "supposedly", "seemingly", "arguably", "admittedly",
  // Approximators
  "practically", "virtually", "nearly", "almost", "pretty", "roughly",
  "approximately", "about", "around", "nearly", "roughly",
  // Empty emphasis  
  "totally", "completely", "absolutely", "entirely", "utterly", "wholly",
  "thoroughly", "perfectly", "fully", "truly", "genuinely",
  // Discourse markers (spoken style)
  "well", "so", "now", "anyway", "anyways", "okay", "right", "like",
  // Weak qualifiers
  "perhaps", "maybe", "possibly", "probably", "likely", "potentially",
  "conceivably", "supposedly", "hopefully", "ideally",
])

// Connectives that LLMs can infer from context (expanded)
const CONNECTIVES = new Set([
  // Contrast
  "however", "nevertheless", "nonetheless", "although", "though",
  "yet", "still", "conversely", "alternatively", "instead",
  // Cause/effect
  "therefore", "thus", "hence", "consequently", "accordingly",
  "subsequently", "thereby", "wherefore",
  // Addition
  "moreover", "furthermore", "additionally", "also", "besides",
  "likewise", "similarly", "equally", "correspondingly",
  // Sequence
  "meanwhile", "subsequently", "thereafter", "afterward", "beforehand",
  "firstly", "secondly", "thirdly", "lastly", "finally",
  // Emphasis
  "indeed", "certainly", "undoubtedly", "unquestionably",
  // Clarification
  "specifically", "particularly", "especially", "notably", "namely",
])

// Hedging phrases - remove entirely
const HEDGING_PHRASES: RegExp[] = [
  /\bi think( that)?\b/gi,
  /\bi believe( that)?\b/gi,
  /\bi feel( that)?\b/gi,
  /\bi would say( that)?\b/gi,
  /\bit seems( like| that| to me)?\b/gi,
  /\bit appears( that)?\b/gi,
  /\bit looks like\b/gi,
  /\bin my opinion,?\b/gi,
  /\bin my view,?\b/gi,
  /\bfrom my perspective,?\b/gi,
  /\bas far as i know,?\b/gi,
  /\bas far as i can tell,?\b/gi,
  /\bto be honest,?\b/gi,
  /\bhonestly,?\b/gi,
  /\bfrankly,?\b/gi,
  /\bto be fair,?\b/gi,
  /\bif you ask me,?\b/gi,
  /\bpersonally,?\b/gi,
  /\bgenerally speaking,?\b/gi,
  /\bbroadly speaking,?\b/gi,
  /\bby and large,?\b/gi,
  /\ball things considered,?\b/gi,
  /\bat the end of the day,?\b/gi,
  /\bwhen all is said and done,?\b/gi,
]

// Verbose phrases → shorter equivalents (massively expanded)
const PHRASE_REPLACEMENTS: [RegExp, string][] = [
  // Purpose/reason
  [/\bin order to\b/gi, "to"],
  [/\bso as to\b/gi, "to"],
  [/\bfor the purpose of\b/gi, "to"],
  [/\bwith the aim of\b/gi, "to"],
  [/\bwith the intention of\b/gi, "to"],
  [/\bwith a view to\b/gi, "to"],
  [/\bdue to the fact that\b/gi, "because"],
  [/\bowing to the fact that\b/gi, "because"],
  [/\bfor the reason that\b/gi, "because"],
  [/\bon account of the fact that\b/gi, "because"],
  [/\bby virtue of the fact that\b/gi, "because"],
  [/\bon the grounds that\b/gi, "because"],
  [/\bgiven the fact that\b/gi, "since"],
  [/\bconsidering the fact that\b/gi, "since"],
  [/\bin light of the fact that\b/gi, "since"],
  [/\bon account of\b/gi, "because"],
  [/\bas a consequence of\b/gi, "from"],
  [/\bas a result of\b/gi, "from"],

  // Reference/about
  [/\bwith regard to\b/gi, "about"],
  [/\bwith regards to\b/gi, "about"],
  [/\bwith respect to\b/gi, "about"],
  [/\bin regards to\b/gi, "about"],
  [/\bin regard to\b/gi, "about"],
  [/\bconcerning the matter of\b/gi, "about"],
  [/\bpertaining to\b/gi, "about"],
  [/\brelating to\b/gi, "about"],
  [/\bin connection with\b/gi, "about"],
  [/\bon the subject of\b/gi, "about"],
  [/\bon the topic of\b/gi, "about"],
  [/\bin terms of\b/gi, "for"],
  [/\bwhen it comes to\b/gi, "for"],
  [/\bas for\b/gi, "for"],
  [/\bas regards\b/gi, "about"],

  // Conditionals
  [/\bin the event that\b/gi, "if"],
  [/\bin the case that\b/gi, "if"],
  [/\bin case of\b/gi, "if"],
  [/\bin the unlikely event that\b/gi, "if"],
  [/\bon the condition that\b/gi, "if"],
  [/\bprovided that\b/gi, "if"],
  [/\bproviding that\b/gi, "if"],
  [/\bassuming that\b/gi, "if"],
  [/\bgiven that\b/gi, "if"],
  [/\bsupposing that\b/gi, "if"],

  // Time expressions
  [/\bat this point in time\b/gi, "now"],
  [/\bat the present time\b/gi, "now"],
  [/\bat this moment in time\b/gi, "now"],
  [/\bat the current time\b/gi, "now"],
  [/\bat this juncture\b/gi, "now"],
  [/\bat this time\b/gi, "now"],
  [/\bat present\b/gi, "now"],
  [/\bcurrently\b/gi, "now"],
  [/\bpresently\b/gi, "now"],
  [/\bprior to\b/gi, "before"],
  [/\bprevious to\b/gi, "before"],
  [/\bin advance of\b/gi, "before"],
  [/\bahead of\b/gi, "before"],
  [/\bsubsequent to\b/gi, "after"],
  [/\bfollowing\b/gi, "after"],
  [/\bin the aftermath of\b/gi, "after"],
  [/\buntil such time as\b/gi, "until"],
  [/\bduring the course of\b/gi, "during"],
  [/\bin the course of\b/gi, "during"],
  [/\bover the course of\b/gi, "during"],
  [/\bfor the duration of\b/gi, "during"],

  // Despite/although
  [/\bin spite of\b/gi, "despite"],
  [/\bin spite of the fact that\b/gi, "although"],
  [/\bdespite the fact that\b/gi, "although"],
  [/\bnotwithstanding the fact that\b/gi, "although"],
  [/\birrespective of\b/gi, "despite"],
  [/\bregardless of\b/gi, "despite"],

  // Means/method
  [/\bby means of\b/gi, "via"],
  [/\bthrough the use of\b/gi, "using"],
  [/\bby way of\b/gi, "via"],
  [/\bby use of\b/gi, "using"],
  [/\bthrough the medium of\b/gi, "via"],
  [/\bwith the help of\b/gi, "using"],
  [/\bwith the aid of\b/gi, "using"],
  [/\bwith the assistance of\b/gi, "using"],

  // Exception
  [/\bwith the exception of\b/gi, "except"],
  [/\bexcept for the fact that\b/gi, "except"],
  [/\bapart from\b/gi, "except"],
  [/\bother than\b/gi, "except"],

  // Addition
  [/\bin addition to\b/gi, "plus"],
  [/\bas well as\b/gi, "and"],
  [/\btogether with\b/gi, "with"],
  [/\balong with\b/gi, "with"],
  [/\bcoupled with\b/gi, "with"],
  [/\bin conjunction with\b/gi, "with"],
  [/\bin combination with\b/gi, "with"],

  // Compliance/accordance
  [/\bin accordance with\b/gi, "per"],
  [/\bin compliance with\b/gi, "per"],
  [/\bin conformity with\b/gi, "per"],
  [/\bin keeping with\b/gi, "per"],
  [/\bconsistent with\b/gi, "per"],

  // Ability/capability
  [/\bhas the ability to\b/gi, "can"],
  [/\bhave the ability to\b/gi, "can"],
  [/\bhas the capacity to\b/gi, "can"],
  [/\bhave the capacity to\b/gi, "can"],
  [/\bhas the capability to\b/gi, "can"],
  [/\bhave the capability to\b/gi, "can"],
  [/\bis capable of\b/gi, "can"],
  [/\bare capable of\b/gi, "can"],
  [/\bis able to\b/gi, "can"],
  [/\bare able to\b/gi, "can"],
  [/\bwas able to\b/gi, "could"],
  [/\bwere able to\b/gi, "could"],
  [/\bis in a position to\b/gi, "can"],
  [/\bare in a position to\b/gi, "can"],

  // Necessity
  [/\bit is important to note that\b/gi, "note:"],
  [/\bit is important to mention that\b/gi, "note:"],
  [/\bit should be noted that\b/gi, "note:"],
  [/\bit is worth noting that\b/gi, "note:"],
  [/\bit is worth mentioning that\b/gi, "note:"],
  [/\bit is crucial to note that\b/gi, "note:"],
  [/\bit bears mentioning that\b/gi, "note:"],
  [/\bit is necessary to\b/gi, "must"],
  [/\bit is essential to\b/gi, "must"],
  [/\bit is imperative to\b/gi, "must"],
  [/\bit is vital to\b/gi, "must"],
  [/\bit is critical to\b/gi, "must"],
  [/\bit is required to\b/gi, "must"],
  [/\bthere is a need to\b/gi, "must"],

  // Manner
  [/\bin a manner that\b/gi, "that"],
  [/\bin such a way that\b/gi, "so"],
  [/\bin a way that\b/gi, "that"],
  [/\bin such a manner that\b/gi, "so"],
  [/\bin a fashion that\b/gi, "that"],

  // Frequency/extent
  [/\bfor the most part\b/gi, "mostly"],
  [/\bto a large extent\b/gi, "largely"],
  [/\bto a great extent\b/gi, "largely"],
  [/\bto a significant extent\b/gi, "largely"],
  [/\bto a considerable extent\b/gi, "largely"],
  [/\bto a certain extent\b/gi, "somewhat"],
  [/\bto some extent\b/gi, "somewhat"],
  [/\bto a degree\b/gi, "somewhat"],
  [/\bin most cases\b/gi, "usually"],
  [/\bin the majority of cases\b/gi, "usually"],
  [/\bmore often than not\b/gi, "usually"],
  [/\bin some cases\b/gi, "sometimes"],
  [/\bin certain cases\b/gi, "sometimes"],
  [/\bin all cases\b/gi, "always"],
  [/\bin every case\b/gi, "always"],
  [/\bwithout exception\b/gi, "always"],
  [/\bin many cases\b/gi, "often"],
  [/\bin numerous cases\b/gi, "often"],
  [/\bon numerous occasions\b/gi, "often"],
  [/\bon many occasions\b/gi, "often"],
  [/\bon a regular basis\b/gi, "regularly"],
  [/\bon a frequent basis\b/gi, "often"],
  [/\bon a daily basis\b/gi, "daily"],
  [/\bon a weekly basis\b/gi, "weekly"],
  [/\bon a monthly basis\b/gi, "monthly"],
  [/\bon an annual basis\b/gi, "yearly"],

  // Quantity
  [/\ba large number of\b/gi, "many"],
  [/\ba great number of\b/gi, "many"],
  [/\ba significant number of\b/gi, "many"],
  [/\ba considerable number of\b/gi, "many"],
  [/\bnumerous\b/gi, "many"],
  [/\ba multitude of\b/gi, "many"],
  [/\ba plethora of\b/gi, "many"],
  [/\ba small number of\b/gi, "few"],
  [/\ba limited number of\b/gi, "few"],
  [/\ba handful of\b/gi, "few"],
  [/\ba significant amount of\b/gi, "much"],
  [/\ba considerable amount of\b/gi, "much"],
  [/\ba great deal of\b/gi, "much"],
  [/\bthe majority of\b/gi, "most"],
  [/\bthe bulk of\b/gi, "most"],
  [/\bthe minority of\b/gi, "few"],
  [/\ba fraction of\b/gi, "some"],

  // Facts
  [/\bas a matter of fact\b/gi, "in fact"],
  [/\bin point of fact\b/gi, "actually"],
  [/\bin actual fact\b/gi, "actually"],
  [/\bthe fact of the matter is\b/gi, ""],
  [/\bthe fact is\b/gi, ""],
  [/\bthe truth is\b/gi, ""],
  [/\bthe reality is\b/gi, ""],

  // Determiners
  [/\ball of the\b/gi, "all"],
  [/\bboth of the\b/gi, "both"],
  [/\beach of the\b/gi, "each"],
  [/\bevery single\b/gi, "every"],
  [/\beach and every\b/gi, "every"],
  [/\bone of the\b/gi, "one"],
  [/\bsome of the\b/gi, "some"],
  [/\bmany of the\b/gi, "many"],
  [/\bmost of the\b/gi, "most"],
  [/\bnone of the\b/gi, "no"],

  // Sequence markers
  [/\bfirst and foremost\b/gi, "first"],
  [/\bfirst of all\b/gi, "first"],
  [/\bto begin with\b/gi, "first"],
  [/\bto start with\b/gi, "first"],
  [/\blast but not least\b/gi, "finally"],
  [/\bin conclusion\b/gi, "finally"],
  [/\bto conclude\b/gi, "finally"],
  [/\bin summary\b/gi, "overall"],
  [/\bto summarize\b/gi, "overall"],
  [/\bin closing\b/gi, "finally"],

  // Time periods
  [/\bpoint in time\b/gi, "time"],
  [/\bperiod of time\b/gi, "period"],
  [/\bspan of time\b/gi, "span"],
  [/\blength of time\b/gi, "time"],

  // Misc verbose
  [/\bwhether or not\b/gi, "whether"],
  [/\bthe fact that\b/gi, "that"],
  [/\bin the process of\b/gi, ""],
  [/\bgoes without saying\b/gi, ""],
  [/\bneedless to say\b/gi, ""],
  [/\bit goes without saying that\b/gi, ""],
  [/\bit is self-evident that\b/gi, ""],
  [/\bas everyone knows\b/gi, ""],
  [/\bas is well known\b/gi, ""],
  [/\bas you know\b/gi, ""],
  [/\bas you can see\b/gi, ""],
  [/\bas we all know\b/gi, ""],
  [/\bas mentioned earlier\b/gi, ""],
  [/\bas mentioned above\b/gi, ""],
  [/\bas stated earlier\b/gi, ""],
  [/\bas stated above\b/gi, ""],
  [/\bas discussed earlier\b/gi, ""],
  [/\bas discussed above\b/gi, ""],
  [/\bas noted earlier\b/gi, ""],
  [/\bas noted above\b/gi, ""],
  [/\bas previously mentioned\b/gi, ""],
  [/\bas previously stated\b/gi, ""],
  [/\bas i mentioned\b/gi, ""],
  [/\bthe thing is\b/gi, ""],
  [/\bthe point is\b/gi, ""],
  [/\bwhat i mean is\b/gi, ""],
  [/\bwhat this means is\b/gi, ""],

  // Nominalizations → verbs
  [/\bmake a decision\b/gi, "decide"],
  [/\bcome to a decision\b/gi, "decide"],
  [/\breach a decision\b/gi, "decide"],
  [/\barrive at a decision\b/gi, "decide"],
  [/\btake into consideration\b/gi, "consider"],
  [/\bgive consideration to\b/gi, "consider"],
  [/\bhave an effect on\b/gi, "affect"],
  [/\bhave an impact on\b/gi, "affect"],
  [/\bmake an impact on\b/gi, "affect"],
  [/\bmake a contribution to\b/gi, "contribute"],
  [/\bmake use of\b/gi, "use"],
  [/\bmake an attempt\b/gi, "try"],
  [/\battempt to\b/gi, "try to"],
  [/\bmake an effort\b/gi, "try"],
  [/\bmake reference to\b/gi, "mention"],
  [/\bmake mention of\b/gi, "mention"],
  [/\bgive an explanation\b/gi, "explain"],
  [/\bprovide an explanation\b/gi, "explain"],
  [/\boffer an explanation\b/gi, "explain"],
  [/\bgive a description\b/gi, "describe"],
  [/\bprovide a description\b/gi, "describe"],
  [/\bconduct an analysis\b/gi, "analyze"],
  [/\bperform an analysis\b/gi, "analyze"],
  [/\bdo an analysis\b/gi, "analyze"],
  [/\bcarry out an analysis\b/gi, "analyze"],
  [/\bconduct a review\b/gi, "review"],
  [/\bperform a review\b/gi, "review"],
  [/\bconduct an investigation\b/gi, "investigate"],
  [/\bcarry out an investigation\b/gi, "investigate"],
  [/\bmake a comparison\b/gi, "compare"],
  [/\bdraw a comparison\b/gi, "compare"],
  [/\bmake changes to\b/gi, "change"],
  [/\bmake improvements to\b/gi, "improve"],
  [/\bmake modifications to\b/gi, "modify"],
  [/\bmake adjustments to\b/gi, "adjust"],
  [/\bgive assistance to\b/gi, "help"],
  [/\bprovide assistance to\b/gi, "help"],
  [/\brender assistance to\b/gi, "help"],
  [/\btake action\b/gi, "act"],
  [/\btake steps\b/gi, "act"],
  [/\btake measures\b/gi, "act"],

  // Multi-word verbs → single verbs
  [/\bcarry out\b/gi, "do"],
  [/\bbring about\b/gi, "cause"],
  [/\bcome up with\b/gi, "create"],
  [/\bfigure out\b/gi, "solve"],
  [/\bfind out\b/gi, "discover"],
  [/\bget rid of\b/gi, "remove"],
  [/\blook into\b/gi, "examine"],
  [/\bput together\b/gi, "assemble"],
  [/\bset up\b/gi, "create"],
  [/\btake place\b/gi, "occur"],
  [/\bturn out\b/gi, "become"],
  [/\bwork out\b/gi, "solve"],
  [/\bgo through\b/gi, "review"],
  [/\bdeal with\b/gi, "handle"],
  [/\bput into\b/gi, "add"],
  [/\bend up\b/gi, "become"],
  [/\bkeep on\b/gi, "continue"],
  [/\bgive up\b/gi, "quit"],
  [/\brun into\b/gi, "encounter"],
  [/\bcome across\b/gi, "find"],
]

// Passive voice patterns to simplify
const PASSIVE_PATTERNS: [RegExp, string][] = [
  [/\bis being\b/gi, "is"],
  [/\bare being\b/gi, "are"],
  [/\bhas been\b/gi, "was"],
  [/\bhave been\b/gi, "were"],
  [/\bhad been\b/gi, "was"],
  [/\bwill be\b/gi, "will"],
  [/\bwould be\b/gi, "would"],
  [/\bshould be\b/gi, "should"],
  [/\bcould be\b/gi, "could"],
  [/\bmight be\b/gi, "might"],
  [/\bmust be\b/gi, "must"],
  [/\bmay be\b/gi, "may"],
  [/\bcan be\b/gi, "can"],
  [/\bneeds to be\b/gi, "needs"],
  [/\bhas to be\b/gi, "must"],
  [/\bhave to be\b/gi, "must"],
  [/\bused to be\b/gi, "was"],
  [/\bgoing to be\b/gi, "will"],
  [/\bseems to be\b/gi, "is"],
  [/\bappears to be\b/gi, "is"],
  [/\bproves to be\b/gi, "is"],
  [/\bturns out to be\b/gi, "is"],
  [/\bhappens to be\b/gi, "is"],
  [/\btends to be\b/gi, "is often"],
]

// Redundant word pairs - keep only the essential word
const REDUNDANT_PAIRS: [RegExp, string][] = [
  [/\babsolutely essential\b/gi, "essential"],
  [/\babsolutely necessary\b/gi, "necessary"],
  [/\babsolutely critical\b/gi, "critical"],
  [/\bcompletely finished\b/gi, "finished"],
  [/\bcompletely destroyed\b/gi, "destroyed"],
  [/\bcompletely eliminated\b/gi, "eliminated"],
  [/\bentirely new\b/gi, "new"],
  [/\btotally unique\b/gi, "unique"],
  [/\bvery unique\b/gi, "unique"],
  [/\bquite unique\b/gi, "unique"],
  [/\brather unique\b/gi, "unique"],
  [/\bmost unique\b/gi, "unique"],
  [/\bmore unique\b/gi, "unique"],
  [/\btruly unique\b/gi, "unique"],
  [/\bendless loop\b/gi, "loop"],
  [/\binfinite loop\b/gi, "loop"],
  [/\bfinal outcome\b/gi, "outcome"],
  [/\bfinal result\b/gi, "result"],
  [/\bend result\b/gi, "result"],
  [/\bfuture plans\b/gi, "plans"],
  [/\bfuture prospects\b/gi, "prospects"],
  [/\bpast history\b/gi, "history"],
  [/\bpast experience\b/gi, "experience"],
  [/\bprior experience\b/gi, "experience"],
  [/\bprevious experience\b/gi, "experience"],
  [/\badvance planning\b/gi, "planning"],
  [/\badvance warning\b/gi, "warning"],
  [/\bbasic fundamentals\b/gi, "fundamentals"],
  [/\bbasic essentials\b/gi, "essentials"],
  [/\bbrief summary\b/gi, "summary"],
  [/\bshort summary\b/gi, "summary"],
  [/\bclose proximity\b/gi, "proximity"],
  [/\bnear proximity\b/gi, "proximity"],
  [/\bcurrent status\b/gi, "status"],
  [/\bpresent status\b/gi, "status"],
  [/\beach individual\b/gi, "each"],
  [/\bevery individual\b/gi, "every"],
  [/\bexact same\b/gi, "same"],
  [/\bvery same\b/gi, "same"],
  [/\bfree gift\b/gi, "gift"],
  [/\bjoint collaboration\b/gi, "collaboration"],
  [/\bmutual cooperation\b/gi, "cooperation"],
  [/\bmain focus\b/gi, "focus"],
  [/\bprimary focus\b/gi, "focus"],
  [/\bcentral focus\b/gi, "focus"],
  [/\bnew innovation\b/gi, "innovation"],
  [/\brecent innovation\b/gi, "innovation"],
  [/\bpersonal opinion\b/gi, "opinion"],
  [/\bown personal\b/gi, "own"],
  [/\bpossible options\b/gi, "options"],
  [/\bavailable options\b/gi, "options"],
  [/\bsudden impulse\b/gi, "impulse"],
  [/\bunexpected surprise\b/gi, "surprise"],
  [/\btotal surprise\b/gi, "surprise"],
  [/\bcomplete surprise\b/gi, "surprise"],
  [/\btrue fact\b/gi, "fact"],
  [/\bactual fact\b/gi, "fact"],
  [/\bgeneral consensus\b/gi, "consensus"],
  [/\bunanimous consensus\b/gi, "consensus"],
  [/\bforeseeable future\b/gi, "future"],
  [/\bnear future\b/gi, "soon"],
  [/\bimmediate future\b/gi, "soon"],
  [/\bpast memories\b/gi, "memories"],
  [/\bforeign imports\b/gi, "imports"],
  [/\bnative citizens\b/gi, "citizens"],
  [/\boriginal founder\b/gi, "founder"],
  [/\boriginal creator\b/gi, "creator"],
  [/\bfinal conclusion\b/gi, "conclusion"],
  [/\bend conclusion\b/gi, "conclusion"],
  [/\bwritten document\b/gi, "document"],
  [/\boral verbal\b/gi, "verbal"],
  [/\bunintended accident\b/gi, "accident"],
  [/\bforward progress\b/gi, "progress"],
  [/\bfuture prediction\b/gi, "prediction"],
  [/\bpersonal beliefs\b/gi, "beliefs"],
  [/\binner feelings\b/gi, "feelings"],
  [/\bouter exterior\b/gi, "exterior"],
  [/\binner interior\b/gi, "interior"],
]

// Wordy intros to strip
const WORDY_INTROS: RegExp[] = [
  /^(this|that|it) is (important|worth noting|essential|crucial|significant) (to note |to understand |to remember |to realize |to recognize |to consider |that )/i,
  /^there (is|are) (a )?(number of |lot of |few |many |several |some )?(things |reasons |ways |factors |aspects |elements )?(that |which |to )/i,
  /^(one|you) (should|must|need to|have to|ought to) (understand|note|realize|consider|remember|recognize|keep in mind) (that )?/i,
  /^(please )?(note|understand|realize|consider|remember|recognize|be aware) (that )?/i,
  /^(what|the thing|one thing) (i|we|you) (want|need|would like) (to|you to) (say|mention|point out|note|understand|know|remember) is (that )?/i,
  /^let me (start|begin) by (saying|stating|noting|pointing out|mentioning) (that )?/i,
  /^(i|we) (want|would like|need|have) to (start|begin) by (saying|stating|noting|pointing out|mentioning) (that )?/i,
]

// Patterns to PROTECT (not compress) - expanded
const PROTECTED_PATTERNS = [
  /```[\s\S]*?```/g,           // Code blocks
  /`[^`]+`/g,                  // Inline code
  /"[^"]+"/g,                  // Quoted strings (double)
  /'[^']+'/g,                  // Quoted strings (single)
  /https?:\/\/[^\s<>)]+/g,     // URLs
  /www\.[^\s<>)]+/g,           // WWW URLs
  /\b\d+(\.\d+)*\s*(ms|s|sec|min|hr|hrs|h|d|days?|weeks?|months?|years?|kb|mb|gb|tb|pb|b|bytes?|px|em|rem|%|hz|khz|mhz|ghz)?\b/gi, // Numbers with units
  /\b\d{1,3}(,\d{3})*(\.\d+)?\b/g, // Formatted numbers
  /\b[A-Z][A-Z0-9_]{2,}\b/g,   // CONSTANTS and ACRONYMS (min 3 chars)
  /\$[a-zA-Z_]\w*/g,           // Variables like $var
  /\{\{[^}]+\}\}/g,            // Template variables {{ }}
  /\{[^}]+\}/g,                // Template variables { }
  /\[\[[^\]]+\]\]/g,           // Wiki-style links
  /<[^>]+>/g,                  // HTML/XML tags
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?\b/g, // IP addresses with optional port
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Emails
  /\bO\([^)]+\)/g,             // Big-O notation
  /\b(v|ver|version)\s*\d+(\.\d+)*\b/gi, // Version numbers
  /\b[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi, // UUIDs
  /\b[0-9a-f]{32,64}\b/gi,     // Hashes
  /--[\w-]+/g,                 // CLI flags
  /-[a-zA-Z]\b/g,              // Short CLI flags
  /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/g, // HTTP methods
  /\bAPI\s*key\b/gi,           // "API key"
  /\/([\w\-._~:/?#[\]@!$&'()*+,;=]+)/g, // Path-like strings
]

interface ProtectedSegment {
  placeholder: string
  original: string
}

function protectPatterns(text: string): { text: string; segments: ProtectedSegment[] } {
  const segments: ProtectedSegment[] = []
  let result = text
  let index = 0

  for (const pattern of PROTECTED_PATTERNS) {
    result = result.replace(pattern, (match) => {
      const placeholder = `__P${index}__`
      segments.push({ placeholder, original: match })
      index++
      return placeholder
    })
  }

  return { text: result, segments }
}

function restorePatterns(text: string, segments: ProtectedSegment[]): string {
  let result = text
  // Restore in reverse order to handle nested protections
  for (let i = segments.length - 1; i >= 0; i--) {
    const { placeholder, original } = segments[i]
    result = result.split(placeholder).join(original)
  }
  return result
}

function removeArticles(text: string, aggressive: boolean): string {
  if (aggressive) {
    // Aggressive: remove all articles except at sentence start
    return text.replace(/\b(a|an|the)\s+/gi, (match, _article, offset, str) => {
      const before = str.slice(Math.max(0, offset - 2), offset).trim()
      if (before === "" || /[.!?]$/.test(before)) {
        return "" // Remove even at sentence start in aggressive mode
      }
      return ""
    })
  }
  // Normal: keep at sentence start
  return text.replace(/\b(a|an|the)\s+/gi, (match, _article, offset, str) => {
    const before = str.slice(Math.max(0, offset - 2), offset).trim()
    if (before === "" || /[.!?]$/.test(before)) {
      return match // Keep at sentence start
    }
    return ""
  })
}

function removeFillers(text: string): string {
  const pattern = new RegExp(`\\b(${Array.from(FILLERS).join("|")})\\b,?\\s*`, "gi")
  return text.replace(pattern, "")
}

function removeConnectives(text: string): string {
  const pattern = new RegExp(`\\b(${Array.from(CONNECTIVES).join("|")})\\b,?\\s*`, "gi")
  return text.replace(pattern, "")
}

function removeHedging(text: string): string {
  let result = text
  for (const pattern of HEDGING_PHRASES) {
    result = result.replace(pattern, "")
  }
  return result
}

function removeWordyIntros(text: string): string {
  let result = text
  for (const pattern of WORDY_INTROS) {
    result = result.replace(pattern, "")
  }
  return result
}

function applyPhraseReplacements(text: string): string {
  let result = text
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function applyPassiveSimplification(text: string): string {
  let result = text
  for (const [pattern, replacement] of PASSIVE_PATTERNS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

function applyRedundantPairs(text: string): string {
  let result = text
  for (const [pattern, replacement] of REDUNDANT_PAIRS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

// Remove redundant "that" after certain verbs
function removeRedundantThat(text: string): string {
  return text.replace(/\b(know|think|believe|say|said|feel|felt|realize|realized|understand|understood|see|saw|hope|hoped|wish|wished|suggest|suggested|assume|assumed|expect|expected|found|noticed|noticed|reported|stated|claimed|argued|explained|mentioned|noted|observed|confirmed|revealed|showed|indicated|demonstrated|proved|concluded)\s+that\b/gi, "$1 ")
}

// Remove unnecessary pronouns in certain contexts
function simplifyPronouns(text: string): string {
  return text
    .replace(/\bwe need to\b/gi, "need to")
    .replace(/\byou need to\b/gi, "need to")
    .replace(/\byou should\b/gi, "should")
    .replace(/\byou must\b/gi, "must")
    .replace(/\byou can\b/gi, "can")
    .replace(/\byou will\b/gi, "will")
    .replace(/\bwe should\b/gi, "should")
    .replace(/\bwe must\b/gi, "must")
    .replace(/\bwe can\b/gi, "can")
    .replace(/\bwe will\b/gi, "will")
    .replace(/\bit is\b/gi, "is")
    .replace(/\bthere is\b/gi, "exists")
    .replace(/\bthere are\b/gi, "exist")
    .replace(/\bthis is\b/gi, "")
}

function cleanupWhitespace(text: string): string {
  return text
    .replace(/\s+/g, " ")                    // Multiple spaces to single
    .replace(/\s+([.,!?;:)])/g, "$1")        // Remove space before punctuation
    .replace(/([(])\s+/g, "$1")              // Remove space after opening paren
    .replace(/([.,!?;:])\s*([.,!?;:])/g, "$1") // Fix double punctuation
    .replace(/\.\s*\./g, ".")                // Fix double periods
    .replace(/,\s*,/g, ",")                  // Fix double commas
    .replace(/^\s*[,;:]\s*/gm, "")           // Remove leading punctuation
    .replace(/\s*[,;:]\s*$/gm, ".")          // Fix trailing comma to period
    .replace(/\(\s*\)/g, "")                 // Remove empty parens
    .replace(/\[\s*\]/g, "")                 // Remove empty brackets
    .replace(/\s+-\s+/g, " - ")              // Normalize dashes
    .replace(/\n{3,}/g, "\n\n")              // Max 2 newlines
    .trim()
}

// Capitalize first letter of sentences
function fixCapitalization(text: string): string {
  return text.replace(/(^|[.!?]\s+)([a-z])/g, (_, prefix, letter) => prefix + letter.toUpperCase())
}

export interface CompressionOptions {
  removeArticles: boolean
  removeFillers: boolean
  removeConnectives: boolean
  simplifyPhrases: boolean
  simplifyPassive: boolean
  removeRedundant: boolean
  removeHedging: boolean
  removeWordyIntros: boolean
  simplifyPronouns: boolean
  removeRedundantThat: boolean
  aggressiveMode: boolean
}

export function compressPrompt(text: string, options: CompressionOptions): string {
  if (!text.trim()) return text

  // Step 1: Protect special content
  const { text: workingText, segments } = protectPatterns(text)

  let result = workingText

  // Step 2: Remove wordy intros first (at sentence level)
  if (options.removeWordyIntros) {
    result = removeWordyIntros(result)
  }

  // Step 3: Remove hedging phrases
  if (options.removeHedging) {
    result = removeHedging(result)
  }

  // Step 4: Apply phrase replacements (longest matches first)
  if (options.simplifyPhrases) {
    result = applyPhraseReplacements(result)
  }

  // Step 5: Remove redundant word pairs
  if (options.removeRedundant) {
    result = applyRedundantPairs(result)
  }

  // Step 6: Simplify passive voice
  if (options.simplifyPassive) {
    result = applyPassiveSimplification(result)
  }

  // Step 7: Remove redundant "that"
  if (options.removeRedundantThat) {
    result = removeRedundantThat(result)
  }

  // Step 8: Simplify pronouns
  if (options.simplifyPronouns) {
    result = simplifyPronouns(result)
  }

  // Step 9: Remove articles
  if (options.removeArticles) {
    result = removeArticles(result, options.aggressiveMode)
  }

  // Step 10: Remove fillers
  if (options.removeFillers) {
    result = removeFillers(result)
  }

  // Step 11: Remove connectives
  if (options.removeConnectives) {
    result = removeConnectives(result)
  }

  // Step 12: Cleanup whitespace and punctuation
  result = cleanupWhitespace(result)

  // Step 13: Fix capitalization
  result = fixCapitalization(result)

  // Step 14: Restore protected content
  result = restorePatterns(result, segments)

  return result
}

// Approximate token count (GPT-style: ~4 chars per token on average)
function estimateTokens(text: string): number {
  if (!text.trim()) return 0
  // More accurate estimation: count words and punctuation separately
  const words = text.split(/\s+/).filter(w => w.length > 0)
  // Average English word is ~5 chars, average token is ~4 chars
  // So roughly 1.25 tokens per word, plus some for punctuation
  const punctuation = (text.match(/[.,!?;:'"()\[\]{}]/g) || []).length
  return Math.ceil(words.length * 1.3 + punctuation * 0.5)
}

const EXAMPLE_TEXT = `In order to optimize the database query performance, we should consider implementing an index on the frequently accessed columns. It is important to note that this will require additional storage space, however the performance benefits are quite significant. Furthermore, we need to ensure that the application handles the case where the database connection fails gracefully. I think the system should be able to recover from temporary network issues without losing any data. As you probably know, this is absolutely essential for maintaining data integrity in production environments.`

export function PromptCompressorTool({ tabId, initialInput, onOutputChange }: ToolComponentProps) {
  const { getToolState, setToolState } = useWorkspace()
  const savedState = getToolState(tabId)
  const { toast } = useToast()

  const [input, setInput] = useState(initialInput || savedState?.input as string || EXAMPLE_TEXT)
  const [options, setOptions] = useState<CompressionOptions>(
    savedState?.options || {
      removeArticles: true,
      removeFillers: true,
      removeConnectives: true,
      simplifyPhrases: true,
      simplifyPassive: true,
      removeRedundant: true,
      removeHedging: true,
      removeWordyIntros: true,
      simplifyPronouns: true,
      removeRedundantThat: true,
      aggressiveMode: false,
    }
  )

  const compressed = useMemo(() => compressPrompt(input, options), [input, options])
  
  const originalTokens = useMemo(() => estimateTokens(input), [input])
  const compressedTokens = useMemo(() => estimateTokens(compressed), [compressed])
  const reduction = originalTokens > 0 
    ? Math.round((1 - compressedTokens / originalTokens) * 100) 
    : 0

  useEffect(() => {
    setToolState(tabId, { input, options })
  }, [input, options, tabId, setToolState])

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(compressed)
    }
  }, [compressed, onOutputChange])

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(compressed)
    toast({ title: "Copied compressed text" })
  }

  const toggleOption = (key: keyof CompressionOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const resetInput = () => {
    setInput(EXAMPLE_TEXT)
  }

  return (
    <ToolShell
      icon={Minimize2}
      title="Prompt Compressor"
      actions={
        <>
          <Button size="sm" onClick={copyToClipboard} className="bg-gradient-primary">
            <Copy className="h-3 w-3 mr-1" />
            Copy Compressed
          </Button>
          <Button size="sm" onClick={resetInput} variant="outline">
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Original:</span>
            <Badge variant="secondary">{originalTokens} tokens</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Compressed:</span>
            <Badge variant="secondary">{compressedTokens} tokens</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-green-500" />
            <Badge className={reduction >= 20 ? "bg-green-500/20 text-green-600 hover:bg-green-500/30" : "bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30"}>
              {reduction}% reduction
            </Badge>
          </div>
        </div>

        {/* Compression Options */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Compression Options</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p>LLMs can reconstruct grammar from context. We remove only what they can reliably predict.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Normal</span>
              <Switch 
                checked={options.aggressiveMode} 
                onCheckedChange={() => toggleOption("aggressiveMode")} 
              />
              <span className={`text-xs ${options.aggressiveMode ? "text-orange-500 font-medium" : "text-muted-foreground"}`}>
                Aggressive
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeArticles} 
                onCheckedChange={() => toggleOption("removeArticles")} 
              />
              <span className="text-xs">Articles</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeFillers} 
                onCheckedChange={() => toggleOption("removeFillers")} 
              />
              <span className="text-xs">Fillers</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeConnectives} 
                onCheckedChange={() => toggleOption("removeConnectives")} 
              />
              <span className="text-xs">Connectives</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.simplifyPhrases} 
                onCheckedChange={() => toggleOption("simplifyPhrases")} 
              />
              <span className="text-xs">Phrases</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.simplifyPassive} 
                onCheckedChange={() => toggleOption("simplifyPassive")} 
              />
              <span className="text-xs">Passive</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeRedundant} 
                onCheckedChange={() => toggleOption("removeRedundant")} 
              />
              <span className="text-xs">Redundant</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeHedging} 
                onCheckedChange={() => toggleOption("removeHedging")} 
              />
              <span className="text-xs">Hedging</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeWordyIntros} 
                onCheckedChange={() => toggleOption("removeWordyIntros")} 
              />
              <span className="text-xs">Wordy intros</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.simplifyPronouns} 
                onCheckedChange={() => toggleOption("simplifyPronouns")} 
              />
              <span className="text-xs">Pronouns</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Switch 
                checked={options.removeRedundantThat} 
                onCheckedChange={() => toggleOption("removeRedundantThat")} 
              />
              <span className="text-xs">"That"</span>
            </label>
          </div>
        </div>

        {/* Input/Output Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Input */}
          <div className="rounded-lg border">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Original Text</span>
              <span className="text-xs text-muted-foreground">{input.length} chars</span>
            </div>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your prompt here..."
              className="min-h-[300px] border-0 rounded-none resize-none focus-visible:ring-0"
            />
          </div>

          {/* Output */}
          <div className="rounded-lg border">
            <div className="p-3 border-b flex items-center justify-between">
              <span className="text-sm font-medium">Compressed</span>
              <span className="text-xs text-muted-foreground">{compressed.length} chars</span>
            </div>
            <Textarea
              value={compressed}
              readOnly
              className="min-h-[300px] border-0 rounded-none resize-none focus-visible:ring-0 bg-muted/30"
            />
          </div>
        </div>
      </div>
    </ToolShell>
  )
}
