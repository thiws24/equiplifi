package de.thi.inv;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InventoryItemRepository implements PanacheRepository<InventoryItem> {
    // Quarkus
}
