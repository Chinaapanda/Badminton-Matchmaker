import { getMatchmaker } from "@/lib/matchmaker-instance";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const matchmaker = getMatchmaker();
    const players = matchmaker.getPlayers();
    return NextResponse.json({ players });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get players" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 }
      );
    }

    const matchmaker = getMatchmaker();
    const playerId = matchmaker.addPlayer(name.trim());
    const player = matchmaker.getPlayers().find((p) => p.id === playerId);

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add player" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { playerId } = await request.json();

    if (!playerId || typeof playerId !== "string") {
      return NextResponse.json(
        { error: "Player ID is required" },
        { status: 400 }
      );
    }

    const matchmaker = getMatchmaker();
    const success = matchmaker.removePlayer(playerId);

    if (!success) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove player" },
      { status: 500 }
    );
  }
}
