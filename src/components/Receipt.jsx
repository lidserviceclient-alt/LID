import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download } from 'lucide-react';
import { money, toNumber } from "@/utils/partnerOrders";

export default function Receipt({ order }) {
  const receiptRef = useRef(null);

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-100 flex justify-center items-center p-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
          <p className="text-red-500 font-medium">Erreur: Aucune commande trouvée.</p>
        </div>
      </div>
    );
  }

  const {
    id,
    customer,
    date,
    time,
    items: rawItems,
    tax,
    shipping,
    paymentMethod,
    paymentStatus,
    transactionId,
    store,
    register,
    totalLabel = "TOTAL",
    netAmount,
    settlementLabel,
    qrValue,
    qrCaption,
    shipmentCodes,
  } = order;

  // Lignes : quantités / prix numériques sûrs (jamais « x NaN »).
  const items = (Array.isArray(rawItems) ? rawItems : []).map((item) => {
    const qty = toNumber(item?.qty ?? item?.quantity) ?? 0;
    const price = toNumber(item?.price ?? item?.unitPrice) ?? 0;
    const lineTotal = toNumber(item?.lineTotal) ?? price * qty;
    return { ...item, qty, price, lineTotal };
  });
  const itemsSum = items.reduce((acc, item) => acc + item.lineTotal, 0);
  const subtotal = toNumber(order.subtotal) ?? itemsSum;
  const taxAmount = toNumber(tax) ?? 0;
  const shippingAmount = toNumber(shipping) ?? 0;
  const total = toNumber(order.total) ?? subtotal + shippingAmount + taxAmount;
  const net = toNumber(netAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 font-mono">
      {/* Actions Bar - Hidden on Print */}
      <div className="flex gap-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Printer size={18} /> Imprimer
        </button>
        <button className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
          <Download size={18} /> PDF
        </button>
      </div>

      {/* Receipt Container */}
      <style>{`
        @media print {
          @page {
            size: 4in 9in;
          }
        }
      `}</style>
      <div ref={receiptRef} className="w-full max-w-[4in] bg-white shadow-xl print:shadow-none">
        {/* Zigzag Top */}
        <div className="relative h-4 bg-white overflow-hidden print:hidden">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: 'linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)',
            backgroundSize: '16px 32px',
            backgroundPosition: '0 -16px'
          }}></div>
        </div>

        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <img src="/imgs/lid-green.png" alt="LID MARKET" className="h-12 object-contain grayscale opacity-90" />
            </div>
            
            <div className="space-y-1">
              
              {store && (
                <div className="text-xs text-gray-500 space-y-0.5">
                  <p>{store.address}</p>
                  <p>{store.phone} • {store.email}</p>
                  <p>{store.website}</p>
                </div>
              )}
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-200"></div>

          {/* Order Details */}
          <div className="flex justify-between text-xs text-gray-600">
            <div className="space-y-1">
              <p>DATE: {date || "—"}</p>
              <p>HEURE: {time || new Date().toLocaleTimeString()}</p>
            </div>
            <div className="space-y-1 text-right">
              <p>N° : {id}</p>
              {register ? <p>CAISSE: {register}</p> : null}
            </div>
          </div>

          {/* Customer */}
          {customer && typeof customer === 'object' && (
            <div className="text-xs text-gray-600 border-b border-gray-100 pb-4">
              <p className="font-bold mb-1">CLIENT:</p>
              <p>{customer.name}</p>
              <p>{customer.phone}</p>
              <p>{customer.address}</p>
            </div>
          )}

          {/* Items Table */}
          <div>
            <div className="flex text-xs font-bold border-b-2 border-black pb-2 mb-2">
              <div className="flex-1">DESIGNATION</div>
              <div className="w-12 text-center">QTE</div>
              <div className="w-20 text-right">PRIX</div>
            </div>
            
            <div className="space-y-3">
              {items.length === 0 ? <p className="text-xs text-gray-500">Détail des articles indisponible.</p> : null}
              {items.map((item, index) => (
                <div key={index} className="text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <p className="font-medium uppercase">{item.name}</p>
                      {item.variant && <p className="text-xs text-gray-500 italic">{item.variant}</p>}
                    </div>
                    <div className="w-12 text-center text-gray-600">x{item.qty}</div>
                    <div className="w-20 text-right font-medium">
                      {item.lineTotal.toLocaleString("fr-FR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-200"></div>

          {/* Financials */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Sous-total</span>
              <span>{money(subtotal)}</span>
            </div>
            {shippingAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span>{money(shippingAmount)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>TVA</span>
                <span>{money(taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-black mt-2">
              <span>{totalLabel}</span>
              <span>{money(total)}</span>
            </div>
            {net !== null && (
              <div className="flex justify-between font-semibold text-base pt-1">
                <span>À percevoir (net après commission, frais et livraison)</span>
                <span>{money(net)}</span>
              </div>
            )}
            {settlementLabel ? <p className="text-right text-xs text-gray-500">Règlement : {settlementLabel}</p> : null}
          </div>

          {/* Payment */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs space-y-1">
            {paymentMethod ? (
              <div className="flex justify-between">
                <span className="text-gray-500">Mode de paiement:</span>
                <span className="font-medium uppercase">{paymentMethod || "—"}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span className="text-gray-500">Statut:</span>
              <span className="font-medium uppercase">{paymentStatus || "PAYÉ"}</span>
            </div>
            {transactionId && (
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-mono">{transactionId}</span>
              </div>
            )}
          </div>

          {/* Footer - QR Code */}
          <div className="flex flex-col items-center space-y-4 pt-4">
            <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG
                value={qrValue || `LID-RECEIPT-${id}`}
                size={120}
                level={"H"}
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
               
              />
            </div>
            {qrCaption ? <p className="text-center font-mono text-sm font-bold tracking-widest">{qrCaption}</p> : null}
            {Array.isArray(shipmentCodes) && shipmentCodes.length > 0 ? (
              <ul className="text-center text-xs text-gray-600">
                {shipmentCodes.map((c) => <li key={c}>Colis : <span className="font-mono font-bold">{c}</span></li>)}
              </ul>
            ) : null}
            <div className="text-center space-y-1 text-xs text-gray-500">
              <p className="font-medium text-black">MERCI DE VOTRE VISITE !</p>
              <p>Conservez ce ticket pour tout échange</p>
              <p>Généré le {new Date().toLocaleDateString()} à {new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Zigzag Bottom */}
        <div className="relative h-4 bg-white overflow-hidden print:hidden transform rotate-180">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            background: 'linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)',
            backgroundSize: '16px 32px',
            backgroundPosition: '0 -16px'
          }}></div>
        </div>
      </div>
    </div>
     
  );
}