-- Données de référence : sujets (topics) prédéfinis du MVP.
-- Idempotent (INSERT IGNORE) : la contrainte UNIQUE sur title empêche les doublons
-- si la migration est rejouée sur une base contenant déjà ces sujets.
INSERT IGNORE INTO topics (title, description) VALUES
  ('Java',       'Langage orienté objet de la JVM, robuste et fortement typé.'),
  ('Angular',    'Framework front-end TypeScript pour applications web SPA.'),
  ('Spring',     'Écosystème Java pour le développement d''applications d''entreprise.'),
  ('DevOps',     'Culture et outils d''intégration et de déploiement continus (CI/CD).'),
  ('Python',     'Langage polyvalent et lisible, prisé en data science et scripting.'),
  ('React',      'Bibliothèque JavaScript pour construire des interfaces utilisateur.');