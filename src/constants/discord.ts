import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";
import type { DiscordCommand } from "~/types";

/**
 * Discord のコマンド一覧
 * * `/roomy today` 今日の教室を確認する
 * * `/roomy help` 使い方・コマンド一覧を表示する
 */
export const DISCORD_COMMANDS = [
  {
    name: "roomy",
    description: "予約している教室を確認する",
    type: ApplicationCommandType.ChatInput,
    options: [
      {
        name: "today",
        description: "今日の教室",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "week",
        description: "今週の教室",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "help",
        description: "使い方・コマンド一覧",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
] as const satisfies DiscordCommand[];
