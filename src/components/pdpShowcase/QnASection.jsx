import { useState } from "react";
import { Send } from "lucide-react";

export default function QnASection({ qna }) {
  const [openId, setOpenId] = useState(null);
  const [question, setQuestion] = useState("");

  return (
    <div>
      <h2 className="text-[24px] font-semibold leading-[32px] text-pdp-ink mb-1">Questions & Réponses</h2>
      <p className="text-sm text-pdp-gray-700 mb-4">Une question ? Demandez aux autres clients</p>

      <div className="flex items-center h-[46px] rounded-full bg-pdp-surface px-4 mb-6">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Un doute ? Parlez à la communauté"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-pdp-gray-500"
        />
        <button type="button" aria-label="Envoyer" className="w-7 h-7 rounded-full bg-pdp-gray-500/20 flex items-center justify-center">
          <Send size={14} className="text-pdp-ink" />
        </button>
      </div>

      <div className="space-y-3">
        {qna.map((q) => {
          const open = openId === q.id;
          const date = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(q.date));
          return (
            <div key={q.id} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded bg-pdp-ink text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                Q
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-pdp-ink truncate">{q.question}</p>
                <p className={`text-sm text-pdp-gray-700 mt-0.5 ${open ? "" : "truncate"}`}>{q.answer}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-pdp-gray-700">
                  <span>{date}</span>
                  <button type="button" onClick={() => setOpenId(open ? null : q.id)} className="underline">
                    Voir les réponses ({q.answersCount})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center mt-4">
        <button type="button" className="h-10 px-5 rounded border border-pdp-ink text-base font-medium text-pdp-ink">
          Toutes les questions
        </button>
      </div>
    </div>
  );
}
