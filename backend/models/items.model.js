const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'عنوان السلعة مطلوب'],
            trim: true,
            maxlength: [100, 'العنوان لا يتجاوز 100 حرف']
        },
        description: {
            type: String,
            required: [true, 'وصف السلعة مطلوب'],
            trim: true,
            maxlength: [2000, 'الوصف لا يتجاوز 2000 حرف']
        },
        type: {
            type: String,
            enum: {
                values: ['donation', 'exchange', 'sell'],
                message: 'نوع المعاملة يجب أن يكون donation أو exchange أو sell'
            },
            default: 'donation'
        },
        price: {
            type: Number,
            default: null,
            validate: {
                validator: function (v) {
                    return this.type === 'sell' ? v != null && v >= 0 : true;
                },
                message: 'السعر مطلوب وقيمته صفر أو أكثر عند اختيار نوع البيع'
            }
        },
        exchangeWith: {
            type: String,
            trim: true,
            default: null
        },
        condition: {
            type: String,
            enum: {
                values: ['new', 'like_new', 'used_good', 'used_fair'],
                message: 'حالة السلعة غير معتمدة'
            },
            required: [true, 'حالة السلعة مطلوبة']
        },
        quantity: {
            type: Number,
            default: 1,
            min: [1, 'الكمية يجب أن تكون 1 على الأقل']
        },
        images: {
            type: [String],
            default: ['https://placeholder.co/600x400/png']
        },
        governorate: {
            type: String,
            required: [true, 'المحافظة مطلوبة'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'المدينة مطلوبة'],
            trim: true
        },
        status: {
            type: String,
            enum: ['available', 'reserved', 'completed'],
            default: 'available'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'معرف المالك مطلوب']
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'تصنيف السلعة مطلوب']
        }
    },
    {
        timestamps: true
    }
);

itemSchema.index({ categoryId: 1, governorate: 1, status: 1 });
itemSchema.index({ title: 'text', description: 'text' });

itemSchema.pre('save', function () {
  if (this.type !== 'sell') {
    this.price = null;
  }
  if (this.type !== 'exchange') {
    this.exchangeWith = null;
  }
});

module.exports = mongoose.model('Item', itemSchema, 'items');