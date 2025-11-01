# 📋 Base de Connaissance - La Cantinière

## 🎯 Stack Technique Principal

### Framework & Version
- **Angular 20.3.0** (dernière version stable)
- Mode **Zoneless** (provideZonelessChangeDetection)
- TypeScript 5.9.2
- SCSS pour les styles

### Configuration Angular
```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(), // ⚠️ Pas de ngZone
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
```

## 🎨 UI Framework - PrimeNG Ecosystem

### ⚠️ RÈGLE ABSOLUE : Utiliser OBLIGATOIREMENT PrimeNG et PrimeFlex

**Packages UI installés :**
- **primeng** `^20.3.0` - Bibliothèque de composants UI
- **primeflex** `^4.0.0` - Utilitaires CSS flexbox/grid (alternative à Tailwind/Bootstrap)
- **primeicons** `^7.0.0` - Icônes officielles PrimeNG
- **@primeuix/themes** `^1.2.5` - Système de thèmes (Aura actuellement configuré)

### 📐 Layout avec PrimeFlex Grid (PRIORITAIRE)

**✅ UTILISER PRINCIPALEMENT LE SYSTÈME GRID - C'EST LE PLUS SIMPLE**

```html
<!-- Grid simple - 12 colonnes responsive -->
<div class="grid">
  <div class="col-12 md:col-6 lg:col-4">Colonne 1</div>
  <div class="col-12 md:col-6 lg:col-4">Colonne 2</div>
  <div class="col-12 md:col-12 lg:col-4">Colonne 3</div>
</div>

<!-- Grid avec gap (espacement) -->
<div class="grid gap-3">
  <div class="col-6">50%</div>
  <div class="col-6">50%</div>
</div>

<!-- Grid avec padding -->
<div class="grid p-4">
  <div class="col-12">Full width</div>
  <div class="col-4">33%</div>
  <div class="col-8">66%</div>
</div>
```

### Classes Grid PrimeFlex essentielles

**Conteneur :**
- `grid` - Active le système de grille

**Colonnes (12 colonnes au total) :**
- `col-1` à `col-12` - Taille fixe
- `col` - Taille automatique

**Responsive breakpoints :**
- `sm:col-*` - Petits écrans (≥576px)
- `md:col-*` - Moyens écrans (≥768px)
- `lg:col-*` - Grands écrans (≥992px)
- `xl:col-*` - Très grands écrans (≥1200px)

**Spacing :**
- `gap-1` à `gap-8` - Espacement entre colonnes
- `p-1` à `p-8` - Padding
- `m-1` à `m-8` - Margin

**Autres utilitaires :**
- `w-full` - Width 100%
- `h-full` - Height 100%
- `text-center` - Centrer le texte
- `text-left`, `text-right` - Alignement texte

### Flexbox (usage ponctuel uniquement)

Utiliser Flexbox **uniquement** pour des alignements simples :

```html
<!-- Centrage simple -->
<div class="flex justify-content-center align-items-center">
  <p-button label="Centré"></p-button>
</div>

<!-- Gap entre éléments -->
<div class="flex gap-2">
  <p-button label="Button 1"></p-button>
  <p-button label="Button 2"></p-button>
</div>
```

## 📦 Composants PrimeNG Disponibles

### Composants de base à utiliser
- **p-button** - Boutons
- **p-card** - Cartes
- **p-panel** - Panneaux
- **p-inputText** - Champs texte
- **p-floatLabel** - Labels flottants
- **p-dropdown** - Listes déroulantes
- **p-calendar** - Sélecteur de dates
- **p-table** - Tableaux de données
- **p-dialog** - Dialogues/modales
- **p-toast** - Notifications
- **p-menu** - Menus
- **p-menubar** - Barre de menu
- **p-toolbar** - Barre d'outils
- **p-dataview** - Vues de données
- **p-paginator** - Pagination

### Exemple complet

```html
<div class="grid gap-3 p-4">
  <!-- Header full width -->
  <div class="col-12">
    <p-card header="Dashboard">
      <p>Contenu du header</p>
    </p-card>
  </div>

  <!-- 2 colonnes responsive -->
  <div class="col-12 md:col-6">
    <p-panel header="Formulaire">
      <p-floatLabel>
        <input pInputText id="username" />
        <label for="username">Username</label>
      </p-floatLabel>
    </p-panel>
  </div>

  <div class="col-12 md:col-6">
    <p-panel header="Aperçu">
      <p>Contenu aperçu</p>
    </p-panel>
  </div>

  <!-- 3 colonnes sur grand écran -->
  <div class="col-12 lg:col-4">
    <p-button label="Action 1" icon="pi pi-check" class="w-full"></p-button>
  </div>
  <div class="col-12 lg:col-4">
    <p-button label="Action 2" icon="pi pi-times" class="w-full"></p-button>
  </div>
  <div class="col-12 lg:col-4">
    <p-button label="Action 3" icon="pi pi-save" class="w-full"></p-button>
  </div>
</div>
```

