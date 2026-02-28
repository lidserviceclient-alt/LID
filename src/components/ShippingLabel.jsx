import React, { forwardRef } from "react";
import QRCode from "react-qr-code";

import React, { forwardRef } from "react";
import QRCode from "react-qr-code";

const ShippingLabel = forwardRef(({ order, customer, company }, ref) => {
  if (!order) return null;

  // Company Details
  const companyName = company?.storeName || "Life Distribution";
  const companyAddress = company?.city || "Cocody Riviera 3, Abidjan";
  const companyPhone = company?.contactPhone || "+225 07 00 00 00 00";
  const companyCountry = "Côte d'Ivoire";

  const orderId = order.id || "INV-2026-XXXXX";
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

  // QR Code Value
  const qrValue = JSON.stringify({
    id: orderId,
    tracking: trackingNumber,
    customer: customerName,
    phone: customerPhone
  });

  return (
    <div ref={ref} className="flex items-center justify-center min-h-screen bg-gray-200 p-6 print:bg-white print:p-0 print:min-h-0">
      
      <div className="w-[400px] bg-white border border-black p-5 text-[11px] font-sans text-black leading-tight print:border-none print:shadow-none">

        {/* HEADER */}
        <div className="flex justify-between items-start border-b border-black pb-3 mb-3">
          <div>
            <h1 className="text-2xl font-bold tracking-wide">INVOICE</h1>
            <p className="text-[10px] text-gray-600">Ref: {orderId}</p>
          </div>

          <div className="text-right text-[10px]">
            <p className="font-semibold uppercase">{companyName}</p>
            <p>{companyAddress}</p>
            <p>{companyCountry}</p>
            <p>{companyPhone}</p>
          </div>
        </div>

        {/* FROM */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase text-gray-500">FROM</p>
          <div className="border border-black p-2 mt-1">
            <p className="font-semibold">{companyName}</p>
            <p>{companyAddress}</p>
            <p>{companyCountry}</p>
            <p>{companyPhone}</p>
          </div>
        </div>

        {/* TO */}
        <div className="mb-3">
          <p className="text-[10px] font-bold uppercase text-gray-500">SHIP TO</p>
          <div className="border-2 border-black p-2 mt-1">
            <p className="font-bold text-[13px] uppercase">{customerName}</p>
            <p>{addressLine1}</p>
            {addressLine2 && <p>{addressLine2}</p>}
            <p>{city}</p>
            <p>{country}</p>
            <p className="mt-1 font-semibold">Tel: {customerPhone}</p>
          </div>
        </div>

        {/* SERVICE INFO */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-[10px]">
          <div className="border border-black p-2">
            <p className="font-bold uppercase">Service</p>
            <p>{service}</p>
          </div>

          <div className="border border-black p-2">
            <p className="font-bold uppercase">Weight</p>
            <p>{weight}</p>
          </div>

          <div className="border border-black p-2">
            <p className="font-bold uppercase">Date</p>
            <p>{date}</p>
          </div>
        </div>

        {/* TRACKING NUMBER */}
        <div className="border-t-2 border-b-2 border-black py-3 mb-3 text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Tracking Number
          </p>
          <p className="text-xl font-bold tracking-[4px] mt-1">
            {trackingNumber}
          </p>
        </div>

        {/* QR CODE & ID */}
        <div className="mb-2 flex flex-col items-center justify-center">
          <div className="border-2 border-black p-2 bg-white">
            <QRCode value={qrValue} size={100} />
          </div>
          <p className="text-center text-[11px] tracking-[3px] mt-2 font-mono">
            {trackingNumber.replace(/[^0-9]/g, "").slice(0, 12) || "8473 3347 13"}
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between text-[9px] mt-4 border-t border-black pt-2">
          <p>Non contractual document</p>
          <p className="font-mono">Zone 3</p>
        </div>
      </div>

      {/* PRINT STYLE */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
});

export default ShippingLabel;
