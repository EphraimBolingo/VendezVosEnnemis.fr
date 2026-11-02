# Plan — VendezVosEnnemis.Fr

## Approche

Créer une landing page monopage statique servie depuis le projet Webdev, en HTML, CSS et JavaScript natifs, sans framework ni dépendance externe. La page doit conserver toute la matière du brief — sections, valeurs, répliques, témoignages, FAQ, offres, contacts et popups — avec une finition de fintech internationale et un humour impassible.

Les interactions s’effectuent sans rechargement : navigation interne fluide, requête `fetch` asynchrone vers un petit fichier JSON local pour les données éditoriales, simulateur, progression de dossier, accordéons, tableau de bord illustratif et notifications/toasts. La simulation ne collecte aucun nom ni donnée personnelle et ne déclenche aucun paiement, transfert ou échange réel : montants, certifications, classements et événements sont fictifs et présentés comme une satire/concept. Les résultats de base reprennent exactement le total et les bonus demandés; les quantités choisies modulent les montants selon une formule visible et cohérente.

L’image héro demandée sera une illustration photoréaliste générée pour ce projet, montrant des partenaires fictifs en négociation dans une tour dominant Kinshasa, sans violence ni imagerie horrifique. Les cartes de catégories auront des illustrations en SVG/CSS intégrées au code, sans dépendance externe. Les contrôles seront accessibles au clavier, adaptés aux écrans mobiles et respecteront `prefers-reduced-motion`.

## Structure du projet

- `index.html` — document sémantique, métadonnées, navigation et sections de la page.
- `styles.css` — système visuel, responsive, animations, états et composants.
- `app.js` — chargement asynchrone des données, navigation sans rechargement, simulateur, revue/confirmation de vente, progression, reçu, tableau de bord de session, FAQ et notifications.
- `data/site.json` — textes et données statiques consommés avec `fetch`.
- Le héros utilise le visuel IA généré pour Kinshasa, servi depuis le stockage Webdev à l’emplacement `/manus-storage/async-images/…/image-1.webp`.
- `manus-routes.json` — manifeste de route statique (une page : `/`).

Aucune API serveur, base de données, police distante, bibliothèque ou requête à un service tiers n’est nécessaire. Le serveur de prévisualisation sera un serveur statique minimal; la publication éventuelle utilisera une sortie statique sans compilation ni installation de dépendances.

## Direction artistique

- **Mouvement** : fintech éditoriale premium, à la rencontre d’une interface financière sobre et d’un magazine économique contemporain, détournée par une satire familiale traitée comme un dossier d’investissement.
- **Principes** : contraste fort et hiérarchie éditoriale; densité maîtrisée de données et de microcopies; or et bleu électrique employés comme signaux fonctionnels; animations rares, précises et accessibles.
- **Philosophie des couleurs** : noir profond et blanc cassé pour la confiance institutionnelle; or champagne pour les montants et la fausse réussite; bleu électrique pour les actions et les indications de technologie. Dégradés discrets, sans surcharge.
- **Mise en page** : composition éditoriale asymétrique, grand héros en deux plans avec texte et photographie, bandeau de confiance, sections aérées et larges panneaux de données; éviter une grille générique de cartes partout.
- **Signatures visuelles** : monogramme typographique « V/E » dessiné en SVG; filets dorés et détails de terminal analytique; pastilles de statut et toasts de « dossiers approuvés ».
- **Philosophie d’interaction** : chaque action ressemble à un geste de banque privée, mais révèle l’absurdité du concept; retours immédiats, explicites, clavier compris, sans navigation ni transaction réelle.
- **Animation** : compteurs progressifs, progression de dossier rythmée, apparition légère au défilement et notifications discrètes; éviter le clignotement et toute animation non essentielle; suspendre ou réduire le mouvement selon les préférences du système.
- **Typographie** : pile native sans-serif (`Inter` si disponible, sinon system-ui) pour l’interface et les grands titres; Georgia pour quelques accents éditoriaux; chiffres tabulaires pour statistiques et montants. Aucune police chargée depuis Internet.
- **Essence de marque** : la plateforme qui convertit les irritants relationnels en richesse imaginaire, pour les victimes de conseils non sollicités; **imperturbable, luxueuse, absurde**.
- **Voix** : slogans de banque privée appliqués à des contrariétés familiales. Exemples : « Votre oncle a été évalué. Votre potentiel, réévalué. » et « La nuisance relationnelle est un actif sous-exploité. »
- **Wordmark** : « VendezVosEnnemis.Fr » dessiné avec un petit monogramme V/E géométrique, plutôt qu’un pictogramme bancaire générique.
- **Couleur signature** : or champagne profond (`#D4AF62`), reconnaissable sur fond noir et réservé aux valeurs premium.

## Comportement éditorial et contenu

Le site reprend les chiffres fournis, y compris 4 857 291 ennemis convertis, 897 milliards $, les offres à 2 / 5 / 50 millions, les trois témoignages avec leurs notes, l’email `support@vendezvosemnemis.fr` et le téléphone `+666 666 666`. La FAQ inclut exactement les réponses prescrites. Les données sont des éléments de fiction : la mention de concept satirique est discrète mais claire, notamment dans le pied de page et le résultat du simulateur. Les six cartes de relations conduisent au simulateur ; la sélection du Scammeur WhatsApp est disponible avec une quantité initiale de zéro afin de préserver le total de 3 850 000 $ des cinq catégories initiales. « PROCÉDER À LA VENTE » ouvre une revue explicite du montant et des membres sélectionnés; une confirmation séparée lance une progression transactionnelle, puis un reçu horodaté et un suivi dans le tableau de bord. Les références et l’historique restent en session navigateur; aucune opération financière réelle n’a lieu.


## Parcours de vente simulée — exigence ajoutée après le retour d’usage

Le démarrage doit charger les données avant tout rendu dépendant de celles-ci, faute de quoi les cartes et commandes dynamiques restent invisibles. Après le choix d’un type de membre et l’analyse, le visiteur voit un récapitulatif clair de son dossier et doit confirmer la vente dans une étape explicite. La confirmation lance une progression de statut crédible à l’écran (réception, vérification, validation, consultation, génération et ordre créé), attribue une référence de transaction horodatée, indique le montant approuvé, affiche le délai de versement annoncé de 48 heures ouvrables, puis présente un reçu et un état consultable dans le tableau de bord. L’historique de cette démonstration peut rester dans la session navigateur ; aucun paiement, virement, service ou backend réel n’est exécuté. Le libellé de l’interface doit présenter ces actions comme une simulation, tout en donnant au parcours l’apparence soignée d’un suivi bancaire.


## Disponibilité du Scammeur WhatsApp

La carte « SCAMMEUR WHATSAPP » est sélectionnable comme les autres catégories. Son champ optionnel est ajouté au simulateur mais vaut zéro par défaut ; sa sélection seule produit un devis personnalisé sans modifier le total par défaut des cinq catégories originales.
