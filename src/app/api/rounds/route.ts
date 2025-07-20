import { getMatchmaker } from "@/lib/matchmaker-instance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const matchmaker = getMatchmaker();
    const rounds = matchmaker.getRounds();
    const currentRound = matchmaker.getCurrentRound();

    return NextResponse.json({
      rounds,
      currentRound,
      totalRounds: rounds.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get rounds" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const matchmaker = getMatchmaker();

    try {
      const round = matchmaker.generateNextRound();

      if (!round) {
        return NextResponse.json(
          { error: "Maximum rounds reached" },
          { status: 400 }
        );
      }

      // Return the updated data for client to save
      return NextResponse.json(
        {
          round,
          updatedData: matchmaker.getDataForStorage(),
        },
        { status: 201 }
      );
    } catch (algorithmError: any) {
      return NextResponse.json(
        { error: algorithmError.message },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate round" },
      { status: 500 }
    );
  }
}
