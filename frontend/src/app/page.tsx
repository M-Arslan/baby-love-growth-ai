"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useCompetitors, Competitor } from "@/hooks/useCompetitors";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const { mutate, isPending, error } = useCompetitors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    console.log("Searching competitors for:", url);
    setShowResults(true);

    mutate(url, {
      onSuccess: (data) => {
        console.log("Received competitors:", data);
        setCompetitors(data);
      },
      onError: (err) => {
        console.error("API Call Failed!", err);
        setShowResults(false);
      }
    });
  };

  const handleBack = () => {
    setShowResults(false);
    setCompetitors([]);
    setUrl("");
  };

  function formatNumber(num:number) {
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1) + "M"; 
    } else if (num >= 1_000) {
        return (num / 1_000).toFixed(1) + "K"; 
    } else {
        return num.toString(); 
    }
}





  if (showResults) {
    return (
      <main className="min-h-screen bg-white p-8">
        <div className="max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            {/* <Image
              src="https://images.unsplash.com/photo-1584727638096-042c45049ebe?w=120&h=40&fit=crop"
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto"
            /> */}
          </div>

          {/* Title and Description */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">SEO Competitors</h1>
            <p className="text-gray-600">
              Discover a detailed breakdown of your competitors' SEO performance. Uncover key
              areas for improvement and capitalize on missed opportunities to enhance your ranking.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 py-4 px-2 text-sm text-gray-500">
            <div className="col-span-5">Competitors</div>
            <div className="col-span-4">Organic traffic</div>
            <div className="col-span-3">Short description</div>
          </div>

          <div className="space-y-3">
            {isPending ? (
              <p className="text-gray-500">Loading competitors...</p>
            ) : competitors.length > 0 ? (
              competitors.map((competitor, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 bg-white rounded-lg p-4 items-center border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8FFF7] flex items-center justify-center">
                      <span className="text-[#00C48C] text-sm">
                        {String.fromCharCode(65 + index)}
                      </span>
                    </div>
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-sm hover:underline"
                    >
                      {competitor.url}
                    </a>
                  </div>
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00C48C]"
                          style={{ width: `${(competitor.traffic / 100) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{formatNumber(competitor.traffic)}</span>
                    </div>
                  </div>
                  <div className="col-span-3">
                    <span className="text-sm text-gray-500">{competitor.description || "—"}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No competitors found.</p>
            )}
          </div>

          <div className="mt-8">
            <Button 
              onClick={handleBack}
              className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-6 py-3"
            >
              🔙 Back to Search
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-4">

      <div className="text-center  mx-auto space-y-6 search-bar">
        <h1 className="text-white text-5xl md:text-7xl font-bold tracking-tight">
          Find
          <div className="mt-2 md:mt-4">
            SEO Competitors
          </div>
        </h1>

        <p className="text-white/80 text-lg md:text-xl mt-6">
          With a single click, find all your competitors and key SEO metrics.
        </p>

        <form onSubmit={handleSubmit} className="mt-12 relative max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>

            <div className="relative flex items-center bg-zinc-900 rounded-full">
              <Input
                type="url"
                placeholder="Paste your website URL here"
                className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-400 focus-visible:ring-0 text-lg py-6 px-6 rounded-l-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <Button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 py-6 text-lg font-medium transition-colors m-1"
              >
                Find Competitors Now
              </Button>
            </div>
          </div>
        </form>

        {isPending && <p className="mt-6 text-orange-500">Loading competitors...</p>}
        {error && <p className="mt-6 text-red-500">Error fetching competitors.</p>}
      </div>
    </main>
  );
}
