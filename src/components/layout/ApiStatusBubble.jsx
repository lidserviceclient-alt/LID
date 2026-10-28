import Button from "../ui/Button.jsx";
import { dismissApiStatus, useApiStatus } from "../../services/apiStatus.js";

export default function ApiStatusBubble() {
  const { unreachable, dismissed } = useApiStatus();
  if (!unreachable || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 bottom-0 z-[100] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[26rem] rounded-t-xl sm:rounded-xl border border-destructive/40 bg-card text-card-foreground shadow-lg p-4 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-sm">
          <p className="font-semibold text-destructive">Le serveur ne répond pas.</p>
          <p className="text-muted-foreground">
            Vos données ne peuvent pas être chargées pour le moment.
          </p>
          <div className="mt-3">
            <Button size="sm" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissApiStatus}
          aria-label="Fermer"
          className="text-muted-foreground hover:text-foreground text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}
