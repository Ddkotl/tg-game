import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PlayerRepository } from "../player/repository/player.repository";
import { BattleRepository } from "./battle.repository";
import { BattleResultDto } from "./dto/battle-result.dto";

@Injectable()
export class BattleService {
  constructor(
    private readonly battleRepository: BattleRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  async attack(
    attackerId: string,
    defenderId: string,
  ): Promise<BattleResultDto> {
    if (attackerId === defenderId) {
      throw new BadRequestException(
        "Attacker and defender must be different players",
      );
    }

    const attacker = await this.playerRepository.findById(attackerId);
    const defender = await this.playerRepository.findById(defenderId);

    if (!attacker || !attacker.stats) {
      throw new NotFoundException("Attacker not found");
    }
    if (!defender || !defender.stats) {
      throw new NotFoundException("Defender not found");
    }

    const attackPower = attacker.stats.strength * 2 + attacker.stats.energy;
    const defensePower = defender.stats.defense * 2 + defender.stats.energy;
    let winner = "draw";
    let description = "The duel ended in a draw.";

    if (attackPower > defensePower) {
      winner = "attacker";
      description = `${attacker.username || "Attacker"} defeated ${defender.username || "Defender"}.`;
    } else if (attackPower < defensePower) {
      winner = "defender";
      description = `${defender.username || "Defender"} defended against ${attacker.username || "Attacker"}.`;
    }

    await this.battleRepository.logBattle({
      attackerId,
      defenderId,
      result: winner,
    });

    return {
      attackerId,
      defenderId,
      winner,
      description,
    };
  }
}
