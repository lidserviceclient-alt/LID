import React, { forwardRef } from "react";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

const ShippingLabel = forwardRef(({ order, customer, company }, ref) => {
  if (!order) return null;

  // Company Details
  const companyName = company?.storeName || "Life Distribution";
  const companyAddress = company?.city || "none";
  const companyPhone = company?.contactPhone || "+225 07 ** *** ***";
  const companyCountry = "Côte d'Ivoire";

  const orderId = order.orderNumber || order.orderId || order.id || "INV-2026-XXXXX";
  // Use created date or scanned date or current date
  const rawDate = order.scannedAt || order.createdAt || new Date();
  const date = new Date(rawDate).toLocaleDateString("fr-FR");
  
  const shippingAddress = order.shippingAddress || "Adresse inconnue";
  
  // Try to parse shipping address if it's a string containing multiple parts
  const addressParts = shippingAddress.split(",").map(s => s.trim());
  const addressLine1 = addressParts[0] || "";
  const addressLine2 = addressParts[1] || "";
  const city = addressParts[2] || "Abidjan";
  const country = addressParts[3] || "Côte d'Ivoire";

  const customerName = customer?.name || order.customerName || "CLIENT";
  const customerPhone = customer?.phone || order.phone || "+225 05 00 00 00 00";
  const trackingNumber = order.trackingId || `LD${orderId.replace(/[^0-9]/g, "").slice(0, 10)}CI`;
  const weight = order.weight || "1.2 kg"; 
  const service = order.carrier || "Standard";

  // Function to increment tracking number for display
  const getIncrementedTracking = (tn) => {
    // Extract numeric part
    const match = tn.match(/(\d+)/);
    if (match) {
      const numStr = match[0];
      const num = parseInt(numStr, 10);
      const nextNum = num + 1;
      // Replace only the last occurrence of the number to be safe
      const lastIndex = tn.lastIndexOf(numStr);
      if (lastIndex !== -1) {
         return tn.substring(0, lastIndex) + nextNum + tn.substring(lastIndex + numStr.length);
      }
    }
    return tn + "1"; // Fallback
  };

  const incrementedTracking = getIncrementedTracking(trackingNumber);

  const qrValue = order.handoffCode || order.qrValue || order.qr || `SHIP:${order.id || order.shipmentId || orderId}`;

  return (
    <div ref={ref} className="bg-white p-0 m-0 w-[384px] h-[576px] font-sans text-black relative print:w-full print:h-full overflow-hidden">
      {/* BORDER CONTAINER */}
      <div className="border-2 border-black h-full flex flex-col relative">
        
        {/* TOP SECTION: DESTINATAIRE (70%) + EXPEDITEUR (30%) */}
        <div className="flex border-b border-black h-[180px]">
        {/* DESTINATAIRE */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <p className="text-sm font-semibold mb-1">{customerName}</p>
          <p className="text-lg font-bold leading-tight mb-1">{addressLine1}</p>
          {addressLine2 && <p className="text-sm mb-1">{addressLine2}</p>}
          <p className="text-2xl font-bold mt-2 uppercase">{city}</p>
          <p className="text-sm font-semibold mt-1">{country}</p>
          <p className="text-xs mt-2">Tel: {customerPhone}</p>
        </div>

        {/* EXPEDITEUR (VERTICAL STRIP) */}
        <div className="w-[85px] border-l border-black flex flex-col justify-between bg-white relative">
           {/* LOGO AREA */}
           <div className="h-[60px] flex items-center justify-center border-b border-black p-1">
             <div className="text-center leading-none">
               <div className="w-12 h-12">
                <img src="/imgs/favicon-3D.png" alt="LID Delivery" className="w-full h-full object-contain" />
               </div>
             </div>
           </div>
           
           {/* SENDER INFO ROTATED OR STACKED */}
           <div className="flex-1 p-2 text-[7px] leading-tight flex flex-col overflow-hidden">
             <p className="font-bold uppercase mb-1 border-b border-gray-300 pb-1">Expéditeur</p>
             <p className="font-semibold truncate">{companyName}</p>
             <p className="truncate">{companyAddress}</p>
             <p className="truncate">{companyCountry}</p>
             <p className="mt-1 truncate">{companyPhone}</p>
             
             <div className="mt-auto pt-2 border-t border-gray-300">
               <p className="font-bold uppercase mb-0.5">Compte</p>
               <p className="font-mono text-[9px]">856575</p>
             </div>
           </div>
           
           {/* VERTICAL REF (Like Colissimo) */}
           <div className="absolute right-0 top-[60px] bottom-0 w-[12px] flex items-center justify-center">
              <span className="text-[6px] transform rotate-90 whitespace-nowrap origin-center text-gray-400">Réf desti : {orderId}</span>
           </div>
        </div>
      </div>

      {/* MIDDLE SECTION: INFO COLIS + QR */}
      <div className="flex border-b border-black h-[150px]">
        {/* INFO GAUCHE */}
        <div className="flex-1 flex flex-col text-[9px] p-2 relative">
           <div className="mb-1">
             <span className="font-bold">Num colis : </span>
             <span className="font-bold font-mono text-sm tracking-wide">{trackingNumber}</span>
           </div>
           <p className="mb-0.5"><span className="text-gray-600">Site dépôt :</span> {shippingAddress}</p>
           <p className="mb-0.5"><span className="text-gray-600">Téléphone :</span> {customerPhone}</p>
           <p className="mb-0.5"><span className="text-gray-600">Code porte :</span> / <span className="text-gray-600">Interphone :</span></p>
           <p className="mb-0.5"><span className="text-gray-600">Instructions :</span> Colis remis en main propre.</p>
           <p className="mt-auto font-bold">Réf client : <span className="font-normal">{orderId}</span></p>
        </div>

        {/* INFO DROITE (POIDS + QR) */}
        <div className="w-[160px] border-l border-black flex flex-col">
           <div className="h-[35px] border-b border-black flex">
              <div className="flex-1 border-r border-black flex flex-col justify-center items-center p-1">
                <span className="text-[7px] text-gray-500">Livraison : 1/1</span>
              </div>
              <div className="flex-1 flex flex-col justify-center items-center p-1 bg-gray-50">
                 <span className="text-[7px] font-bold uppercase">Poids</span>
                 <span className="text-[10px] font-bold">{weight}</span>
              </div>
           </div>
           <div className="flex-1 flex items-center justify-center p-1">
              <div className="bg-white p-1">
                <QRCode value={qrValue} size={100} level="L" />
              </div>
           </div>
        </div>
      </div>

      {/* SERVICE BAND (J+2 / Dom) */}
      <div className="h-[40px] border-b border-black flex">
         <div className="flex-1 flex items-center justify-center border-r border-black">
            <span className="text-2xl font-bold font-sans">J+2</span>
         </div>
         <div className="w-[100px] flex items-center justify-center bg-gray-50">
            <span className="text-2xl font-bold font-sans">{service === "Express" ? "Exp" : "Dom"}</span>
         </div>
      </div>

      {/* BOTTOM SECTION: BARCODE & ROUTING */}
      <div className="flex-1 flex flex-col p-2 justify-between relative">
        
        {/* BIG ROUTING CODE */}
        <div className="flex justify-between items-end mb-1 px-1">
           <span className="text-xl font-bold font-mono">115Y</span>
           <span className="text-xl font-mono tracking-tighter">{trackingNumber.slice(-10)}</span>
           <div className="text-right leading-none">
              <span className="block text-xs font-bold">J+2_Dom</span>
              <span className="text-[8px] text-gray-500">Service</span>
           </div>
        </div>

        {/* HUGE ROUTING TEXT */}
        <div className="text-center mb-1">
           <p className="text-xl font-bold tracking-tight font-sans">{qrValue}</p>
        </div>

        {/* SORT CODE */}
        <div className="text-center mb-2">
           <p className="text-sm font-bold text-gray-700">801-CI-54200</p>
           <p className="text-[8px] text-gray-400 font-mono mt-0.5">{new Date().toLocaleString('fr-FR')} LID_DELIVERY v2.3</p>
        </div>

        {/* BARCODE */}
        <div className="flex items-center justify-center w-full overflow-hidden">
             <Barcode 
               value={trackingNumber.replace(/[^0-9A-Z]/g, "") || "123456789"}
               width={3}
               height={65}
               displayValue={false}
               background="transparent"
               margin={0}
             />
        </div>
        
        <div className="text-center mt-0.5 border-t border-gray-300 pt-0.5">
           <p className="text-[9px] uppercase font-mono tracking-widest text-gray-600">
             {incrementedTracking}
           </p>
        </div>

      </div>

    </div>

    <style>{`
      @media print {
        @page {
          size: 4in 7in;
          margin: 0;
        }
        body {
          margin: 0;
        }
      }
    `}</style>
  </div>
);
});

export default ShippingLabel;
