package com.lifeevent.lid.common.seed;

import lombok.extern.slf4j.Slf4j;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.customer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@Profile("local")
@Slf4j
public class LocalSqlSeeder implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final PasswordEncoder passwordEncoder;
    private final CustomerRepository customerRepository;

    @Value("${config.seed.enabled:true}")
    private boolean enabled;

    @Value("${config.seed.sql-file:}")
    private String sqlFileOverride;

    @Value("${config.seed.admin-email:admin@demo.com}")
    private String adminEmail;

    @Value("${config.seed.admin-password:Admin123!}")
    private String adminPassword;

    public LocalSqlSeeder(JdbcTemplate jdbcTemplate, PasswordEncoder passwordEncoder, CustomerRepository customerRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.passwordEncoder = passwordEncoder;
        this.customerRepository = customerRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!enabled) {
            log.info("DB seed disabled (config.seed.enabled=false).");
            return;
        }

        boolean hasCoreData = hasAnyRows("utilisateur")
                && hasAnyRows("produit")
                && hasAnyRows("commande");
        if (!hasCoreData) {
            seedFromSqlFile();
        }

        ensureAdminPassword();
        ensureDemoCustomer();
    }

    private boolean hasAnyRows(String table) {
        try {
            Long count = jdbcTemplate.queryForObject("select count(*) from " + table, Long.class);
            return count != null && count > 0;
        } catch (Exception ex) {
            log.warn("Unable to check {} table (will try seed anyway): {}", table, ex.getMessage());
            return false;
        }
    }

    private void seedFromSqlFile() {
        Path sqlFile = resolveSqlFile();
        if (sqlFile == null) {
            log.warn("Seed SQL file not found. Expected systems/lid.sql near repo root.");
            return;
        }

        String rawSql;
        try {
            rawSql = Files.readString(sqlFile, StandardCharsets.UTF_8);
        } catch (IOException ex) {
            log.warn("Unable to read seed SQL file {}: {}", sqlFile.toAbsolutePath(), ex.getMessage());
            return;
        }

        String sql = rawSql.lines()
                .filter(line -> {
                    String trimmed = line.trim();
                    return !(trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.startsWith("*") || trimmed.startsWith("*/"));
                })
                .collect(Collectors.joining("\n"));

        List<String> statements = splitStatements(sql);
        int executed = 0;
        int failed = 0;

        for (String statement : statements) {
            String trimmed = statement.trim();
            if (trimmed.isBlank()) continue;

            try {
                jdbcTemplate.execute(trimmed);
                executed++;
            } catch (Exception ex) {
                failed++;
                log.debug("Seed SQL statement failed (ignored): {}", ex.getMessage());
            }
        }

        log.info("DB seed from {} finished: executed={}, failed={}", sqlFile.toAbsolutePath(), executed, failed);
    }

    private Path resolveSqlFile() {
        if (sqlFileOverride != null && !sqlFileOverride.isBlank()) {
            Path override = Paths.get(sqlFileOverride);
            if (Files.exists(override)) {
                return override;
            }
            log.warn("config.seed.sql-file provided but not found: {}", override.toAbsolutePath());
        }

        List<Path> candidates = List.of(
                Paths.get("systems", "lid.sql"),
                Paths.get("..", "systems", "lid.sql"),
                Paths.get("..", "..", "systems", "lid.sql"),
                Paths.get("..", "..", "..", "systems", "lid.sql")
        );

        for (Path candidate : candidates) {
            if (Files.exists(candidate)) {
                return candidate.normalize();
            }
        }

        return null;
    }

    private static List<String> splitStatements(String script) {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inSingleQuotes = false;
        boolean inDoubleQuotes = false;

        for (int i = 0; i < script.length(); i++) {
            char c = script.charAt(i);

            if (c == '\'' && !inDoubleQuotes) {
                inSingleQuotes = !inSingleQuotes;
                current.append(c);
                continue;
            }
            if (c == '"' && !inSingleQuotes) {
                inDoubleQuotes = !inDoubleQuotes;
                current.append(c);
                continue;
            }

            if (c == ';' && !inSingleQuotes && !inDoubleQuotes) {
                statements.add(current.toString());
                current.setLength(0);
                continue;
            }

            current.append(c);
        }

        if (!current.isEmpty()) {
            statements.add(current.toString());
        }

        return statements;
    }

    private void ensureAdminPassword() {
        String encoded = passwordEncoder.encode(adminPassword);

        try {
            int updated = jdbcTemplate.update(
                    "update authentification set mot_de_passe_hash=? where fournisseur='LOCAL' and identifiant_fournisseur=?",
                    encoded,
                    adminEmail
            );
            if (updated > 0) {
                log.info("Admin password ensured for {} (updated {}).", adminEmail, updated);
                return;
            }

            String userId = jdbcTemplate.queryForObject(
                    "select id from utilisateur where email=? limit 1",
                    String.class,
                    adminEmail
            );
            if (userId == null || userId.isBlank()) {
                log.warn("Admin user not found in utilisateur table for email={}", adminEmail);
                return;
            }

            jdbcTemplate.update(
                    "insert into authentification (id, utilisateur_id, fournisseur, identifiant_fournisseur, mot_de_passe_hash, date_creation) values (?,?,?,?,?,?)",
                    UUID.randomUUID().toString(),
                    userId,
                    "LOCAL",
                    adminEmail,
                    encoded,
                    LocalDateTime.now()
            );
            log.info("Admin authentification created for {}.", adminEmail);
        } catch (Exception ex) {
            log.warn("Unable to ensure admin password for {}: {}", adminEmail, ex.getMessage());
        }
    }

    private void ensureDemoCustomer() {
        String userId = "c-demo-001";
        if (customerRepository.existsById(userId)) {
            return;
        }

        if (customerRepository.existsByEmail("customer@demo.com")) {
            return;
        }

        Customer customer = Customer.builder()
                .userId(userId)
                .email("customer@demo.com")
                .emailVerified(true)
                .firstName("Demo")
                .lastName("Customer")
                .build();
        customerRepository.save(customer);
        log.info("Demo Customer ensured: {} (customer@demo.com)", userId);
    }
}
