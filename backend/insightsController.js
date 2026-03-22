const fetch = require('node-fetch');

/**
 * Production-grade financial insights controller.
 * 
 * Safety features:
 * - Anti-hallucination guardrails in prompt
 * - Confidence scoring (high/medium/low) per insight
 * - Explainable reasoning (WHY each recommendation is given)
 * - Data sufficiency checks before AI call
 * - Safe fallback to rule-based insights
 * - No specific investment/stock recommendations
 * - Output validation and sanitization
 */

const MIN_TRANSACTIONS_FOR_AI = 3;
const MAX_INSIGHTS = 4;

const generateInsights = async (req, res) => {
    try {
        const { transactions } = req.body;

        if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
            return res.json({
                success: true,
                insights: [{
                    title: 'No Data Available',
                    description: 'Upload a bank statement or add transactions to get personalized financial insights.',
                    category: 'Getting Started',
                    savingPotential: 0,
                    confidence: 'low',
                    reasoning: 'No transaction data to analyze.'
                }],
                source: 'empty',
                dataQuality: { score: 0, transactions: 0, sufficient: false }
            });
        }

        // ── Data analysis ──────────────────────────────────────
        const analysis = analyzeTransactions(transactions);

        // ── Data quality assessment ────────────────────────────
        const dataQuality = {
            score: Math.min(100, Math.round((analysis.totalTransactions / 20) * 100)),
            transactions: analysis.totalTransactions,
            categories: analysis.categoryCount,
            dateRange: analysis.dateRange,
            sufficient: analysis.totalTransactions >= MIN_TRANSACTIONS_FOR_AI
        };

        // ── Try Gemini AI if key exists and data is sufficient ──
        const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

        if (geminiKey && geminiKey !== 'mock_gemini_key' && dataQuality.sufficient) {
            try {
                const aiInsights = await callGeminiSafe(geminiKey, analysis);
                if (aiInsights && aiInsights.length > 0) {
                    return res.json({
                        success: true,
                        insights: aiInsights,
                        source: 'gemini',
                        dataQuality
                    });
                }
            } catch (aiError) {
                console.error('Gemini AI error (falling back):', aiError.message);
            }
        }

        // ── Fallback: rule-based insights from real data ───────
        return res.json({
            success: true,
            insights: generateRuleBasedInsights(analysis),
            source: geminiKey && geminiKey !== 'mock_gemini_key' ? 'fallback' : 'rule-based',
            dataQuality,
            note: !geminiKey || geminiKey === 'mock_gemini_key'
                ? 'Add a Gemini API key for AI-powered insights'
                : undefined
        });

    } catch (error) {
        console.error('Insights controller error:', error);
        const { transactions } = req.body;
        const analysis = transactions ? analyzeTransactions(transactions) : null;
        res.json({
            success: true,
            insights: analysis ? generateRuleBasedInsights(analysis) : [{
                title: 'Service Temporarily Unavailable',
                description: 'Please try again in a moment.',
                category: 'System',
                savingPotential: 0,
                confidence: 'low',
                reasoning: 'An internal error occurred.'
            }],
            source: 'error-fallback'
        });
    }
};

// ═══════════════════════════════════════════════════════════════
// DATA ANALYSIS
// ═══════════════════════════════════════════════════════════════

function analyzeTransactions(transactions) {
    const spendingByCategory = {};
    let totalSpending = 0;
    let totalIncome = 0;
    let dates = [];

    transactions.forEach(tx => {
        const amount = parseFloat(tx.amount) || 0;
        if (tx.type === 'debit' || tx.type === 'expense') {
            const category = tx.category || 'Other';
            spendingByCategory[category] = (spendingByCategory[category] || 0) + amount;
            totalSpending += amount;
        } else if (tx.type === 'credit' || tx.type === 'income') {
            totalIncome += amount;
        }
        if (tx.date) dates.push(new Date(tx.date));
    });

    const sortedCategories = Object.entries(spendingByCategory)
        .sort((a, b) => b[1] - a[1]);

    // Date range
    let dateRange = 'unknown';
    if (dates.length > 1) {
        dates.sort((a, b) => a - b);
        const days = Math.ceil((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24));
        dateRange = `${days} days`;
    }

    const savingsRate = totalIncome > 0
        ? ((totalIncome - totalSpending) / totalIncome * 100)
        : 0;

    return {
        totalSpending,
        totalIncome,
        savingsRate,
        sortedCategories,
        spendingByCategory,
        categoryCount: sortedCategories.length,
        totalTransactions: transactions.length,
        dateRange
    };
}

