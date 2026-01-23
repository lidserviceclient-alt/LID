export default function Orders() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Commandes récentes</h2>
      <div className="bg-white rounded-[24px] border border-neutral-100 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-100">
            <tr>
              <th className="px-6 py-4 font-bold text-neutral-500">ID</th>
              <th className="px-6 py-4 font-bold text-neutral-500">Client</th>
              <th className="px-6 py-4 font-bold text-neutral-500">Date</th>
              <th className="px-6 py-4 font-bold text-neutral-500">Montant</th>
              <th className="px-6 py-4 font-bold text-neutral-500">Statut</th>
              <th className="px-6 py-4 font-bold text-neutral-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-neutral-50 transition">
                <td className="px-6 py-4 font-bold">#CMD-{1000 + i}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-neutral-200" />
                    <span className="font-semibold">Jean Dupont</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-neutral-500">12 Jan 2024</td>
                <td className="px-6 py-4 font-bold">45.000 FCFA</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">Payé</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-neutral-400 hover:text-neutral-900 font-bold">Détails</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
