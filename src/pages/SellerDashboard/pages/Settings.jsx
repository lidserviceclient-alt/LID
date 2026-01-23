export default function Settings() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Paramètres de la boutique</h2>
        <p className="text-neutral-500">Gérez les informations de votre boutique et vos préférences.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">Nom de la boutique</label>
          <input type="text" defaultValue="Ma Super Boutique" className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400 bg-white" />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">Description</label>
          <textarea rows={4} defaultValue="Une boutique incroyable avec des produits fantastiques." className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400 bg-white" />
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-neutral-200">
          <div>
            <div className="font-bold">Mode Vacances</div>
            <div className="text-xs text-neutral-500">Désactiver temporairement vos produits</div>
          </div>
          <div className="h-6 w-11 rounded-full bg-neutral-200 relative cursor-pointer">
            <div className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-sm" />
          </div>
        </div>

        <button className="px-8 py-3 rounded-xl text-white font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-1" style={{ background: "#6aa200" }}>
          Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
