import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

export default function Settings() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Paramètres"
        subtitle="Gérez les profils, la sécurité et les intégrations."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <SectionHeader title="Informations boutique" subtitle="Profil public" />
          <div className="grid gap-3">
            <Input placeholder="Nom de boutique" defaultValue="LID Prime Store" />
            <Input placeholder="Email" defaultValue="contact@lid.store" />
            <Input placeholder="Ville" defaultValue="Abidjan" />
          </div>
          <Button className="w-fit">Sauvegarder</Button>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Sécurité" subtitle="Accès & rôles" />
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Authentification double facteur</p>
                <p className="text-xs text-muted-foreground">Activée pour les admins</p>
              </div>
              <Button variant="outline">Configurer</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Logs d'activité</p>
                <p className="text-xs text-muted-foreground">Dernier export il y a 2 jours</p>
              </div>
              <Button variant="outline">Exporter</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="space-y-4">
          <SectionHeader title="Équipe" subtitle="Collaborateurs" />
          <div className="space-y-3 text-sm text-muted-foreground">
            {["Awa Brou", "Boris Touré", "Mariam N'Guessan"].map((name) => (
              <div key={name} className="flex items-center justify-between">
                <span>{name}</span>
                <Button variant="outline" size="sm">Gérer</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Intégrations" subtitle="Services connectés" />
          <div className="space-y-3 text-sm text-muted-foreground">
            {["Paydunya", "Sendinblue", "Slack", "Google Analytics"].map((service) => (
              <div key={service} className="flex items-center justify-between">
                <span>{service}</span>
                <Button variant="outline" size="sm">Connecter</Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeader title="Notifications" subtitle="Préférés" />
          <div className="space-y-2 text-sm text-muted-foreground">
            {[
              "Alertes stock",
              "Paiements échoués",
              "Nouveaux clients",
              "Anomalies logistiques"
            ].map((notif) => (
              <label key={notif} className="flex items-center justify-between cursor-pointer hover:text-foreground">
                <span>{notif}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-input text-primary focus:ring-ring" />
              </label>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}