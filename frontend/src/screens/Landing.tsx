import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { SiteNav } from "../components/SiteNav";
import DotField from "../components/DotField";
import { HeroBoard } from "../components/HeroBoard";
import { useReplay } from "../hooks/useReplay";
import { FAMOUS_GAME } from "../data/famousGame";

export const Landing = () => {
    const navigate = useNavigate();
    const { pieces, lastMove, moveText } = useReplay();

    return (
        <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden text-slate-200 flex flex-col">

            {/* BACKGROUND: the same dot field as the game page */}
            <div className="absolute inset-0 z-0">
                <DotField
                    dotRadius={3}
                    dotSpacing={12}
                    bulgeStrength={67}
                    glowRadius={160}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={500}
                    cursorForce={0.1}
                    bulgeOnly={true}
                    gradientFrom="#10b981"
                    gradientTo="#1e293b"
                    glowColor="#064e3b"
                />
            </div>

            <SiteNav />

            {/* HERO: two columns on large screens, stacked on small ones */}
            <main className="relative z-10 flex-1 w-full max-w-screen-xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                {/* LEFT: the pitch */}
                <div>
                    <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tight leading-none">
                        Your move.
                    </h1>
                    <p className="mt-6 text-lg lg:text-xl text-slate-400 max-w-md leading-relaxed">
                        Real-time chess against real people. Click play, get matched, and start your game.
                    </p>
                    <div className="mt-10 flex items-center gap-6">
                        <Button onClick={() => navigate("/game", { viewTransition: true })}>Play now</Button>
                        <span className="text-sm text-slate-500">No account needed</span>
                    </div>
                </div>

                {/* RIGHT: the board (a placeholder until step 3) */}
                <figure className="w-full max-w-[480px] mx-auto">
                    <HeroBoard pieces={pieces} lastMove={lastMove} />
                    <figcaption className="mt-4 flex items-baseline justify-between gap-4">
                        <span className="text-sm text-slate-400">
                            {FAMOUS_GAME.white} vs. {FAMOUS_GAME.black}, {FAMOUS_GAME.event}
                            <span className="block text-slate-500">The Game of the Century</span>
                        </span>
                        <span className="text-lg font-semibold text-white tabular-nums">
                            {moveText}
                        </span>
                    </figcaption>
                </figure>
            </main>
        </div>
    );
};