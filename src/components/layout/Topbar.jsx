import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  MessageSquareText,
  PackagePlus,
  Plus,
  Search,
  Settings,
  UserPlus
} from "lucide-react";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import Input from "../ui/Input.jsx";
import Label from "../ui/Label.jsx";
import GlobalSearchModal from "../search/GlobalSearchModal.jsx";
import { clearAccessToken, getAuthenticatedUser } from "../../services/auth.js";
import { useNotificationsContext } from "../../contexts/NotificationsContext.jsx";
import { cn } from "../../utils/cn.js";
export default function Topbar({ onMenuClick }) {
  const [focused, setFocused] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isCommandOpen, setIsCommandOpen] = useState(false);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackSubject, setFeedbackSubject] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("");

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const createMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const currentUser = getAuthenticatedUser();
  const {
    notifications,
    notificationsLoading,
    notificationsError,
    hasUnreadNotifications,
    unreadNotificationsCount,
    loadNotifications
  } = useNotificationsContext();

  const displayName = useMemo(() => {
    const fullName = [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ").trim();
    if (fullName) return fullName;
    if (currentUser?.email) return currentUser.email;
    return "Utilisateur";
  }, [currentUser?.email, currentUser?.firstName, currentUser?.lastName]);

  const initials = useMemo(() => {
    const first = currentUser?.firstName?.trim?.() || "";
    const last = currentUser?.lastName?.trim?.() || "";
    const parts = [];
    if (first) parts.push(first[0]);
    if (last) parts.push(last[0]);
    if (parts.length >= 2) return parts.join("").toUpperCase();

    const base = (displayName || "").split("@")[0].trim();
    const words = base.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return "U";
  }, [currentUser?.firstName, currentUser?.lastName, displayName]);

  const roleLabel = useMemo(() => {
    const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
    const role = roles[0] || "";
    return role ? role.toUpperCase() : "USER";
  }, [currentUser?.roles]);

  const isMac = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || "");
  }, []);

  const breadcrumbs = useMemo(() => {
    const path = location.pathname || "/";

    const labelForStatic = {
      "/": { parent: "Dashboard", current: "Vue d'ensemble" },
      "/orders": { parent: "Commandes", current: "Liste" },
      "/partners": { parent: "Partenaires", current: "Liste" },
      "/products": { parent: "Produits", current: "Liste" },
      "/products/create": { parent: "Produits", current: "Créer" },
      "/categories": { parent: "Catégories", current: "Liste" },
      "/promo-codes": { parent: "Codes promo", current: "Liste" },
      "/customers": { parent: "Clients", current: "Liste" },
      "/users": { parent: "Utilisateurs", current: "Liste" },
      "/inventory": { parent: "Stocks", current: "Inventaire" },
      "/logistics": { parent: "Livraison", current: "Suivi" },
      "/marketing": { parent: "Marketing", current: "Campagnes" },
      "/loyalty": { parent: "Fidélité", current: "Programme" },
      "/finance": { parent: "Finance", current: "Paiements" },
      "/analytics": { parent: "Analytics", current: "Tableaux" },
      "/settings": { parent: "Paramètres", current: "Configuration" },
      "/messages": { parent: "Messages", current: "Historique" }
    };

    if (labelForStatic[path]) {
      const x = labelForStatic[path];
      return [
        { label: x.parent, to: path === "/" ? "/" : path.split("/").slice(0, 2).join("/") || "/" },
        { label: x.current, to: null }
      ];
    }

    if (path.startsWith("/users/")) {
      return [
        { label: "Utilisateurs", to: "/users" },
        { label: "Détail", to: null }
      ];
    }

    if (path.startsWith("/products/")) {
      return [
        { label: "Produits", to: "/products" },
        { label: "Détail", to: null }
      ];
    }

    return [
      { label: "Dashboard", to: "/" },
      { label: "Page", to: null }
    ];
  }, [location.pathname]);

  const closeMenus = useCallback(() => {
    setIsCreateOpen(false);
    setIsProfileOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    clearAccessToken();
    navigate("/login", { replace: true });
  }, [navigate]);

  const openCommandPalette = useCallback(
    () => {
      closeMenus();
      setIsCommandOpen(true);
    },
    [closeMenus]
  );

  const commands = useMemo(
    () => [
      { label: "Aller au Dashboard", keywords: ["dashboard", "accueil"], action: () => navigate("/") },
      { label: "Commandes", keywords: ["orders", "commandes"], action: () => navigate("/orders") },
      { label: "Partenaires", keywords: ["partners", "partenaires", "vendeurs"], action: () => navigate("/partners") },
      { label: "Clients", keywords: ["customers", "clients"], action: () => navigate("/customers") },
      { label: "Produits", keywords: ["products", "produits"], action: () => navigate("/products") },
      { label: "Stocks", keywords: ["inventory", "stock"], action: () => navigate("/inventory") },
      { label: "Analytics", keywords: ["analytics", "stats"], action: () => navigate("/analytics") },
      { label: "Marketing", keywords: ["marketing"], action: () => navigate("/marketing") },
      { label: "Paramètres", keywords: ["settings", "parametres", "paramètres"], action: () => navigate("/settings") },
      { label: "Créer un produit", keywords: ["creer", "créer", "produit"], action: () => navigate("/products/create") },
      { label: "Ajouter un client", keywords: ["creer", "créer", "client"], action: () => navigate("/customers?create=1") },
      { label: "Utilisateurs", keywords: ["users", "utilisateurs"], action: () => navigate("/users") },
      { label: "Messages", keywords: ["messages", "email", "mail"], action: () => navigate("/messages") },
      { label: "Déconnexion", keywords: ["logout", "deconnexion", "déconnexion"], action: handleLogout }
    ],
    [handleLogout, navigate]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      const key = e.key?.toLowerCase?.() || "";

      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        openCommandPalette();
        return;
      }

      if (key === "escape") {
        closeMenus();
        setIsCommandOpen(false);
        setIsFeedbackOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMenus, openCommandPalette]);

  useEffect(() => {
    const onMouseDown = (e) => {
      const target = e.target;
      if (isCreateOpen && createMenuRef.current && !createMenuRef.current.contains(target)) {
        setIsCreateOpen(false);
      }
      if (isProfileOpen && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isCreateOpen, isProfileOpen]);

  useEffect(() => {
    if (!isCommandOpen) return;
  }, [isCommandOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;
    loadNotifications().catch(() => {});
  }, [isNotificationsOpen, loadNotifications]);

  const sendFeedback = async () => {
    const subject = feedbackSubject.trim() || "Feedback backoffice";
    const message = feedbackMessage.trim();
    const payload = `Sujet: ${subject}\n\n${message}`.trim();

    setFeedbackStatus("");
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload);
        setFeedbackStatus("Feedback copié dans le presse-papiers.");
      }
    } catch {
      // ignore
    }

    const mailto = `mailto:support@lid.local?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    if (typeof window !== "undefined") {
      window.location.href = mailto;
    }

    setIsFeedbackOpen(false);
    setFeedbackSubject("");
    setFeedbackMessage("");
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/60 backdrop-blur-xl border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden md:flex items-center text-sm text-muted-foreground">
            {breadcrumbs.map((bc, idx) => (
              <span key={`${bc.label}-${idx}`} className="flex items-center">
                <span
                  className={cn(
                    "transition-colors",
                    bc.to ? "hover:text-foreground cursor-pointer" : "font-medium text-foreground"
                  )}
                  onClick={() => {
                    if (bc.to) navigate(bc.to);
                  }}
                >
                  {bc.label}
                </span>
                {idx < breadcrumbs.length - 1 ? <span className="mx-2">/</span> : null}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div
            className={`hidden overflow-hidden md:flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-300 ${
              focused
                ? "border-primary/50 ring-4 ring-primary/10 bg-background w-64"
                : "border-border/50 bg-muted/30 hover:bg-muted/50 w-48"
            }`}
          >
            <Search size={16} className={focused ? "text-primary" : "text-muted-foreground"} />
            <input
              className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70 cursor-pointer"
              placeholder="Rechercher..."
              readOnly
              onClick={() => openCommandPalette()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
            <div className="flex items-center gap-1">
              <kbd className="inline-flex h-5 select-none items-center gap-1 rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:inline-flex h-9 rounded-full border-dashed"
              onClick={() => {
                closeMenus();
                navigate("/messages");
              }}
            >
              Messages
            </Button>

            <div className="relative" ref={createMenuRef}>
              <Button
                size="sm"
                className="h-9 gap-2 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsCreateOpen((v) => !v);
                }}
              >
                <Plus size={16} /> <span className="hidden sm:inline">Créer</span>
              </Button>
              {isCreateOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl border border-border/60 bg-background shadow-lg p-2 z-50">
                  <button
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    onClick={() => {
                      setIsCreateOpen(false);
                      navigate("/products/create");
                    }}
                  >
                    <PackagePlus size={16} className="text-primary" />
                    Nouveau produit
                  </button>
                  <button
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    onClick={() => {
                      setIsCreateOpen(false);
                      navigate("/customers?create=1");
                    }}
                  >
                    <UserPlus size={16} className="text-primary" />
                    Nouveau client
                  </button>
                  <div className="h-px bg-border/60 my-1" />
                  <button
                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    onClick={() => {
                      setIsCreateOpen(false);
                      openCommandPalette();
                    }}
                  >
                    <Search size={16} className="text-muted-foreground" />
                    Ouvrir la palette
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-9 rounded-full"
              onClick={handleLogout}
            >
              Déconnexion
            </Button>
          </div>

          <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

          <button
            className="relative p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
            onClick={() => {
              closeMenus();
              setIsNotificationsOpen(true);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
                {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
              </span>
            ) : hasUnreadNotifications ? (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background animate-pulse" />
            ) : null}
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button
              className="flex items-center gap-3 pl-1 cursor-pointer group"
              onClick={() => {
                setIsCreateOpen(false);
                setIsProfileOpen((v) => !v);
              }}
              aria-label="Menu utilisateur"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/60 text-primary-foreground flex items-center justify-center font-bold shadow-md ring-2 ring-transparent group-hover:ring-primary/20 transition-all overflow-hidden">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={displayName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="hidden md:block leading-tight text-left">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{displayName}</p>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{roleLabel}</p>
              </div>
              <ChevronDown
                size={14}
                className="text-muted-foreground group-hover:text-primary transition-colors hidden md:block"
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border/60 bg-background shadow-lg p-2 z-50">
                <button
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate("/settings");
                  }}
                >
                  <Settings size={16} className="text-primary" />
                  Paramètres
                </button>
                <button
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={16} className="text-primary" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <GlobalSearchModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        shortcuts={commands}
      />

      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Feedback"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-subject">Sujet</Label>
            <Input
              id="feedback-subject"
              value={feedbackSubject}
              onChange={(e) => setFeedbackSubject(e.target.value)}
              placeholder="Ex: Problème sur les commandes"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">Message</Label>
            <textarea
              id="feedback-message"
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              placeholder="Décrivez votre problème ou votre suggestion..."
              className="w-full min-h-32 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200"
            />
          </div>

          {feedbackStatus && (
            <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              {feedbackStatus}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsFeedbackOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={sendFeedback}
              disabled={!feedbackSubject.trim() && !feedbackMessage.trim()}
              className="gap-2"
            >
              <MessageSquareText size={16} />
              Envoyer
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
        size="lg"
      >
        {notificationsLoading ? (
          <div className="text-sm text-muted-foreground">Chargement...</div>
        ) : notificationsError ? (
          <div className="text-sm text-destructive">{notificationsError}</div>
        ) : notifications.length === 0 ? (
          <div className="text-sm text-muted-foreground">Aucune notification.</div>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 20).map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-4 p-3 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground">{n.title || "Notification"}</div>
                  <div className="text-xs text-muted-foreground">{n.body || "-"}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate(n.actionPath || "/");
                  }}
                >
                  {n.actionLabel || "Voir"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </>
  );
}
