import CarGame from "@/components/car-game";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-3xl font-bold text-white mb-6">2D Car Game</h1>
        <CarGame />
      </div>
    </main>
  );
}
