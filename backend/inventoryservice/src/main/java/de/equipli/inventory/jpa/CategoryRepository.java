package de.equipli.inventory.jpa;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CategoryRepository implements PanacheRepository<Category> {

    public Category findByItemId(Long itemId) {
        return find("SELECT c FROM Category c JOIN c.items i WHERE i.id = ?1", itemId).firstResult();
    }

}