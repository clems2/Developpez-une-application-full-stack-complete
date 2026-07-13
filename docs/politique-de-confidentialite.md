# Politique de confidentialité

_Dernière mise à jour : 13/07/2026_

> **Avertissement** — Document rédigé dans le cadre d'un projet pédagogique
> (OpenClassrooms, Projet 5). L'application MDD et la société éditrice sont fictives.
> Ce modèle n'a pas de valeur juridique certifiée ; une mise en production réelle
> nécessiterait la validation d'un professionnel.

## 1. Responsable du traitement

Le responsable du traitement des données personnelles est l'éditeur de l'application
MDD (Monde de Dév), dont les coordonnées figurent dans les
[Mentions légales](./mentions-legales.md).

## 2. Données collectées

MDD collecte uniquement les données strictement nécessaires à son fonctionnement :

| Donnée | Finalité | Origine |
|---|---|---|
| Nom d'utilisateur | Identification, affichage comme auteur | Fournie à l'inscription |
| Adresse e-mail | Identification, connexion | Fournie à l'inscription |
| Mot de passe | Authentification | Fourni à l'inscription, **stocké haché** (jamais en clair) |
| Articles publiés | Fonctionnement du fil d'actualité | Créés par l'utilisateur |
| Commentaires | Fonctionnement des discussions | Créés par l'utilisateur |
| Abonnements aux thèmes | Personnalisation du fil d'actualité | Choisis par l'utilisateur |

MDD **ne collecte pas** de données de navigation à des fins publicitaires, ne dépose
pas de cookies tiers, et n'utilise pas d'outils de traçage.

## 3. Finalités et base légale

Les données sont traitées pour :

- permettre la création et la gestion d'un compte utilisateur ;
- authentifier l'utilisateur à chaque connexion ;
- afficher les contenus qu'il publie (articles, commentaires) en l'identifiant comme auteur ;
- personnaliser son fil d'actualité selon ses abonnements.

La base légale du traitement est l'**exécution du service** demandé par l'utilisateur
lors de son inscription (article 6.1.b du RGPD).

## 4. Sécurité des données

MDD met en œuvre les mesures suivantes pour protéger les données :

- **mots de passe hachés** avec un algorithme de hachage à sens unique (BCrypt) —
  ils ne sont jamais stockés ni journalisés en clair ;
- **authentification par jeton JWT** signé, transmis via un en-tête sécurisé ;
- **absence de journalisation des données sensibles** : ni mot de passe, ni jeton,
  ni requête SQL contenant des paramètres personnels n'apparaissent dans les logs de
  production ;
- **communication chiffrée** recommandée en production (HTTPS).

## 5. Durée de conservation

Les données sont conservées tant que le compte de l'utilisateur est actif. En cas de
demande de suppression du compte, les données personnelles associées sont supprimées.

## 6. Partage des données

MDD **ne partage, ne vend et ne loue aucune donnée personnelle** à des tiers. Les
données restent internes au service et ne sont accessibles qu'aux personnes habilitées
à assurer le fonctionnement de l'application.

## 7. Vos droits

Conformément au RGPD, vous disposez des droits suivants sur vos données :

- **droit d'accès** : obtenir une copie des données vous concernant ;
- **droit de rectification** : corriger vos données (nom d'utilisateur, e-mail via
  votre profil) ;
- **droit à l'effacement** : demander la suppression de votre compte et de vos données ;
- **droit d'opposition** et **droit à la limitation** du traitement ;
- **droit à la portabilité** de vos données.

Pour exercer ces droits, contactez l'éditeur à l'adresse indiquée dans les
[Mentions légales](./mentions-legales.md). Vous disposez également du droit d'introduire
une réclamation auprès de la CNIL (www.cnil.fr).

## 8. Modification de la politique

Cette politique de confidentialité peut être mise à jour. La date de dernière mise à
jour figure en tête de document.