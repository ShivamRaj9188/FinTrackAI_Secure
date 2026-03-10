// Function to generate insights using Google's Gemini API
export const generateInsights = async (transactions) => {
  try {
    // Format transaction data for the model
    const spendingByCategory = {};
    let totalSpending = 0;
    let totalIncome = 0;
    
    transactions.forEach(tx => {
      if (tx.type === 'debit') {
        const category = tx.category || 'Other';
        if (!spendingByCategory[category]) {
          spendingByCategory[category] = 0;
        }
        spendingByCategory[category] += tx.amount;
        totalSpending += tx.amount;
      } else if (tx.type === 'credit') {
        totalIncome += tx.amount;
      }
    });
    
    // Create a prompt for the model
    const prompt = `
      As a financial advisor, analyze this spending data and provide 3 specific money-saving insights:
      
      Total Income: ₹${totalIncome.toFixed(2)}
      Total Spending: ₹${totalSpending.toFixed(2)}
      
      Spending by Category:
      ${Object.entries(spendingByCategory)
        .map(([category, amount]) => `${category}: ₹${amount.toFixed(2)} (${((amount/totalSpending)*100).toFixed(1)}%)`)
        .join('\n')}
      
      For each insight, include:
      1. A specific title
      2. A detailed recommendation with amounts
      3. The category it applies to
      4. The potential savings amount
      
      Format your response as JSON with this structure:
      [
        {
          "title": "Short insight title",
          "description": "Detailed recommendation with specific amounts",
          "category": "Category name",
          "savingPotential": number
        }
      ]
    `;
    
    // Call Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": import.meta.env.VITE_GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        }),
      }
    );
    
    const result = await response.json();
    
    // Parse the response into structured insights
    let insights = [];
    
    try {
      // Extract text from Gemini response with null checks
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content || !result.candidates[0].content.parts || !result.candidates[0].content.parts[0]) {
        throw new Error('Invalid API response structure');
      }
      const responseText = result.candidates[0].content.parts[0].text;
      
      // Try to parse JSON directly
      try {
        insights = JSON.parse(responseText);
      } catch (jsonError) {
        // If direct JSON parsing fails, try to extract JSON from the text
        const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON found, extract insights manually
          const insightTexts = responseText.split(/\d+\./).filter(text => text.trim().length > 0);
          
          insights = insightTexts.map(text => {
            // Extract title (first sentence or line)
            const titleMatch = text.match(/^([^.!?:]+)[.!?:]/);
            const title = titleMatch ? titleMatch[1].trim() : "Financial Insight";
            
            // Extract category (look for category mentions)
            const categoryMatch = text.match(/category:?\s*([A-Za-z &]+)/i) || 
                                text.match(/in\s+([A-Za-z &]+)\s+spending/i);
            const category = categoryMatch ? categoryMatch[1].trim() : "General";
            
            // Extract potential savings (look for numbers with ₹ symbol or "save" mentions)
            const savingsMatch = text.match(/₹\s*(\d+[,\d]*(\.\d+)?)/i) || 
                                text.match(/save\s*₹?\s*(\d+[,\d]*(\.\d+)?)/i) ||
                                text.match(/saving\s*₹?\s*(\d+[,\d]*(\.\d+)?)/i);
            const savingPotential = savingsMatch ? 
              parseFloat(savingsMatch[1].replace(/,/g, '')) : 
              Math.round(spendingByCategory[category] * 0.2 || totalSpending * 0.1);
            
            return {
              title,
              description: text.trim(),
              category,
              savingPotential
            };
          });
        }
      }
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      throw new Error('Failed to parse AI response');
    }
    
    return {
      success: true,
      insights: insights.slice(0, 3) // Limit to 3 insights
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    
    // Fallback insights if API call fails
    return {
      success: false,
      error: error.message,
      insights: [
        {
          title: "Reduce Food & Dining Expenses",
          description: "You're spending a significant amount on food. Consider cooking at home more often to reduce expenses by 20-30%.",
          category: "Food & Dining",
          savingPotential: 2000
        },
        {
          title: "Create a Budget",
          description: "Setting a monthly budget can help you save up to 15% of your current spending.",
          category: "Budgeting",
          savingPotential: 1500
        },
        {
          title: "Build an Emergency Fund",
          description: "Try to save 10% of your income each month for emergencies and future goals.",
          category: "Savings",
          savingPotential: 3000
        }
      ]
    };
  }
};