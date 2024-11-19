# Database Model Documentation

## Elements and Attributes

### 1. **Inventory Item**
- **Attribute**: `status`
- **Possible Values**: 
  - `In maintenance`
  - `Need for maintenance`
  - `Destroyed`
  - `Lend`
- **Description**: Describes availability besides reservation.

---

### 2. **Reservation**
- **Attribute**: `status`
- **Possible Values**: 
  - `Cancelled`
  - `Active`
- **Description**: Shows historical reservations.

---

### 3. **Person**
- **Attribute**: `role`
- **Possible Values**: 
  - `Member`
  - `Inventory Manager`
- **Description**: Describes the specific role of a user.
