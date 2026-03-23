package com.lifeevent.lid.common.cache.event;

import java.util.Set;

public record ReviewCatalogChangedEvent(Set<Long> productIds) {
}
