INSERT INTO restaurant_table (id, table_name, capacity) VALUES
  (1, 'Tisch 1', 2),
  (2, 'Tisch 2', 2),
  (3, 'Tisch 3', 4),
  (4, 'Tisch 4', 4),
  (5, 'Tisch 5', 4),
  (6, 'Tisch 6', 6),
  (7, 'Tisch 7', 6),
  (8, 'Tisch 8', 8),
  (9, 'Tisch 9', 8),
  (10, 'Tisch 10', 2);

INSERT INTO menu_item (id, name, description, price, category, image_url, available) VALUES
  (1, 'Margherita Pizza', 'Klassische Pizza mit Tomate, Mozzarella & Basilikum.', 9.90, 'Pizza', 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366', true),
  (2, 'Prosciutto Pizza', 'Pizza mit Prosciutto, Rucola & Parmesan.', 12.50, 'Pizza', 'https://images.unsplash.com/photo-1601924582975-7aa2a6d2cb52', true),
  (3, 'Spaghetti Carbonara', 'Mit Speck, Ei und Pecorino.', 11.50, 'Pasta', 'https://images.unsplash.com/photo-1528712306091-ed0763094c98', true),
  (4, 'Penne Arrabbiata', 'Scharfe Tomatensauce mit Knoblauch.', 10.20, 'Pasta', 'https://images.unsplash.com/photo-1521389508051-d7ffb5dc8a40', true),
  (5, 'Caesar Salad', 'Römersalat, Croutons, Parmesan, Caesar-Dressing.', 8.90, 'Salat', 'https://images.unsplash.com/photo-1551892589-865f69869476', true),
  (6, 'Burrata Bowl', 'Burrata, Ofengemüse, Pesto & Focaccia.', 13.20, 'Salat', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141', true),
  (7, 'Tiramisu', 'Hausgemacht mit Espresso und Mascarpone.', 6.50, 'Dessert', 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3', true),
  (8, 'Panna Cotta', 'Mit Vanille & Beerenragout.', 5.90, 'Dessert', 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40', true),
  (9, 'Limonade', 'Frisch gepresste Zitronenlimonade.', 3.50, 'Getränke', 'https://images.unsplash.com/photo-1527169402691-feff5539e52c', true),
  (10, 'Hauswein', '0,2l Weißwein vom Weingut.', 5.20, 'Getränke', 'https://images.unsplash.com/photo-1514361892635-6b07e31e75f9', true);
