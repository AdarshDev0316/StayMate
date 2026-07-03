const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── AI Compatibility Scorer ──────────────────────────────────────────────────
const computeCompatibilityScore = async (tenant, listing) => {
  try {
    const score = await getGeminiScore(tenant, listing);
    return score;
  } catch (err) {
    console.warn('⚠️  Gemini failed, using fallback scoring:', err.message);
    return getFallbackScore(tenant, listing);
  }
};

// ─── Gemini LLM Scoring ───────────────────────────────────────────────────────
const getGeminiScore = async (tenant, listing) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const prefs = tenant.preferences || {};
  const listingPrefs = listing.preferences || {};

  const prompt = `You are StayMate's AI compatibility engine. Analyze the compatibility between a tenant and a room listing.

TENANT PROFILE:
- Name: ${tenant.name}
- Preferred Location/City: ${prefs.city || prefs.location || 'Not specified'}
- Budget Range: ₹${prefs.budgetMin || 0} - ₹${prefs.budgetMax || 'unlimited'}/month
- Preferred Move-in Date: ${prefs.moveInDate ? new Date(prefs.moveInDate).toDateString() : 'Flexible'}
- Preferred Room Type: ${prefs.roomType || 'Any'}
- Preferred Furnishing: ${prefs.furnishing || 'Any'}
- Lifestyle - Smoking: ${prefs.lifestyle?.smoking ? 'Yes' : 'No'}
- Lifestyle - Pets: ${prefs.lifestyle?.pets ? 'Yes' : 'No'}
- Lifestyle - Vegetarian: ${prefs.lifestyle?.vegetarian ? 'Yes' : 'No'}
- Work Schedule: ${prefs.lifestyle?.workSchedule || 'Any'}
- Gender: ${prefs.gender || 'Not specified'}
- Occupation: ${prefs.occupation || 'Not specified'}

ROOM LISTING:
- Title: ${listing.title}
- City: ${listing.location?.city || 'Not specified'}
- Address: ${listing.location?.address || 'Not specified'}
- Rent: ₹${listing.rent}/month + ₹${listing.deposit || 0} deposit
- Room Type: ${listing.roomType}
- Furnishing: ${listing.furnishing}
- Available From: ${new Date(listing.availableFrom).toDateString()}
- Amenities: ${listing.amenities?.join(', ') || 'None listed'}
- Owner Preference - Gender: ${listingPrefs.gender || 'Any'}
- Owner Preference - Occupation: ${listingPrefs.occupation || 'Any'}
- Owner Preference - Smoking Allowed: ${listingPrefs.smoking ? 'Yes' : 'No'}
- Owner Preference - Pets Allowed: ${listingPrefs.pets ? 'Yes' : 'No'}
- Owner Preference - Vegetarian Only: ${listingPrefs.vegetarian ? 'Yes' : 'No'}

Analyze and return ONLY a JSON object with:
{
  "score": <integer 0-100>,
  "confidence": <"high" | "medium" | "low">,
  "explanation": "<2-3 clear sentences explaining the match quality>",
  "pros": ["<matching factor 1>", "<matching factor 2>", ...],
  "cons": ["<mismatch factor 1>", ...],
  "recommendations": ["<actionable tip for tenant>", ...]
}

Scoring Guide:
- 80-100: Excellent match (most criteria align perfectly)
- 60-79: Good match (most criteria align, minor gaps)
- 40-59: Average match (some criteria align, notable gaps)
- 0-39: Poor match (significant incompatibilities)

Be factual, specific, and helpful. Do not be generic.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    // Try to extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Could not parse Gemini response as JSON');
    }
  }

  // Validate response structure
  if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
    throw new Error('Invalid score from Gemini');
  }

  return {
    score: Math.round(parsed.score),
    confidence: parsed.confidence || 'medium',
    explanation: parsed.explanation || '',
    pros: Array.isArray(parsed.pros) ? parsed.pros : [],
    cons: Array.isArray(parsed.cons) ? parsed.cons : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    fallback: false,
  };
};

// ─── Rule-Based Fallback Scoring ──────────────────────────────────────────────
const getFallbackScore = (tenant, listing) => {
  const prefs = tenant.preferences || {};
  const listingPrefs = listing.preferences || {};
  let score = 0;
  const pros = [];
  const cons = [];

  // 1. City/Location Match (30 pts)
  const tenantCity = (prefs.city || prefs.location || '').toLowerCase().trim();
  const listingCity = (listing.location?.city || '').toLowerCase().trim();
  if (tenantCity && listingCity && (tenantCity === listingCity || listingCity.includes(tenantCity) || tenantCity.includes(listingCity))) {
    score += 30;
    pros.push(`Location matches your preference (${listing.location.city})`);
  } else {
    cons.push(`Location differs from your preference`);
  }

  // 2. Budget Within Range (25 pts)
  const { budgetMin = 0, budgetMax = Infinity } = prefs;
  if (listing.rent >= budgetMin && listing.rent <= budgetMax) {
    score += 25;
    pros.push(`Rent ₹${listing.rent} is within your budget range`);
  } else if (listing.rent < budgetMin) {
    score += 15;
    pros.push(`Rent is below your minimum budget`);
  } else {
    cons.push(`Rent ₹${listing.rent} exceeds your budget of ₹${budgetMax}`);
  }

  // 3. Room Type Match (20 pts)
  if (prefs.roomType === 'any' || !prefs.roomType || prefs.roomType === listing.roomType) {
    score += 20;
    pros.push(`Room type (${listing.roomType}) matches your preference`);
  } else {
    cons.push(`Room type (${listing.roomType}) doesn't match your preference (${prefs.roomType})`);
  }

  // 4. Availability Date Match (15 pts)
  const tenantMoveIn = prefs.moveInDate ? new Date(prefs.moveInDate) : null;
  const listingAvailable = new Date(listing.availableFrom);
  if (!tenantMoveIn) {
    score += 10;
  } else if (listingAvailable <= tenantMoveIn) {
    score += 15;
    pros.push('Room available before your desired move-in date');
  } else {
    const diffDays = Math.abs((listingAvailable - tenantMoveIn) / (1000 * 60 * 60 * 24));
    if (diffDays <= 30) {
      score += 8;
    } else {
      cons.push(`Room available ${Math.round(diffDays)} days after your desired move-in`);
    }
  }

  // 5. Lifestyle Compatibility (10 pts)
  let lifestyleScore = 0;
  const lifestyle = prefs.lifestyle || {};

  if (!listingPrefs.smoking && lifestyle.smoking) {
    cons.push('Owner prefers non-smoking');
  } else {
    lifestyleScore += 3;
  }

  if (!listingPrefs.pets && lifestyle.pets) {
    cons.push('Owner does not allow pets');
  } else {
    lifestyleScore += 4;
  }

  if (listingPrefs.vegetarian && !lifestyle.vegetarian) {
    cons.push('Owner prefers vegetarian tenants');
  } else {
    lifestyleScore += 3;
  }

  score += lifestyleScore;

  if (lifestyleScore >= 8) {
    pros.push('Lifestyle preferences are compatible');
  }

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    score: finalScore,
    confidence: 'low',
    explanation: `Based on rule-based analysis: ${pros.slice(0, 2).join('. ')}. ${cons.length > 0 ? `Key concerns: ${cons.slice(0, 2).join('. ')}.` : ''}`,
    pros,
    cons,
    recommendations: [
      'Complete your profile for a more accurate AI match score',
      'Update your preferences to get better recommendations',
    ],
    fallback: true,
  };
};

// ─── Get Recommendations ──────────────────────────────────────────────────────
const getRecommendations = async (tenant, listings) => {
  // Score all listings in parallel (max 10 at a time)
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < listings.length; i += batchSize) {
    const batch = listings.slice(i, i + batchSize);
    const scores = await Promise.allSettled(
      batch.map(listing => computeCompatibilityScore(tenant, listing))
    );

    scores.forEach((result, idx) => {
      if (result.status === 'fulfilled') {
        results.push({
          listing: batch[idx],
          ...result.value,
        });
      } else {
        results.push({
          listing: batch[idx],
          score: 50,
          confidence: 'low',
          explanation: 'Score temporarily unavailable',
          pros: [],
          cons: [],
          recommendations: [],
          fallback: true,
        });
      }
    });
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
};

module.exports = { computeCompatibilityScore, getRecommendations };
