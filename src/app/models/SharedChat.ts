import { co, z } from "jazz-tools";

export const SharedChat = co.map({
  messages: z.string(),
});
