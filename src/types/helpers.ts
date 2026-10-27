/**
 * database.ts ustidan yordamchi turlar.
 * database.ts `npm run gen:types` bilan qayta yozilsa ham bu fayl saqlanib qoladi.
 */
import type { Database } from "./database";

type PublicSchema = Database["public"];

export type TableRow<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TableInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TableUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
export type ViewRow<T extends keyof PublicSchema["Views"]> = PublicSchema["Views"][T]["Row"];
