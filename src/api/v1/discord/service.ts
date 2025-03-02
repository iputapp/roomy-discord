import {
  type APIInteraction,
  ApplicationCommandType,
  InteractionType,
} from "discord-api-types/v10";
import { verifyKey } from "discord-interactions";
import { type ParsedEnv, parseEnv } from "~/constants";
import { DISCORD_COMMANDS } from "~/constants";
import { APIError } from "~/handler";
import { InteractionResponseType, discordInteractionHandler } from "~/handler";
import type { Bindings } from "~/types";
import { GoogleSheetsService } from "../google/sheets/service";

export namespace DiscordService {
  export async function handleInteraction(props: {
    body: string;
    signature: string;
    timestamp: string;
    env: Bindings;
  }) {
    const { body, signature, timestamp, env } = props;
    const { discord, googleSheets } = parseEnv(env);

    const isValid = await verifyKey(
      body,
      signature,
      timestamp,
      discord.publicKey,
    );
    if (!isValid) {
      throw new APIError("Invalid discord signature", 401);
    }

    const interaction = JSON.parse(body);
    return handleInteractionType({ interaction, env: googleSheets });
  }

  async function handleInteractionType(props: {
    interaction: APIInteraction;
    env: ParsedEnv["googleSheets"];
  }): Promise<Response> {
    const { interaction, env } = props;

    // PINGリクエストの処理
    if (interaction.type === InteractionType.Ping) {
      return discordInteractionHandler({ type: InteractionResponseType.Pong });
    }

    // スラッシュコマンドの処理
    if (
      interaction.type === InteractionType.ApplicationCommand &&
      interaction.data.type === ApplicationCommandType.ChatInput
    ) {
      /**
       * @example /roomy {command}
       * @see DISCORD_COMMANDS
       */
      const command = interaction.data.options?.[0].name
        .toString()
        .toLowerCase() as (typeof DISCORD_COMMANDS)[number]["options"][number]["name"];

      // コマンドの追加はここに追記
      switch (command) {
        case "today": {
          const message = await GoogleSheetsService.getRoomInfo({
            ...env,
            query: { period: "today" },
          });
          return discordInteractionHandler({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: message },
          });
        }

        case "week": {
          const message = await GoogleSheetsService.getRoomInfo({
            ...env,
            query: { period: "week" },
          });
          return discordInteractionHandler({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: message },
          });
        }

        case "help": {
          /**
           * @example
           * - `/roomy today`  今日の教室を確認する
           * - `/roomy week`  今週の教室を確認する
           * - `/roomy help`  使い方・コマンド一覧を確認する
           */
          const helps = DISCORD_COMMANDS[0].options.map((option) => {
            return `- \`/${DISCORD_COMMANDS[0].name} ${option.name}\`  ${option.description}を確認する`;
          });
          const message = `### 使い方・コマンド一覧\n${helps.join("\n")}`;
          return discordInteractionHandler({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: message },
          });
        }

        default:
          return discordInteractionHandler({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: "不明なコマンドだよ！" },
          });
      }
    }

    // 未対応のインタラクションタイプ
    return discordInteractionHandler(
      {
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content: "Unsupported interaction type" },
      },
      { status: 404 },
    );
  }
}
