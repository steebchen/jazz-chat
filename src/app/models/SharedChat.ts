import { CoMap } from "jazz-tools";
import { Account } from "jazz-tools";

export class SharedChat extends CoMap {
  owner!: Account;
  messages!: Array<{ role: string; content: string }>;
} 