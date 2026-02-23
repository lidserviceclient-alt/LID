package com.lifeevent.lid.common.seed;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.core.entity.Boutique;
import com.lifeevent.lid.core.entity.Authentification;
import com.lifeevent.lid.core.entity.Categorie;
import com.lifeevent.lid.core.entity.Produit;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.FournisseurAuth;
import com.lifeevent.lid.core.enums.NiveauCategorie;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.BoutiqueRepository;
import com.lifeevent.lid.core.repository.AuthentificationRepository;
import com.lifeevent.lid.core.repository.CategorieRepository;
import com.lifeevent.lid.core.repository.ProduitRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import com.lifeevent.lid.content.entity.BlogPost;
import com.lifeevent.lid.content.entity.TicketEvent;
import com.lifeevent.lid.content.repository.BlogPostRepository;
import com.lifeevent.lid.content.repository.TicketEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@Profile("local-h2")
@RequiredArgsConstructor
public class LocalH2Seeder implements ApplicationRunner {

    private final UtilisateurRepository utilisateurRepository;
    private final AuthentificationRepository authentificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;
    private final BoutiqueRepository boutiqueRepository;
    private final CategorieRepository categorieRepository;
    private final ProduitRepository produitRepository;
    private final BlogPostRepository blogPostRepository;
    private final TicketEventRepository ticketEventRepository;

    @Override
    public void run(ApplicationArguments args) {
        Utilisateur admin = ensureAdmin();
        ensureCatalog();
        ensureCoreCatalog(admin);
        ensureContent();
    }

    private Utilisateur ensureAdmin() {
        String email = "admin@demo.com";
        Utilisateur user = utilisateurRepository.findByEmail(email).orElseGet(() -> {
            Utilisateur created = new Utilisateur();
            created.setEmail(email);
            created.setEmailVerifie(true);
            created.setNom("Demo");
            created.setPrenom("Admin");
            created.setRole(RoleUtilisateur.SUPER_ADMIN);
            return utilisateurRepository.save(created);
        });

        authentificationRepository.findByFournisseurAndIdentifiantFournisseur(FournisseurAuth.LOCAL, email)
                .orElseGet(() -> {
                    Authentification auth = new Authentification();
                    auth.setUtilisateur(user);
                    auth.setFournisseur(FournisseurAuth.LOCAL);
                    auth.setIdentifiantFournisseur(email);
                    auth.setMotDePasseHash(passwordEncoder.encode("Admin123!"));
                    return authentificationRepository.save(auth);
                });

        return user;
    }

    private void ensureCatalog() {
        Category category = categoryRepository.findByNameIgnoreCase("Général")
                .orElseGet(() -> categoryRepository.save(Category.builder().name("Général").orderIdx(1).build()));

        articleRepository.findByReferenceProduitPartenaire("DEMO-001")
                .orElseGet(() -> articleRepository.save(Article.builder()
                        .referenceProduitPartenaire("DEMO-001")
                        .name("Article Démo")
                        .price(1000d)
                        .vat(0.18f)
                        .img("https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop")
                        .status(ArticleStatus.ACTIVE)
                        .categories(List.of(category))
                        .build()));
    }

