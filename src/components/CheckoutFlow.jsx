import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, CreditCard, Smartphone, User, MapPin,
  Phone, Mail, ArrowRight, ShieldCheck, Lock,
  ChevronLeft, Loader2, LocateFixed
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────── */
const fmt4 = v => v.replace(/\s+/g,'').replace(/[^0-9]/gi,'').match(/.{1,4}/g)?.join(' ') ?? v;
const fmtExp = v =>
  v.replace(/[^0-9]/g,'')
   .replace(/^([2-9])$/,'0$1')
   .replace(/^(1)([3-9])$/,'0$1/$2')
   .replace(/^0{1,}/,'0')
   .replace(/^([0-1][0-9])([0-9]{1,2}).*/,'$1/$2');
const fmtMoney = v => {
  const n = Number(v);
  if (!Number.isFinite(n)) return '0';
  const dec = Math.abs(n - Math.trunc(n)) > 0.000001;
  return n.toLocaleString('fr-FR', { minimumFractionDigits: dec?2:0, maximumFractionDigits: dec?2:0 });
};
const normExp = v => {
  const s = `${v||''}`.trim();
  if (!s) return 'MM/YY';
  if (s.includes('/')) return s;
  if (s.length >= 4) return `${s.slice(0,2)}/${s.slice(2,4)}`;
  return s;
};
const fmtExpLong = v => {
  const m = normExp(v).match(/^(\d{2})\/(\d{2})$/);
  return m ? `${m[1]}/20${m[2]}` : normExp(v);
};

