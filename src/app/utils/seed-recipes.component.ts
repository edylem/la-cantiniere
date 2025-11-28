import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../services/firestore.service';
import { RecipeModel } from '../models/recipe.model';

/**
 * Script utilitaire pour insérer des recettes de test.
 * À supprimer après utilisation.
 */
@Component({
  selector: 'app-seed-recipes',
  standalone: true,
  template: `<p>Seeding recipes... Check console.</p>`,
})
export class SeedRecipesComponent implements OnInit {
  constructor(private firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.cleanAndSeedRecipes();
  }

  private cleanAndSeedRecipes(): void {
    // D'abord supprimer toutes les recettes existantes
    this.firestoreService.getAllDocuments<any>('recipes').subscribe({
      next: (docs) => {
        console.log(`🗑️ Suppression de ${docs.length} recettes existantes...`);
        docs.forEach((doc) => {
          this.firestoreService.deleteDocument('recipes', doc.id).subscribe({
            next: () => console.log(`  Supprimé: ${doc.id}`),
            error: (err) => console.error(`  Erreur suppression ${doc.id}:`, err),
          });
        });
        // Attendre un peu puis insérer les nouvelles
        setTimeout(() => this.seedRecipes(), 2000);
      },
      error: (err) => {
        console.error('Erreur récupération recettes:', err);
        this.seedRecipes();
      },
    });
  }

