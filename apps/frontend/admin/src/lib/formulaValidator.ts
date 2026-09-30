/**
 * Administrative Fee Statutory Formula Validator & Simulator
 * Strictly typed without type assertions, safe arithmetic evaluation without eval().
 */

export interface FormulaVariableInfo {
  readonly token: string;
  readonly label: string;
  readonly description: string;
  readonly category: "base" | "multiplier" | "tax";
}

export interface FormulaValidationResult {
  readonly isValid: boolean;
  readonly error: string | null;
  readonly previewCalculation: number | null;
  readonly detectedVariables: readonly string[];
}

export const STANDARD_FORMULA_VARIABLES: readonly FormulaVariableInfo[] = [
  {
    token: "{RATE}",
    label: "Base Rate",
    description: "Standard component fee base amount",
    category: "base",
  },
  {
    token: "{YEARS}",
    label: "Years (YR)",
    description: "Validity duration in years",
    category: "multiplier",
  },
  {
    token: "{UNITS}",
    label: "Units",
    description: "Number of registered equipment units",
    category: "multiplier",
  },
  {
    token: "{CHANNELS}",
    label: "Channels",
    description: "Assigned radio frequency channels",
    category: "multiplier",
  },
  {
    token: "{PAGES}",
    label: "Pages / Copies",
    description: "Document pages or physical copies",
    category: "multiplier",
  },
  {
    token: "{NAS}",
    label: "Add'l Services",
    description: "Count of additional services requested",
    category: "multiplier",
  },
  {
    token: "{DST}",
    label: "DST Tax (₱30)",
    description: "Documentary Stamp Tax",
    category: "tax",
  },
  {
    token: "{SUR}",
    label: "Late Surcharge",
    description: "Late renewal surcharge penalty",
    category: "tax",
  },
];

export const COMMON_FORMULA_TEMPLATES = [
  {
    label: "Standard Multiplier (Rate × YR × Unit)",
    template: "TOTAL = ({RATE})(YEARS)(UNITS)",
  },
  {
    label: "Statutory Tariff + DST",
    template: "TOTAL = (ROC)(YR) + DST",
  },
  {
    label: "Full Statutory (Tariffs + DST + SUR)",
    template: "TOTAL = FF + AF + (ROC)(YR) + DST + SUR",
  },
  {
    label: "Per-Copy / Document Page",
    template: "TOTAL = ({RATE})(COPY) + DST",
  },
];

/**
 * Validates a formula expression and computes a safe dry-run preview.
 */
