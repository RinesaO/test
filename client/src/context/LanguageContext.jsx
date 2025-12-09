import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    'nav.browsePharmacies': 'Browse Pharmacies',
    'nav.myProfile': 'My Profile',
    'nav.myPrescriptions': 'My Prescriptions',
    'nav.settings': 'Settings',
    
    // Categories
    'category.antibiotics': 'Antibiotics',
    'category.vitamins': 'Vitamins',
    'category.syrups': 'Syrups',
    'category.creams': 'Creams',
    'category.other': 'Other Medicines (A-Z)',
    'category.opiates': 'Opiates',
    
    // Common
    'common.welcome': 'Welcome',
    'common.searchProducts': 'Search products...',
    'common.sortBy': 'Sort by...',
    'common.selectCategory': 'Select a category...',
    'common.priceLowHigh': 'Price: Low to High',
    'common.priceHighLow': 'Price: High to Low',
    'common.cart': 'Cart',
    'common.products': 'Products',
    'common.noProductsFound': 'No products found',
    'common.loading': 'Loading...',
    'common.clearFilter': 'Clear Filter',
    'common.categories': 'Categories',
    'common.navigation': 'Navigation',
    'common.advertisement': 'Advertisement',
    'common.noActiveAds': 'No active advertisements',
    'common.specialOffer': 'Special Offer',
    
    // Product Details
    'product.description': 'Description',
    'product.category': 'Category',
    'product.sideEffects': 'Side Effects',
    'product.usageInstructions': 'Usage Instructions',
    'product.availableInPharmacies': 'Available in Pharmacies (Kosovo)',
    'product.noDescription': 'No description available',
    'product.uncategorized': 'Uncategorized',
    'product.noSideEffects': 'No side effects information available',
    'product.consultDoctor': 'Please consult your doctor for usage instructions',
    'product.noPharmacies': 'No pharmacies found for this product',
    'product.inStock': 'In Stock',
    'product.outOfStock': 'Out of Stock',
    'product.addToCart': 'Add to Cart',
    'product.outOfStockAll': 'Product is out of stock in all pharmacies',
    'product.frequentlyBoughtTogether': 'Frequently Bought Together',
    'product.manufacturer': 'Manufacturer',
    'product.expirationDate': 'Expiration Date',
    
    // Cart
    'cart.shoppingCart': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    
    // Opiates Warning
    'opiates.warning': 'Opiates are prescription-only medications. You can view where to find them, but they cannot be purchased online. Please consult with a licensed pharmacy for these medications.',
    'opiates.viewOnly': 'View-only: Cannot purchase online',
    'opiates.prescriptionRequired': '⚠️ Prescription Required - Cannot Purchase Online',
    
    // Pharmacy
    'pharmacy.findNearYou': 'Find pharmacies near you',
    'pharmacy.manageAccount': 'Manage your account',
    'pharmacy.viewPrescriptions': 'View prescriptions',
    
    // Settings
    'settings.accountSettings': 'Account Settings',
    'settings.notificationPreferences': 'Notification Preferences',
    'settings.privacySecurity': 'Privacy & Security',
    'settings.pushNotifications': 'Push Notifications',
    'settings.pushNotificationsDesc': 'Receive notifications about orders and updates',
    'settings.emailUpdates': 'Email Updates',
    'settings.emailUpdatesDesc': 'Receive email updates about promotions and news',
    'settings.editProfile': 'Edit Profile Information',
    'settings.changePassword': 'Change Password',
    'settings.passwordChangeNote': 'For security reasons, password changes must be done through your profile page.',
    
    // Buttons
    'button.login': 'Login',
    'button.logout': 'Logout',
    'button.register': 'Register',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.edit': 'Edit',
    'button.delete': 'Delete',
    'button.close': 'Close',
    'button.submit': 'Submit',
    'button.create': 'Create',
    'button.update': 'Update',
    
    // Home Page
    'home.findNearestPharmacy': 'Find Your Nearest Pharmacy in Kosovo',
    'home.connectWithPharmacies': 'Connect with trusted pharmacies and discover products near you',
    'home.findPharmacy': 'Find a Pharmacy',
    'home.whyChoose': 'Why Choose PharmaCare?',
    'home.easyLocation': 'Easy Location',
    'home.easyLocationDesc': 'Find pharmacies near you with detailed location information and contact details.',
    'home.productCatalog': 'Product Catalog',
    'home.productCatalogDesc': 'Browse products from each pharmacy and check availability before visiting.',
    'home.openingHours': 'Opening Hours',
    'home.openingHoursDesc': 'Check pharmacy opening hours and plan your visit accordingly.',
    'home.verifiedPharmacies': 'Verified Pharmacies',
    'home.verifiedPharmaciesDesc': 'All listed pharmacies are verified and actively subscribed to our platform.',
    'home.easyContact': 'Easy Contact',
    'home.easyContactDesc': 'Direct contact information to reach out to pharmacies quickly.',
    'home.smartSearch': 'Smart Search',
    'home.smartSearchDesc': 'Search by name, location, or product to find exactly what you need.',
    'home.howItWorks': 'How It Works',
    'home.search': 'Search',
    'home.searchDesc': 'Browse our directory of verified pharmacies or search by location',
    'home.explore': 'Explore',
    'home.exploreDesc': 'View pharmacy profiles, products, services, and opening hours',
    'home.contact': 'Contact',
    'home.contactDesc': 'Reach out to the pharmacy directly using provided contact information',
    'home.readyToFind': 'Ready to Find Your Pharmacy?',
    'home.startBrowsing': 'Start browsing our directory of trusted pharmacies',
    'home.browsePharmacies': 'Browse Pharmacies',
    
    // Login/Register
    'auth.signIn': 'Sign in to your account',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.registerHere': 'Register here',
    'auth.createPharmacyAccount': 'create a new pharmacy account',
    'auth.email': 'Email address',
    'auth.password': 'Password',
    'auth.rememberMe': 'Remember me',
    'auth.forgotPassword': 'Forgot your password?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.loginHere': 'Login here',
    'auth.signingIn': 'Signing in...',
    'auth.registrationApproved': 'Registration Approved',
    'auth.continue': 'Continue',
    'auth.or': 'Or',
    'auth.createAccount': 'Create your account',
    'auth.signInExisting': 'sign in to your existing account',
    'auth.registerAs': 'I want to register as:',
    'auth.regularUser': 'Regular User',
    'auth.pharmacy': 'Pharmacy',
    'auth.doctor': 'Doctor',
    'auth.continueAsDoctor': 'Continue as Doctor',
    'auth.name': 'Full Name',
    'auth.pharmacyName': 'Pharmacy Name',
    'auth.phone': 'Phone Number',
    'auth.street': 'Street Address',
    'auth.city': 'City',
    'auth.register': 'Register',
    'auth.registering': 'Registering...',
    
    // Doctor
    'doctor.approvalMessage': 'Your registration request has been approved by the Ministry of Health.',
    'doctor.onboarding': 'Doctor Onboarding',
    
    // MSH
    'msh.dashboard': 'MSH Dashboard',
    'msh.pendingDoctors': 'Pending Doctors',
    'msh.allDoctors': 'All Doctors',
    'msh.statistics': 'Statistics',
    'msh.doctorReview': 'Doctor Review',
    'msh.settings': 'Settings',
    'msh.login': 'Ministry of Health Login',
    'msh.loginDescription': 'Official access for Ministry of Health administrators',
    'msh.loginButton': 'Log in as Ministry of Health',
    'msh.accessDenied': 'Access denied. This login is for Ministry of Health officials only.',
    'msh.adminPanel': 'Admin Panel',
    'msh.ministryOfHealth': 'Ministry of Health',
    'msh.pendingApplications': 'Pending Doctor Applications',
    'msh.noPendingApplications': 'No pending doctor applications',
    'msh.doctorFullName': 'Doctor Full Name',
    'msh.specialization': 'Specialization',
    'msh.licenseNumber': 'License Number',
    'msh.applicationDate': 'Application Date',
    'msh.workplaceName': 'Workplace Name',
    'msh.actions': 'Actions',
    'msh.viewLicense': 'View License',
    'msh.viewIdCard': 'View ID Card',
    'msh.viewCertificate': 'View Certificate',
    'msh.approve': 'Approve',
    'msh.reject': 'Reject',
    'msh.doctorApproved': 'Doctor approved successfully',
    'msh.doctorRejected': 'Doctor rejected successfully',
    'msh.errorLoading': 'Error loading doctors',
    'msh.documents': 'Documents',
    'msh.workplace': 'Workplace Name',
    
    // Pharmacy
    'pharmacy.advertising': 'Advertising / Promote Product',
    'pharmacy.purchaseAdSlot': 'Purchase an ad slot to promote your products to users.',
    'pharmacy.purchaseAd': 'Purchase Ad Slot (€9.99)',
    'pharmacy.adSlotPurchased': 'Ad slot purchased! Create your advertisement below.',
    'pharmacy.createAdvertisement': 'Create Advertisement',
    'pharmacy.adImage': 'Ad Image',
    'pharmacy.offerText': 'Offer Text',
    'pharmacy.enterOfferText': 'Enter your special offer or promotion text...',
    'pharmacy.selectProduct': 'Select Product to Promote',
    'pharmacy.selectProductPlaceholder': 'Select a product...',
    'pharmacy.publishAd': 'Publish Ad',
    'pharmacy.adActive': 'Advertisement is active and visible to users',
    'pharmacy.adPublished': 'Advertisement published successfully!',
    'pharmacy.selectProductError': 'Please select a product to promote',
    'pharmacy.products': 'Products',
    'pharmacy.addProduct': 'Add Product',
    'pharmacy.noProducts': 'No products yet. Add your first product!',
    'pharmacy.productName': 'Name',
    'pharmacy.productDescription': 'Description',
    'pharmacy.productImage': 'Product Image',
    'pharmacy.productPrice': 'Price (€)',
    'pharmacy.productCategory': 'Category',
    'pharmacy.stockQuantity': 'Stock Quantity',
    'pharmacy.inStock': 'In Stock',
    'pharmacy.uploadAfterCreate': 'Upload image after creating the product',
    'pharmacy.editProduct': 'Edit Product',
    'pharmacy.createProduct': 'Create',
    'pharmacy.updateProduct': 'Update',
    
    // Admin
    'admin.dashboard': 'Admin Dashboard',
    'admin.users': 'Users',
    'admin.pharmacies': 'Pharmacies',
    'admin.products': 'Products',
    'admin.doctorRequests': 'Doctor Requests',
  },
  al: {
    // Navigation
    'nav.browsePharmacies': 'Shfleto Farmacitë',
    'nav.myProfile': 'Profili Im',
    'nav.myPrescriptions': 'Recetat e Mia',
    'nav.settings': 'Cilësimet',
    
    // Categories
    'category.antibiotics': 'Antibiotikët',
    'category.vitamins': 'Vitaminat',
    'category.syrups': 'Sirupat',
    'category.creams': 'Kremat',
    'category.other': 'Barnat e tjera (A-Z)',
    'category.opiates': 'Opiatet',
    
    // Common
    'common.welcome': 'Mirë se vini',
    'common.searchProducts': 'Kërko produkte...',
    'common.sortBy': 'Rendit sipas...',
    'common.selectCategory': 'Zgjidh një kategori...',
    'common.priceLowHigh': 'Çmimi: Nga më i ulët te më i lartë',
    'common.priceHighLow': 'Çmimi: Nga më i lartë te më i ulët',
    'common.cart': 'Shporta',
    'common.products': 'Produktet',
    'common.noProductsFound': 'Nuk u gjetën produkte',
    'common.loading': 'Duke u ngarkuar...',
    'common.clearFilter': 'Pastro Filtër',
    'common.categories': 'Kategoritë',
    'common.navigation': 'Navigimi',
    'common.advertisement': 'Reklamë',
    'common.noActiveAds': 'Nuk ka reklama aktive',
    'common.specialOffer': 'Ofertë Speciale',
    
    // Product Details
    'product.description': 'Përshkrimi',
    'product.category': 'Kategoria',
    'product.sideEffects': 'Efektet Anësore',
    'product.usageInstructions': 'Udhëzimet e Përdorimit',
    'product.availableInPharmacies': 'Në dispozicion në Farmaci (Kosovë)',
    'product.noDescription': 'Nuk ka përshkrim të disponueshëm',
    'product.uncategorized': 'Pa kategori',
    'product.noSideEffects': 'Nuk ka informacion për efektet anësore',
    'product.consultDoctor': 'Ju lutemi konsultohuni me mjekun tuaj për udhëzimet e përdorimit',
    'product.noPharmacies': 'Nuk u gjetën farmaci për këtë produkt',
    'product.inStock': 'Në Stok',
    'product.outOfStock': 'Jashtë Stokut',
    'product.addToCart': 'Shto në Shportë',
    'product.outOfStockAll': 'Produkti është jashtë stokut në të gjitha farmacitë',
    'product.frequentlyBoughtTogether': 'Shpesh Blenë Së Bashku',
    'product.manufacturer': 'Prodhuesi',
    'product.expirationDate': 'Data e Skadimit',
    
    // Cart
    'cart.shoppingCart': 'Shporta e Blerjeve',
    'cart.empty': 'Shporta juaj është e zbrazët',
    'cart.total': 'Totali',
    'cart.proceedToCheckout': 'Vazhdo te Pagesa',
    'cart.remove': 'Hiq',
    
    // Opiates Warning
    'opiates.warning': 'Opiatet janë medikamente që kërkojnë recetë. Ju mund t\'i shihni ku të gjenden, por nuk mund t\'i blini online. Ju lutemi konsultohuni me një farmaci të licencuar për këto medikamente.',
    'opiates.viewOnly': 'Vetëm për shikim: Nuk mund të blihet online',
    'opiates.prescriptionRequired': '⚠️ Kërkohet Recetë - Nuk Mund të Blihet Online',
    
    // Pharmacy
    'pharmacy.findNearYou': 'Gjej farmaci pranë teje',
    'pharmacy.manageAccount': 'Menaxho llogarinë tënde',
    'pharmacy.viewPrescriptions': 'Shiko recetat',
    
    // Settings
    'settings.accountSettings': 'Cilësimet e Llogarisë',
    'settings.notificationPreferences': 'Preferencat e Njoftimeve',
    'settings.privacySecurity': 'Privatësia dhe Siguria',
    'settings.pushNotifications': 'Njoftimet Push',
    'settings.pushNotificationsDesc': 'Merr njoftime për porositë dhe përditësimet',
    'settings.emailUpdates': 'Përditësimet me Email',
    'settings.emailUpdatesDesc': 'Merr përditësime me email për promovime dhe lajme',
    'settings.editProfile': 'Ndrysho Informacionin e Profilit',
    'settings.changePassword': 'Ndrysho Fjalëkalimin',
    'settings.passwordChangeNote': 'Për arsye sigurie, ndryshimet e fjalëkalimit duhet të bëhen përmes faqes së profilit.',
    
    // Buttons
    'button.login': 'Hyr',
    'button.logout': 'Dil',
    'button.register': 'Regjistrohu',
    'button.cancel': 'Anulo',
    'button.save': 'Ruaj',
    'button.edit': 'Ndrysho',
    'button.delete': 'Fshi',
    'button.close': 'Mbyll',
    'button.submit': 'Dërgo',
    'button.create': 'Krijo',
    'button.update': 'Përditëso',
    
    // Home Page
    'home.findNearestPharmacy': 'Gjej Farmacinë Më Të Afërt në Kosovë',
    'home.connectWithPharmacies': 'Lidhu me farmaci të besueshme dhe zbuloni produkte pranë teje',
    'home.findPharmacy': 'Gjej një Farmaci',
    'home.whyChoose': 'Pse të Zgjidhni PharmaCare?',
    'home.easyLocation': 'Vendndodhje e Lehtë',
    'home.easyLocationDesc': 'Gjej farmaci pranë teje me informacion të detajuar të vendndodhjes dhe detaje kontakti.',
    'home.productCatalog': 'Katalog Produktesh',
    'home.productCatalogDesc': 'Shfleto produkte nga çdo farmaci dhe kontrollo disponueshmërinë para se të vizitosh.',
    'home.openingHours': 'Orët e Hapjes',
    'home.openingHoursDesc': 'Kontrollo orët e hapjes së farmacisë dhe planifiko vizitën tënde në përputhje me to.',
    'home.verifiedPharmacies': 'Farmaci të Verifikuara',
    'home.verifiedPharmaciesDesc': 'Të gjitha farmacitë e listuara janë të verifikuara dhe aktivisht të abonuara në platformën tonë.',
    'home.easyContact': 'Kontakt i Lehtë',
    'home.easyContactDesc': 'Informacion i drejtpërdrejtë i kontaktit për të kontaktuar farmacitë shpejt.',
    'home.smartSearch': 'Kërkim i Mençur',
    'home.smartSearchDesc': 'Kërko sipas emrit, vendndodhjes ose produktit për të gjetur saktësisht atë që ke nevojë.',
    'home.howItWorks': 'Si Funksionon',
    'home.search': 'Kërko',
    'home.searchDesc': 'Shfleto direktorinë tonë të farmacive të verifikuara ose kërko sipas vendndodhjes',
    'home.explore': 'Eksploro',
    'home.exploreDesc': 'Shiko profilet e farmacive, produktet, shërbimet dhe orët e hapjes',
    'home.contact': 'Kontakto',
    'home.contactDesc': 'Lidhu me farmacinë drejtpërdrejt duke përdorur informacionin e kontaktit të ofruar',
    'home.readyToFind': 'Gati të Gjesh Farmacinë Tënde?',
    'home.startBrowsing': 'Fillo të shfletosh direktorinë tonë të farmacive të besueshme',
    'home.browsePharmacies': 'Shfleto Farmacitë',
    
    // Login/Register
    'auth.signIn': 'Hyr në llogarinë tënde',
    'auth.dontHaveAccount': 'Nuk ke llogari?',
    'auth.registerHere': 'Regjistrohu këtu',
    'auth.createPharmacyAccount': 'krijo një llogari të re farmacie',
    'auth.email': 'Adresa e email-it',
    'auth.password': 'Fjalëkalimi',
    'auth.rememberMe': 'Më mbaj mend',
    'auth.forgotPassword': 'Ke harruar fjalëkalimin?',
    'auth.alreadyHaveAccount': 'Ke tashmë një llogari?',
    'auth.loginHere': 'Hyr këtu',
    'auth.signingIn': 'Duke u identifikuar...',
    'auth.registrationApproved': 'Regjistrimi u Aprovua',
    'auth.continue': 'Vazhdo',
    'auth.or': 'Ose',
    'auth.createAccount': 'Krijo llogarinë tënde',
    'auth.signInExisting': 'hyr në llogarinë ekzistuese',
    'auth.registerAs': 'Dëshiroj të regjistrohem si:',
    'auth.regularUser': 'Përdorues i Rregullt',
    'auth.pharmacy': 'Farmaci',
    'auth.doctor': 'Doktor',
    'auth.continueAsDoctor': 'Vazhdo si Doktor',
    'auth.name': 'Emri i Plotë',
    'auth.pharmacyName': 'Emri i Farmacisë',
    'auth.phone': 'Numri i Telefonit',
    'auth.street': 'Adresa e Rrugës',
    'auth.city': 'Qyteti',
    'auth.register': 'Regjistrohu',
    'auth.registering': 'Duke u regjistruar...',
    
    // Doctor
    'doctor.approvalMessage': 'Kërkesa juaj për regjistrim është aprovuar nga Ministria e Shëndetësisë.',
    'doctor.onboarding': 'Regjistrimi i Doktorit',
    
    // MSH
    'msh.dashboard': 'Paneli MSH',
    'msh.pendingDoctors': 'Doktorët në Pritje',
    'msh.allDoctors': 'Të Gjithë Doktorët',
    'msh.statistics': 'Statistikat',
    'msh.doctorReview': 'Rishikimi i Doktorit',
    'msh.settings': 'Cilësimet',
    'msh.login': 'Hyrja në Ministrinë e Shëndetësisë',
    'msh.loginDescription': 'Qasje zyrtare për administratorët e Ministrisë së Shëndetësisë',
    'msh.loginButton': 'Hyr si Ministri i Shëndetësisë',
    'msh.accessDenied': 'Qasja u refuzua. Kjo hyrje është vetëm për zyrtarët e Ministrisë së Shëndetësisë.',
    'msh.adminPanel': 'Paneli i Administratorit',
    'msh.ministryOfHealth': 'Ministria e Shëndetësisë',
    'msh.pendingApplications': 'Aplikacionet e Doktorëve në Pritje',
    'msh.noPendingApplications': 'Nuk ka aplikacione doktorësh në pritje',
    'msh.doctorFullName': 'Emri i Plotë i Doktorit',
    'msh.specialization': 'Specializimi',
    'msh.licenseNumber': 'Numri i Licencës',
    'msh.applicationDate': 'Data e Aplikimit',
    'msh.workplaceName': 'Emri i Vendit të Punës',
    'msh.actions': 'Veprimet',
    'msh.viewLicense': 'Shiko Licencën',
    'msh.viewIdCard': 'Shiko Letërnjoftimin',
    'msh.viewCertificate': 'Shiko Certifikatën',
    'msh.approve': 'Aprovo',
    'msh.reject': 'Refuzo',
    'msh.doctorApproved': 'Doktori u aprovua me sukses',
    'msh.doctorRejected': 'Doktori u refuzua me sukses',
    'msh.errorLoading': 'Gabim në ngarkimin e doktorëve',
    'msh.documents': 'Dokumentet',
    'msh.workplace': 'Emri i Vendit të Punës',
    
    // Pharmacy
    'pharmacy.advertising': 'Reklamim / Promovim Produkti',
    'pharmacy.purchaseAdSlot': 'Bli një slot reklamimi për të promovuar produktet e tua te përdoruesit.',
    'pharmacy.purchaseAd': 'Bli Slot Reklamimi (€9.99)',
    'pharmacy.adSlotPurchased': 'Slot reklamimi u blenë! Krijoni reklamën tuaj më poshtë.',
    'pharmacy.createAdvertisement': 'Krijo Reklamë',
    'pharmacy.adImage': 'Imazhi i Reklamës',
    'pharmacy.offerText': 'Teksti i Ofertës',
    'pharmacy.enterOfferText': 'Shkruani tekstin e ofertës ose promovimit tuaj...',
    'pharmacy.selectProduct': 'Zgjidh Produktin për Promovim',
    'pharmacy.selectProductPlaceholder': 'Zgjidh një produkt...',
    'pharmacy.publishAd': 'Publiko Reklamën',
    'pharmacy.adActive': 'Reklama është aktive dhe e dukshme për përdoruesit',
    'pharmacy.adPublished': 'Reklama u publikua me sukses!',
    'pharmacy.selectProductError': 'Ju lutemi zgjidhni një produkt për promovim',
    'pharmacy.products': 'Produktet',
    'pharmacy.addProduct': 'Shto Produkt',
    'pharmacy.noProducts': 'Nuk ka produkte ende. Shto produktin tënd të parë!',
    'pharmacy.productName': 'Emri',
    'pharmacy.productDescription': 'Përshkrimi',
    'pharmacy.productImage': 'Imazhi i Produktit',
    'pharmacy.productPrice': 'Çmimi (€)',
    'pharmacy.productCategory': 'Kategoria',
    'pharmacy.stockQuantity': 'Sasia në Stok',
    'pharmacy.inStock': 'Në Stok',
    'pharmacy.uploadAfterCreate': 'Ngarko imazhin pas krijimit të produktit',
    'pharmacy.editProduct': 'Ndrysho Produktin',
    'pharmacy.createProduct': 'Krijo',
    'pharmacy.updateProduct': 'Përditëso',
    
    // Admin
    'admin.dashboard': 'Paneli i Administratorit',
    'admin.users': 'Përdoruesit',
    'admin.pharmacies': 'Farmacitë',
    'admin.products': 'Produktet',
    'admin.doctorRequests': 'Kërkesat e Doktorëve',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Default to Albanian (AL)
    const savedLanguage = localStorage.getItem('pharmacare_language');
    return savedLanguage || 'al';
  });

  useEffect(() => {
    localStorage.setItem('pharmacare_language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'al' : 'en');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

