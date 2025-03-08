import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const SERPER_API_KEY = process.env.SERPER_API_KEY;

if (!OPENROUTER_API_KEY || !SERPER_API_KEY) {
  throw new Error("Missing API keys in .env file");
}


const fetchCompetitors = async (website: string): Promise<{ url: string; description: string }[]> => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an SEO expert. Given a website, return exactly 10 competitors in a **valid JSON array** format. 
                      Strictly use this format: 
                      [{"url": "https://competitor.com", "description": "A brief description"}]
                      **DO NOT** include any additional text, explanations, or markdown formatting. **Only return the JSON array.**`
          },
          {
            role: "user",
            content: `Find competitors for: ${website}`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    if (!response.data.choices || !response.data.choices.length) {
      throw new Error("Invalid API response (No choices returned)");
    }

    let jsonResponse = response.data.choices[0].message.content.trim();

    console.log("Raw OpenRouter Response:", jsonResponse);

    if (jsonResponse.startsWith('"') && jsonResponse.endsWith('"')) {
      jsonResponse = jsonResponse.slice(1, -1).replace(/\\"/g, '"');
    }

    try {
      const competitors: { url: string; description: string }[] = JSON.parse(jsonResponse);
      return competitors.slice(0, 10);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError);
      throw new Error("Failed to parse OpenRouter API response");
    }
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return [];
  }
};


const fetchCompetitorDetails = async (url: string): Promise<{ logo: string | null; traffic: number }> => {
  try {
    const response = await axios.post(
      "https://serper.dev/search",
      { q: url },
      { headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" } }
    );

    if (!response.data.organic || response.data.organic.length === 0) {
      return { logo: null, traffic: Math.floor(Math.random() * 100000) };
    }

    const siteData = response.data.organic[0];
    return {
      logo: siteData.favicon || null,
      traffic: Math.floor(Math.random() * 100000),
    };
  } catch (error) {
    console.error(`Error fetching details for ${url}:`, error);
    return { logo: null, traffic: Math.floor(Math.random() * 100000) };
  }
};


app.post("/api/competitors", async (req: Request, res: Response): Promise<void> => {
  try {
    const { website } = req.body;
    if (!website) {
      res.status(400).json({ error: "Website URL is required" });
      return;
    }

    const competitors = await fetchCompetitors(website);

    const detailedCompetitors = await Promise.all(
      competitors.map(async (competitor) => {
        const details = await fetchCompetitorDetails(competitor.url);
        return { ...competitor, ...details };
      })
    );

    res.json({ competitors: detailedCompetitors });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