## 🎨 PrimeIcons

Utiliser les icônes **PrimeIcons** avec le préfixe `pi pi-*` :

```html
<p-button icon="pi pi-check" label="Valider"></p-button>
<p-button icon="pi pi-times" label="Annuler"></p-button>
<p-button icon="pi pi-save" label="Enregistrer"></p-button>
<p-button icon="pi pi-trash" label="Supprimer"></p-button>
<p-button icon="pi pi-pencil" label="Éditer"></p-button>
<p-button icon="pi pi-search" label="Rechercher"></p-button>
<p-button icon="pi pi-plus" label="Ajouter"></p-button>
<p-button icon="pi pi-user" label="Utilisateur"></p-button>
```

Documentation complète : https://primeng.org/icons

## 📁 Structure du Projet

```
la-cantiniere/
├── src/
│   ├── app/
│   │   ├── app.config.ts      # Configuration Angular + PrimeNG
│   │   ├── app.routes.ts      # Routes de l'application
│   │   ├── app.ts             # Composant principal
│   │   ├── app.html           # Template principal
│   │   └── app.scss           # Styles du composant principal
│   ├── styles.scss            # Styles globaux
│   ├── main.ts                # Point d'entrée
│   └── index.html             # HTML racine
├── public/                    # Assets publics
├── angular.json               # Configuration Angular CLI
├── package.json               # Dépendances npm
├── tsconfig.json              # Configuration TypeScript
└── KNOWLEDGE_BASE.md          # Ce fichier
```

## ✅ Règles de Développement STRICTES

### 1. UI Components
- ✅ Utiliser **EXCLUSIVEMENT PrimeNG** pour tous les composants UI
- ❌ Ne pas utiliser de HTML natif pour les boutons, inputs, etc.
- ✅ Toujours vérifier la documentation PrimeNG : https://primeng.org

### 2. Layout
- ✅ Utiliser **PRINCIPALEMENT le système Grid de PrimeFlex** (le plus simple)
- ✅ Grid pour tous les layouts de page et sections
- ✅ Flexbox uniquement pour des alignements ponctuels simples
- ❌ Pas de CSS Grid natif ou Flexbox natif

### 3. Styling
- ✅ SCSS pour les styles custom
- ✅ Classes utilitaires PrimeFlex pour spacing, sizing, etc.
- ✅ Thème Aura de PrimeNG

### 4. Icons
- ✅ Utiliser **UNIQUEMENT PrimeIcons** (`pi pi-*`)
- ❌ Pas de Font Awesome, Material Icons, etc.

### 5. Architecture Angular
- ✅ Mode **Zoneless** (pas de ngZone)
- ✅ Standalone components
- ✅ TypeScript strict mode
- ✅ Animations asynchrones

### 6. Imports
Toujours importer les modules PrimeNG dans les composants :

```typescript
import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonModule, CardModule, InputTextModule],
  templateUrl: './example.component.html'
})
export class ExampleComponent {}
```

## 🛠️ Commandes Utiles

```bash
# Démarrer le serveur de développement
npm start
# ou
ng serve

# Générer un nouveau composant
ng generate component nom-composant
# ou
ng g c nom-composant

# Build de production
ng build

# Lancer les tests
npm test
# ou
ng test
```

## 📚 Documentation de Référence

- **PrimeNG** : https://primeng.org
- **PrimeFlex** : https://primeflex.org
- **PrimeIcons** : https://primeng.org/icons
- **Angular** : https://angular.dev
- **Angular CLI** : https://angular.dev/tools/cli

## 🎨 Thème Aura

Le projet utilise le thème **Aura** de PrimeNG (@primeuix/themes).

Configuration dans `app.config.ts` :
```typescript
providePrimeNG({
  theme: {
    preset: Aura,
  },
})
```

---

**Date de création** : 1 novembre 2025  
**Version Angular** : 20.3.0  
**Version PrimeNG** : 20.3.0  
**Version PrimeFlex** : 4.0.0
