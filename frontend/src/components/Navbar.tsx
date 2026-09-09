import { LogoMark } from "./icons";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-forest-sage/30 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-lg font-bold tracking-tight text-forest-deep">
            NutriLens
          </span>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full border border-forest-sage/50 bg-white px-3 py-1 text-xs font-medium text-forest-medium sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-forest-fresh" />
          Search powered by Typesense
        </span>
      </div>
    </header>
  );
}
