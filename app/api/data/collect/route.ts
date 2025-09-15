import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, keywords } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { collectAllData } from "@/services/dataPipeline";

// Helper function to get user ID from request headers
function getUserIdFromRequest(request: Request): number | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    try {
      const payload = JSON.parse(atob(token));
      return payload.userId;
    } catch {
      return null;
    }
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    // Get user's keywords
    const userKeywords = await db
      .select()
      .from(keywords)
      .where(eq(keywords.userId, userId));

    if (userKeywords.length === 0) {
      return NextResponse.json(
        { error: "No keywords found for user" },
        { status: 400 },
      );
    }

    const keywordStrings = userKeywords.map((k) => k.keyword);

    console.log("Keywords to process:", keywordStrings);

    // Collect data for all keywords
    console.log("Starting data collection process...");
    const collectedData = await collectAllData(keywordStrings);
    console.log("Data collection completed. Results:", collectedData.length, "keywords processed");

    // Save the collected data to user's monitoring data
    await db
      .update(users)
      .set({
        monitoringData: collectedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return NextResponse.json({
      message: "Data collected successfully",
      data: collectedData,
    });
  } catch (error) {
    console.error("Error collecting data:", error);
    return NextResponse.json(
      { error: "Failed to collect data" },
      { status: 500 },
    );
  }
}
