import Typewriter from "./Typewriter";
import LandingButtons from "./LandingButtons";

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-2xl text-center">
        <Typewriter />
        <LandingButtons />
      </div>
    </main>
  );
}
