import {
  getCurrentConfiguration,
  getMatchmaker,
  resetMatchmaker,
  updateConfiguration,
} from "@/lib/matchmaker-instance";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const config = getCurrentConfiguration();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get configuration" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { courts, randomnessLevel, reset } = await request.json();

    if (reset) {
      const matchmaker = resetMatchmaker(courts || 1, randomnessLevel || 0.5);
      return NextResponse.json({
        message: "Matchmaker reset successfully",
        courts: courts || 1,
        randomnessLevel: randomnessLevel || 0.5,
        updatedData: matchmaker.getDataForStorage(),
      });
    }

    if (courts !== undefined || randomnessLevel !== undefined) {
      updateConfiguration(courts || 1, randomnessLevel);

      // Get updated data if matchmaker instance exists
      const matchmaker = getMatchmaker();
      let updatedData = null;
      if (matchmaker) {
        updatedData = matchmaker.getDataForStorage();
      }

      return NextResponse.json({
        message: "Configuration updated successfully",
        courts: courts || 1,
        randomnessLevel: randomnessLevel || 0.5,
        updatedData,
      });
    }

    return NextResponse.json(
      { error: "No configuration provided" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
