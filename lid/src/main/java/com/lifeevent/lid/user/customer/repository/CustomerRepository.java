package com.lifeevent.lid.user.customer.repository;

import com.lifeevent.lid.order.enumeration.Status;
import com.lifeevent.lid.user.customer.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {

    interface CustomerBasicView {
        String getUserId();
        String getEmail();
        String getFirstName();
        String getLastName();
        String getPhoneNumber();
    }

    interface TopCustomerPointsView {
        String getUserId();
        String getEmail();
        String getPhoneNumber();
        Double getScore();
    }
    
    @Override
    @EntityGraph(attributePaths = {"user"})
    Optional<Customer> findById(String userId);

    @Override
    @EntityGraph(attributePaths = {"user"})
    Page<Customer> findAll(Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user"})
    List<Customer> findAllById(Iterable<String> userIds);

    /**
     * Recherche par email - charge UNIQUEMENT le Customer avec ses données spécifiques
     * Sans jointure inutile à la table parent si pas nécessaire
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT c FROM Customer c WHERE c.user.email = :email")
    Optional<Customer> findByEmail(@Param("email") String email);
    
    /**
     * Vérifier si un email existe dans les Customers - requête très légère
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Customer c WHERE c.user.email = :email")
    boolean existsByEmail(@Param("email") String email);
    
    /**
     * Récupérer un Customer par ID avec tous ses champs
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT c FROM Customer c WHERE c.userId = :userId")
    Optional<Customer> findByUserId(@Param("userId") String userId);

    @Query("SELECT c.user.email FROM Customer c WHERE c.user.email IS NOT NULL")
    List<String> findClientEmails();

    @Query("SELECT c.phoneNumber FROM Customer c WHERE c.phoneNumber IS NOT NULL")
    List<String> findClientPhones();

    @Query("""
        SELECT c.userId AS userId,
               c.user.email AS email,
               c.user.firstName AS firstName,
               c.user.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
    """)
    List<CustomerBasicView> findAllBasic();

    @Query("""
        SELECT c.userId AS userId,
               c.user.email AS email,
               c.user.firstName AS firstName,
               c.user.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
    """)
    Page<CustomerBasicView> findAllBasic(Pageable pageable);

    @Query("""
        SELECT c.userId AS userId,
               c.user.email AS email,
               c.user.firstName AS firstName,
               c.user.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
        WHERE (
            :q IS NULL OR :q = '' OR
            LOWER(CAST(c.user.email AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.user.firstName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.user.lastName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.phoneNumber AS string)) LIKE LOWER(CONCAT('%', :q, '%'))
        )
    """)
    List<CustomerBasicView> searchBasic(@Param("q") String q);

    @Query("""
        SELECT c.userId AS userId,
               c.user.email AS email,
               c.user.firstName AS firstName,
               c.user.lastName AS lastName,
               c.phoneNumber AS phoneNumber
        FROM Customer c
        WHERE (
            :q IS NULL OR :q = '' OR
            LOWER(CAST(c.user.email AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.user.firstName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.user.lastName AS string)) LIKE LOWER(CONCAT('%', :q, '%')) OR
            LOWER(CAST(c.phoneNumber AS string)) LIKE LOWER(CONCAT('%', :q, '%'))
        )
    """)
    Page<CustomerBasicView> searchBasic(@Param("q") String q, Pageable pageable);

    @Query("""
        SELECT c.userId AS userId,
               c.user.email AS email,
               c.phoneNumber AS phoneNumber,
               (
                   FLOOR(
                       (SELECT COALESCE(SUM(o.amount), 0)
                        FROM Order o
                        WHERE o.customer.userId = c.userId
                          AND o.currentStatus = :status) * :pointsPerFcfa
                   )
                   + (SELECT COALESCE(SUM(a.deltaPoints), 0)
                      FROM LoyaltyPointAdjustment a
                      WHERE a.customer.userId = c.userId)
               ) AS score
        FROM Customer c
        ORDER BY score DESC, LOWER(COALESCE(c.user.email, '')) ASC
    """)
    List<TopCustomerPointsView> findTopCustomersByPoints(
            @Param("status") Status status,
            @Param("pointsPerFcfa") double pointsPerFcfa,
            Pageable pageable
    );
}
