import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PrintClient from "./PrintClient";

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.opticOrder.findUnique({
    where: { id },
    include: {
      customer: true,
      prescription: true,
    }
  });

  if (!order) notFound();

  const settings = await prisma.settings.findFirst({ include: { firm: true } });
  const firmName = settings?.firm?.name || "Optik Firması";
  const firmPhone = settings?.firm?.phone || "";
  const firmAddress = settings?.firm?.address || "";
  const logoUrl = "";

  let orderNo = order.printSerialNo;

  // Eğer seri numarası yoksa hemen oluştur ve kaydet
  if (!orderNo) {
    try {
      const updatedSettings = await prisma.settings.update({
        where: { id: settings?.id || "global" },
        data: { lastPrintSequence: { increment: 1 } }
      });
      orderNo = `A${updatedSettings.lastPrintSequence.toString().padStart(6, '0')}`;
      await prisma.opticOrder.update({
        where: { id: order.id },
        data: { printSerialNo: orderNo }
      });
    } catch (e) {
      console.error("Seri no oluşturma hatası:", e);
      orderNo = `A000000`; // Fallback
    }
  }

  const rx = order.prescription;

  // Formatting dates
  const orderDate = new Date(order.orderDate).toLocaleDateString("tr-TR");
  const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("tr-TR") : "";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-background min-h-screen print:bg-white print:p-0 print:m-0">
      <PrintClient orderId={order.id} orderNo={orderNo} />

      {/* PRINT AREA */}
      <div id="print-area" className="bg-white text-black shadow-sm border border-gray-200 rounded-lg mx-auto flex flex-col relative transition-all overflow-hidden print-container">
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body { background: white !important; margin: 0; padding: 0; }
            body * { visibility: hidden; }
            #print-area, #print-area * { visibility: visible; }
            #print-area { position: absolute; left: 0; top: 0; margin: 0; padding: 0; box-sizing: border-box; border: none !important; shadow: none !important; }
            nav, header, aside, .print\\:hidden { display: none !important; }
            
            /* Paper Sizes controlled via CSS variables from client */
            @page { size: var(--print-size, A4); margin: 10mm; }
          }
        `}} />

        {/* Dynamic Padding based on scale */}
        <div className="print-content p-6 sm:p-12 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 sm:pb-6 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
            ) : (
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center font-bold text-xl text-gray-400 rounded-md">
                LOGO
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wider">{firmName}</h1>
              {firmPhone && <p className="text-sm font-medium text-gray-600 mt-1">Tel: {firmPhone}</p>}
              {firmAddress && <p className="text-xs text-gray-500 mt-1 max-w-xs">{firmAddress}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-gray-800">SİPARİŞ FORMU</h2>
            <p className="text-sm font-bold text-gray-600 mt-2 bg-gray-100 px-3 py-1 rounded-md inline-block border border-gray-200">
              Seri No: <span className="text-black font-black">{orderNo}</span>
            </p>
          </div>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Müşteri Adı:</span>
            <span className="flex-1 font-medium text-sm text-black">{order.customer?.firstName || 'Bilinmeyen'} {order.customer?.lastName || 'Müşteri'}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Tarih:</span>
            <span className="flex-1 font-medium text-sm text-black">{orderDate}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Telefon:</span>
            <span className="flex-1 font-medium text-sm text-black">{order.customer?.phone || "-"}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Teslim Tarihi:</span>
            <span className="flex-1 font-medium text-sm text-black">{deliveryDate || "-"}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Adres:</span>
            <span className="flex-1 font-medium text-sm text-black truncate">{order.customer?.address || "-"}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Doktor:</span>
            <span className="flex-1 font-medium text-sm text-black">{rx?.doctorName || "-"}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Cam Tipi:</span>
            <span className="flex-1 font-medium text-sm text-black">{rx?.lensType || "-"}</span>
          </div>
          <div className="flex border-b border-gray-200 pb-1">
            <span className="w-28 font-bold text-sm text-gray-700">Hastane:</span>
            <span className="flex-1 font-medium text-sm text-black">{rx?.hospitalName || "-"}</span>
          </div>
        </div>

        {/* Prescription Table */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-900 bg-gray-200 px-4 py-2 uppercase border border-gray-800 border-b-0">
            Gözlük Bilgileri (Reçete)
          </h3>
          <table className="w-full border-collapse border border-gray-800 text-sm text-center">
            <thead>
              <tr className="bg-gray-100 font-bold border-b border-gray-800">
                <th className="border-r border-gray-800 py-2 w-1/4">GÖZ</th>
                <th className="border-r border-gray-800 py-2">SPH</th>
                <th className="border-r border-gray-800 py-2">CYL</th>
                <th className="border-r border-gray-800 py-2">AX</th>
                <th className="py-2">PD</th>
              </tr>
            </thead>
            <tbody>
              {/* UZAK */}
              <tr className="border-b border-gray-300">
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">UZAK SAĞ (R)</td>
                <td className="border-r border-gray-800 py-2">{rx?.farRightSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.farRightCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.farRightAx || ""}</td>
                <td className="py-2">{rx?.pdRight || ""}</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">UZAK SOL (L)</td>
                <td className="border-r border-gray-800 py-2">{rx?.farLeftSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.farLeftCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.farLeftAx || ""}</td>
                <td className="py-2">{rx?.pdLeft || ""}</td>
              </tr>
              {/* YAKIN */}
              <tr className="border-b border-gray-300">
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">YAKIN SAĞ (R)</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearRightSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearRightCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearRightAx || ""}</td>
                <td className="py-2 bg-gray-50 border-t border-gray-800 border-l border-b-0 row-span-2 flex flex-col items-center justify-center">
                   <span className="text-[10px] text-gray-500 mb-1">Total PD</span>
                   <span className="font-bold">{rx?.pdTotal || ""}</span>
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">YAKIN SOL (L)</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearLeftSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearLeftCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.nearLeftAx || ""}</td>
              </tr>
              {/* DAİMİ */}
              <tr className="border-b border-gray-300">
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">DAİMİ SAĞ (R)</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantRightSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantRightCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantRightAx || ""}</td>
                <td className="py-2 bg-white"></td>
              </tr>
              <tr>
                <td className="border-r border-gray-800 py-2 font-bold text-xs bg-gray-50 text-left px-4">DAİMİ SOL (L)</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantLeftSph || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantLeftCyl || ""}</td>
                <td className="border-r border-gray-800 py-2">{rx?.constantLeftAx || ""}</td>
                <td className="py-2 bg-white"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Info & Signatures */}
        <div className="mt-auto pt-6 border-t border-gray-800 flex justify-between items-end pb-8">
          
          <div className="flex gap-16 ml-8">
            <div className="text-center w-32">
              <p className="font-bold text-sm text-gray-800 border-b border-gray-300 pb-1 mb-6">Teslim Eden</p>
              <p className="text-xs text-gray-400">İmza</p>
            </div>
            <div className="text-center w-32">
              <p className="font-bold text-sm text-gray-800 border-b border-gray-300 pb-1 mb-6">Teslim Alan</p>
              <p className="text-xs text-gray-400">İmza</p>
            </div>
          </div>

          <div className="border-2 border-gray-800 rounded-lg p-4 w-64 bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
              <span className="font-bold text-sm text-gray-700">Tutar:</span>
              <span className="font-bold text-sm">{order.totalPrice?.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-300 pb-2 mb-2">
              <span className="font-bold text-sm text-gray-700">Kapora:</span>
              <span className="font-bold text-sm text-emerald-600">{order.deposit?.toLocaleString('tr-TR')} ₺</span>
            </div>
            <div className="flex justify-between items-center bg-gray-200 -mx-4 -mb-4 p-4 rounded-b-md mt-2">
              <span className="font-black text-sm text-gray-900">BAKİYE:</span>
              <span className="font-black text-lg text-rose-600">{order.balance?.toLocaleString('tr-TR')} ₺</span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
