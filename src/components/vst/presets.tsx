import { cn } from "@/lib/cn";
import { RECIPES } from "@/lib/vst/recipes";
import { useVst } from "@/lib/vst/store";
import { FAMILIES, type Family, type Recipe } from "@/lib/vst/types";
import { useEffect, useState } from "react";

function spark(gains: number[]) {
  return gains
    .map((gain, index) => {
      const x = 2 + (index * 60) / 6;
      const db = (gain - 50) * 0.24;
      const y = 14 - (db / 12) * 10;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function RecipeButton({ recipe, compact = false }: { recipe: Recipe; compact?: boolean }) {
  const active = useVst((s) => s.recipeId === recipe.id);
  const edited = useVst((s) => s.edited);
  const apply = useVst((s) => s.applyRecipe);
  return (
    <button
      id={compact ? undefined : `recipe-${recipe.id}`}
      type="button"
      data-recipe={recipe.id}
      aria-pressed={active}
      onClick={() => apply(recipe.id)}
      className={cn(
        "shrink-0 border text-left transition-colors duration-150 outline-none active:scale-[0.96] focus-visible:ring-2 focus-visible:ring-brass",
        compact ? "h-11 rounded-full px-3" : "w-full rounded-xl px-3 py-3",
        active ? "border-brass bg-brass/10" : "border-line bg-inset hover:border-brass/50",
      )}
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className={cn("text-ivory", compact ? "text-sm whitespace-nowrap" : "text-sm")}>{recipe.name}</span>
        {!compact && (
          <span className="font-mono text-xs tracking-wide text-muted uppercase">
            {active && edited ? "Edited" : recipe.family}
          </span>
        )}
      </span>
      {!compact && (
        <>
          <span className="mt-1 block text-xs leading-relaxed text-pretty text-muted">{recipe.description}</span>
          <svg viewBox="0 0 64 28" className="mt-2 h-7 w-full" aria-hidden="true">
            <polyline points={spark(recipe.eqGain)} fill="none" className="stroke-brass" strokeWidth="1.4" />
          </svg>
        </>
      )}
    </button>
  );
}

export function PresetStrip() {
  return (
    <div className="flex min-w-0 gap-4 overflow-x-auto pb-1 lg:hidden">
      {FAMILIES.map((family) => (
        <div key={family} className="flex items-center gap-2">
          <span className="text-xs tracking-widest text-muted uppercase">{family}</span>
          {RECIPES.filter((recipe) => recipe.family === family).map((recipe) => (
            <RecipeButton key={recipe.id} recipe={recipe} compact />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PresetCatalog() {
  const [family, setFamily] = useState<Family | "All">("All");
  const recipeId = useVst((s) => s.recipeId);
  const hint = useVst((s) => s.hint);
  const reset = useVst((s) => s.reset);
  const visible = family === "All" ? RECIPES : RECIPES.filter((recipe) => recipe.family === family);

  useEffect(() => {
    if (!recipeId) return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    document.getElementById(`recipe-${recipeId}`)?.scrollIntoView({ block: "nearest" });
  }, [recipeId]);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-3" data-catalog>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs tracking-widest text-brass uppercase">Space recipes</p>
          <h2 className="text-lg text-ivory">NoDAW Labs</h2>
        </div>
        <button
          type="button"
          onClick={reset}
          className="h-11 rounded-full border border-line px-3 text-sm text-muted transition-colors hover:text-ivory active:scale-[0.96]"
        >
          Init
        </button>
      </div>
      <p className="text-sm leading-relaxed text-pretty text-muted">{hint}</p>
      <div className="flex flex-wrap gap-2">
        {(["All", ...FAMILIES] as const).map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={family === name}
            onClick={() => setFamily(name)}
            className={cn(
              "h-11 rounded-full px-3 text-sm transition-colors active:scale-[0.96]",
              family === name ? "bg-brass text-void" : "border border-line text-muted hover:text-ivory",
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="catalog-scroll flex max-h-[70dvh] flex-col gap-2 overflow-y-auto pr-1 lg:max-h-[calc(100dvh-10rem)]">
        {visible.map((recipe) => (
          <RecipeButton key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </section>
  );
}
