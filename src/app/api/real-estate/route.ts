import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { address } = await request.json();

        if (!address) {
            return NextResponse.json({ error: 'Address is required' }, { status: 400 });
        }

        const apiKey = process.env.HASDATA_API_KEY || 'vPVkUZ0KDFaHq36Wa2T5xuw4QBCkMJ';

        try {
            // First attempt: HasData Zillow Search API (Best for addresses)
            const response = await fetch('https://api.hasdata.com/scrape/zillow/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                },
                body: JSON.stringify({
                    q: address,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('HasData API Error:', errorText);
                // If API fails (e.g. invalid key or out of credits), fallback to high-quality mock
                return NextResponse.json({
                    isMock: true,
                    data: generateMockData(address)
                });
            }

            const apiData = await response.json();

            // Check if we got results
            const results = apiData.results || apiData.data || [];
            if (results.length === 0) {
                return NextResponse.json({
                    isMock: true,
                    data: generateMockData(address)
                });
            }

            return NextResponse.json({
                isMock: false,
                data: processHasDataSearchResponse(results[0], address)
            });

        } catch (apiError) {
            console.error('External API fetch failed:', apiError);
            return NextResponse.json({
                isMock: true,
                data: generateMockData(address)
            });
        }

    } catch (err: unknown) {
        const error = err as Error;
        console.error('Real Estate Analysis Error:', error);
        return NextResponse.json({
            error: 'Failed to analyze property',
            details: error.message
        }, { status: 500 });
    }
}

function processHasDataSearchResponse(propertyObj: Record<string, unknown>, searchAddress: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const property = propertyObj as Record<string, any>;
    // HasData Search Results typically have slightly different fields than full property details
    const price = property.price || property.unformattedPrice || 0;
    const rent = property.rentZestimate || (price * 0.005);

    // Some APIs return price as a string, attempt to parse
    const numericPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, '')) || 0 : price;
    const numericRent = typeof rent === 'string' ? parseInt(rent.replace(/[^0-9]/g, '')) || 0 : rent;

    return {
        address: property.address || searchAddress,
        price: typeof price === 'string' ? price : `$${price.toLocaleString()}`,
        status: property.homeStatus || property.statusText || 'For Sale',
        rent: `$${Math.round(numericRent).toLocaleString()}/mo`,
        schoolRating: property.schools ? property.schools[0]?.rating || 7 : Math.floor(Math.random() * 3) + 6,
        area: property.area || `${property.livingArea || 1800} sqft`,
        lotSize: property.lotSize || '0.2 acres',
        goodBuyScore: calculateScore(numericPrice, numericRent),
        verdict: calculateVerdict(numericPrice, numericRent),
        verdictDesc: generateVerdictDesc(numericPrice, numericRent),
        similar: [
            { id: 1, address: 'Nearby Property A', price: `$${Math.round(numericPrice * 0.95).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80' },
            { id: 2, address: 'Nearby Property B', price: `$${Math.round(numericPrice * 1.05).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1448630360428-6e2143831f13?auto=format&fit=crop&q=80' },
            { id: 3, address: 'Nearby Property C', price: `$${Math.round(numericPrice * 1.02).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80' }
        ]
    };
}

function calculateScore(price: number, rent: number) {
    if (!price || !rent) return 70;
    const annualRent = rent * 12;
    const yield_ = (annualRent / price) * 100;
    const score = Math.min(Math.max(Math.round(yield_ * 12), 40), 98);
    return score;
}

function calculateVerdict(price: number, rent: number) {
    const score = calculateScore(price, rent);
    if (score > 80) return 'Strong Buy';
    if (score > 70) return 'Good Buy';
    return 'Neutral';
}

function generateVerdictDesc(price: number, rent: number) {
    const score = calculateScore(price, rent);
    if (score > 80) return 'Excellent rental yield potential with strong appreciation prospects.';
    if (score > 70) return 'Solid investment opportunity with stable expected returns.';
    return 'Market value is high relative to rental income. Consider negotiation.';
}

function generateMockData(address: string) {
    const mockPrice = Math.floor(Math.random() * (2000000 - 500000) + 500000);
    const mockRent = Math.floor(mockPrice * 0.005);
    const score = Math.floor(Math.random() * (95 - 60) + 60);

    return {
        address: address,
        price: `$${mockPrice.toLocaleString()}`,
        status: 'For Sale',
        rent: `$${mockRent.toLocaleString()}/mo`,
        schoolRating: Math.floor(Math.random() * 4) + 6,
        area: `${Math.floor(Math.random() * (4000 - 1500) + 1500)} sqft`,
        lotSize: `${(Math.random() * (0.5 - 0.1) + 0.1).toFixed(2)} acres`,
        goodBuyScore: score,
        verdict: score > 80 ? 'Strong Buy' : score > 70 ? 'Good Buy' : 'Neutral',
        verdictDesc: score > 80
            ? 'This property shows excellent rental yield potential and is in a high-growth neighborhood.'
            : 'Solid property but watch out for slightly higher than average property taxes in this area.',
        similar: [
            { id: 1, address: '124 Maple Ave', price: `$${(mockPrice * 0.9).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80' },
            { id: 2, address: '892 Oak Lane', price: `$${(mockPrice * 1.1).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80' },
            { id: 3, address: '45 Sunset Blvd', price: `$${(mockPrice * 1.05).toLocaleString()}`, image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&q=80' },
        ]
    };
}
