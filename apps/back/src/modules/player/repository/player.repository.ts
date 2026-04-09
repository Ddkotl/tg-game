import { Injectable } from "@nestjs/common";
import { Player, Stats } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PlayerRepository {
  constructor(private prisma: PrismaService) {}

  async findByTelegramId(
    telegramId: string,
  ): Promise<(Player & { stats: Stats | null }) | null> {
    return this.prisma.player.findUnique({
      where: { telegramId },
      include: { stats: true },
    });
  }

  async findById(
    id: string,
  ): Promise<(Player & { stats: Stats | null }) | null> {
    return this.prisma.player.findUnique({
      where: { id },
      include: { stats: true },
    });
  }

  async create(data: {
    telegramId: string;
    username?: string;
  }): Promise<Player & { stats: Stats }> {
    return this.prisma.player.create({
      data: {
        telegramId: data.telegramId,
        username: data.username,
        stats: {
          create: {},
        },
      },
      include: { stats: true },
    });
  }

  async findOrCreateByTelegramId(
    telegramId: string,
    username?: string,
  ): Promise<Player & { stats: Stats | null }> {
    let player = await this.findByTelegramId(telegramId);
    if (!player) {
      player = await this.create({ telegramId, username });
    }
    return player;
  }

  async setMeditationStartedAt(
    id: string,
    meditationStartedAt: Date,
  ): Promise<Player & { stats: Stats | null }> {
    return this.prisma.player.update({
      where: { id },
      data: { meditationStartedAt },
      include: { stats: true },
    });
  }

  async claimMeditation(
    id: string,
    energyReward: number,
    strengthReward: number,
    defenseReward: number,
  ): Promise<Player & { stats: Stats | null }> {
    return this.prisma.player.update({
      where: { id },
      data: {
        meditationStartedAt: null,
        stats: {
          update: {
            energy: { increment: energyReward },
            strength: { increment: strengthReward },
            defense: { increment: defenseReward },
          },
        },
      },
      include: { stats: true },
    });
  }

  async upgradeStats(
    id: string,
    statsUpdate: { strength?: number; defense?: number; energy?: number },
  ): Promise<Player & { stats: Stats | null }> {
    const updateData: {
      strength?: { increment: number };
      defense?: { increment: number };
      energy?: { increment: number };
    } = {};

    if (statsUpdate.strength !== undefined) {
      updateData.strength = { increment: statsUpdate.strength };
    }
    if (statsUpdate.defense !== undefined) {
      updateData.defense = { increment: statsUpdate.defense };
    }
    if (statsUpdate.energy !== undefined) {
      updateData.energy = { increment: statsUpdate.energy };
    }

    return this.prisma.player.update({
      where: { id },
      data: {
        stats: {
          update: updateData,
        },
      },
      include: { stats: true },
    });
  }

  async findLeaderboard(
    page: number,
    limit: number,
  ): Promise<Array<Player & { stats: Stats | null }>> {
    return this.prisma.player.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { stats: { strength: "desc" } },
        { stats: { defense: "desc" } },
        { stats: { energy: "desc" } },
      ],
      include: { stats: true },
    });
  }
}