/* ─── Card Visual ───────────────────────────────────────────── */
function CardFace({ number, name, expiry, cvc, flipped }) {
  const num = `${number||''}`.replace(/\D/g,'');
  const disp = num ? fmt4(num) : '4242 4242 4242 4242';
  const raw = `${cvc||''}`.replace(/\D/g,'').padEnd(3,'•').slice(0,3);

  return (
    <div style={{ perspective: 1200, width: '100%', maxWidth: 380, margin: '0 auto' }}>
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4,0.2,0.2,1] }}
        style={{ transformStyle: 'preserve-3d', position: 'relative', aspectRatio: '1.586', width: '100%' }}
      >
        {/* FRONT */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          borderRadius: 20, overflow: 'hidden',
          background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #0f0f0f 100%)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5)',
        }}>
          {/* grid lines */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.06 }} viewBox="0 0 400 252">
            {Array.from({length:20}).map((_,i)=><line key={i} x1={i*22} y1="0" x2={i*22} y2="252" stroke="#fff" strokeWidth="0.5"/>)}
            {Array.from({length:12}).map((_,i)=><line key={i} x1="0" y1={i*22} x2="400" y2={i*22} stroke="#fff" strokeWidth="0.5"/>)}
          </svg>
          {/* glow */}
          <div style={{ position:'absolute', top:-60, right:-40, width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }}/>
          {/* chip */}
          <div style={{ position:'absolute', top:28, left:28 }}>
            <svg width="46" height="36" viewBox="0 0 46 36" fill="none">
              <rect width="46" height="36" rx="5" fill="#c9a227"/>
              <rect x="1" y="1" width="44" height="34" rx="4" stroke="rgba(255,220,80,0.4)" strokeWidth="0.5"/>
              {[13,23].map(x=><line key={x} x1={x} y1="0" x2={x} y2="36" stroke="rgba(0,0,0,0.3)" strokeWidth="0.7"/>)}
              {[12,24].map(y=><line key={y} x1="0" y1={y} x2="46" y2={y} stroke="rgba(0,0,0,0.3)" strokeWidth="0.7"/>)}
              <rect x="13" y="12" width="20" height="12" fill="rgba(0,0,0,0.15)"/>
            </svg>
          </div>
          {/* number */}
          <div style={{
            position:'absolute', top:'50%', left:28, transform:'translateY(-50%)',
            fontFamily:'monospace', fontSize:19, fontWeight:700, letterSpacing:'0.15em',
            color:'rgba(255,255,255,0.92)', textShadow:'0 2px 8px rgba(0,0,0,0.5)',
          }}>
            {disp.replace(/ /g,'\u2007\u2007')}
          </div>
          {/* bottom row */}
          <div style={{ position:'absolute', bottom:24, left:28, right:28, display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
            <div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:6 }}>
                <span style={{ color:'rgba(255,255,255,0.3)', fontSize:7, textTransform:'uppercase', letterSpacing:'0.12em', lineHeight:1.5 }}>VALID<br/>THRU</span>
                <span style={{ color:'rgba(255,255,255,0.85)', fontFamily:'monospace', fontSize:13, fontWeight:700, letterSpacing:'0.12em' }}>{fmtExpLong(expiry)||'11/2027'}</span>
              </div>
              <div style={{ color:'rgba(255,255,255,0.8)', fontFamily:'monospace', fontSize:12, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase' }}>
                {`${name||'VOTRE NOM'}`.toUpperCase().slice(0,22)}
              </div>
            </div>
            {/* visa-style */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 }}>
              <div style={{ display:'flex' }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(218,35,35,0.88)', marginRight:-10, zIndex:1, boxShadow:'0 2px 8px rgba(0,0,0,0.5)' }}/>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'rgba(232,155,22,0.88)', boxShadow:'0 2px 8px rgba(0,0,0,0.5)' }}/>
              </div>
              <span style={{ color:'#fff', fontSize:8, fontWeight:700, letterSpacing:'0.04em' }}>mastercard</span>
            </div>
          </div>
          {/* shine */}
          <div style={{ position:'absolute', inset:0, borderRadius:20, background:'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 60%)', pointerEvents:'none' }}/>
        </div>

        {/* BACK */}
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          borderRadius:20, overflow:'hidden', transform:'rotateY(180deg)',
          background:'linear-gradient(135deg, #0f0f0f, #1a1a2e)',
          boxShadow:'0 32px 64px rgba(0,0,0,0.5)',
        }}>
          <div style={{ position:'absolute', top:40, left:0, right:0, height:48, background:'#000' }}/>
          <div style={{ position:'absolute', top:108, left:24, right:24, display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ flex:1, height:40, background:'repeating-linear-gradient(90deg,#e8e0d0 0,#e8e0d0 8px,#d4ccc0 8px,#d4ccc0 16px)', borderRadius:4, display:'flex', alignItems:'center', paddingLeft:12 }}>
              <span style={{ fontFamily:'cursive', fontSize:14, color:'#555', opacity:0.6 }}>{`${name||''}`.toUpperCase().slice(0,20)}</span>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:8, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', marginBottom:2 }}>CVV</div>
              <div style={{ width:54, height:40, background:'#fff', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:15, fontWeight:700, color:'#111', letterSpacing:3 }}>{raw}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Step Indicator ────────────────────────────────────────── */
