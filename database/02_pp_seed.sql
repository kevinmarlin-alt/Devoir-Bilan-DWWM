INSERT app_user (first_name, last_name, email, password_hash) VALUES 
('John', 'Doe', 'admin@private-place.fr', '$2b$10$uRES2KvnXjUYGLVj.xMZJO8WBIpOu/JOAZq4CyReGMnFQnJF0FqPC');

INSERT category (category_name, description) VALUES 
('Rustique', 'TBD'),
('Contemporain', 'TBD'),
('Architectural', 'TBD');

INSERT exploitation_type (exploitation_type_name, description) VALUES 
('Shooting', 'TBD'),
('Evénementiel', 'TBD'),
('Tournage', 'TBD'),
('Réception', 'TBD');

INSERT place (slug, name, description, additional_information, category_id, status) VALUES
('vila-romantique', 'Vila Romantique', 'Laboris anim non reprehenderit consectetur irure eiusmod minim ea. Duis non consectetur et mollit. Ea laboris veniam labore laborum minim aliqua ipsum voluptate. Incididunt officia do id nostrud Lorem aliquip ex nostrud est consequat officia cillum proident. Nulla anim proident id ex eiusmod.', 'TBD', 1, 'draft'),
('vila-romantique-published', 'Vila Romantique (publié)', 'Laboris anim non reprehenderit consectetur irure eiusmod minim ea. Duis non consectetur et mollit. Ea laboris veniam labore laborum minim aliqua ipsum voluptate. Incididunt officia do id nostrud Lorem aliquip ex nostrud est consequat officia cillum proident. Nulla anim proident id ex eiusmod.', 'TBD', 1, 'published'),
('vila-romantique-archived', 'Vila Romantique (archivé)', 'Laboris anim non reprehenderit consectetur irure eiusmod minim ea. Duis non consectetur et mollit. Ea laboris veniam labore laborum minim aliqua ipsum voluptate. Incididunt officia do id nostrud Lorem aliquip ex nostrud est consequat officia cillum proident. Nulla anim proident id ex eiusmod.', 'TBD', 1, 'archived');

INSERT image (slug, filename, alt) VALUES
('beach-club-atlantique', 'beach-club-atlantique.png', 'Beach club sur la côte Atlantique.'),
('chalet-alpin', 'chalet-alpin.png', 'Chalet au cœur des Alpes.'),
('chateau-loire', 'chateau-loire.png', 'Château de la Loire.'),
('domaine-viticole-bourgogne', 'domaine-viticole-bourgogne.png', 'Domaine viticole en Bourgogne.'),
('hotel-particulier-parisien', 'hotel-particulier-parisien.png', 'Hôtel particulier parisien.'),
('loft-industriel', 'loft-industriel.png', 'Loft industriel.'),
('mas-provencal-lavande', 'mas-provencal-lavande.png', 'Mas provençal entouré de lavande.'),
('riad-mediterraneen', 'riad-mediterraneen.png', 'Riad méditerranéen.'),
('salon-art-deco', 'salon-art-deco.png', 'Salon Art déco.'),
('villa-mediterranee-infinity-pool', 'villa-mediterranee-infinity-pool.png', 'Villa méditerranéenne avec piscine à débordement.');
