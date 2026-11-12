# Guide des Commandes Git et GitHub

Ce document présente les commandes Git et GitHub les plus courantes pour gérer un projet.

## Configuration initiale

```bash
# Configurer votre nom d'utilisateur
git config --global user.name "VotreNom"

# Configurer votre adresse e-mail
git config --global user.email "votre@email.com"
```

## Créer et cloner un dépôt

```bash
# Initialiser un nouveau dépôt local
git init

# Cloner un dépôt GitHub existant
git clone https://github.com/utilisateur/nom-du-depot.git
```

## Gérer les fichiers

```bash
# Voir l'état des fichiers modifiés
git status

# Ajouter un fichier spécifique à la zone de staging
git add nom-du-fichier

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Description claire de la modification"
```

## Branches

```bash
# Lister toutes les branches
git branch

# Créer une nouvelle branche
git branch nom-de-la-branche

# Basculer sur une branche (Git 2.23+)
git switch nom-de-la-branche

# Créer et basculer sur une nouvelle branche en une seule commande (Git 2.23+)
git switch -c nom-de-la-branche

# Fusionner une branche dans la branche courante
git merge nom-de-la-branche

# Supprimer une branche locale
git branch -d nom-de-la-branche
```

## Synchronisation avec GitHub

```bash
# Envoyer les commits locaux vers GitHub
git push origin nom-de-la-branche

# Récupérer les modifications depuis GitHub
git pull origin nom-de-la-branche

# Ajouter un dépôt distant
git remote add origin https://github.com/utilisateur/nom-du-depot.git

# Voir les dépôts distants configurés
git remote -v
```

## Historique et comparaison

```bash
# Afficher l'historique des commits
git log

# Afficher l'historique en format condensé
git log --oneline

# Comparer les modifications non encore commitées
git diff

# Comparer deux branches
git diff branche1..branche2
```

## Annuler des modifications

```bash
# Annuler les modifications d'un fichier non encore stagé (Git 2.23+)
git restore nom-du-fichier

# Retirer un fichier de la zone de staging (Git 2.23+)
git restore --staged nom-du-fichier

# Revenir au dernier commit (attention : supprime les modifications non commitées)
git reset --hard HEAD
```

## Pull Requests sur GitHub

1. **Créer une branche** pour votre fonctionnalité ou correction.
2. **Pousser** la branche sur GitHub avec `git push origin nom-de-la-branche`.
3. Sur GitHub, cliquer sur **"Compare & pull request"**.
4. Rédiger un **titre** et une **description** clairs pour expliquer vos modifications.
5. Cliquer sur **"Create pull request"** pour soumettre la demande de fusion.
6. Attendre la **revue de code** par un collaborateur avant la fusion.

## Bonnes pratiques

- Faites des commits fréquents avec des messages clairs et descriptifs.
- Utilisez des branches dédiées pour chaque nouvelle fonctionnalité ou correction.
- Synchronisez régulièrement votre branche avec la branche principale (`git pull`).
- Relisez vos modifications avant de les envoyer (`git diff`, `git status`).