function Steps({ current }) {
  const steps = ['Livraison', 'Paiement', 'Confirmation'];
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0 }}>
      {steps.map((s, i) => {
        const done = i < current - 1;
        const active = i === current - 1;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
              <motion.div
                animate={{ background: done ? '#6366f1' : active ? '#fff' : 'transparent', borderColor: done||active ? '#6366f1' : 'rgba(255,255,255,0.15)' }}
                style={{ width:28, height:28, borderRadius:'50%', border:'2px solid', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color: active ? '#0f0f0f' : done ? '#fff' : 'rgba(255,255,255,0.3)' }}
              >
                {done ? <Check size={12} strokeWidth={3}/> : i+1}
              </motion.div>
              <span style={{ fontSize:10, fontWeight:600, letterSpacing:'0.08em', color: active ? '#fff' : done ? '#6366f1' : 'rgba(255,255,255,0.3)', textTransform:'uppercase' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:60, height:1, background: done ? '#6366f1' : 'rgba(255,255,255,0.1)', margin:'0 8px', marginBottom:18 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Input ─────────────────────────────────────────────────── */
function Field({ label, icon: Icon, ...props }) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:8 }}>{label}</label>
      <div style={{ position:'relative' }}>
        {Icon && <Icon size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color: focus ? '#6366f1' : 'rgba(255,255,255,0.25)', transition:'color 0.2s' }}/>}
        <input
          {...props}
          onFocus={e => { setFocus(true); props.onFocus?.(e); }}
          onBlur={e => { setFocus(false); props.onBlur?.(e); }}
          style={{
            width:'100%', boxSizing:'border-box',
            background: focus ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${focus ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius:12, paddingLeft: Icon ? 42 : 16, paddingRight:16, paddingTop:13, paddingBottom:13,
            fontSize:14, fontWeight:600, color:'#fff', outline:'none',
            transition:'all 0.2s', fontFamily:'inherit',
            ...(props.readOnly ? { opacity:0.45, cursor:'not-allowed' } : {}),
          }}
        />
      </div>
    </div>
  );
}

/* ─── Summary Line ──────────────────────────────────────────── */
function SumLine({ label, value, accent, small }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ fontSize: small?11:13, color: accent ? '#4ade80' : 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ fontSize: small?11:13, fontWeight:700, color: accent ? '#4ade80' : 'rgba(255,255,255,0.75)' }}>{value}</span>
    </div>
  );
}

