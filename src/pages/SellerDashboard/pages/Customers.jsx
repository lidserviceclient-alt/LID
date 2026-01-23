export default function Customers() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vos Clients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-[24px] bg-white border border-neutral-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className="h-14 w-14 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-bold text-neutral-400">
              JD
            </div>
            <div>
              <div className="font-bold text-lg">Jean Dupont</div>
              <div className="text-sm text-neutral-500">jean.dupont@email.com</div>
              <div className="mt-2 text-xs font-bold text-[#6aa200]">5 commandes</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