export function validateFormula(
  formula: string,
  customFeeCodes?: readonly string[]
): FormulaValidationResult {
  if (typeof formula !== "string" || formula.trim() === "") {
    return {
      isValid: false,
      error: "Formula expression cannot be empty.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  const trimmed = formula.trim();
  if (trimmed.length > 500) {
    return {
      isValid: false,
      error: "Formula expression must not exceed 500 characters.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  let rawExpr = trimmed;

  // 1. Assignment Check (e.g. "TOTAL = (ROC)(YR) + DST")
  if (rawExpr.includes("=")) {
    const parts = rawExpr.split("=");
    if (parts.length > 2) {
      return {
        isValid: false,
        error: "Formula cannot contain multiple assignment '=' operators.",
        previewCalculation: null,
        detectedVariables: [],
      };
    }

    const firstPart = parts[0];
    const secondPart = parts[1];
    const leftTarget = firstPart !== undefined ? firstPart.trim() : "";
    if (leftTarget === "") {
      return {
        isValid: false,
        error: "Assignment target on left side of '=' cannot be empty.",
        previewCalculation: null,
        detectedVariables: [],
      };
    }

    if (!/^[A-Za-z0-9_]+$/.test(leftTarget)) {
      return {
        isValid: false,
        error: `Invalid assignment target '${leftTarget}'. Target name must contain only alphanumeric characters or underscores (e.g. 'TOTAL').`,
        previewCalculation: null,
        detectedVariables: [],
      };
    }

    rawExpr = secondPart !== undefined ? secondPart.trim() : "";
    if (rawExpr === "") {
      return {
        isValid: false,
        error: "Formula expression on the right side of '=' cannot be empty.",
        previewCalculation: null,
        detectedVariables: [],
      };
    }
  }

  // 2. Character Whitelist: Letters, Digits, _, {}, (), +, -, *, /, ., and spaces
  const invalidCharMatch = /[^A-Za-z0-9_{}()+\-*/.\s]/.exec(rawExpr);
  if (invalidCharMatch !== null) {
    return {
      isValid: false,
      error: `Formula contains unsupported character '${invalidCharMatch[0]}'. Allowed characters are alphanumeric identifiers, numbers, (), {}, and operators (+, -, *, /).`,
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  // 3. Braces {} Matching Check
  let openBraceCount = 0;
  let closeBraceCount = 0;
  for (let i = 0; i < rawExpr.length; i++) {
    const char = rawExpr[i];
    if (char === "{") openBraceCount++;
    if (char === "}") closeBraceCount++;
  }

  if (openBraceCount !== closeBraceCount) {
    return {
      isValid: false,
      error: "Mismatched bracketed placeholders: every '{' must have a matching '}'.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/\{[^{}]*\{|\}[^{}]*\}/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Nested or malformed curly brackets '{}' are not allowed.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/\{\s*\}/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Empty variable placeholder '{}' is not allowed.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  // 4. Parentheses () Balance and Empty Check
  let parenDepth = 0;
  for (let i = 0; i < rawExpr.length; i++) {
    const char = rawExpr[i];
    if (char === "(") {
      parenDepth++;
    } else if (char === ")") {
      parenDepth--;
      if (parenDepth < 0) {
        return {
          isValid: false,
          error: "Mismatched closing parenthesis ')' without a preceding '('.",
          previewCalculation: null,
          detectedVariables: [],
        };
      }
    }
  }

  if (parenDepth > 0) {
    return {
      isValid: false,
      error: `Unclosed opening parenthesis '(': ${parenDepth} unclosed opening parenthesis.`,
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/\(\s*\)/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Empty parentheses '()' are not allowed in formula.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  // 5. Operator Sequence and Boundary Checks
  const startTrimmed = rawExpr.trimStart();
  if (startTrimmed.startsWith("*") || startTrimmed.startsWith("/")) {
    return {
      isValid: false,
      error: "Formula expression cannot start with multiplication or division operator.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  const endTrimmed = rawExpr.trimEnd();
  if (
    endTrimmed.endsWith("+") ||
    endTrimmed.endsWith("-") ||
    endTrimmed.endsWith("*") ||
    endTrimmed.endsWith("/")
  ) {
    return {
      isValid: false,
      error: "Formula expression cannot end with an arithmetic operator.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/[+\-*/]\s*[*\/]/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Invalid operator sequence: binary operators cannot be immediately followed by '*' or '/'.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/[+*\/]\s*[+]/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Invalid operator sequence: duplicate '+' operators are not allowed.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  if (/--\s*-/.test(rawExpr)) {
    return {
      isValid: false,
      error: "Invalid operator sequence with multiple consecutive '-' operators.",
      previewCalculation: null,
      detectedVariables: [],
    };
  }

  // Collect detected variable tokens
  const detectedVariables: string[] = [];
  const bracketMatches = rawExpr.match(/\{[A-Za-z0-9_]+\}/g);
  if (bracketMatches !== null) {
    for (let i = 0; i < bracketMatches.length; i++) {
      const match = bracketMatches[i];
      if (match !== undefined && !detectedVariables.includes(match)) {
        detectedVariables.push(match);
      }
    }
  }

  const wordMatches = rawExpr.match(/\b[A-Za-z_][A-Za-z0-9_]*\b/g);
  if (wordMatches !== null) {
    for (let i = 0; i < wordMatches.length; i++) {
      const match = wordMatches[i];
      if (match !== undefined && !detectedVariables.includes(match)) {
        detectedVariables.push(match);
      }
    }
  }

  // 6. Dry-run evaluate for preview calculation
  try {
    let simExpr = rawExpr;

    // Substitute standard placeholders
    simExpr = simExpr
      .replace(/\{RATE\}/gi, "100")
      .replace(/\{YEARS\}/gi, "2")
      .replace(/\{YR\}/gi, "2")
      .replace(/\{UNITS\}/gi, "3")
      .replace(/\{UNIT\}/gi, "3")
      .replace(/\{CHANNELS\}/gi, "1")
      .replace(/\{CH_UNIT\}/gi, "1")
      .replace(/\{PAGES\}/gi, "5")
      .replace(/\{COPY\}/gi, "5")
      .replace(/\{NAS\}/gi, "1")
      .replace(/\{DST\}/gi, "30")
      .replace(/\{SUR\}/gi, "50");

    // Substitute word variables
    simExpr = simExpr
      .replace(/\bRATE\b/gi, "100")
      .replace(/\bFEE\b/gi, "100")
      .replace(/\bYEARS\b/gi, "2")
      .replace(/\bYR\b/gi, "2")
      .replace(/\bUNITS\b/gi, "3")
      .replace(/\bUNIT\b/gi, "3")
      .replace(/\bCHANNELS\b/gi, "1")
      .replace(/\bCH_UNIT\b/gi, "1")
      .replace(/\bPAGES\b/gi, "5")
      .replace(/\bCOPY\b/gi, "5")
      .replace(/\bNAS\b/gi, "1")
      .replace(/\bDST\b/gi, "30")
      .replace(/\bSUR\b/gi, "50");

    // Replace generic remaining bracketed fee placeholders
    simExpr = simExpr.replace(/\{[A-Za-z0-9_]+\}/g, "100");

    // Substitute known statutory acronyms
    simExpr = simExpr.replace(
      /\b(ROC|LF|PF|PUR|POS|STF|REG|DEMO|PTR|SP|CPF|SUF|ARF1|ARF2|FF|AF|SEM|MOD|DUP|FC|SC)\b/gi,
      "100"
    );

    // If customFeeCodes passed, replace them
    if (customFeeCodes !== undefined && customFeeCodes.length > 0) {
      for (let i = 0; i < customFeeCodes.length; i++) {
        const code = customFeeCodes[i];
        if (code !== undefined && code !== "") {
          const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          simExpr = simExpr.replace(new RegExp(`\\b${escaped}\\b`, "gi"), "100");
        }
      }
    }

    // Replace any remaining alphanumeric fee codes like 1RTG, 2RTG with numeric value
    simExpr = simExpr.replace(/\b\d*[A-Za-z][A-Za-z0-9_]*\b/g, "100");

    // Implicit multiplication
    simExpr = simExpr.replace(/\)\s*\(/g, ")*(");
    simExpr = simExpr.replace(/(\d+)\s*\(/g, "$1*(");
    simExpr = simExpr.replace(/\)\s*(\d+)/g, ")*$1");

    const calculatedPreview = evaluateArithmetic(simExpr);

    return {
      isValid: true,
      error: null,
      previewCalculation: calculatedPreview,
      detectedVariables,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Formula expression calculation failed.";
    return {
      isValid: false,
      error: message,
      previewCalculation: null,
      detectedVariables,
    };
  }
}

/**
 * Safe arithmetic expression evaluator using recursive descent parsing.
 */
function evaluateArithmetic(expression: string): number {
  const tokens = tokenize(expression);
  if (tokens.length === 0) return 0;

  let index = 0;

  function parseExpression(): number {
    let value = parseTerm();

    while (index < tokens.length) {
      const op = tokens[index];
      if (op === "+" || op === "-") {
        index++;
        const nextTerm = parseTerm();
        value = op === "+" ? value + nextTerm : value - nextTerm;
      } else {
        break;
      }
    }

    return value;
  }

  function parseTerm(): number {
    let value = parseFactor();

    while (index < tokens.length) {
      const op = tokens[index];
      if (op === "*" || op === "/") {
        index++;
        const nextFactor = parseFactor();
        if (op === "*") {
          value *= nextFactor;
        } else {
          value = nextFactor !== 0 ? value / nextFactor : 0;
        }
      } else {
        break;
      }
    }

    return value;
  }

  function parseFactor(): number {
    if (index >= tokens.length) return 0;

    const token = tokens[index];

    if (token === "-") {
      index++;
      return -parseFactor();
    }
    if (token === "+") {
      index++;
      return parseFactor();
    }

    if (token === "(") {
      index++;
      const result = parseExpression();
      if (index < tokens.length && tokens[index] === ")") {
        index++;
      }
      return result;
    }

    index++;
    if (token !== undefined) {
      const parsed = parseFloat(token);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }

    return 0;
  }

  const result = parseExpression();
  return Math.round(result * 100) / 100;
}

function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let currentBuffer = "";

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === undefined || ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      continue;
    }

    if ((ch >= "0" && ch <= "9") || ch === ".") {
      currentBuffer += ch;
    } else if (
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "(" ||
      ch === ")"
    ) {
      if (currentBuffer.length > 0) {
        tokens.push(currentBuffer);
        currentBuffer = "";
      }
      tokens.push(ch);
    }
  }

  if (currentBuffer.length > 0) {
    tokens.push(currentBuffer);
  }

  return tokens;
}
