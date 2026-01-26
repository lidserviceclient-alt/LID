import Card from "../components/ui/Card.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import { Table, THead, TRow, TCell } from "../components/ui/Table.jsx";
import { marketingCampaigns } from "../data/mockData.js";

export default function Marketing() {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="Marketing"
        subtitle="Gérez vos campagnes, promotions et automation."
        rightSlot={<Button>Nouvelle campagne</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
            <SectionHeader title="Vue d'ensemble" subtitle="Performance globale" />
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm text-muted-foreground">ROI Global</p>
                    <p className="text-2xl font-bold text-primary">x4.2</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30">
                    <p className="text-sm text-muted-foreground">Budget dépensé</p>
                    <p className="text-2xl font-bold text-foreground">1.2M FCFA</p>
                </div>
            </div>
        </Card>
        <Card className="space-y-4">
             <SectionHeader title="Canaux performants" subtitle="Par revenus générés" />
             <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-sm">Email Marketing</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[70%]"></div>
                        </div>
                        <span className="text-xs font-medium">70%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">SMS</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[45%]"></div>
                        </div>
                        <span className="text-xs font-medium">45%</span>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">Social Ads</span>
                    <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary w-[30%]"></div>
                        </div>
                        <span className="text-xs font-medium">30%</span>
                    </div>
                </div>
             </div>
        </Card>
      </div>

      <Card>
        <SectionHeader title="Campagnes actives" subtitle="Suivi en temps réel" />
        <Table>
          <THead>
            <TRow>
              <TCell>Nom</TCell>
              <TCell>Type</TCell>
              <TCell>Statut</TCell>
              <TCell>Envoyés</TCell>
              <TCell>Ouverture</TCell>
              <TCell>Clics</TCell>
              <TCell>Revenus</TCell>
            </TRow>
          </THead>
          <tbody>
            {marketingCampaigns.map((campaign) => (
              <TRow key={campaign.id}>
                <TCell className="font-medium">{campaign.name}</TCell>
                <TCell>{campaign.type}</TCell>
                <TCell><Badge label={campaign.status} variant={campaign.status === 'Active' ? 'success' : 'neutral'} /></TCell>
                <TCell>{campaign.sent}</TCell>
                <TCell>{campaign.openRate}</TCell>
                <TCell>{campaign.clickRate}</TCell>
                <TCell className="font-semibold">{campaign.revenue}</TCell>
              </TRow>
            ))}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
