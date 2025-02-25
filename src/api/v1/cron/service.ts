import { parseEnv } from "~/constants";
import type { Bindings } from "~/types";
import { sendDiscordMessage } from "~/utils/discord";
import { GoogleSheetsService } from "../google/sheets/service";

export namespace CronService {
  export async function processCronJob(env: Bindings): Promise<void> {
    const { googleSheets, discord } = parseEnv(env);

    // 定期実行の管理はcronの設定で行う
    const message = await GoogleSheetsService.getRoomInfo({
      ...googleSheets,
      query: { period: "week" },
    });
    await sendDiscordMessage({
      token: discord.token,
      channelId: discord.channelId,
      content: message,
    });
  }
}
