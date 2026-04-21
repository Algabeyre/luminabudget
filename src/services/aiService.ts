import { GoogleGenAI } from "@google/genai";
import { Transaction, Budget } from "../types";

const apiKey = import.meta.env.VITE_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey as string });

export async function getFinancialAdvice(transactions: Transaction[], budgets: Budget[]) {
  const summary = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0),
    topCategories: budgets.sort((a, b) => b.spent - a.spent).slice(0, 3).map(b => `${b.category}: $${b.spent}/${b.limit}`),
    recentExpenses: transactions.filter(t => t.type === 'expense').slice(0, 5).map(t => `${t.description} ($${t.amount})`)
  };

  const prompt = `
    As a professional financial advisor, analyze this monthly spending data and provide 3-4 actionable "Smart Insights".
    Insights should be concise, encouraging, and highly specific.
    
    Data Summary:
    - Monthly Income: $${summary.totalIncome}
    - Total Expenses: $${summary.totalExpense}
    - Category Progress: ${summary.topCategories.join(', ')}
    - Recent Large Items: ${summary.recentExpenses.join(', ')}

    Return the response as a JSON array of objects with "title", "description", and "category" (e.g., 'Warning', 'Opportunity', 'Tip', 'Success').
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Advice Error:", error);
    return [
      { 
        title: "Manual Insights", 
        description: "Your food spending is slightly above average this week. Consider bulk meal prep.", 
        category: "Tip" 
      }
    ];
  }
}
