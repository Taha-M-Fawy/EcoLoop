export const environment = {
  production: false,
  apiUrl: 'https://eco-loop-one.vercel.app/api',
  platformWallets: {
    etisalatCash: '01159511474', // محفظة اتصالات كاش الرسمية المعتمدة
    vodafoneCash: '01159511474', // تستقبل التحويل من فودافون كاش
    instaPay: '01159511474',     // تستقبل التحويل من إنستاباي
    orangeCash: '01159511474',   // تستقبل التحويل من أورانج كاش
    wePay: '01159511474'         // تستقبل التحويل من وي باي
  },
  cloudinary: {
    cloudName: 'v8lzsyg9',
    uploadPreset: 'ecoloop_preset',
    uploadUrl: 'https://api.cloudinary.com/v1_1/v8lzsyg9/image/upload'
  }
};
