package com.lifeevent.lid.cache.event;

import java.util.Set;

public record ReviewCatalogChangedEvent(Set<Long> productIds) {
}
