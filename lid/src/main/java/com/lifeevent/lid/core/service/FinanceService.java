package com.lifeevent.lid.core.service;

import com.lifeevent.lid.core.dto.FinanceOverviewDto;
import com.lifeevent.lid.core.dto.FinanceTransactionDto;
import com.lifeevent.lid.core.entity.Paiement;
import com.lifeevent.lid.core.enums.StatutPaiement;
import com.lifeevent.lid.core.repository.PaiementRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class FinanceService {

    private final PaiementRepository paiementRepository;

    public FinanceService(PaiementRepository paiementRepository) {
        this.paiementRepository = paiementRepository;
    }

    @Transactional(readOnly = true)
    public FinanceOverviewDto overview(int days) {
        int safeDays = Math.max(1, Math.min(days, 365));
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);

        BigDecimal inflows = paiementRepository.sumMontantByStatutSince(StatutPaiement.SUCCES, from);
        BigDecimal outflows = paiementRepository.sumMontantByStatutSince(StatutPaiement.REMBOURSE, from);
        BigDecimal pending = paiementRepository.sumMontantByStatutSince(StatutPaiement.EN_ATTENTE, from);

        BigDecimal totalSuccess = paiementRepository.sumMontantByStatutSince(StatutPaiement.SUCCES, null);
        BigDecimal totalRefunded = paiementRepository.sumMontantByStatutSince(StatutPaiement.REMBOURSE, null);
        BigDecimal available = totalSuccess.subtract(totalRefunded);

        return new FinanceOverviewDto(available, inflows, outflows, pending, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<FinanceTransactionDto> latestTransactions(int size) {
        int safeSize = Math.max(1, Math.min(size, 200));

        List<Paiement> paiements = paiementRepository.findLatest(PageRequest.of(0, safeSize)).getContent();
        return paiements.stream().map((p) -> {
            boolean isRefund = p.getStatut() == StatutPaiement.REMBOURSE;
            BigDecimal amount = p.getMontant() != null ? p.getMontant() : BigDecimal.ZERO;
            if (isRefund) amount = amount.negate();
            return new FinanceTransactionDto(
                    p.getTransactionId() != null ? p.getTransactionId() : p.getId(),
                    isRefund ? "Remboursement" : "Paiement",
                    p.getFournisseur() != null ? p.getFournisseur() : "-",
                    amount,
                    mapPaiementStatus(p.getStatut()),
                    p.getDatePaiement()
            );
        }).toList();
    }

    @Transactional(readOnly = true)
    public String exportCsv(int days) {
        int safeDays = Math.max(1, Math.min(days, 365));
        LocalDateTime from = LocalDateTime.now().minusDays(safeDays);
        List<FinanceTransactionDto> txs = latestTransactions(200).stream()
                .filter((t) -> t.date() == null || !t.date().isBefore(from))
                .toList();
        StringBuilder sb = new StringBuilder();
        sb.append("id;type;method;amount;status;date\n");
        for (FinanceTransactionDto tx : txs) {
            sb.append(escape(tx.id())).append(';')
                    .append(escape(tx.type())).append(';')
                    .append(escape(tx.method())).append(';')
                    .append(tx.amount() != null ? tx.amount().toPlainString() : "0").append(';')
                    .append(escape(tx.status())).append(';')
                    .append(tx.date() != null ? tx.date().toString() : "")
                    .append('\n');
        }
        return sb.toString();
    }

    private static String mapPaiementStatus(StatutPaiement statut) {
        if (statut == null) return "-";
        return switch (statut) {
            case SUCCES -> "Succes";
            case EN_ATTENTE -> "En attente";
            case ECHEC -> "Échec";
            case REMBOURSE -> "Remboursée";
        };
    }

    private static String escape(String value) {
        if (value == null) return "";
        String v = value.replace("\n", " ").replace("\r", " ").trim();
        return v.replace(";", ",");
    }
}
