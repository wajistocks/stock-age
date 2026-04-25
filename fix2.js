const fs = require('fs');
const code = `import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content;
  
  let marketData = '';
  try {
    const symbol = userMessage.match(/\b[A-Z]{2,5}\b/)?.[0];
    if (symbol) {
      const avRes = await fetch('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + symbol + '&apikey=' + process.env.ALPHA_VANTAGE_KEY);
      const avData = await avRes.json();
      const quote = avData['Global Quote'];
      if (quote && quote['05. price']) {
        marketData = 'Live data for ' + symbol + ': Price $' + parseFloat(quote['05. price']).toFixed(2) + ', Change: ' + quote['09. change'] + ' (' + quote['10. change percent'] + '), Volume: ' + parseInt(quote['06. volume']).toLocaleString();
      }
    }
  } catch(e) {}

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are an elite stock market research analyst. ' + (marketData ? 'Use this real live market data in your analysis: ' + marketData : '') + ' Give specific actionable recommendations with ticker symbols, price targets, and clear reasoning.',
      messages
    })
  });

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  return NextResponse.json({ content: text });
}`;
fs.writeFileSync('app/api/research/route.ts', code);
console.log('Done!');
