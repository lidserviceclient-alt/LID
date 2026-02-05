package com.lifeevent.lid.common.seed;

import com.lifeevent.lid.article.entity.Article;
import com.lifeevent.lid.article.entity.Category;
import com.lifeevent.lid.article.enumeration.ArticleStatus;
import com.lifeevent.lid.article.repository.ArticleRepository;
import com.lifeevent.lid.article.repository.CategoryRepository;
import com.lifeevent.lid.core.entity.Authentification;
import com.lifeevent.lid.core.entity.Utilisateur;
import com.lifeevent.lid.core.enums.FournisseurAuth;
import com.lifeevent.lid.core.enums.RoleUtilisateur;
import com.lifeevent.lid.core.repository.AuthentificationRepository;
import com.lifeevent.lid.core.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

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

    @Override
    public void run(ApplicationArguments args) {
        ensureAdmin();
        ensureCatalog();
    }

    private void ensureAdmin() {
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
                        .img("https://via.placeholder.com/300")
                        .status(ArticleStatus.ACTIVE)
                        .categories(List.of(category))
                        .build()));
    }
}
