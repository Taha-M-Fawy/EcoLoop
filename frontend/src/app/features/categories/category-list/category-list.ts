import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../services/category';
import { Category } from '../models/category.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css'
})
export class CategoryList implements OnInit {

  categories: Category[] = [];

  showForm = false;
  editingCategory: Category | null = null;

  newCategory = {
    name: '',
    description: '',
    image: ''
  };

  constructor(
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  openForm(): void {
    this.editingCategory = null;
    this.showForm = true;
  }

  editCategory(category: Category): void {
    this.editingCategory = category;

    this.newCategory = {
      name: category.name,
      description: category.description,
      image: category.image
    };

    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editingCategory = null;

    this.newCategory = {
      name: '',
      description: '',
      image: ''
    };
  }

  saveCategory(): void {
    if (!this.newCategory.name.trim()) {
      return;
    }

    if (this.editingCategory) {

      this.categoryService
        .updateCategory(this.editingCategory._id, this.newCategory)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadCategories();
          },
          error: (error) => {
            console.error(error);
          }
        });

    } else {

      this.categoryService
        .addCategory(this.newCategory as Category)
        .subscribe({
          next: () => {
            this.closeForm();
            this.loadCategories();
          },
          error: (error) => {
            console.error(error);
          }
        });
    }
  }

  deleteCategory(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      return;
    }

    this.categoryService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}