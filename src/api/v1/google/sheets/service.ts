import type { ParsedEnv } from "~/constants";
import { APIError } from "~/handler";
import { GoogleAuth } from "~/utils/google";
import type { Query } from "./types";

export namespace GoogleSheetsService {
  export async function getRoomInfo(
    props: ParsedEnv["googleSheets"] & Query,
  ): Promise<string> {
    const { clientEmail, privateKey, spreadsheetId, range, query } = props;
    const today = new Date();
    const sheetName = `${today.getMonth() + 1}月分`;

    try {
      /**
       * Error: [unenv] crypto.createSign is not implemented yet!
       * @description Cloudflare Workers with "nodejs_compat" flag cannot use node:crypto module.
       * @link https://github.com/cloudflare/workerd/issues/3172
       *
       * @todo Use "googleapis" library when the issue is resolved.
       */
      // const auth = new google.auth.GoogleAuth({
      //   credentials: {
      //     client_email: clientEmail,
      //     private_key: privateKey.replace(/\\n/g, "\n"),
      //   },
      //   scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
      // });
      // const sheets = google.sheets({ version: "v4", auth });
      // const response = await sheets.spreadsheets.values.get({
      //   spreadsheetId,
      //   range: `${sheetName}!${range}`,
      // });
      // return formatRoomResponse(response.data.values);

      /** @todo Temporary implementation */
      const auth = new GoogleAuth(clientEmail, privateKey);
      const accessToken = await auth.getAccessToken();

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`${sheetName}!${range}`)}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        /**
         * @example
         * ```
         * {
         *   "error": {
         *     "code": 400,
         *     "message": 'Unable to parse range: 2月分!A:E',
         *     "status": "INVALID_ARGUMENT"
         *   }
         * }
         * ```
         */
        const errorData: {
          error: {
            code: number;
            message: string;
            status: string;
          };
        } = await response.json();
        // シートや範囲が存在しない場合
        if (
          errorData.error.code === 400 ||
          errorData.error.status === "INVALID_ARGUMENT"
        ) {
          return "今月の情報が見つからないよ！";
        }
        throw new Error(`Google Sheets API error: ${response.statusText}`);
      }

      const data: {
        range: string;
        values: Parameters<typeof formatRoomResponse>[0];
      } = await response.json();

      // 今日の情報を返す
      if (query.period === "today") {
        return formatRoomResponse(data.values);
      }
      // 週間の情報を返す
      if (query.period === "week") {
        return formatRoomResponseWeek(data.values);
      }
      // デフォルトは今日の情報を返す
      return formatRoomResponse(data.values);
    } catch (err) {
      console.error(err);
      throw new APIError("Failed to fetch google sheets data", 500);
    }
  }

  function formatRoomResponse(values: string[][] | null | undefined): string {
    if (!values || values.length === 0) {
      return "今月は何もないよ！";
    }

    const today = new Date();
    const formattedToday = `${today.getMonth() + 1}/${today.getDate()}`; // "M/D"
    const todayRow = values.find((row) => {
      const date = row[1]; // B列に日付
      return date === formattedToday;
    });

    if (!todayRow) {
      return "今日の情報がないよ！";
    }

    const className = todayRow[0] || "情報なし"; // A列に授業名
    const date = todayRow[1] || "情報なし"; // B列に日付
    const dayOfWeek = todayRow[2] || "情報なし"; // C列に曜日
    const room = todayRow[3] || null; // D列に教室
    const note = todayRow[4] || null; // E列に備考

    /**
     * @example
     * 今日の教室は`999`だよ！
     * ```
     * <日付> 1/1(月)
     * <授業> 自習室
     * 備考
     * ```
     */
    const message = !room
      ? "今日の教室は未定だよ！"
      : `今日の教室は\`${room}\`だよ！\n\`\`\`<日付> ${date}(${dayOfWeek})\n<授業> ${className}${!note ? "" : `\n${note}`}\n\`\`\``;

    return message;
  }

  function formatRoomResponseWeek(
    values: string[][] | null | undefined,
  ): string {
    if (!values || values.length === 0) {
      return "今月は何もないよ！";
    }

    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay); // 今週の日曜日
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // 今週の土曜日

    console.log(values);

    // 今週の日付の範囲内にある行を全て取得
    const weekRows = values.filter((row) => {
      const date = row[1]; // B列に日付
      if (!date) return false;
      const dateParts = date.split("/"); // "M/D" => ["M", "D"]
      if (dateParts.length !== 2) return false;
      const month = Number(dateParts[0]) - 1;
      const day = Number(dateParts[1]);
      const rowDate = new Date(today.getFullYear(), month, day);
      return rowDate >= startOfWeek && rowDate <= endOfWeek;
    });

    if (!weekRows || weekRows.length === 0) {
      return "今週の情報がないよ！";
    }

    /**
     * @example
     * 今週の教室だよ！
     * ```
     * <日付> 1/1(月)
     * <授業> 自習室
     * 備考
     * ---
     * <日付> 1/2(火)
     * <授業> 自習室
     * 備考
     * ```
     */
    let message = "今週の教室だよ！\n```";

    for (const row of weekRows) {
      const className = row[0] || "情報なし"; // A列に授業名
      const date = row[1] || "情報なし"; // B列に日付
      const dayOfWeek = row[2] || "情報なし"; // C列に曜日
      const room = row[3] || "未定"; // D列に教室
      const note = row[4] || null; // E列に備考

      message += `\n<日付> ${date}(${dayOfWeek})`;
      message += `\n<授業> ${className}`;
      message += `\n<教室> ${room}`;
      if (note) message += `\n<備考> ${note}`;
      if (weekRows.indexOf(row) !== weekRows.length - 1) message += "\n---";
    }

    message += "\n```";

    return message;
  }
}
