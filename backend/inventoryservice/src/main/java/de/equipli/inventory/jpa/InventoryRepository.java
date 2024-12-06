package de.equipli.inventory.jpa;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InventoryRepository implements PanacheRepository<InventoryItem> {

    public Category findCategoryByItemId(Long itemId) {
        return find("id", itemId).firstResult().getCategory();
    }

}