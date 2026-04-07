package com.lifeevent.lid.user.customer.repository;

import com.lifeevent.lid.user.customer.entity.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, String> {
    List<CustomerAddress> findByCustomer_UserIdOrderByCreatedAtDesc(String customerId);
    List<CustomerAddress> findByCustomer_UserIdAndIsDefaultTrue(String customerId);
    void deleteByCustomer_UserId(String customerId);
}
