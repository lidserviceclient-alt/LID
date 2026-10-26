import Card from "../../../components/ui/Card.jsx";
import { cn } from "../../../utils/cn.js";

/**
 * Carte d'un bloc de paramètres : titre, aide courte, actions (Actualiser, Ajouter…) et contenu.
 */
export default function SettingsCard({ title, description, actions, children, className }) {
  return (
    <Card className={cn("space-y-4 p-4 sm:p-5", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}
