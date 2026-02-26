import React from "react";
import { Star, Quote } from "lucide-react";
import { cn } from "@/utils/cn";

const reviews = [];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
  rating,
}) => {
  return (
    <figure
      className={cn(
        "relative w-80 cursor-pointer overflow-hidden rounded-xl border p-6",
        // light styles
        "border-neutral-200 bg-white hover:bg-neutral-50",
        // dark styles
        "dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/50",
        "transition-colors duration-300"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <img className="rounded-full w-10 h-10 object-cover" width="40" height="40" alt={name} src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-bold dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
            {username}
          </p>
        </div>
        <div className="ml-auto flex gap-0.5">
            {[...Array(5)].map((_, i) => (
                <Star 
                    key={i} 
                    className={cn(
                        "w-3 h-3", 
                        i < rating ? "fill-orange-500 text-orange-500" : "fill-neutral-200 text-neutral-200 dark:fill-neutral-800 dark:text-neutral-800"
                    )} 
                />
            ))}
        </div>
      </div>
      <blockquote className="mt-4 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
        <Quote className="w-4 h-4 text-neutral-300 dark:text-neutral-700 mb-1 transform scale-x-[-1]" />
        {body}
      </blockquote>
    </figure>
  );
};

const Marquee = ({
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) => {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
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
};

export default function Opinion() {
  if (reviews.length === 0) return null;
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden py-20  dark:bg-black/20">
      
      <div className="mb-12 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4 font-sans">
            Ils nous font confiance
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto">
            Découvrez ce que la communauté pense de son expérience sur Lid. La transparence et la satisfaction sont au cœur de nos priorités.
        </p>
      </div>

      <Marquee pauseOnHover className="[--duration:40s]">
        {firstRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      <Marquee reverse pauseOnHover className="[--duration:40s] mt-4">
        {secondRow.map((review) => (
          <ReviewCard key={review.username} {...review} />
        ))}
      </Marquee>
      
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-neutral-950"></div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-neutral-950"></div>
      
      <style>{`
        @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(calc(-100% - var(--gap))); }
        }
        @keyframes marquee-vertical {
            from { transform: translateY(0); }
            to { transform: translateY(calc(-100% - var(--gap))); }
        }
        .animate-marquee {
            animation: marquee var(--duration) linear infinite;
        }
        .animate-marquee-vertical {
            animation: marquee-vertical var(--duration) linear infinite;
        }
      `}</style>
    </div>
  );
}
