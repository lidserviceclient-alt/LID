import RefundSlaPanel from "../../components/orders/RefundSlaPanel.jsx";

/**
 * Sous-page « Remboursements » : file des remboursements à engager (retours produits et annulations),
 * avec indicateurs de délai (48 h / 14 jours). Le traitement se fait depuis le détail de la commande ou du retour.
 */
export default function ReturnRefundsPage() {
  return <RefundSlaPanel showEmpty />;
}
