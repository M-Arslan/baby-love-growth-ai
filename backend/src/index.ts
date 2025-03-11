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


const fetchSearchResultsFromSerper = async (website: string) => {
    try {
        const query = `related:${website} OR "competitors of ${website}" OR "alternative to ${website}" OR site:${website}`;
        
        const response = await axios.post(
            "https://google.serper.dev/search",
            { q: query, num: 20 }, // Fetch 20 results
            { headers: { "X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json" } }
        );

        if (!response.data.organic || response.data.organic.length === 0) {
            throw new Error(`No competitor data found for ${website}`);
        }

        const results = response.data.organic.map((result: any) => ({
            title: result.title,
            link: result.link,
            snippet: result.snippet,
            publishedDate: result.date ?? "Unknown", // Some results contain a published date
        }));

        return results;
    } catch (error: any) {
        console.error(`Error fetching competitors for ${website}:`, error.response?.data || error.message);
        return [];
    }
};

const extractCompetitorInformation = async (website: string, searchResults: any) => {
    try {

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: `Analyze these search results for ${website} competitors: ${JSON.stringify(searchResults)}.
                        Return only 10 competitors with:
                      - "url": Competitor Name - url
                      - "description": Short description of the competitor
                      - "traffic": Relevance score (0-100)
                      - "logo": Competitor website URL Return ONLY a JSON object with this exact structure: {
                        "competitors": [{"url": "string","description": "string", "traffic": number, "logo": "url"}]
                      }
                      No explanations, notes, or markdown formatting. Only valid JSON.`
                    }
                ],
                response_format: { type: "json_object" }
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const rawResponse = response.data.choices[0].message.content;
        const jsonString = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("OpenRouter API error:", error);
        return { competitors: [] };
    }
};

app.post("/api/competitors", async (req: Request, res: Response) => {
    try {
        const { website } = req.body;
        if (!website) {
            res.status(400).json({ error: "Website URL is required" });
            return;
        }

        const searchResults = await fetchSearchResultsFromSerper(website);
        const analyzedCompetitors = await extractCompetitorInformation(website, searchResults);

        res.json(analyzedCompetitors);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
