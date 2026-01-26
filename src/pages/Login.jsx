import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Label from "../components/ui/Label";
import Card from "../components/ui/Card";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Visual / Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-black items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-60"
          style={{ backgroundImage: "url('/imgs/wall-1.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-black/90 z-10" />
        
        {/* Content */}
        <div className="relative z-20 p-12 text-white max-w-2xl">
          <img 
            src="/imgs/lid-white.png" 
            alt="LID Logo" 
            className="h-16 w-auto mb-10 object-contain"
          />
          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
            Pilotez votre distribution avec excellence
          </h1>
          <p className="text-xl text-white/80 font-light mb-10 leading-relaxed">
            Accédez à tous vos outils de gestion, analysez vos performances et optimisez vos flux logistiques en temps réel.
          </p>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">Sécurité maximale</p>
              <p className="text-xs text-white/70">Vos données sont protégées par un chiffrement de bout en bout.</p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">
              Connexion Admin
            </h2>
            <p className="text-muted-foreground">
              Entrez vos identifiants pour accéder au tableau de bord.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email professionnel</Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="email"
                    placeholder="admin@lid.ci"
                    type="email"
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus:bg-background transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">Mot de passe</Label>
                  <a 
                    href="/forgot-password" 
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Mot de passe oublié ?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-12 bg-muted/30 border-border/60 focus:bg-background transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 font-bold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-xl"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Accéder au Backoffice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              En vous connectant, vous acceptez nos <Link to="/terms" className="underline hover:text-primary">Conditions d'utilisation</Link> et notre <Link to="/privacy" className="underline hover:text-primary">Politique de confidentialité</Link>.
            </p>
          </div>
          
          <div className="absolute bottom-6 right-8 text-xs text-muted-foreground/50 hidden lg:block">
            v1.0.4-beta
          </div>
        </div>
      </div>
    </div>
  );
}
