import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ItemService } from '../../services/item';
import { CategorySummary } from '../../models/item.model';
import { LocationService } from '../../../../core/services/location.service';
import { LocationItem } from '../../../../core/models/location.model';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './item-form.html',
  styleUrl: './item-form.css'
})
export class ItemFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private itemService = inject(ItemService);
  private locationService = inject(LocationService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  currentStep: number = 1;

  itemForm!: FormGroup;
  isEditMode = false;
  itemId: string | null = null;
  submitting = false;

  categories: CategorySummary[] = [];
  imagePreviews: string[] = [];
  imageError: string | null = null;
  isMedicalCategory = false;

  locationsData: LocationItem[] = [];
  governorates: string[] = [];
  availableCities: string[] = [];

  readonly conditions = [
    { value: 'new', label: 'جديد' },
    { value: 'like_new', label: 'كالجديد' },
    { value: 'used_good', label: 'مستعمل بحالة جيدة' },
    { value: 'used_fair', label: 'مستعمل بحالة مقبولة' }
  ];

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.toast.error('يجب تسجيل الدخول أولاً لإضافة أو تعديل سلعة');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.initForm();
    this.loadLocations();
    this.loadCategories();
    this.checkEditMode();
  }

  goToStep(step: number): void {
    if (step <= this.currentStep) {
      this.currentStep = step;
    }
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateCurrentStep(): boolean {
    if (this.currentStep === 1) {
      const step1Fields = ['title', 'categoryId', 'quantity', 'condition', 'description'];
      let isValid = true;

      step1Fields.forEach((field) => {
        const control = this.itemForm.get(field);
        control?.markAsTouched();
        if (control?.invalid) {
          isValid = false;
        }
      });

      if (!isValid) {
        this.toast.error('يرجى استكمال الحقول المطلوبة في الخطوة الحالية');
        return false;
      }
      return true;
    }

    if (this.currentStep === 2) {
      const type = this.itemForm.get('type')?.value;

      if (type === 'sell') {
        const priceControl = this.itemForm.get('price');
        priceControl?.markAsTouched();
        if (priceControl?.invalid) {
          this.toast.error('يرجى كتابة السعر المطلوب بدقة');
          return false;
        }
      }

      if (type === 'exchange') {
        const exchangeControl = this.itemForm.get('exchangeWith');
        exchangeControl?.markAsTouched();
        if (exchangeControl?.invalid) {
          this.toast.error('يرجى توضيح السلعة المرغوبة للتبادل');
          return false;
        }
      }

      return true;
    }

    if (this.currentStep === 3) {
      const imagesControl = this.itemForm.get('images');
      imagesControl?.markAsTouched();

      if (!this.imagePreviews || this.imagePreviews.length === 0) {
        this.toast.error('يجب رفع صورة واحدة على الأقل');
        return false;
      }

      if (this.isMedicalCategory) {
        const expiryControl = this.itemForm.get('expiryDate');
        const batchControl = this.itemForm.get('batchNumber');
        const confirmControl = this.itemForm.get('isControlledSubstanceConfirmed');

        expiryControl?.markAsTouched();
        batchControl?.markAsTouched();
        confirmControl?.markAsTouched();

        if (expiryControl?.invalid || batchControl?.invalid || confirmControl?.invalid) {
          this.toast.error('يرجى استيفاء شروط الأمان الدوائي وتاريخ الصلاحية');
          return false;
        }
      }

      return true;
    }

    return true;
  }

  selectCondition(val: string): void {
    this.itemForm.patchValue({ condition: val });
  }

  selectType(type: 'donation' | 'exchange' | 'sell'): void {
    this.itemForm.patchValue({ type });
    this.handleTypeChange();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe({
      next: (res) => {
        this.locationsData = Array.isArray(res?.data) ? res.data : [];
        this.governorates = this.locationsData.map((loc) => loc.governorate);

        const currentGov = this.itemForm.get('governorate')?.value;
        if (currentGov) {
          const match = this.locationsData.find((loc) => loc.governorate === currentGov);
          this.availableCities = match ? match.cities : [];
          this.itemForm.get('city')?.enable();
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('فشل تحميل المحافظات:', err)
    });
  }

  loadCategories(): void {
    this.itemService.getCategories().subscribe({
      next: (res: any) => {
        const fetched = res?.data?.categories || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(fetched) && fetched.length > 0) {
          this.categories = fetched;
        } else {
          this.categories = [
            { _id: '65f1a2b3c4d5e6f7a8b9c001', name: 'أدوية ومستلزمات طبية (Medical)' },
            { _id: '65f1a2b3c4d5e6f7a8b9c002', name: 'كتب وأدوات دراسية (Books)' },
            { _id: '65f1a2b3c4d5e6f7a8b9c003', name: 'أجهزة وإلكترونيات (Electronics)' },
            { _id: '65f1a2b3c4d5e6f7a8b9c004', name: 'ملابس وأقمشة (Clothes)' }
          ] as any;
        }
        this.checkIfMedical();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('فشل تحميل التصنيفات:', err)
    });
  }

  initForm(): void {
    const currentUserId = this.authService.currentUserValue?._id || '';

    this.itemForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      type: ['donation', Validators.required],
      price: [null],
      exchangeWith: [''],
      condition: ['like_new', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      governorate: ['', Validators.required],
      city: [{ value: '', disabled: true }, Validators.required],
      images: [[], [Validators.required]],
      categoryId: ['', Validators.required],
      ownerId: [currentUserId, Validators.required],
      expiryDate: [null],
      batchNumber: [''],
      isControlledSubstanceConfirmed: [false]
    });

    this.handleTypeChange();
  }

  onCategoryChange(): void {
    this.checkIfMedical();
    const expiryControl = this.itemForm.get('expiryDate');
    const batchControl = this.itemForm.get('batchNumber');
    const confirmControl = this.itemForm.get('isControlledSubstanceConfirmed');

    if (this.isMedicalCategory) {
      expiryControl?.setValidators([Validators.required]);
      batchControl?.setValidators([Validators.required]);
      confirmControl?.setValidators([Validators.requiredTrue]);
    } else {
      expiryControl?.clearValidators();
      batchControl?.clearValidators();
      confirmControl?.clearValidators();
      expiryControl?.setValue(null);
      batchControl?.setValue('');
      confirmControl?.setValue(false);
    }

    expiryControl?.updateValueAndValidity();
    batchControl?.updateValueAndValidity();
    confirmControl?.updateValueAndValidity();
  }

  checkIfMedical(): void {
    const selectedCatId = this.itemForm.get('categoryId')?.value;
    const cat = this.categories.find((c) => c._id === selectedCatId);
    const catName = (cat?.name || '').toLowerCase();
    this.isMedicalCategory = catName.includes('medic') || catName.includes('دواء') || catName.includes('طب');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.imageError = null;
    const files = Array.from(input.files);

    files.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        this.imageError = 'إحدى الصور تتجاوز 5 ميجابايت وتم تخطيها';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagePreviews.push(base64String);
        this.itemForm.patchValue({ images: this.imagePreviews });
        this.itemForm.get('images')?.updateValueAndValidity();
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    });

    input.value = '';
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.itemForm.patchValue({ images: this.imagePreviews.length > 0 ? this.imagePreviews : [] });
    this.itemForm.get('images')?.updateValueAndValidity();
    this.itemForm.get('images')?.markAsTouched();
  }

  handleTypeChange(): void {
    const type = this.itemForm.get('type')?.value;
    const priceControl = this.itemForm.get('price');
    const exchangeControl = this.itemForm.get('exchangeWith');

    if (type === 'sell') {
      priceControl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      priceControl?.clearValidators();
      priceControl?.setValue(null);
    }

    if (type === 'exchange') {
      exchangeControl?.setValidators([Validators.required]);
    } else {
      exchangeControl?.clearValidators();
      exchangeControl?.setValue(null);
    }

    priceControl?.updateValueAndValidity();
    exchangeControl?.updateValueAndValidity();
  }

  onGovChange(): void {
    const gov = this.itemForm.get('governorate')?.value;
    const cityControl = this.itemForm.get('city');

    cityControl?.setValue('');
    if (gov) {
      const selected = this.locationsData.find((loc) => loc.governorate === gov);
      this.availableCities = selected ? selected.cities : [];
      cityControl?.enable();
    } else {
      this.availableCities = [];
      cityControl?.disable();
    }
  }

  checkEditMode(): void {
    this.itemId = this.route.snapshot.paramMap.get('id');
    if (this.itemId) {
      this.isEditMode = true;
      this.itemService.getItemById(this.itemId).subscribe({
        next: (res: any) => {
          const itemData = res?.data?.item || res?.data || res;
          const currentUserId = this.authService.currentUserValue?._id;
          const itemOwnerId = typeof itemData.ownerId === 'object' ? itemData.ownerId?._id : itemData.ownerId;

          // التحقق من أن المستخدم الحالي هو المالك الحقيقي للسلعة
          if (currentUserId && itemOwnerId && currentUserId !== itemOwnerId) {
            this.toast.error('غير مصرح لك بتعديل هذه السلعة');
            this.router.navigate(['/items']);
            return;
          }

          this.itemForm.patchValue(itemData);

          if (itemData.categoryId && typeof itemData.categoryId === 'object') {
            this.itemForm.patchValue({ categoryId: itemData.categoryId._id || itemData.categoryId.id });
          }

          if (itemData.images && itemData.images.length > 0) {
            this.imagePreviews = itemData.images;
          }

          if (itemData.governorate && this.locationsData.length > 0) {
            const selected = this.locationsData.find((loc) => loc.governorate === itemData.governorate);
            this.availableCities = selected ? selected.cities : [];
            this.itemForm.get('city')?.enable();
          }

          this.handleTypeChange();
          this.checkIfMedical();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('تعذر جلب تفاصيل السلعة للتعديل:', err);
          this.toast.error('تعذر جلب تفاصيل السلعة للتعديل');
        }
      });
    }
  }

  onSubmit(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.toast.error('يرجى التأكد من استكمال كافة الحقول الإلزامية');
      return;
    }

    this.submitting = true;
    const formValues = this.itemForm.getRawValue();

    // التأكد من إرفاق معرف المستخدم الحالي كمالك
    const currentUserId = this.authService.currentUserValue?._id;
    if (currentUserId) {
      formValues.ownerId = currentUserId;
    }

    const payload: any = {
      ...formValues,
      isControlledSubstance: false,
      packagingType: this.isMedicalCategory ? 'sealed_blister_only' : undefined
    };

    delete payload.isControlledSubstanceConfirmed;

    const request$ = this.isEditMode && this.itemId
      ? this.itemService.updateItem(this.itemId, payload)
      : this.itemService.createItem(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        this.toast.success(this.isEditMode ? 'تم حفظ التعديلات بنجاح' : 'تم نشر السلعة بنجاح!');
        this.router.navigate(['/items']);
      },
      error: (err) => {
        console.error('فشل حفظ السلعة:', err);
        this.submitting = false;
        const msg = err?.error?.message || 'حدث خطأ أثناء حفظ السلعة.';
        this.toast.error(msg);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/items']);
  }
} 