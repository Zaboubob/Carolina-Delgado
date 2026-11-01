# Carolina Delgado — Galerie d’art

Site statique en français, compatible GitHub Pages. Ouvrir avec un serveur HTTP local (`python -m http.server 8000`).

## Contenu
- `works.json` : inventaire éditorial des six peintures et dix dessins. Les titres absents sont explicitement signalés. Descriptions originales en anglais conservées.
- `assets/` : copies locales des images et vidéos dans le paquet de publication. `asset-manifest.json` et `scripts/build.py` permettent leur récupération depuis le portfolio.
- `portfolio-source.json` : contenu structuré du portfolio source pour conserver textes, références et variantes.
- `products.json` : inventaire boutique vide prêt à compléter. Aucun prix, disponibilité ou paiement inventé.
- `commandes.html` : formulaire qui prépare un courriel, sans serveur ni stockage.

## Prochaines étapes commerciales
Confirmer prix, stocks, dimensions et titres ; ajouter les produits ; choisir un prestataire de paiement et configurer livraison, taxes, conditions de vente et confidentialité avant ouverture de la vente. Les articles et vlogs futurs ne sont pas encore publiés.

## Publication
Le workflow GitHub Actions construit le site, importe les médias et publie GitHub Pages. Si la création automatique de Pages est refusée, sélectionner Settings → Pages → Source: GitHub Actions, puis relancer le workflow. Tous les chemins sont relatifs pour fonctionner dans un sous-répertoire.

Source : https://carolinadelgado.my.canva.site/portfolio
Œuvres, textes et photographies : Carolina Delgado.
