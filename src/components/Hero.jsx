import Orb from "./Orb";
import RotatingText from "./RotatingText";

export default function Hero() {
    return (
        <section className="relative h-screen flex flex-col items-center justify-center px-4 text-center bg-[#FFFFFF] overflow-hidden">

            <div className="absolute inset-0 z-0 scale-110 pointer-events-none">
                <Orb
                    hue={247}
                    hoverIntensity={0}
                    rotateOnHover={false}
                    forceHoverState={false}
                />
            </div>

            <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 px-4 text-[#2B2B2B]">
                <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold">Talk to</span>
                <RotatingText
                    texts={['Therapists', 'Listeners', 'Me']}
                    mainClassName="px-5 py-3 bg-[#FFFFFF] backdrop-blur-md text-[#B80F2A] rounded-xl shadow-lg inline-flex items-center text-4xl sm:text-5xl md:text-6xl font-extrabold transition-all"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.025}
                    splitLevelClassName="overflow-hidden"
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    rotationInterval={2000}
                />
            </div>
        </section>

    );
}
