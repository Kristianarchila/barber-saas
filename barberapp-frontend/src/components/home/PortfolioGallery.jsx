import { motion } from "framer-motion";

export const PortfolioGallery = () => {
    const works = [
        { id: 1, url: '/portfolio-1.png', tag: 'Fade Mastery' },
        { id: 2, url: '/portfolio-2.png', tag: 'Classic Sculpt' },
        { id: 3, url: '/portfolio-3.png', tag: 'Modern Edge' },
    ];

    return (
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 no-scrollbar pb-10">
            {works.map((work, idx) => (
                <motion.div
                    key={work.id}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="min-w-[320px] md:min-w-[450px] h-[300px] md:h-[450px] snap-center rounded-[3rem] overflow-hidden relative group shadow-2xl"
                >
                    <img
                        src={work.url}
                        alt={work.tag}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute bottom-8 left-8">
                        <span className="text-[9px] tracking-[0.6em] text-gold uppercase font-black block mb-2 cursor-default">
                            Maestría Real
                        </span>
                        <p className="text-2xl font-serif italic text-white drop-shadow-md">
                            {work.tag}
                        </p>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