    private void ensureCoreCatalog(Utilisateur admin) {
        Boutique boutique = boutiqueRepository.findByPartenaire(admin)
                .orElseGet(() -> {
                    Boutique created = new Boutique();
                    created.setPartenaire(admin);
                    created.setNom("Boutique Démo");
                    created.setDescription("Boutique de démonstration (local-h2)");
                    return boutiqueRepository.save(created);
                });

        Categorie categorie = categorieRepository.findBySlug("demo")
                .orElseGet(() -> {
                    Categorie c = new Categorie();
                    c.setNom("Catégorie Démo");
                    c.setSlug("demo");
                    c.setNiveau(NiveauCategorie.PRINCIPALE);
                    c.setOrdre(1);
                    c.setEstActive(true);
                    c.setIsFeatured(true);
                    return categorieRepository.save(c);
                });

        produitRepository.findByReferencePartenaireIgnoreCase("DEMO-P-001")
                .orElseGet(() -> {
                    Produit p = new Produit();
                    p.setBoutique(boutique);
                    p.setCategorie(categorie);
                    p.setReferencePartenaire("DEMO-P-001");
                    p.setNom("Produit Démo (Phare)");
                    p.setSlug("produit-demo-phare");
                    p.setPrix(new BigDecimal("15000"));
                    p.setTva(new BigDecimal("0.18"));
                    p.setIsFeatured(true);
                    p.setIsBestSeller(true);
                    return produitRepository.save(p);
                });

        produitRepository.findByReferencePartenaireIgnoreCase("DEMO-P-002")
                .orElseGet(() -> {
                    Produit p = new Produit();
                    p.setBoutique(boutique);
                    p.setCategorie(categorie);
                    p.setReferencePartenaire("DEMO-P-002");
                    p.setNom("Produit Démo");
                    p.setSlug("produit-demo");
                    p.setPrix(new BigDecimal("9900"));
                    p.setTva(new BigDecimal("0.18"));
                    p.setIsFeatured(false);
                    p.setIsBestSeller(false);
                    return produitRepository.save(p);
                });
    }

    private void ensureContent() {
        if (blogPostRepository.count() == 0) {
            BlogPost post1 = new BlogPost();
            post1.setTitle("Les tendances e-commerce en 2026");
            post1.setExcerpt("Paiement, livraison et expÃ©rience client : les Ã©volutions Ã  suivre pour booster vos ventes.");
            post1.setContent("DÃ©couvrez les leviers concrets pour amÃ©liorer votre conversion, rÃ©duire vos abandons panier et fidÃ©liser vos clients.");
            post1.setImageUrl("https://images.unsplash.com/photo-1523398002811-999ca8dec234?q=80&w=1200&auto=format&fit=crop");
            post1.setCategory("Tendance");
            post1.setDate(LocalDateTime.now().minusDays(3));
            post1.setAuthor("LID");
            post1.setFeatured(true);
            post1.setReadTime("4 min");

            BlogPost post2 = new BlogPost();
            post2.setTitle("Comment optimiser votre logistique");
            post2.setExcerpt("RÃ©duisez vos dÃ©lais et vos coÃ»ts avec une organisation simple et des KPIs pertinents.");
            post2.setContent("Une logistique maÃ®trisÃ©e = clients satisfaits. Voici une mÃ©thode pas Ã  pas pour structurer vos expÃ©ditions.");
            post2.setImageUrl("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop");
            post2.setCategory("Logistique");
            post2.setDate(LocalDateTime.now().minusDays(7));
            post2.setAuthor("LID");
            post2.setFeatured(false);
            post2.setReadTime("5 min");

            blogPostRepository.saveAll(List.of(post1, post2));
        }

        if (ticketEventRepository.count() == 0) {
            TicketEvent event1 = new TicketEvent();
            event1.setTitle("Concert Live â€” Abidjan");
            event1.setDate(LocalDateTime.now().plusDays(10).withHour(20).withMinute(0).withSecond(0).withNano(0));
            event1.setLocation("Palais de la Culture, Abidjan");
            event1.setPrice(new BigDecimal("5000"));
            event1.setImageUrl("https://images.unsplash.com/photo-1515165562835-c3b8b6b4c0ad?q=80&w=1200&auto=format&fit=crop");
            event1.setCategory("Concert");
            event1.setAvailable(true);
            event1.setDescription("Une soirÃ©e exceptionnelle avec des artistes locaux et internationaux.");

            TicketEvent event2 = new TicketEvent();
            event2.setTitle("ConfÃ©rence Business â€” Distribution");
            event2.setDate(LocalDateTime.now().plusDays(21).withHour(9).withMinute(30).withSecond(0).withNano(0));
            event2.setLocation("Plateau, Abidjan");
            event2.setPrice(new BigDecimal("15000"));
            event2.setImageUrl("https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop");
            event2.setCategory("ConfÃ©rence");
            event2.setAvailable(true);
            event2.setDescription("Networking, tendances marchÃ© et ateliers pour dÃ©velopper votre activitÃ©.");

            ticketEventRepository.saveAll(List.of(event1, event2));
        }
    }
}
