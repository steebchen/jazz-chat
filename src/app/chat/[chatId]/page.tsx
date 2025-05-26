import { jazzSSR } from "@/jazzSSR";
import { SharedChat } from "@/app/models/SharedChat";
import Chat from "@/app/components/Chat";

export default async function SharedChatPage(props: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await props.params;
  const chat = await SharedChat.load(chatId, {
    loadAs: jazzSSR,
  });
  console.log('chat', chat);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chat Not Found</h1>
          <p className="text-gray-600">The requested chat could not be found.</p>
        </div>
      </div>
    );
  }

  const messages = chat.messages.map((msg, index) => ({
    id: index.toString(),
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  return (
    <main className="min-h-screen bg-white">
      <Chat initialMessages={messages} readOnly />
    </main>
  );
}