  private seedRecipes(): void {
    const recipes: Omit<RecipeModel, 'id'>[] = [
      {
        title: 'Boeuf Bourguignon',
        description: `1. Couper le boeuf en cubes de 4 cm.
2. Faire revenir les lardons dans une cocotte, réserver.
3. Faire dorer la viande dans la graisse des lardons, réserver.
4. Faire revenir les oignons et carottes 5 min.
5. Remettre la viande, ajouter la farine, mélanger.
6. Verser le vin rouge et le bouillon, ajouter le bouquet garni.
7. Laisser mijoter 2h30 à feu doux.
8. Ajouter les champignons 30 min avant la fin.
9. Servir avec des pommes de terre vapeur ou des pâtes fraîches.`,
        ingredients: [
          { name: 'Boeuf (paleron ou macreuse)', quantity: 1.2, unit: 'kg' },
          { name: 'Vin rouge Bourgogne', quantity: 75, unit: 'cl' },
          { name: 'Lardons fumés', quantity: 200, unit: 'g' },
          { name: 'Carottes', quantity: 4, unit: 'pièces' },
          { name: 'Oignons', quantity: 2, unit: 'pièces' },
          { name: 'Champignons de Paris', quantity: 250, unit: 'g' },
          { name: 'Bouillon de boeuf', quantity: 50, unit: 'cl' },
          { name: 'Farine', quantity: 2, unit: 'c. à soupe' },
          { name: 'Bouquet garni', quantity: 1, unit: 'pièce' },
        ],
        season: ['Automne', 'Hiver'],
        category: ['Pour les grandes occasions', 'Repas Gourmand'],
        personnes: 6,
        prepTime: 180,
        cost: 25,
      },
      {
        title: 'Quiche Lorraine',
        description: `1. Préchauffer le four à 180°C.
2. Étaler la pâte dans un moule à tarte, piquer le fond.
3. Faire revenir les lardons à sec, égoutter.
4. Battre les oeufs avec la crème fraîche, saler, poivrer, muscade.
5. Répartir les lardons sur la pâte.
6. Verser l'appareil à quiche.
7. Parsemer de gruyère râpé.
8. Enfourner 35-40 minutes jusqu'à ce que la quiche soit dorée.
9. Laisser tiédir 5 minutes avant de servir.`,
        ingredients: [
          { name: 'Pâte brisée', quantity: 1, unit: 'pièce' },
          { name: 'Lardons fumés', quantity: 200, unit: 'g' },
          { name: 'Oeufs', quantity: 3, unit: 'pièces' },
          { name: 'Crème fraîche épaisse', quantity: 20, unit: 'cl' },
          { name: 'Lait', quantity: 10, unit: 'cl' },
          { name: 'Gruyère râpé', quantity: 100, unit: 'g' },
          { name: 'Muscade', quantity: 1, unit: 'pincée' },
        ],
        season: ['Printemps', 'Été', 'Automne', 'Hiver'],
        category: ['Recette rapide'],
        personnes: 6,
        prepTime: 50,
        cost: 8,
      },
      {
        title: 'Ratatouille Provençale',
        description: `1. Laver et couper tous les légumes en cubes de 2 cm.
2. Faire revenir les oignons et l'ail dans l'huile d'olive.
3. Ajouter les poivrons, cuire 5 min.
4. Ajouter les aubergines, cuire 5 min.
5. Ajouter les courgettes et les tomates.
6. Assaisonner avec le thym, laurier, sel et poivre.
7. Couvrir et laisser mijoter 45 min à feu doux.
8. Rectifier l'assaisonnement, ajouter le basilic frais.
9. Servir chaud ou froid avec du riz ou du pain grillé.`,
        ingredients: [
          { name: 'Aubergines', quantity: 2, unit: 'pièces' },
          { name: 'Courgettes', quantity: 3, unit: 'pièces' },
          { name: 'Poivrons (rouge et jaune)', quantity: 2, unit: 'pièces' },
          { name: 'Tomates mûres', quantity: 4, unit: 'pièces' },
          { name: 'Oignon', quantity: 1, unit: 'pièce' },
          { name: 'Ail', quantity: 3, unit: 'gousses' },
          { name: "Huile d'olive", quantity: 4, unit: 'c. à soupe' },
          { name: 'Thym frais', quantity: 2, unit: 'branches' },
          { name: 'Basilic frais', quantity: 10, unit: 'feuilles' },
        ],
        season: ['Été'],
        category: ['Recette rapide'],
        personnes: 4,
        prepTime: 60,
        cost: 10,
      },
      {
        title: 'Blanquette de Veau',
        description: `1. Couper le veau en morceaux, mettre dans une cocotte avec de l'eau froide.
2. Porter à ébullition, écumer régulièrement.
3. Ajouter les carottes, poireaux, oignon piqué de clous de girofle, bouquet garni.
4. Laisser mijoter 1h30 à feu doux.
5. Préparer un roux blanc avec beurre et farine.
6. Filtrer le bouillon, l'incorporer au roux.
7. Mélanger les jaunes d'oeufs avec la crème, ajouter hors du feu.
8. Remettre la viande et les légumes dans la sauce.
9. Servir avec du riz blanc.`,
        ingredients: [
          { name: 'Épaule de veau', quantity: 1, unit: 'kg' },
          { name: 'Carottes', quantity: 4, unit: 'pièces' },
          { name: 'Poireaux', quantity: 2, unit: 'pièces' },
          { name: 'Oignon', quantity: 1, unit: 'pièce' },
          { name: 'Champignons de Paris', quantity: 200, unit: 'g' },
          { name: 'Crème fraîche', quantity: 20, unit: 'cl' },
          { name: "Jaunes d'oeufs", quantity: 2, unit: 'pièces' },
          { name: 'Beurre', quantity: 50, unit: 'g' },
          { name: 'Farine', quantity: 50, unit: 'g' },
          { name: 'Bouquet garni', quantity: 1, unit: 'pièce' },
        ],
        season: ['Automne', 'Hiver'],
        category: ['Pour les grandes occasions', 'Repas Gourmand'],
        personnes: 6,
        prepTime: 120,
        cost: 22,
      },
      {
        title: 'Crêpes Bretonnes',
        description: `1. Mélanger la farine et le sel dans un saladier.
2. Faire un puits, ajouter les oeufs battus.
3. Incorporer le lait progressivement en fouettant.
4. Ajouter le beurre fondu.
5. Laisser reposer la pâte 1h minimum.
6. Faire chauffer une poêle avec un peu de beurre.
7. Verser une louche de pâte, répartir en tournant.
8. Cuire 1-2 min de chaque côté.
9. Garnir selon vos envies : sucre, Nutella, confiture...`,
        ingredients: [
          { name: 'Farine', quantity: 250, unit: 'g' },
          { name: 'Oeufs', quantity: 4, unit: 'pièces' },
          { name: 'Lait', quantity: 50, unit: 'cl' },
          { name: 'Beurre fondu', quantity: 50, unit: 'g' },
          { name: 'Sucre', quantity: 2, unit: 'c. à soupe' },
          { name: 'Sel', quantity: 1, unit: 'pincée' },
        ],
        season: ['Printemps', 'Été', 'Automne', 'Hiver'],
        category: ['Recette rapide'],
        personnes: 6,
        prepTime: 30,
        cost: 5,
      },
      {
        title: 'Gratin Dauphinois',
        description: `1. Préchauffer le four à 150°C.
2. Éplucher et couper les pommes de terre en rondelles fines.
3. Frotter le plat avec la gousse d'ail.
4. Disposer les pommes de terre en couches, saler, poivrer, muscade.
5. Mélanger la crème et le lait, verser sur les pommes de terre.
6. Parsemer de beurre en morceaux.
7. Enfourner 1h30 à 150°C.
8. Augmenter à 180°C les 15 dernières minutes pour dorer.
9. Laisser reposer 10 min avant de servir.`,
        ingredients: [
          { name: 'Pommes de terre', quantity: 1, unit: 'kg' },
          { name: 'Crème fraîche entière', quantity: 30, unit: 'cl' },
          { name: 'Lait entier', quantity: 30, unit: 'cl' },
          { name: 'Ail', quantity: 2, unit: 'gousses' },
          { name: 'Beurre', quantity: 30, unit: 'g' },
          { name: 'Muscade', quantity: 1, unit: 'pincée' },
        ],
        season: ['Automne', 'Hiver'],
        category: ['Repas Gourmand'],
        personnes: 6,
        prepTime: 105,
        cost: 8,
      },
      {
        title: 'Tarte Tatin',
        description: `1. Préchauffer le four à 180°C.
2. Éplucher les pommes, les couper en quartiers.
3. Faire un caramel avec le sucre et le beurre dans un moule allant au four.
4. Disposer les quartiers de pommes serrés sur le caramel.
5. Cuire 20 min sur feu moyen pour confire les pommes.
6. Recouvrir avec la pâte feuilletée, rentrer les bords.
7. Enfourner 25-30 min jusqu'à ce que la pâte soit dorée.
8. Laisser tiédir 5 min.
9. Retourner sur un plat de service, servir tiède avec de la crème fraîche.`,
        ingredients: [
          { name: 'Pommes Golden', quantity: 8, unit: 'pièces' },
          { name: 'Pâte feuilletée', quantity: 1, unit: 'rouleau' },
          { name: 'Beurre demi-sel', quantity: 100, unit: 'g' },
          { name: 'Sucre', quantity: 150, unit: 'g' },
          { name: 'Cannelle', quantity: 1, unit: 'c. à café' },
        ],
        season: ['Automne'],
        category: ['Repas Gourmand', 'Pour les grandes occasions'],
        personnes: 8,
        prepTime: 60,
        cost: 10,
      },
      {
        title: 'Poulet Rôti aux Herbes',
        description: `1. Préchauffer le four à 200°C.
2. Préparer un beurre aux herbes (beurre mou + thym + romarin + ail).
3. Glisser le beurre sous la peau du poulet.
4. Saler et poivrer l'intérieur et l'extérieur.
5. Mettre le citron coupé à l'intérieur du poulet.
6. Disposer dans un plat avec les pommes de terre coupées.
7. Enfourner 1h15, arroser régulièrement avec le jus.
8. Vérifier la cuisson (jus clair quand on pique la cuisse).
9. Laisser reposer 10 min sous aluminium avant de découper.`,
        ingredients: [
          { name: 'Poulet fermier', quantity: 1.5, unit: 'kg' },
          { name: 'Beurre', quantity: 80, unit: 'g' },
          { name: 'Thym frais', quantity: 4, unit: 'branches' },
          { name: 'Romarin', quantity: 2, unit: 'branches' },
          { name: 'Ail', quantity: 4, unit: 'gousses' },
          { name: 'Citron', quantity: 1, unit: 'pièce' },
          { name: 'Pommes de terre', quantity: 800, unit: 'g' },
        ],
        season: ['Printemps', 'Été', 'Automne', 'Hiver'],
        category: ['Repas Gourmand'],
        personnes: 5,
        prepTime: 90,
        cost: 15,
      },
      {
        title: "Soupe à l'Oignon Gratinée",
        description: `1. Émincer finement les oignons.
2. Les faire caraméliser dans le beurre 30 min à feu doux.
3. Ajouter la farine, mélanger 2 min.
4. Verser le vin blanc, puis le bouillon.
5. Assaisonner avec thym, laurier, sel et poivre.
6. Laisser mijoter 20 min.
7. Répartir dans des bols allant au four.
8. Déposer les tranches de pain grillé, couvrir de gruyère.
9. Gratiner 5 min sous le gril jusqu'à ce que le fromage soit doré.`,
        ingredients: [
          { name: 'Oignons', quantity: 6, unit: 'pièces' },
          { name: 'Beurre', quantity: 50, unit: 'g' },
          { name: 'Farine', quantity: 2, unit: 'c. à soupe' },
          { name: 'Vin blanc sec', quantity: 15, unit: 'cl' },
          { name: 'Bouillon de boeuf', quantity: 1.5, unit: 'L' },
          { name: 'Pain de campagne', quantity: 8, unit: 'tranches' },
          { name: 'Gruyère râpé', quantity: 200, unit: 'g' },
          { name: 'Thym', quantity: 2, unit: 'branches' },
        ],
        season: ['Automne', 'Hiver'],
        category: ['Recette rapide'],
        personnes: 4,
        prepTime: 60,
        cost: 8,
      },
      {
        title: 'Tiramisu',
        description: `1. Séparer les blancs des jaunes d'oeufs.
2. Fouetter les jaunes avec le sucre jusqu'à blanchiment.
3. Ajouter le mascarpone, mélanger délicatement.
4. Monter les blancs en neige ferme, les incorporer.
5. Préparer le café fort, le laisser refroidir, ajouter l'amaretto.
6. Tremper rapidement les biscuits dans le café.
7. Alterner couches de biscuits et de crème dans un plat.
8. Terminer par une couche de crème.
9. Réfrigérer 4h minimum, saupoudrer de cacao avant de servir.`,
        ingredients: [
          { name: 'Mascarpone', quantity: 500, unit: 'g' },
          { name: 'Oeufs', quantity: 4, unit: 'pièces' },
          { name: 'Sucre', quantity: 100, unit: 'g' },
          { name: 'Biscuits à la cuillère', quantity: 300, unit: 'g' },
          { name: 'Café fort', quantity: 30, unit: 'cl' },
          { name: 'Amaretto', quantity: 4, unit: 'c. à soupe' },
          { name: 'Cacao amer en poudre', quantity: 2, unit: 'c. à soupe' },
        ],
        season: ['Printemps', 'Été', 'Automne', 'Hiver'],
        category: ['Que pour les parents', 'Pour les grandes occasions'],
        personnes: 8,
        prepTime: 30,
        cost: 12,
      },
    ];

    recipes.forEach((recipe, index) => {
      const id = `recipe_${Date.now()}_${index}`;
      const fullRecipe: RecipeModel = { ...recipe, id };

      // Format attendu par RecipeService: { id, data: RecipeModel }
      const documentData = {
        id: id,
        data: fullRecipe,
      };

      this.firestoreService.setDocument('recipes', id, documentData).subscribe({
        next: () => console.log(`✅ Recette "${recipe.title}" ajoutée avec succès`),
        error: (err) => console.error(`❌ Erreur pour "${recipe.title}":`, err),
      });
    });
  }
}
