import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";

export default function Placeholder({ title, subtitle, actions }) {
  return (
    <div className="space-y-6">
      <SectionHeader title={title} subtitle={subtitle} rightSlot={actions} />
      <Card className="grid place-items-center text-center py-20 border-dashed">
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mx-auto text-2xl font-bold shadow-sm ring-1 ring-primary/10">
            {title.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">Module en attente</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ce module est en cours de configuration. Ajoutez vos premières données pour activer les workflows.
            </p>
          </div>
          <div className="pt-2">
            <Button>Configurer le module</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
