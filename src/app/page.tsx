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
    </main>
  );
}
