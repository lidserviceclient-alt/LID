package com.lifeevent.lid.auth.repository;

import com.lifeevent.lid.auth.entity.Authentication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthenticationRepository extends JpaRepository<Authentication, String> {

}
