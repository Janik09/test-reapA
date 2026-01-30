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
  (1, 'Margherita Pizza', 'Klassische Pizza mit Tomate, Mozzarella & Basilikum.', 9.90, 'MAIN', '/img/PizzaMargarita.jpg', true),
  (2, 'Prosciutto Pizza', 'Pizza mit Prosciutto, Rucola & Parmesan.', 12.50, 'MAIN', '/img/PizzaProsciutto.png', true),
  (3, 'Spaghetti Carbonara', 'Mit Speck, Ei und Pecorino.', 11.50, 'MAIN', '/img/SpaghettiCarbonara.jpg', true),
  (4, 'Penne Arrabbiata', 'Scharfe Tomatensauce mit Knoblauch.', 10.20, 'MAIN', '/img/PenneArrabbiata.jpg', true),
  (5, 'Caesar Salad', 'Römersalat, Croutons, Parmesan, Caesar-Dressing.', 8.90, 'STARTER', '/img/CeasarSalad.jpg', true),
  (6, 'Burrata Bowl', 'Burrata, Ofengemüse, Pesto & Focaccia.', 13.20, 'STARTER', '/img/Burrata.jpg', true),
  (7, 'Tiramisu', 'Hausgemacht mit Espresso und Mascarpone.', 6.50, 'DESSERT', '/img/Tiramisu.jpg', true),
  (8, 'Panna Cotta', 'Mit Vanille & Beerenragout.', 5.90, 'DESSERT', '/img/PannaCotta.jpg', true),
  (9, 'Limonade', 'Frisch gepresste Zitronenlimonade.', 3.50, 'DRINK', '/img/lemonade.jpg', true),
  (10, 'Hauswein', '0,2l Weißwein vom Weingut.', 5.20, 'DRINK', '/img/wine.jpg', true);
