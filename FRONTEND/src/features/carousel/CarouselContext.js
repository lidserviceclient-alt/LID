import { createContext } from "react";

export const CarouselContext = createContext({
  onCardClose: () => {},
  currentIndex: 0,
});
