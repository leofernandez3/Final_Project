const OpenAI = require("openai");
const Room = require("../models/room");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const parseAgeRange = (value) => {
  if (!value || value === "Any") return null;
  const match = String(value).match(/^(\d{1,2})\s*-\s*(\d{1,2})$/);
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
};

const ageFits = (age, ageRange) => {
  if (!Number.isFinite(age)) return true;
  const parsed = parseAgeRange(ageRange);
  return !parsed || (age >= parsed.min && age <= parsed.max);
};

const scoreRoom = (room, userPreferences) => {
  const prefs = room.roommatePrefs || {};
  let score = 0;

  if (prefs.smoking === Boolean(userPreferences.smoking)) score += 2;
  if (prefs.pets === Boolean(userPreferences.pets)) score += 2;
  if (prefs.personality && prefs.personality === userPreferences.personality) score += 2;
  if (prefs.schedule && prefs.schedule === userPreferences.schedule) score += 2;
  if (!prefs.gender || prefs.gender === "Any" || prefs.gender === userPreferences.preferredGender) score += 1;
  if (ageFits(Number(userPreferences.age), prefs.ageRange)) score += 2;
  if (userPreferences.type && room.type === userPreferences.type) score += 1;

  return score;
};

const localMatch = (rooms, userPreferences = {}) => {
  const budget = Number(userPreferences.budget);
  const withinBudget = Number.isFinite(budget) && budget > 0
    ? rooms.filter((room) => Number(room.price) <= budget)
    : rooms;

  if (withinBudget.length === 0) {
    return {
      match: null,
      reason: "No rooms found within your budget. Try increasing your budget to see more options."
    };
  }

  let best = null;
  let bestScore = -1;

  for (const room of withinBudget) {
    const score = scoreRoom(room, userPreferences);
    if (score > bestScore) {
      best = room;
      bestScore = score;
    }
  }

  return best
    ? { match: best, reason: "This room matches your budget, age range, and aligns well with your roommate preferences." }
    : { match: null, reason: "No strong match found. Try adjusting your preferences for better results." };
};

const buildPrompt = (userPreferences, roomsData) => `
You are an AI assistant helping students find the best room and roommate match.

Student preferences (the person searching for a room):
${JSON.stringify(userPreferences, null, 2)}

Available rooms (each room includes the landlord's preferred roommate profile):
${JSON.stringify(roomsData, null, 2)}

Your task:
1. Filter rooms where price <= student's budget (treat both values as EUR)
2. Score each room by how well the landlord's roommatePrefs match the student's lifestyle (age, smoking, personality, schedule, gender, pets)
3. Pick the single best matching room

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "matchId": "<_id of the best matching room>",
  "reason": "<2 clear sentences explaining why this room fits the student best>"
}
`;

const findMatch = async (req, res) => {
  let rooms = [];

  try {
    const { userPreferences = {} } = req.body || {};
    rooms = await Room.find({ status: { $ne: "Lended" } });

    if (rooms.length === 0) {
      return res.json({ match: null, reason: "No rooms available in database" });
    }

    const roomsData = rooms.map((room) => ({
      _id: room._id,
      title: room.title,
      price: room.price,
      location: room.location,
      type: room.type,
      description: room.description,
      roommatePrefs: room.roommatePrefs
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: buildPrompt(userPreferences, roomsData) }],
      temperature: 0.3
    });

    const parsed = JSON.parse(response.choices[0].message.content.trim());
    const matchedRoom = rooms.find((room) => room._id.toString() === parsed.matchId);

    if (!matchedRoom) {
      return res.status(404).json({ message: "AI returned an unknown room ID" });
    }

    return res.json({ match: matchedRoom, reason: parsed.reason });
  } catch (err) {
    console.error("OpenAI match error:", err.message);
    try {
      const { userPreferences = {} } = req.body || {};
      const fallback = localMatch(rooms, userPreferences);
      return res.json({ ...fallback, aiFallback: true });
    } catch {
      return res.status(500).json({ message: "AI matching failed: " + err.message });
    }
  }
};

module.exports = { findMatch };