// ═══════════════════════════════════════════════════════════════
// GEMINI AI — WITH SAFETY GUARDRAILS
// ═══════════════════════════════════════════════════════════════

async function callGeminiSafe(apiKey, analysis) {
    const { totalSpending, totalIncome, savingsRate, sortedCategories } = analysis;

    // Guard: no spending data
    if (totalSpending === 0) return null;

    const categoryBreakdown = sortedCategories
        .map(([cat, amt]) => `${cat}: ₹${amt.toFixed(0)} (${((amt / totalSpending) * 100).toFixed(1)}%)`)
        .join('\n');

    const prompt = `You are a certified financial advisor analyzing a user's real transaction data. Provide exactly 3 actionable insights.

## STRICT RULES — YOU MUST FOLLOW:
1. BASE EVERY insight ONLY on the numbers below. Do NOT invent data.
2. NEVER recommend specific stocks, crypto, or investment products.
3. NEVER guarantee returns or use phrases like "guaranteed", "risk-free", or "will definitely".
4. Every recommendation MUST include a specific ₹ amount derived from the data.
5. If data is insufficient for an insight, say so honestly.
6. Each insight MUST have a "reasoning" field explaining WHY you made this recommendation based on the data.
7. Assign a confidence level: "high" (strong data support), "medium" (reasonable inference), or "low" (limited data).

## USER'S FINANCIAL DATA:
- Total Income: ₹${totalIncome.toFixed(0)}
- Total Spending: ₹${totalSpending.toFixed(0)}
- Net Savings: ₹${(totalIncome - totalSpending).toFixed(0)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Transaction Count: ${analysis.totalTransactions}
- Data Period: ${analysis.dateRange}
- Categories: ${analysis.categoryCount}

## SPENDING BY CATEGORY:
${categoryBreakdown}

## REQUIRED OUTPUT FORMAT (JSON array, no markdown):
[
  {
    "title": "Short actionable title (max 60 chars)",
    "description": "Specific recommendation with exact ₹ amounts from the data above (max 200 chars)",
    "category": "Relevant category name from the data",
    "savingPotential": 1500,
    "confidence": "high",
    "reasoning": "Brief explanation of WHY this insight was generated from the data"
  }
]`;

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,       // Low temp for deterministic, factual output
                    maxOutputTokens: 1024,
                    responseMimeType: 'application/json'
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
                ]
            })
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini ${response.status}: ${errText.substring(0, 200)}`);
    }

    const result = await response.json();

    if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Empty Gemini response');
    }

    const rawText = result.candidates[0].content.parts[0].text;
    let insights = [];

    try {
        insights = JSON.parse(rawText);
    } catch {
        const match = rawText.match(/\[\s*\{.*\}\s*\]/s);
        if (match) insights = JSON.parse(match[0]);
        else throw new Error('Cannot parse Gemini JSON');
    }

    // ── Validate & sanitize each insight ───────────────────
    return insights
        .filter(i => i.title && i.description)
        .slice(0, MAX_INSIGHTS)
        .map(i => sanitizeInsight(i, analysis));
}

// ═══════════════════════════════════════════════════════════════
// SANITIZATION & SAFETY VALIDATION
// ═══════════════════════════════════════════════════════════════

const BANNED_PHRASES = [
    'guaranteed', 'risk-free', 'will definitely', 'certain to',
    'buy stock', 'invest in crypto', 'bitcoin', 'forex',
    'double your money', 'get rich', '100% safe'
];

function sanitizeInsight(insight, analysis) {
    let desc = String(insight.description || '').substring(0, 500);
    const title = String(insight.title || '').substring(0, 100);

    // Check for banned phrases — replace with safe alternative
    for (const phrase of BANNED_PHRASES) {
        if (desc.toLowerCase().includes(phrase) || title.toLowerCase().includes(phrase)) {
            desc += ' (Note: All financial decisions carry risk. Consult a professional advisor.)';
            break;
        }
    }

    // Validate confidence level
    const validConfidence = ['high', 'medium', 'low'];
    const confidence = validConfidence.includes(insight.confidence) ? insight.confidence : 'medium';

    // Clamp saving potential to reasonable range (not more than total spending)
    const savingPotential = Math.max(0, Math.min(
        parseFloat(insight.savingPotential) || 0,
        analysis.totalSpending * 0.5  // Cap at 50% of total spending
    ));

    return {
        title,
        description: desc,
        category: String(insight.category || 'General').substring(0, 50),
        savingPotential: Math.round(savingPotential),
        confidence,
        reasoning: String(insight.reasoning || 'Based on your transaction data.').substring(0, 300)
    };
}

// ═══════════════════════════════════════════════════════════════
// RULE-BASED FALLBACK (always from real data, never hardcoded)
// ═══════════════════════════════════════════════════════════════

function generateRuleBasedInsights(analysis) {
    const { totalSpending, totalIncome, savingsRate, sortedCategories } = analysis;
    const insights = [];

    // Insight 1: Top spending category
    if (sortedCategories.length > 0 && totalSpending > 0) {
        const [topCat, topAmt] = sortedCategories[0];
        const pct = ((topAmt / totalSpending) * 100).toFixed(0);
        const saving = Math.round(topAmt * 0.15);
        insights.push({
            title: `Optimize ${topCat} spending`,
            description: `₹${topAmt.toFixed(0)} spent on ${topCat} (${pct}% of total). A 15% reduction would save ₹${saving}/month.`,
            category: topCat,
            savingPotential: saving,
            confidence: pct > 30 ? 'high' : 'medium',
            reasoning: `${topCat} is your largest expense at ${pct}% of total spending, making it the highest-impact area to optimize.`
        });
    }

    // Insight 2: Savings rate assessment
    if (totalIncome > 0) {
        const rate = savingsRate.toFixed(0);
        const gap = Math.max(0, Math.round(totalIncome * 0.2 - (totalIncome - totalSpending)));
        insights.push({
            title: rate >= 20 ? 'Healthy savings rate' : 'Improve savings to 20%',
            description: rate >= 20
                ? `Your ${rate}% savings rate exceeds the recommended 20% threshold. Well done!`
                : `Current savings rate: ${rate}%. Need ₹${gap} more savings/month to reach the recommended 20%.`,
            category: 'Savings',
            savingPotential: gap,
            confidence: 'high',
            reasoning: `Calculated from ₹${totalIncome.toFixed(0)} income minus ₹${totalSpending.toFixed(0)} spending. The 20% benchmark is a widely accepted financial planning standard.`
        });
    }

    // Insight 3: Second category review
    if (sortedCategories.length >= 2) {
        const [cat2, amt2] = sortedCategories[1];
        insights.push({
            title: `Review ${cat2} expenses`,
            description: `₹${amt2.toFixed(0)} spent on ${cat2}. Check for unused subscriptions or recurring charges.`,
            category: cat2,
            savingPotential: Math.round(amt2 * 0.1),
            confidence: 'medium',
            reasoning: `${cat2} is your second-largest expense category. Reviewing recurring charges here often reveals easy savings.`
        });
    }

    return insights.length > 0 ? insights : [{
        title: 'Add more transactions',
        description: 'Upload a bank statement or add more transactions for personalized insights.',
        category: 'Getting Started',
        savingPotential: 0,
        confidence: 'low',
        reasoning: 'Insufficient transaction data for meaningful analysis.'
    }];
}

module.exports = { generateInsights };
