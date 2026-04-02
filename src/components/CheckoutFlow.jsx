import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Check, CreditCard, Smartphone, MapPin,
  Phone, Mail, ArrowRight, ShieldCheck, Lock,
  Loader2, Package, Truck, Star, ChevronRight
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────── */
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
  return n.toLocaleString('fr-FR',{minimumFractionDigits:dec?2:0,maximumFractionDigits:dec?2:0});
};
const fmtExpLong = v => {
  const s = `${v||''}`.trim();
  const norm = s.includes('/') ? s : s.length>=4 ? `${s.slice(0,2)}/${s.slice(2,4)}` : s;
  const m = norm.match(/^(\d{2})\/(\d{2})$/);
  return m ? `${m[1]}/20${m[2]}` : norm || 'MM/YY';
};

/* ─── Card 3D ─────────────────────────────────────────────── */
function Card3D({ number, name, expiry, cvc, focusField }) {
  const [clicked, setClicked] = useState(false);
  const flipped = clicked || focusField === 'cvc';
  const disp = number ? fmt4(number.replace(/\D/g,'')) : '•••• •••• •••• ••••';
  const raw = `${cvc||''}`.replace(/\D/g,'').padEnd(3,'•').slice(0,3);

  return (
    <div style={{perspective:1100, cursor:'pointer', userSelect:'none'}} onClick={()=>setClicked(f=>!f)}>
      <motion.div
        animate={{rotateY: flipped ? 180 : 0}}
        transition={{duration:0.65, ease:[0.4,0.2,0.2,1]}}
        style={{transformStyle:'preserve-3d', position:'relative', width:'100%', aspectRatio:'1.586'}}
      >
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          borderRadius:18, overflow:'hidden',
          background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          boxShadow:'0 20px 60px rgba(99,102,241,0.35)',
        }}>
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:0.04}} viewBox="0 0 200 126">
            {Array.from({length:14}).map((_,i)=><line key={i} x1={i*15} y1="0" x2={i*15} y2="126" stroke="#fff" strokeWidth="0.5"/>)}
            {Array.from({length:9}).map((_,i)=><line key={i} x1="0" y1={i*15} x2="200" y2={i*15} stroke="#fff" strokeWidth="0.5"/>)}
          </svg>
          <div style={{position:'absolute',top:-40,right:-20,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(167,139,250,0.4) 0%,transparent 70%)'}}/>
          <div style={{position:'absolute',top:22,left:22}}>
            <svg width="42" height="33" viewBox="0 0 42 33" fill="none">
              <rect width="42" height="33" rx="4" fill="#c9a227"/>
              <rect x="0.5" y="0.5" width="41" height="32" rx="3.5" stroke="rgba(255,220,80,0.4)" strokeWidth="0.7"/>
              {[12,21].map(x=><line key={x} x1={x} y1="0" x2={x} y2="33" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>)}
              {[11,22].map(y=><line key={y} x1="0" y1={y} x2="42" y2={y} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6"/>)}
              <rect x="12" y="11" width="18" height="11" fill="rgba(0,0,0,0.12)"/>
            </svg>
          </div>
          <div style={{position:'absolute',top:22,right:22,opacity:0.5}}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M4 11Q4 4 11 4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <path d="M7 11Q7 7 11 7" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <path d="M10 11Q10 9.5 11 9.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
              <circle cx="11" cy="11" r="1.8" fill="#fff"/>
            </svg>
          </div>
          <div style={{position:'absolute',top:'50%',left:22,transform:'translateY(-50%)',fontFamily:'monospace',fontSize:17,fontWeight:700,letterSpacing:'0.14em',color:'rgba(255,255,255,0.9)'}}>
            {disp.replace(/ /g,'\u2007')}
          </div>
          <div style={{position:'absolute',bottom:20,left:22,right:22,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
            <div>
              <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:5}}>
                <span style={{color:'rgba(255,255,255,0.3)',fontSize:7,textTransform:'uppercase',letterSpacing:'0.1em',lineHeight:1.5}}>GOOD<br/>THRU</span>
                <span style={{color:'rgba(255,255,255,0.85)',fontFamily:'monospace',fontSize:12,fontWeight:700,letterSpacing:'0.1em'}}>{fmtExpLong(expiry)}</span>
              </div>
              <div style={{color:'rgba(255,255,255,0.8)',fontFamily:'monospace',fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase'}}>
                {`${name||'VOTRE NOM'}`.toUpperCase().slice(0,22)}
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{display:'flex'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(218,35,35,0.88)',marginRight:-8,zIndex:1,boxShadow:'0 2px 6px rgba(0,0,0,0.4)'}}/>
                <div style={{width:28,height:28,borderRadius:'50%',background:'rgba(232,155,22,0.88)',boxShadow:'0 2px 6px rgba(0,0,0,0.4)'}}/>
              </div>
              <span style={{color:'rgba(255,255,255,0.7)',fontSize:7,fontWeight:700,letterSpacing:'0.04em'}}>mastercard</span>
            </div>
          </div>
          <div style={{position:'absolute',inset:0,borderRadius:18,background:'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,transparent 55%)',pointerEvents:'none'}}/>
        </div>
        <div style={{
          position:'absolute', inset:0, backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
          borderRadius:18, overflow:'hidden', transform:'rotateY(180deg)',
          background:'linear-gradient(135deg, #1e1b4b, #312e81)',
          boxShadow:'0 20px 60px rgba(99,102,241,0.35)',
        }}>
          <div style={{position:'absolute',top:38,left:0,right:0,height:42,background:'#000'}}/>
          <div style={{position:'absolute',top:98,left:20,right:20,display:'flex',alignItems:'center',gap:8}}>
            <div style={{flex:1,height:36,borderRadius:4,background:'repeating-linear-gradient(90deg,#f5f0e8 0,#f5f0e8 8px,#e2d9cb 8px,#e2d9cb 16px)',display:'flex',alignItems:'center',paddingLeft:10}}>
              <span style={{fontFamily:'cursive',fontSize:12,color:'#555',opacity:0.5}}>{`${name||''}`.toUpperCase().slice(0,16)}</span>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:7,color:'rgba(255,255,255,0.3)',letterSpacing:'0.1em',marginBottom:2}}>CVV</div>
              <div style={{width:48,height:36,background:'#fff',borderRadius:4,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <span style={{fontFamily:'monospace',fontSize:14,fontWeight:700,color:'#111',letterSpacing:3}}>{raw}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      <p style={{textAlign:'center',fontSize:10,color:'#94a3b8',marginTop:6,fontStyle:'italic'}}>Cliquer pour retourner la carte</p>
    </div>
  );
}

/* ─── Progress Rail ──────────────────────────────────────── */
function ProgressRail({ step }) {
  const steps = [
    { id:1, icon:Package, label:'Livraison', sub:'Adresse & contact' },
    { id:2, icon:CreditCard, label:'Paiement', sub:'Carte ou mobile' },
    { id:3, icon:Check, label:'Confirmation', sub:'Commande validée' },
  ];
  return (
    <div style={{display:'flex',flexDirection:'column',gap:0}}>
      {steps.map((s,i)=>{
        const done = step > s.id;
        const active = step === s.id;
        return (
          <div key={s.id} style={{display:'flex',gap:16,alignItems:'flex-start'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
              <motion.div
                animate={{
                  background: done ? '#6366f1' : active ? '#fff' : '#f1f5f9',
                  border: `2px solid ${done||active ? '#6366f1' : '#e2e8f0'}`,
                }}
                style={{width:40,height:40,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative'}}
              >
                {done
                  ? <Check size={16} color="#fff" strokeWidth={3}/>
                  : <s.icon size={16} color={active?'#6366f1':'#94a3b8'}/>
                }
                {active && (
                  <motion.div
                    animate={{scale:[1,1.3,1]}}
                    transition={{repeat:Infinity,duration:2}}
                    style={{position:'absolute',inset:-4,borderRadius:'50%',border:'2px solid rgba(99,102,241,0.2)'}}
                  />
                )}
              </motion.div>
              {i < steps.length-1 && (
                <motion.div
                  animate={{background: done ? '#6366f1' : '#e2e8f0'}}
                  style={{width:2,height:40,marginTop:4,marginBottom:4,borderRadius:2}}
                />
              )}
            </div>
            <div style={{paddingTop:8,paddingBottom: i<steps.length-1 ? 32 : 0}}>
              <div style={{fontSize:13,fontWeight:700,color: active?'#1e293b':done?'#6366f1':'#94a3b8',transition:'color 0.2s'}}>{s.label}</div>
              <div style={{fontSize:11,color:'#94a3b8',marginTop:1}}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Input Field ─────────────────────────────────────────── */
function Field({label, icon:Icon, hint, ...props}) {
  const [focus, setFocus] = useState(false);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <label style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'#64748b'}}>{label}</label>
        {hint && <span style={{fontSize:10,color:'#94a3b8'}}>{hint}</span>}
      </div>
      <div style={{position:'relative'}}>
        {Icon && <Icon size={14} style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:focus?'#6366f1':'#94a3b8',transition:'color 0.2s',pointerEvents:'none'}}/>}
        <input
          {...props}
          onFocus={e=>{setFocus(true);props.onFocus?.(e);}}
          onBlur={e=>{setFocus(false);props.onBlur?.(e);}}
          style={{
            width:'100%', boxSizing:'border-box',
            background: props.readOnly ? '#f8fafc' : '#fff',
            border:`1.5px solid ${focus ? '#6366f1' : '#e2e8f0'}`,
            borderRadius:10,
            paddingLeft: Icon ? 38 : 13, paddingRight:13,
            paddingTop:11, paddingBottom:11,
            fontSize:13, fontWeight:600,
            color: props.readOnly ? '#94a3b8' : '#1e293b',
            outline:'none', transition:'all 0.2s',
            fontFamily:'inherit',
            boxShadow: focus ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
            cursor: props.readOnly ? 'not-allowed' : 'text',
          }}
        />
      </div>
    </div>
  );
}

/* ─── Method Button ───────────────────────────────────────── */
function MethodBtn({active, icon:Icon, label, sub, onClick}) {
  return (
    <motion.button
      type="button" onClick={onClick}
      whileHover={{y:-2}} whileTap={{scale:0.98}}
      style={{
        padding:'14px 16px', borderRadius:12, cursor:'pointer', textAlign:'left', width:'100%',
        background: active ? 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))' : '#f8fafc',
        border:`1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
        transition:'all 0.2s', boxShadow: active ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none',
      }}
    >
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:38,height:38,borderRadius:10,background:active?'linear-gradient(135deg,#6366f1,#8b5cf6)':'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.2s'}}>
          <Icon size={16} color={active?'#fff':'#94a3b8'}/>
        </div>
        <div>
          <div style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{label}</div>
          <div style={{fontSize:11,color:'#94a3b8'}}>{sub}</div>
        </div>
        {active && <ChevronRight size={14} color="#6366f1" style={{marginLeft:'auto'}}/>}
      </div>
    </motion.button>
  );
}

/* ─── Main ────────────────────────────────────────────────── */
export default function CheckoutFlow({
  isOpen, onClose, product, selectedColor, selectedSize, quantity,
  cartItems, onSuccess, shippingCost=0, discountAmount=0,
  loyaltyDiscountAmount=0, loyaltyTier='', shippingMethodLabel='Standard'
}) {
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [cardFocus, setCardFocus] = useState('');
  const [orderNumber] = useState(()=>Math.random().toString(36).slice(2,10).toUpperCase());

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    address:'', city:'', zip:'',
    method:'card',
    cardNumber:'', cardExpiry:'', cardCvc:'', cardName:'',
    mobilePhone:'',
  });

  const isCart = cartItems && cartItems.length > 0;
  const qty = Number.isFinite(Number(quantity)) ? Number(quantity) : 1;
  const ship = Number.isFinite(Number(shippingCost)) ? Number(shippingCost) : 0;
  const disc = Number.isFinite(Number(discountAmount)) ? Number(discountAmount) : 0;
  const ldisc = Number.isFinite(Number(loyaltyDiscountAmount)) ? Number(loyaltyDiscountAmount) : 0;
  const itemsTotal = isCart
    ? cartItems.reduce((a,i)=>a+(Number(i?.price)||0)*(Number(i?.quantity)||1),0)
    : (Number(product?.price)||0)*qty;
  const total = Math.max(0, itemsTotal + ship - disc - ldisc);
  const tax = Math.round(total - total/1.18);

  useEffect(()=>{
    if(typeof document==='undefined') return;
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return ()=>{ document.body.style.overflow=''; };
  },[isOpen]);

  const upd = e => {
    const {name,value} = e.target;
    let v = value;
    if(name==='cardNumber') v = fmt4(value);
    if(name==='cardExpiry') v = fmtExp(value);
    if(name==='cardCvc') v = value.replace(/\D/g,'').slice(0,3);
    setForm(p=>({...p,[name]:v}));
  };

  const handleStep1 = e => { e.preventDefault(); setStep(2); };
  const handlePay = async e => {
    e.preventDefault();
    setProcessing(true);
    await new Promise(r=>setTimeout(r,2000));
    setProcessing(false);
    setStep(3);
    onSuccess?.();
  };

  if(!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{
            position:'fixed', inset:0, zIndex:300,
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:'16px',
            fontFamily:"'DM Sans','Helvetica Neue',sans-serif",
          }}
        >
          <motion.div
            initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={onClose}
            style={{position:'absolute',inset:0,background:'rgba(15,23,42,0.6)',backdropFilter:'blur(8px)'}}
          />

          <motion.div
            initial={{opacity:0, scale:0.96, y:20}}
            animate={{opacity:1, scale:1, y:0}}
            exit={{opacity:0, scale:0.96, y:20}}
            transition={{type:'spring',damping:28,stiffness:260}}
            style={{
              position:'relative', width:'100%', maxWidth:900,
              maxHeight:'92vh', borderRadius:24,
              background:'#f8fafc',
              boxShadow:'0 40px 100px rgba(15,23,42,0.25), 0 0 0 1px rgba(15,23,42,0.06)',
              display:'flex', flexDirection:'column',
              overflow:'hidden',
            }}
          >
            {/* TOP HEADER */}
            <div style={{background:'#fff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <Lock size={15} color="#fff"/>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'#94a3b8'}}>Checkout sécurisé</div>
                  <div style={{fontSize:15,fontWeight:800,color:'#1e293b',marginTop:1}}>
                    {step===1?'Informations de livraison':step===2?'Méthode de paiement':'Commande confirmée'}
                  </div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:20,padding:'5px 12px'}}>
                  <ShieldCheck size={13} color="#16a34a"/>
                  <span style={{fontSize:11,fontWeight:700,color:'#16a34a'}}>SSL 256-bit</span>
                </div>
                <button onClick={onClose} style={{width:36,height:36,borderRadius:10,background:'#f1f5f9',border:'none',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#64748b'}}>
                  <X size={16}/>
                </button>
              </div>
            </div>

            {/* BODY: 3-COL */}
            <div style={{display:'flex',flex:1,overflow:'hidden',minHeight:0}}>

              {/* LEFT: progress rail */}
              <div style={{width:220,background:'#fff',borderRight:'1px solid #e2e8f0',padding:'32px 24px',flexShrink:0,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'#94a3b8',marginBottom:24}}>Étapes</div>
                  <ProgressRail step={step}/>
                </div>
                <div style={{background:'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))',border:'1px solid rgba(99,102,241,0.12)',borderRadius:14,padding:'14px 16px'}}>
                  <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#6366f1',marginBottom:8}}>Total commande</div>
                  <div style={{fontSize:22,fontWeight:800,color:'#1e293b'}}>{fmtMoney(total)}</div>
                  <div style={{fontSize:11,color:'#94a3b8',marginTop:2}}>FCFA TTC</div>
                </div>
              </div>

              {/* CENTRE: main form */}
              <div style={{flex:1,overflowY:'auto',padding:'28px 32px'}}>
                <AnimatePresence mode="wait">

                  {step===1 && (
                    <motion.form key="s1" initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:16}} onSubmit={handleStep1}>
                      <div style={{marginBottom:24}}>
                        <h2 style={{fontSize:20,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>Où livrer votre commande ?</h2>
                        <p style={{fontSize:12,color:'#94a3b8',margin:0}}>Vos informations de contact et d'expédition</p>
                      </div>
                      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20,marginBottom:14}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#64748b',marginBottom:14}}>
                          <div style={{width:20,height:20,borderRadius:6,background:'#ede9fe',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:9,color:'#6366f1'}}>👤</span></div>
                          Identité
                        </div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                          <Field label="Prénom" name="firstName" value={form.firstName} onChange={upd} readOnly placeholder="Jean"/>
                          <Field label="Nom" name="lastName" value={form.lastName} onChange={upd} readOnly placeholder="Dupont"/>
                        </div>
                        <Field label="Email" icon={Mail} name="email" type="email" value={form.email} onChange={upd} readOnly placeholder="jean@exemple.fr"/>
                      </div>
                      <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20,marginBottom:20}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:'#64748b',marginBottom:14}}>
                          <div style={{width:20,height:20,borderRadius:6,background:'#fce7f3',display:'flex',alignItems:'center',justifyContent:'center'}}><MapPin size={10} color="#ec4899"/></div>
                          Adresse de livraison
                        </div>
                        <div style={{marginBottom:10}}><Field label="Téléphone" icon={Phone} name="phone" type="tel" value={form.phone} onChange={upd} placeholder="+225 07 00 00 00" required/></div>
                        <div style={{marginBottom:10}}><Field label="Adresse" icon={MapPin} name="address" value={form.address} onChange={upd} placeholder="Numéro et nom de rue" required/></div>
                        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                          <Field label="Ville" name="city" value={form.city} onChange={upd} placeholder="Abidjan" required/>
                          <Field label="Code postal" name="zip" value={form.zip} onChange={upd} placeholder="00000" required/>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:12,background:'#fff',border:'1px solid #e2e8f0',borderRadius:12,padding:'12px 16px',marginBottom:20}}>
                        <div style={{width:36,height:36,borderRadius:10,background:'#eff6ff',display:'flex',alignItems:'center',justifyContent:'center'}}><Truck size={16} color="#3b82f6"/></div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,fontWeight:700,color:'#1e293b'}}>Livraison {shippingMethodLabel}</div>
                          <div style={{fontSize:11,color:'#94a3b8'}}>{ship===0?'Gratuite':`${fmtMoney(ship)} FCFA`}</div>
                        </div>
                        <Check size={14} color="#6366f1"/>
                      </div>
                      <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}} type="submit"
                        style={{width:'100%',padding:'14px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,cursor:'pointer',fontSize:14,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 8px 24px rgba(99,102,241,0.3)'}}>
                        Continuer vers le paiement <ArrowRight size={16}/>
                      </motion.button>
                    </motion.form>
                  )}

                  {step===2 && (
                    <motion.form key="s2" initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-16}} onSubmit={handlePay}>
                      <div style={{marginBottom:20}}>
                        <h2 style={{fontSize:20,fontWeight:800,color:'#1e293b',margin:'0 0 4px'}}>Comment souhaitez-vous payer ?</h2>
                        <p style={{fontSize:12,color:'#94a3b8',margin:0}}>Transactions chiffrées et sécurisées</p>
                      </div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
                        <MethodBtn active={form.method==='card'} icon={CreditCard} label="Carte bancaire" sub="Visa, Mastercard…" onClick={()=>setForm(p=>({...p,method:'card'}))}/>
                        <MethodBtn active={form.method==='mobile'} icon={Smartphone} label="Mobile Money" sub="Orange, MTN, Wave" onClick={()=>setForm(p=>({...p,method:'mobile'}))}/>
                      </div>
                      {form.method==='card' ? (
                        <>
                          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20,marginBottom:16}}>
                            <Card3D number={form.cardNumber} name={form.cardName} expiry={form.cardExpiry} cvc={form.cardCvc} focusField={cardFocus}/>
                          </div>
                          <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:20,marginBottom:20}}>
                            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                              <Field label="Numéro de carte" icon={CreditCard} name="cardNumber" value={form.cardNumber} onChange={upd} maxLength={19} placeholder="0000 0000 0000 0000" onFocus={()=>setCardFocus('number')} required/>
                              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                                <Field label="Expiration" name="cardExpiry" value={form.cardExpiry} onChange={upd} maxLength={5} placeholder="MM/YY" onFocus={()=>setCardFocus('expiry')} required hint="MM/YY"/>
                                <Field label="CVC" icon={Lock} name="cardCvc" value={form.cardCvc} onChange={upd} maxLength={3} placeholder="•••" onFocus={()=>setCardFocus('cvc')} required hint="3 chiffres"/>
                              </div>
                              <Field label="Nom sur la carte" name="cardName" value={form.cardName} onChange={upd} placeholder="JEAN DUPONT" onFocus={()=>setCardFocus('name')} required/>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:14,padding:28,textAlign:'center',marginBottom:20}}>
                          <div style={{width:56,height:56,borderRadius:16,background:'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}><Smartphone size={24} color="#6366f1"/></div>
                          <div style={{fontSize:15,fontWeight:700,color:'#1e293b',marginBottom:4}}>Validation sur mobile</div>
                          <div style={{fontSize:12,color:'#94a3b8',marginBottom:18,lineHeight:1.6}}>Vous recevrez une notification après avoir cliqué sur Payer.</div>
                          <input required name="mobilePhone" type="tel" value={form.mobilePhone} onChange={upd} placeholder="07 00 00 00 00"
                            style={{width:'100%',maxWidth:220,boxSizing:'border-box',background:'#f8fafc',border:'1.5px solid #e2e8f0',borderRadius:10,padding:'12px 16px',fontSize:16,fontWeight:700,color:'#1e293b',outline:'none',textAlign:'center',fontFamily:'monospace'}}/>
                        </div>
                      )}
                      <motion.button whileHover={{scale:1.01}} whileTap={{scale:0.98}} type="submit" disabled={processing}
                        style={{width:'100%',padding:'14px',background:processing?'#a5b4fc':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,cursor:processing?'not-allowed':'pointer',fontSize:14,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,boxShadow:'0 8px 24px rgba(99,102,241,0.3)',transition:'all 0.2s'}}>
                        {processing ? <><Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/> Traitement…</> : <><Lock size={15}/> Payer {fmtMoney(total)} FCFA</>}
                      </motion.button>
                      <button type="button" onClick={()=>setStep(1)} style={{width:'100%',marginTop:10,padding:'11px',background:'transparent',border:'1.5px solid #e2e8f0',borderRadius:10,color:'#64748b',fontSize:12,fontWeight:600,cursor:'pointer'}}>← Retour à la livraison</button>
                    </motion.form>
                  )}

                  {step===3 && (
                    <motion.div key="s3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{textAlign:'center',padding:'32px 20px'}}>
                      <motion.div initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}} transition={{type:'spring',damping:14,stiffness:180,delay:0.1}}
                        style={{width:80,height:80,borderRadius:24,background:'linear-gradient(135deg,#dcfce7,#bbf7d0)',border:'1px solid #86efac',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px'}}>
                        <Check size={36} color="#16a34a" strokeWidth={3}/>
                      </motion.div>
                      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.2}}>
                        <h2 style={{fontSize:26,fontWeight:800,color:'#1e293b',margin:'0 0 8px'}}>Commande confirmée !</h2>
                        <p style={{color:'#64748b',fontSize:13,marginBottom:24,lineHeight:1.6}}>Merci pour votre achat. Un email de confirmation vous a été envoyé.</p>
                        <div style={{display:'inline-flex',alignItems:'center',gap:12,background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:'12px 20px',marginBottom:28}}>
                          <div>
                            <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:'#94a3b8'}}>Numéro de commande</div>
                            <div style={{fontFamily:'monospace',fontSize:16,fontWeight:800,color:'#6366f1',marginTop:2}}>#{orderNumber}</div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap',marginBottom:28}}>
                          {['Préparation','Expédition','Livraison'].map((s,i)=>(
                            <motion.div key={s} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3+i*0.08}}
                              style={{display:'flex',alignItems:'center',gap:6,background:'#fff',border:'1px solid #e2e8f0',borderRadius:20,padding:'6px 12px'}}>
                              <div style={{width:6,height:6,borderRadius:'50%',background:i===0?'#6366f1':'#e2e8f0'}}/>
                              <span style={{fontSize:11,fontWeight:600,color:i===0?'#6366f1':'#94a3b8'}}>{s}</span>
                            </motion.div>
                          ))}
                        </div>
                        <motion.button whileHover={{scale:1.02}} whileTap={{scale:0.98}} onClick={onClose}
                          style={{padding:'13px 32px',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:12,fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer',boxShadow:'0 8px 24px rgba(99,102,241,0.25)'}}>
                          Continuer mes achats
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

              {/* RIGHT: order summary */}
              <div style={{width:260,borderLeft:'1px solid #e2e8f0',background:'#fff',padding:'28px 20px',overflowY:'auto',flexShrink:0}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'#94a3b8',marginBottom:16}}>Votre commande</div>
                <div style={{marginBottom:16}}>
                  {isCart ? cartItems.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:10,marginBottom:12,alignItems:'center'}}>
                      <div style={{width:44,height:44,borderRadius:10,background:'#f1f5f9',flexShrink:0,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',border:'1px solid #e2e8f0'}}>
                        {item?.image && <img src={item.image} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>}
                        <div style={{position:'absolute',top:-4,right:-4,width:17,height:17,borderRadius:'50%',background:'#6366f1',fontSize:9,fontWeight:800,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>{item?.quantity}</div>
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#1e293b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item?.name||'Produit'}</div>
                        <div style={{fontSize:11,color:'#6366f1',fontWeight:700}}>{fmtMoney((Number(item?.price)||0)*(Number(item?.quantity)||1))} FCFA</div>
                      </div>
                    </div>
                  )) : (
                    <div style={{display:'flex',gap:10,marginBottom:12,alignItems:'center'}}>
                      <div style={{width:44,height:44,borderRadius:10,background:'#f1f5f9',flexShrink:0,border:'1px solid #e2e8f0'}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:700,color:'#1e293b'}}>{product?.name||'Produit'}</div>
                        <div style={{fontSize:11,color:'#64748b'}}>×{qty}</div>
                        <div style={{fontSize:11,color:'#6366f1',fontWeight:700}}>{fmtMoney(itemsTotal)} FCFA</div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{borderTop:'1px solid #f1f5f9',paddingTop:14}}>
                  {[
                    {label:'Sous-total', value:`${fmtMoney(itemsTotal)} FCFA`},
                    {label:`Livraison (${shippingMethodLabel})`, value:ship===0?'Gratuit':`${fmtMoney(ship)} FCFA`},
                    ...(disc>0?[{label:'Réduction', value:`-${fmtMoney(disc)} FCFA`, accent:true}]:[]),
                    ...(ldisc>0?[{label:`VIP${loyaltyTier?` (${loyaltyTier})`:''} `, value:`-${fmtMoney(ldisc)} FCFA`, accent:true}]:[]),
                    {label:'TVA (18%)', value:`${fmtMoney(tax)} FCFA`, muted:true},
                  ].map(l=>(
                    <div key={l.label} style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <span style={{fontSize:11,color:l.muted?'#94a3b8':'#64748b'}}>{l.label}</span>
                      <span style={{fontSize:11,fontWeight:700,color:l.accent?'#16a34a':l.muted?'#94a3b8':'#1e293b'}}>{l.value}</span>
                    </div>
                  ))}
                  <div style={{borderTop:'1px solid #e2e8f0',paddingTop:12,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:800,color:'#1e293b'}}>Total</span>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontSize:18,fontWeight:800,color:'#6366f1'}}>{fmtMoney(total)}</div>
                      <div style={{fontSize:10,color:'#94a3b8'}}>FCFA TTC</div>
                    </div>
                  </div>
                </div>
                <div style={{marginTop:16,background:'#f8fafc',borderRadius:10,padding:'12px 14px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                    <Star size={11} color="#f59e0b" fill="#f59e0b"/>
                    <span style={{fontSize:10,fontWeight:700,color:'#1e293b'}}>Paiement sécurisé</span>
                  </div>
                  <p style={{fontSize:10,color:'#94a3b8',margin:0,lineHeight:1.6}}>Données chiffrées 256-bit. Aucune info bancaire stockée.</p>
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