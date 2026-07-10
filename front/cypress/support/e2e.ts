/**
 * Point d'entrée du support Cypress, chargé avant chaque fichier de spec.
 *
 * Aucun nettoyage explicite du stockage n'est nécessaire : depuis Cypress 12, cookies et
 * `localStorage` sont purgés automatiquement avant chaque test. Chaque `it` repart donc
 * d'une session vierge — ce qui rend `visitAuthenticated` obligatoire dans chaque test
 * authentifié, et non une seule fois dans un `before`.
 */
import './commands';