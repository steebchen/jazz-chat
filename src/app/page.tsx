"use client";

import { useAccount } from "jazz-react";
import { Account } from "jazz-tools";
import Link from "next/link";
import Chat from './components/Chat';

export default function Home() {
  const { me } = useAccount(Account, {
    resolve: {
      profile: true,
    },
  });

  return (
    <main className="min-h-screen bg-white">
      <Chat />

      <div>
        <div className="text-sm">
          Your profile name{" "}
          <span className="text-xs">(only loaded on the client)</span>
        </div>
        <input
          className="border-2 border-gray-300 rounded-md p-2 w-full"
          value={me?.profile.name ?? ""}
          onChange={(e) => {
            if (!me) {
              return;
            }

            me.profile.name = e.target.value;
          }}
        />
      </div>
    </main>
  );
}
