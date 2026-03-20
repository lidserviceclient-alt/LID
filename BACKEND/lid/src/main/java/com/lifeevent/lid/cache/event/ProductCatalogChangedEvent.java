package com.lifeevent.lid.cache.event;

import java.util.Set;

public record ProductCatalogChangedEvent(Set<Long> productIds) {
}
