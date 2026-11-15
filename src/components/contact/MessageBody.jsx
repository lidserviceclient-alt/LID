import { cn } from "../../utils/cn.js";

/**
 * Contenu d'un message : toujours rendu comme TEXTE (React échappe tout, aucun dangerouslySetInnerHTML), les retours
 * à la ligne sont conservés. Un message contenant du HTML s'affiche donc littéralement et ne s'exécute jamais.
 */
export default function MessageBody({ text, className }) {
  return (
    <div className={cn("whitespace-pre-wrap break-words rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground", className)}>
      {text || <span className="text-muted-foreground">Message vide.</span>}
    </div>
  );
}
