import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RecipeModel, ALL_SEASONS } from '../../../models/recipe.model';
import { IngredientModel } from '../../../models/ingredient.model';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { MultiSelect } from 'primeng/multiselect';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Dialog } from 'primeng/dialog';
import { Fieldset } from 'primeng/fieldset';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputText,
    Textarea,
    InputNumber,
    MultiSelect,
    Button,
    Card,
    Dialog,
    Fieldset,
  ],
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss'],
})
export class RecipeFormComponent implements OnInit, OnChanges {
  @Input() recipe?: RecipeModel;
  @Input() isReadOnly: boolean = false;
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<RecipeModel>();
  @Output() cancel = new EventEmitter<void>();

  recipeForm!: FormGroup;
  seasons = ALL_SEASONS.map((s) => ({ label: s, value: s }));

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.recipe) {
      this.loadRecipe(this.recipe);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['recipe'] && changes['recipe'].currentValue) {
      this.loadRecipe(changes['recipe'].currentValue);
    } else if (changes['recipe'] && !changes['recipe'].currentValue) {
      // Reset form for new recipe
      this.initForm();
    }
  }

  private initForm(): void {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      image: [''],
      description: ['', Validators.required],
      season: [[], Validators.required],
      prepTime: [null, Validators.min(1)],
      cost: [null, Validators.min(0)],
      ingredients: this.fb.array([]),
    });
  }

  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  private createIngredientFormGroup(ingredient?: IngredientModel): FormGroup {
    return this.fb.group({
      name: [ingredient?.name || '', Validators.required],
      quantity: [ingredient?.quantity || null, [Validators.required, Validators.min(0)]],
      unit: [ingredient?.unit || '', Validators.required],
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientFormGroup());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  private loadRecipe(recipe: RecipeModel): void {
    this.recipeForm.patchValue({
      title: recipe.title,
      image: recipe.image || '',
      description: recipe.description,
      season: recipe.season,
      prepTime: recipe.prepTime,
      cost: recipe.cost,
    });

    // Charger les ingrédients
    recipe.ingredients.forEach((ing) => {
      this.ingredients.push(this.createIngredientFormGroup(ing));
    });
  }

  onSubmit(): void {
    if (this.recipeForm.valid) {
      const formValue = this.recipeForm.value;
      const recipe: RecipeModel = {
        id: this.recipe?.id || '', // Will be set in service if empty
        title: formValue.title,
        image: formValue.image || undefined,
        description: formValue.description,
        season: formValue.season,
        prepTime: formValue.prepTime,
        cost: formValue.cost,
        ingredients: formValue.ingredients,
      };
      this.save.emit(recipe);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.recipeForm.patchValue({ image: base64 });
      };
      reader.readAsDataURL(file);
    }
  }

  get isEditMode(): boolean {
    return !!this.recipe;
  }
}
