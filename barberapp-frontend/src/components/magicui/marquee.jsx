import { cn } from "@/lib/utils";

export default function Marquee({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  fade = true, // Nueva prop para suavizar bordes
  ...props
}) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1.5rem]", // Aumenté el gap para mejor lectura
        {
          "flex-row": !vertical,
          "flex-col": vertical,
          // Añade un degradado en los bordes para que no se corte de golpe
          "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]": fade && !vertical,
          "[mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]": fade && vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn("flex shrink-0 justify-around [gap:var(--gap)]", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {children}
          </div>
        ))}
    </div>
  );
}