/* ─── Main Export ───────────────────────────────────────────── */
export default function CheckoutFlow({
  isOpen, onClose, product, selectedColor: _selectedColor, selectedSize: _selectedSize, quantity,
  cartItems, onSuccess, shippingCost = 0, discountAmount = 0,
  loyaltyDiscountAmount = 0, loyaltyTier = '', promoCode: _promoCode = '',
  shippingMethodLabel = 'Standard'
}) {
  const [step, setStep] = useState(1);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [cardFocus, setCardFocus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [_done, setDone] = useState(false);
  const [orderNumber] = useState(() => Math.random().toString(36).slice(2,10).toUpperCase());

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '',
    method: 'card',
    cardNumber: '', cardExpiry: '', cardCvc: '', cardName: '',
    mobilePhone: '',
  });

  const isCart = cartItems && cartItems.length > 0;
  const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  const ship = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
  const disc = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const ldisc = Number.isFinite(Number(loyaltyDiscountAmount)) ? Number(loyaltyDiscountAmount) : 0;

  const itemsTotal = isCart
    ? cartItems.reduce((a, i) => a + (Number(i?.price)||0)*(Number(i?.quantity)||1), 0)
    : (Number(product?.price)||0) * qty;
  const total = Math.max(0, itemsTotal + ship - disc - ldisc);
  const tax = Math.round(total - total / 1.18);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const upd = e => {
    const { name, value } = e.target;
    let v = value;
    if (name === 'cardNumber') v = fmt4(value);
    if (name === 'cardExpiry') v = fmtExp(value);
    if (name === 'cardCvc') v = value.replace(/\D/g,'').slice(0,3);
    setForm(p => ({ ...p, [name]: v }));
  };

  const handleStep1 = e => { e.preventDefault(); setStep(2); };
  const handlePay = async e => {
    e.preventDefault();
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2200));
    setProcessing(false);
    setDone(true);
    setStep(3);
    onSuccess?.();
  };

  if (!isOpen) return null;

  const isCvcFocused = cardFocus === 'cvc';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position:'fixed', inset:0, zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center' }}
        >
          {/* backdrop */}
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            onClick={onClose}
            style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(12px)' }}
          />

          {/* panel */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type:'spring', damping:32, stiffness:280 }}
            style={{
              position:'relative', width:'100%', maxWidth:960,
              maxHeight:'94vh', borderRadius:'24px 24px 0 0',
              background:'#0a0a0f',
              border:'1px solid rgba(255,255,255,0.08)',
              borderBottom:'none',
              display:'flex', flexDirection:'column',
              overflow:'hidden',
              fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif",
            }}
          >
            {/* ambient glow */}
            <div style={{ position:'absolute', top:-120, left:'50%', transform:'translateX(-50%)', width:600, height:300, background:'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents:'none' }}/>

            {/* header */}
            <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Lock size={16} color="#fff"/>
                </div>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>Paiement sécurisé</div>
                  <div style={{ fontSize:17, fontWeight:700, color:'#fff', marginTop:1 }}>
                    {step===1?'Livraison':step===2?'Paiement':'Confirmation'}
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <Steps current={step}/>
                <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'rgba(255,255,255,0.6)' }}>
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* body */}
            <div style={{ display:'flex', flex:1, overflow:'hidden', minHeight:0 }}>

              {/* ── LEFT ── */}
              <div style={{ flex:1, overflowY:'auto', padding:28 }}>

                <AnimatePresence mode="wait">

                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.form key="s1" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} onSubmit={handleStep1}>
                      <div style={{ marginBottom:24 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6366f1', marginBottom:6 }}>01 / Livraison</div>
                        <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', margin:0 }}>Où livrer ?</h2>
                      </div>

                      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.35)' }}>
                          <User size={12}/> Compte
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                          <Field label="Prénom" name="firstName" value={form.firstName} onChange={upd} readOnly placeholder="Jean"/>
                          <Field label="Nom" name="lastName" value={form.lastName} onChange={upd} readOnly placeholder="Dupont"/>
                        </div>
                        <Field label="Email" icon={Mail} name="email" type="email" value={form.email} onChange={upd} readOnly placeholder="jean@exemple.fr"/>
                      </div>

                      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, marginBottom:24 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.35)' }}>
                          <MapPin size={12}/> Adresse
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <Field label="Téléphone" icon={Phone} name="phone" type="tel" value={form.phone} onChange={upd} placeholder="+225 07 00 00 00 00" required/>
                        </div>
                        <div style={{ marginBottom:12 }}>
                          <Field label="Adresse" name="address" value={form.address} onChange={upd} placeholder="Numéro et rue" required/>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                          <Field label="Ville" name="city" value={form.city} onChange={upd} placeholder="Abidjan" required/>
                          <Field label="Code postal" name="zip" value={form.zip} onChange={upd} placeholder="00000" required/>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                        type="submit"
                        style={{
                          width:'100%', padding:'15px 24px',
                          background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          border:'none', borderRadius:14, cursor:'pointer',
                          fontSize:14, fontWeight:700, color:'#fff',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          letterSpacing:'0.02em',
                        }}
                      >
                        Continuer vers le paiement <ArrowRight size={16}/>
                      </motion.button>
                    </motion.form>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.form key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} onSubmit={handlePay}>
                      <div style={{ marginBottom:24 }}>
                        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#6366f1', marginBottom:6 }}>02 / Paiement</div>
                        <h2 style={{ fontSize:26, fontWeight:800, color:'#fff', margin:0 }}>Comment payer ?</h2>
                      </div>

                      {/* method toggle */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:20 }}>
                        {[{id:'card', icon:CreditCard, label:'Carte', sub:'Visa, Mastercard'},{id:'mobile', icon:Smartphone, label:'Mobile Money', sub:'Orange, MTN, Wave'}].map(m => (
                          <motion.button
                            key={m.id} type="button"
                            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
                            onClick={() => setForm(p=>({...p, method:m.id}))}
                            style={{
                              padding:'14px 16px', borderRadius:14, cursor:'pointer', textAlign:'left',
                              background: form.method===m.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${form.method===m.id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.07)'}`,
                              transition:'all 0.2s',
                            }}
                          >
                            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                              <div style={{ width:36, height:36, borderRadius:10, background: form.method===m.id ? '#6366f1' : 'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s' }}>
                                <m.icon size={16} color={form.method===m.id?'#fff':'rgba(255,255,255,0.4)'}/>
                              </div>
                              <div>
                                <div style={{ fontSize:13, fontWeight:700, color:'#fff' }}>{m.label}</div>
                                <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{m.sub}</div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>

                      {form.method === 'card' ? (
                        <>
                          {/* card preview */}
                          <div style={{ marginBottom:20 }}
                            onClick={() => setCardFlipped(f => !f)}
                          >
                            <CardFace
                              number={form.cardNumber} name={form.cardName}
                              expiry={form.cardExpiry} cvc={form.cardCvc}
                              flipped={cardFlipped || isCvcFocused}
                            />
                            <p style={{ textAlign:'center', fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:8 }}>Cliquer pour retourner la carte</p>
                          </div>

                          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
                            <Field label="Numéro de carte" icon={CreditCard}
                              name="cardNumber" value={form.cardNumber} onChange={upd}
                              maxLength={19} placeholder="0000 0000 0000 0000"
                              onFocus={()=>setCardFocus('number')} required
                            />
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              <Field label="Expiration" name="cardExpiry" value={form.cardExpiry} onChange={upd}
                                maxLength={5} placeholder="MM/YY" onFocus={()=>setCardFocus('expiry')} required
                              />
                              <Field label="CVC" icon={Lock} name="cardCvc" value={form.cardCvc} onChange={upd}
                                maxLength={3} placeholder="123" onFocus={()=>setCardFocus('cvc')} required
                              />
                            </div>
                            <Field label="Nom sur la carte" name="cardName" value={form.cardName} onChange={upd}
                              placeholder="JEAN DUPONT" onFocus={()=>setCardFocus('name')} required
                            />
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign:'center', padding:'32px 20px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, marginBottom:24 }}>
                          <div style={{ width:52, height:52, borderRadius:16, background:'rgba(99,102,241,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                            <Smartphone size={22} color="#6366f1"/>
                          </div>
                          <div style={{ fontSize:16, fontWeight:700, color:'#fff', marginBottom:6 }}>Validation sur mobile</div>
                          <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>Tu recevras une confirmation après le paiement</div>
                          <input
                            required name="mobilePhone" type="tel"
                            value={form.mobilePhone} onChange={upd}
                            placeholder="07 00 00 00 00"
                            style={{
                              width:'100%', maxWidth:240, boxSizing:'border-box',
                              background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
                              borderRadius:12, padding:'13px 16px', fontSize:17, fontWeight:700,
                              color:'#fff', outline:'none', textAlign:'center', fontFamily:'monospace',
                            }}
                          />
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale:1.01 }} whileTap={{ scale:0.98 }}
                        type="submit" disabled={processing}
                        style={{
                          width:'100%', padding:'15px 24px',
                          background: processing ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          border:'none', borderRadius:14, cursor: processing ? 'not-allowed' : 'pointer',
                          fontSize:14, fontWeight:700, color:'#fff',
                          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                          letterSpacing:'0.02em', transition:'all 0.2s',
                        }}
                      >
                        {processing ? (
                          <><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Traitement…</>
                        ) : (
                          <><Lock size={16}/> Payer {fmtMoney(total)} FCFA</>
                        )}
                      </motion.button>
                      <button type="button" onClick={()=>setStep(1)} style={{ width:'100%', marginTop:10, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, color:'rgba(255,255,255,0.4)', fontSize:13, fontWeight:600, cursor:'pointer' }}>
                        ← Retour
                      </button>
                    </motion.form>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <motion.div key="s3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{ textAlign:'center', padding:'40px 20px' }}>
                      <motion.div
                        initial={{ scale:0 }} animate={{ scale:1 }}
                        transition={{ type:'spring', damping:15, stiffness:200, delay:0.1 }}
                        style={{ width:80, height:80, borderRadius:24, background:'rgba(74,222,128,0.12)', border:'1px solid rgba(74,222,128,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}
                      >
                        <Check size={36} color="#4ade80" strokeWidth={3}/>
                      </motion.div>
                      <h2 style={{ fontSize:28, fontWeight:800, color:'#fff', margin:'0 0 8px' }}>Commande confirmée</h2>
                      <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, marginBottom:28 }}>Un email de confirmation a été envoyé.</p>
                      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'16px 20px', display:'inline-flex', alignItems:'center', gap:12, marginBottom:32 }}>
                        <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'rgba(255,255,255,0.3)' }}>Commande</span>
                        <span style={{ fontFamily:'monospace', fontSize:15, fontWeight:800, color:'#6366f1', letterSpacing:'0.1em' }}>#{orderNumber}</span>
                      </div>
                      <motion.button
                        whileHover={{scale:1.02}} whileTap={{scale:0.98}}
                        onClick={onClose}
                        style={{ display:'block', width:'100%', maxWidth:300, margin:'0 auto', padding:'14px 24px', background:'#fff', borderRadius:14, border:'none', fontSize:14, fontWeight:700, color:'#0a0a0f', cursor:'pointer' }}
                      >
                        Continuer mes achats
                      </motion.button>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* ── RIGHT: SUMMARY ── */}
              <div style={{ width:300, borderLeft:'1px solid rgba(255,255,255,0.06)', padding:24, overflowY:'auto', flexShrink:0, background:'rgba(255,255,255,0.015)' }}>
                <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:16 }}>Récapitulatif</div>

                {/* items */}
                <div style={{ marginBottom:16 }}>
                  {isCart ? cartItems.map((item,i)=>(
                    <div key={i} style={{ display:'flex', gap:10, marginBottom:12 }}>
                      <div style={{ width:46, height:46, borderRadius:10, background:'rgba(255,255,255,0.06)', flexShrink:0, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                        {item?.image && <img src={item.image} alt="" style={{ width:'100%', height:'100%', objectFit:'contain' }}/>}
                        <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'#6366f1', fontSize:9, fontWeight:800, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{item?.quantity}</div>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item?.name}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{fmtMoney((Number(item?.price)||0)*(Number(item?.quantity)||1))} FCFA</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ display:'flex', gap:10, marginBottom:12 }}>
                      <div style={{ width:46, height:46, borderRadius:10, background:'rgba(255,255,255,0.06)', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{product?.name||'Produit'}</div>
                        <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>×{qty} — {fmtMoney(itemsTotal)} FCFA</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:12 }}>
                  <SumLine label="Sous-total" value={`${fmtMoney(itemsTotal)} FCFA`}/>
                  <SumLine label={`Livraison (${shippingMethodLabel})`} value={ship===0?'Gratuit':`${fmtMoney(ship)} FCFA`}/>
                  {disc > 0 && <SumLine label="Réduction" value={`-${fmtMoney(disc)} FCFA`} accent/>}
                  {ldisc > 0 && <SumLine label={loyaltyTier?`VIP (${loyaltyTier})`:'VIP'} value={`-${fmtMoney(ldisc)} FCFA`} accent/>}
                  <SumLine label="Dont TVA (18%)" value={`${fmtMoney(tax)} FCFA`} small/>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:14, marginTop:4 }}>
                    <span style={{ fontSize:13, fontWeight:800, color:'#fff' }}>Total</span>
                    <span style={{ fontSize:20, fontWeight:800, color:'#fff' }}>{fmtMoney(total)} <span style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>FCFA</span></span>
                  </div>
                </div>

                {/* trust badge */}
                <div style={{ marginTop:20, padding:'12px 14px', background:'rgba(99,102,241,0.07)', border:'1px solid rgba(99,102,241,0.15)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:10 }}>
                  <ShieldCheck size={16} color="#6366f1" style={{flexShrink:0, marginTop:1}}/>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.7)', marginBottom:2 }}>Paiement sécurisé</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', lineHeight:1.5 }}>Données chiffrées 256-bit SSL</div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>

          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
