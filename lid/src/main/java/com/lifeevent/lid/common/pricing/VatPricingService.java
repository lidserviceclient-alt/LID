package com.lifeevent.lid.common.pricing;

import com.lifeevent.lid.backoffice.lid.setting.repository.BackOfficeAppConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class VatPricingService {

    private final BackOfficeAppConfigRepository appConfigRepository;

    public double resolveConfiguredVatRate() {
        return appConfigRepository.findTopByOrderByIdAsc()
                .map(cfg -> cfg.getVatPercent())
                .filter(value -> value != null && Double.isFinite(value) && value >= 0d)
                .map(value -> value > 1d ? value / 100d : value)
                .orElse(0.18d);
    }

    public double grossFromNet(double netAmount) {
        if (!Double.isFinite(netAmount) || netAmount <= 0d) {
            return 0d;
        }
        return round2(netAmount * (1d + resolveConfiguredVatRate()));
    }

    public BigDecimal grossFromNet(Double netAmount) {
        if (netAmount == null || !Double.isFinite(netAmount) || netAmount <= 0d) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return BigDecimal.valueOf(grossFromNet(netAmount.doubleValue()));
    }

    public double includedVatFromGross(double grossAmount) {
        if (!Double.isFinite(grossAmount) || grossAmount <= 0d) {
            return 0d;
        }
        double vatRate = resolveConfiguredVatRate();
        if (vatRate <= 0d) {
            return 0d;
        }
        return round2(grossAmount - (grossAmount / (1d + vatRate)));
    }

    private double round2(double value) {
        return Math.round(value * 100d) / 100d;
    }
}
