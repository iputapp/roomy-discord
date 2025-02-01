import type { ParsedEnv } from "~/constants";
import { APIError } from "~/handler";
import { GoogleAuth } from "~/utils/google";

export namespace GoogleSheetsService {
  export async function getRoomInfo(
    props: ParsedEnv["googleSheets"],
  ): Promise<string> {
    const { clientEmail, privateKey, spreadsheetId, range } = props;
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
}
