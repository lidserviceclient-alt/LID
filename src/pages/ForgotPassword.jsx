import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ShieldCheck, Key, CheckCircle, ChevronLeft, AlertCircle } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { backofficeApi } from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [codeDigits, setCodeDigits] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const codeValue = codeDigits.join("");

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await backofficeApi.forgotPassword(email);
      setCodeDigits(["", "", "", "", "", ""]);
      setStep(2);
    } catch (err) {
      setError(err.message || "Impossible d'envoyer le code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError("");
    if (codeValue.length < 6) {
      setError("Veuillez saisir le code complet.");
      return;
    }
    setIsLoading(true);
    try {
      await backofficeApi.verifyResetCode(codeValue);
      setStep(3);
    } catch (err) {
      setError(err.message || "Code invalide ou expiré.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setIsLoading(true);
    try {
      await backofficeApi.resetPassword({ code: codeValue, newPassword: password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Impossible de réinitialiser le mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError("");
    setIsLoading(true);
    try {
      await backofficeApi.forgotPassword(email);
      setCodeDigits(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Impossible de renvoyer le code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    const next = value.replace(/\D/g, "").slice(-1);
    setCodeDigits((prev) => {
      const updated = [...prev];
      updated[index] = next;
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Partie Gauche - Visuel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-slate-900/90 z-10" />
        <img 
          src="/imgs/lid-white.png" 
          alt="LID Distribution Warehouse" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
        />
        
        <div className="relative z-20 flex flex-col justify-between h-full p-12 text-white">
          <div>
            <img src="/imgs/lid-white.png" alt="LID Logo" className="h-12 mb-8" />
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Sécurité et <br/>Confidentialité.
            </h1>
            <p className="text-lg text-slate-300 max-w-md">
              Nous prenons la sécurité de votre compte très au sérieux. Suivez les étapes pour récupérer votre accès.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <ShieldCheck className="h-8 w-8 text-green-400" />
              <div>
                <p className="font-semibold">Connexion sécurisée</p>
                <p className="text-sm text-slate-300">Vos données sont chiffrées de bout en bout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie Droite - Formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 sm:p-12 lg:p-24 bg-background relative">
        <Link to="/login" className="absolute top-8 left-8 flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à la connexion
        </Link>

        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Récupération</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === 1 && "Entrez votre email pour recevoir un code de vérification."}
              {step === 2 && "Entrez le code à 6 chiffres envoyé à votre adresse email."}
              {step === 3 && "Créez un nouveau mot de passe sécurisé."}
            </p>
          </div>

          {/* Étapes */}
          <div className="flex justify-center gap-2 mb-8">
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 w-8 rounded-full transition-colors ${step >= 3 ? "bg-primary" : "bg-muted"}`} />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <Input 
                  label="Email professionnel"
                  icon={Mail}
                  type="email" 
                  placeholder="nom@lid-distribution.com" 
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Envoyer le code <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Code de vérification
                </label>
                <div className="flex gap-2 justify-between">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      autoComplete={i === 0 ? "one-time-code" : "off"}
                      className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      value={codeDigits[i]}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Vous n'avez rien reçu ? <button type="button" className="text-primary hover:underline" onClick={handleResendCode}>Renvoyer le code</button>
                </p>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Vérifier <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <Input 
                label="Nouveau mot de passe"
                icon={Key}
                type="password" 
                placeholder="••••••••" 
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
              <Input 
                label="Confirmer le mot de passe"
                icon={Key}
                type="password" 
                placeholder="••••••••" 
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <h4 className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-3 tracking-wider">Critères de sécurité</h4>
                <ul className="space-y-3 text-sm">
                  <li className={`flex items-center gap-2.5 transition-all duration-300 ${password.length >= 8 ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                    <div className={`rounded-full p-0.5 ${password.length >= 8 ? "bg-green-100 dark:bg-green-900/30" : "bg-slate-200 dark:bg-slate-800"}`}>
                      <CheckCircle className={`h-3.5 w-3.5 ${password.length >= 8 ? "opacity-100" : "opacity-0"}`} />
                    </div>
                    <span>Minimum 8 caractères</span>
                  </li>
                  <li className={`flex items-center gap-2.5 transition-all duration-300 ${password && password === confirmPassword ? "text-green-600 dark:text-green-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}>
                    <div className={`rounded-full p-0.5 ${password && password === confirmPassword ? "bg-green-100 dark:bg-green-900/30" : "bg-slate-200 dark:bg-slate-800"}`}>
                      <CheckCircle className={`h-3.5 w-3.5 ${password && password === confirmPassword ? "opacity-100" : "opacity-0"}`} />
                    </div>
                    <span>Mots de passe identiques</span>
                  </li>
                </ul>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                Réinitialiser le mot de passe
              </Button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
