package com.smartbank.manager.onboarding;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {
    List<KycDocument> findByRequestRequestId(Long requestId);
}
