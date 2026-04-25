import { NextRequest, NextResponse } from 'next/server';

export async function POST(req) {
  const { messages } = await req.json();
  const userMessage = messages[messages.length - 1].content;
  const upper = userMessage.toUpperCase();
  const tickers = ['NVDA','AAPL','MSFT','GOOGL','AMZN','META','TSLA','AMD','INTC','NFLX'];
  const found = tickers.find(t => upper.includes(t));
  
  let marketData = '';
  if (found) {
    try {
      const url = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=' + found + '&apikey=' + process.env.ALPHA_VANTAGE_KEY;
      const res = await fetch(url);
      const json = await res.json();
      const q = json['Global Quote'];
      if (q && q['05. price']) {
        marketData = found + ' live price: $' + parseFloat(q['05. price']).toFixed(2) + ', change today: ' + q['10. change percent'];
      }
    } catch(e) { marketData = ''; }
  }

  const sys = 'You are an elite stock market analyst. ' + (marketData ? 'IMPORTANT - Use this live market data in your response: ' + marketData + '. State the exact current price.' : 'Give detailed stock analysis.');
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: sys, messages })
  });

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  return NextResponse.json({ content: text });
}