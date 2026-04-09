import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from "@nestjs/common";
import { createHash, createHmac, timingSafeEqual } from "crypto";
import { PlayerDto } from "../player/dto/player.dto";
import { PlayerService } from "../player/player.service";

interface TelegramInitData {
  id: string;
  username?: string;
  authDate: number;
}

@Injectable()
export class AuthService {
  constructor(private readonly playerService: PlayerService) {}

  async authenticate(initData: string): Promise<PlayerDto> {
    const parsed = this.parseInitData(initData);
    return this.playerService.findOrCreateByTelegramId(
      parsed.id,
      parsed.username,
    );
  }

  private parseInitData(initData: string): TelegramInitData {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new InternalServerErrorException(
        "Telegram bot token is not configured",
      );
    }

    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      throw new BadRequestException("Missing Telegram initData hash");
    }

    const dataCheckString = [...params.entries()]
      .filter(([key]) => key !== "hash")
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    const secretKey = createHash("sha256").update(token).digest();
    const expectedHash = createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    const hashBuffer = Buffer.from(hash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (
      hashBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(hashBuffer, expectedBuffer)
    ) {
      throw new BadRequestException("Invalid Telegram initData signature");
    }

    const id = params.get("id");
    if (!id) {
      throw new BadRequestException("Missing Telegram user id");
    }

    const authDateString = params.get("auth_date");
    if (!authDateString || Number.isNaN(Number(authDateString))) {
      throw new BadRequestException("Invalid Telegram auth_date");
    }

    const authDate = Number(authDateString);
    if (Math.abs(Date.now() / 1000 - authDate) > 86400) {
      throw new BadRequestException("Telegram initData is too old");
    }

    const username =
      params.get("username") || params.get("first_name") || undefined;

    return { id, username, authDate };
  }
}
