INSERT app_user (first_name, last_name, email, password_hash) VALUES 
('John', 'Doe', 'admin@private-place.fr', '$2y$10$MaowmX6dd9Pw4Jt7R/fkFe/5mIh61AlzJULaNFDulwG8us3R.Fk/m');

INSERT category (category_name, description) VALUES 
('Rustique', 'TBD'),
('Contemporain', 'TBD'),
('Architectural', 'TBD');

INSERT exploitation_type (exploitation_type_name, description) VALUES 
('Shooting', 'TBD'),
('Evénementiel', 'TBD'),
('Tournage', 'TBD'),
('Réception', 'TBD');

INSERT place (slug, name, description, additional_information, category_name) VALUES
('vila-romantique', 'Vila Romantique', 'Laboris anim non reprehenderit consectetur irure eiusmod minim ea. Duis non consectetur et mollit. Ea laboris veniam labore laborum minim aliqua ipsum voluptate. Incididunt officia do id nostrud Lorem aliquip ex nostrud est consequat officia cillum proident. Nulla anim proident id ex eiusmod.', 'TBD', 'Rustique');

INSERT image (url, alt) VALUES
('contemporain_home.jpg', 'Do enim occaecat elit ut deserunt pariatur nisi laborum cillum.');
