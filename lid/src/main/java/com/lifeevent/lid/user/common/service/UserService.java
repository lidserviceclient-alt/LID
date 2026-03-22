package com.lifeevent.lid.user.common.service;


import com.lifeevent.lid.user.common.dto.UserDto;
import com.lifeevent.lid.user.customer.entity.Customer;
import com.lifeevent.lid.user.deliverydriver.entity.DelivryDriverProfileEntity;
import com.lifeevent.lid.user.partner.entity.Partner;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface UserService {

    /**
     * Récupérer un utilisateur par ID (sans distinction de type)
     * Utilise une requête optimisée SANS jointure aux sous-classes
     */
    UserDto getUserById(String id);
    
    /**
     * Lister tous les utilisateurs (Parents + Enfants via discriminator)
     * Requête optimisée sans jointures inutiles
     */
    Page<UserDto> getAllUsers(Pageable pageable);
    
    /**
     * Recherche par email sur TOUS les utilisateurs
     * (Customer, Admin, etc - tous les UserEntity)
     */
    Optional<UserDto> getUserByEmail(String email);

    /**
     * Vérifier si un email existe PARMI TOUS les utilisateurs
     * Requête très légère, aucune jointure
     */
    boolean emailExists(String email);

    Optional<Customer> getCustomerProfile(String userId);

    Optional<Partner> getPartnerProfile(String userId);

    Optional<DelivryDriverProfileEntity> getDeliveryProfile(String userId);

    Map<String, Customer> getCustomerProfilesByIds(Collection<String> userIds);

    Map<String, Partner> getPartnerProfilesByIds(Collection<String> userIds);

    Map<String, DelivryDriverProfileEntity> getDeliveryProfilesByIds(Collection<String> userIds);

    DelivryDriverProfileEntity getOrCreateDelivryDriverProfile(String userId);

    DelivryDriverProfileEntity upsertDelivryDriverProfile(String userId, String phoneNumber, String city, String country);

    Customer getOrCreateCustomerProfile(String userId);

    Customer upsertCustomerProfile(Customer customer);

    Customer getOrCreateCustomerAccount(String userId,
                                        String email,
                                        boolean emailVerified,
                                        String firstName,
                                        String lastName,
                                        Boolean blocked);

    Partner getOrCreatePartnerProfile(String userId);

    Partner upsertPartnerProfile(Partner partner);

}
