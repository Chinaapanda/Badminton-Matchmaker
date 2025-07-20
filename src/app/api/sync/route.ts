import { getMatchmaker } from "@/lib/matchmaker-instance";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { data } = await request.json();

    if (!data) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    // Get the matchmaker instance and load the client data
    const matchmaker = getMatchmaker();
    matchmaker.loadFromServerData(data);

    return NextResponse.json({
      message: "Data synced successfully",
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sync data" }, { status: 500 });
  }
}
