"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "en" | "ar"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  dir: "ltr" | "rtl"
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.about": "About",
    "nav.filaments": "Filaments",
    "nav.designTool": "Design Tool",
    "nav.getStarted": "Get Started",
    "nav.cart": "Cart",
    "nav.brand": "BeeGreen",
    
    // Hero
    "hero.title": "Transform Ideas Into Printable Reality",
    "hero.subtitle": "AI-powered 3D design tools and custom filament creation for makers, artists, and engineers.",
    "hero.cta.design": "Start Designing",
    "hero.cta.filaments": "Explore Filaments",
    "hero.scroll": "Scroll to explore",
    "hero.stat.models": "Models Created",
    "hero.stat.filaments": "Filament Types",
    "hero.stat.makers": "Active Makers",
    
    // Features
    "features.title": "Powerful Tools for Makers",
    "features.subtitle": "Everything you need to bring your 3D printing ideas to life",
    "features.textToStl.title": "Text to STL",
    "features.textToStl.desc": "Describe your idea in words and let AI generate a 3D model ready for printing.",
    "features.imageToStl.title": "Image to STL",
    "features.imageToStl.desc": "Upload any image and convert it into a detailed 3D printable model.",
    "features.viewer.title": "3D Viewer",
    "features.viewer.desc": "Preview and inspect your models from every angle before printing.",
    "features.generator.title": "Filament Generator",
    "features.generator.desc": "Create custom filament blends tailored to your specific project needs.",
    "features.marketplace.title": "Marketplace",
    "features.marketplace.desc": "Shop premium filaments from sustainable and innovative materials.",
    
    // About Section
    "about.title": "Our Mission",
    "about.subtitle": "Empowering creators with sustainable 3D printing solutions",
    "about.desc": "We believe in making 3D printing accessible, sustainable, and innovative. Our AI-powered tools help you create without limits.",
    "about.innovation": "Innovation",
    "about.innovation.desc": "Cutting-edge AI technology",
    "about.sustainability": "Sustainability",
    "about.sustainability.desc": "Eco-friendly materials",
    "about.community": "Community",
    "about.community.desc": "Supporting makers worldwide",
    
    // Filaments
    "filaments.title": "Filament Marketplace",
    "filaments.subtitle": "Discover premium materials for your 3D printing projects",
    "filaments.search": "Search filaments...",
    "filaments.addToCart": "Add to Cart",
    "filaments.outOfStock": "Out of Stock",
    "filaments.inStock": "In Stock",
    "filaments.generator.title": "Custom Filament Generator",
    "filaments.generator.subtitle": "Describe your requirements and get a custom filament recommendation",
    "filaments.generator.placeholder": "Describe your project needs (e.g., flexible material for outdoor use, heat resistant...)",
    "filaments.generator.button": "Generate Recommendation",
    "filaments.generator.generating": "Generating...",
    "filaments.noResults": "No filaments found matching your search.",
    "filaments.currency": "QAR",
    
    // Design Tool
    "designTool.title": "AI Design Tool",
    "designTool.subtitle": "Transform your ideas into 3D printable models",
    "designTool.textTab": "Text to STL",
    "designTool.imageTab": "Image to STL",
    "designTool.textPlaceholder": "Describe the model you want, e.g. A hexagonal phone stand, 90mm tall, with a 12mm wide slot to hold a phone at a 60 degree angle.",
    "designTool.codePlaceholder": "Enter OpenSCAD code, e.g. cube([20, 20, 20]);",
    "designTool.generate": "Generate Model",
    "designTool.generating": "Generating...",
    "designTool.writingCode": "Writing OpenSCAD code...",
    "designTool.advancedToggle": "Write code directly",
    "designTool.generatedCode": "Generated OpenSCAD code",
    "designTool.rerender": "Re-render",
    "designTool.upload": "Upload Image",
    "designTool.uploadDesc": "Drag and drop an image or click to browse",
    "designTool.preview": "3D Preview",
    "designTool.download": "Download STL",
    "designTool.editor.title": "Edit Parts",
    "designTool.editor.hint": "Click a part in the 3D view to edit its dimensions",
    "designTool.editor.updating": "Updating model...",
    "designTool.editor.empty": "Select a part above or in the 3D view to edit its dimensions.",
    "designTool.editor.selected": "Selected",
    "designTool.editor.noParams": "This part has no editable dimensions.",
    "designTool.tips.title": "Tips for Best Results",
    "designTool.tips.1": "Be specific about dimensions and proportions",
    "designTool.tips.2": "Mention the intended use for better optimization",
    "designTool.tips.3": "Include details about surface texture if needed",
    
    // About Page
    "aboutPage.title": "About BeeGreen",
    "aboutPage.mission.title": "Our Mission",
    "aboutPage.mission.desc": "We are dedicated to revolutionizing 3D printing by combining artificial intelligence with sustainable materials. Our goal is to make professional-grade 3D design accessible to everyone.",
    "aboutPage.values.title": "Our Values",
    "aboutPage.values.innovation": "Innovation First",
    "aboutPage.values.innovation.desc": "Pushing the boundaries of what's possible with AI and 3D printing technology.",
    "aboutPage.values.sustainability": "Sustainable Future",
    "aboutPage.values.sustainability.desc": "Committed to eco-friendly materials and responsible manufacturing practices.",
    "aboutPage.values.community": "Community Driven",
    "aboutPage.values.community.desc": "Building a global community of makers, artists, and innovators.",
    "aboutPage.values.quality": "Quality Assured",
    "aboutPage.values.quality.desc": "Every product and service meets the highest standards of excellence.",
    "aboutPage.team.title": "Our Team",
    "aboutPage.team.member1.name": "Sarah Johnson",
    "aboutPage.team.member1.role": "CEO & Founder",
    "aboutPage.team.member2.name": "Ahmed Hassan",
    "aboutPage.team.member2.role": "CTO",
    "aboutPage.team.member3.name": "Maria Garcia",
    "aboutPage.team.member3.role": "Head of Design",
    "aboutPage.team.member4.name": "James Chen",
    "aboutPage.team.member4.role": "Lead Engineer",
    
    // Footer
    "footer.desc": "AI-powered 3D design tools and custom filaments for makers.",
    "footer.product": "Product",
    "footer.company": "Company",
    "footer.support": "Support",
    "footer.legal": "Legal",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.about": "About",
    "footer.careers": "Careers",
    "footer.help": "Help Center",
    "footer.contact": "Contact",
    "footer.privacy": "Privacy",
    "footer.terms": "Terms",
    "footer.rights": "All rights reserved.",
  },
  ar: {
    // Navigation
    "nav.about": "من نحن",
    "nav.filaments": "الخيوط",
    "nav.designTool": "أداة التصميم",
    "nav.getStarted": "ابدأ الآن",
    "nav.cart": "السلة",
    "nav.brand": "بي جرين",
    
    // Hero
    "hero.title": "حوّل أفكارك إلى واقع قابل للطباعة",
    "hero.subtitle": "أدوات تصميم ثلاثية الأبعاد مدعومة بالذكاء الاصطناعي وإنشاء خيوط مخصصة للصناع والفنانين والمهندسين.",
    "hero.cta.design": "ابدأ التصميم",
    "hero.cta.filaments": "استكشف الخيوط",
    "hero.scroll": "مرر لاستكشاف المزيد",
    "hero.stat.models": "نماذج تم إنشاؤها",
    "hero.stat.filaments": "أنواع الخيوط",
    "hero.stat.makers": "صانع نشط",
    
    // Features
    "features.title": "أدوات قوية للصناع",
    "features.subtitle": "كل ما تحتاجه لإحياء أفكار الطباعة ثلاثية الأبعاد",
    "features.textToStl.title": "نص إلى STL",
    "features.textToStl.desc": "صف فكرتك بالكلمات ودع الذكاء الاصطناعي يولد نموذجًا ثلاثي الأبعاد جاهزًا للطباعة.",
    "features.imageToStl.title": "صورة إلى STL",
    "features.imageToStl.desc": "ارفع أي صورة وحولها إلى نموذج ثلاثي الأبعاد قابل للطباعة.",
    "features.viewer.title": "عارض ثلاثي الأبعاد",
    "features.viewer.desc": "معاينة وفحص نماذجك من كل زاوية قبل الطباعة.",
    "features.generator.title": "مولد الخيوط",
    "features.generator.desc": "أنشئ خلطات خيوط مخصصة تناسب احتياجات مشروعك.",
    "features.marketplace.title": "المتجر",
    "features.marketplace.desc": "تسوق خيوط عالية الجودة من مواد مستدامة ومبتكرة.",
    
    // About Section
    "about.title": "مهمتنا",
    "about.subtitle": "تمكين المبدعين بحلول طباعة ثلاثية الأبعاد مستدامة",
    "about.desc": "نؤمن بجعل الطباعة ثلاثية الأبعاد متاحة ومستدامة ومبتكرة. تساعدك أدواتنا المدعومة بالذكاء الاصطناعي على الإبداع بلا حدود.",
    "about.innovation": "الابتكار",
    "about.innovation.desc": "تقنية ذكاء اصطناعي متطورة",
    "about.sustainability": "الاستدامة",
    "about.sustainability.desc": "مواد صديقة للبيئة",
    "about.community": "المجتمع",
    "about.community.desc": "دعم الصناع حول العالم",
    
    // Filaments
    "filaments.title": "متجر الخيوط",
    "filaments.subtitle": "اكتشف مواد عالية الجودة لمشاريع الطباعة ثلاثية الأبعاد",
    "filaments.search": "ابحث عن خيوط...",
    "filaments.addToCart": "أضف للسلة",
    "filaments.outOfStock": "غير متوفر",
    "filaments.inStock": "متوفر",
    "filaments.generator.title": "مولد الخيوط المخصصة",
    "filaments.generator.subtitle": "صف متطلباتك واحصل على توصية خيط مخصصة",
    "filaments.generator.placeholder": "صف احتياجات مشروعك (مثال: مادة مرنة للاستخدام الخارجي، مقاومة للحرارة...)",
    "filaments.generator.button": "توليد التوصية",
    "filaments.generator.generating": "جاري التوليد...",
    "filaments.noResults": "لم يتم العثور على خيوط مطابقة لبحثك.",
    "filaments.currency": "ر.ق",
    
    // Design Tool
    "designTool.title": "أداة التصميم بالذكاء الاصطناعي",
    "designTool.subtitle": "حوّل أفكارك إلى نماذج ثلاثية الأبعاد قابلة للطباعة",
    "designTool.textTab": "نص إلى STL",
    "designTool.imageTab": "صورة إلى STL",
    "designTool.textPlaceholder": "صف النموذج الذي تريده، مثال: حامل هاتف سداسي، ارتفاعه 90 ملم، بفتحة 12 ملم لتثبيت الهاتف بزاوية 60 درجة.",
    "designTool.codePlaceholder": "أدخل كود OpenSCAD، مثال: cube([20, 20, 20]);",
    "designTool.generate": "توليد النموذج",
    "designTool.generating": "جاري التوليد...",
    "designTool.writingCode": "جاري كتابة كود OpenSCAD...",
    "designTool.advancedToggle": "كتابة الكود مباشرة",
    "designTool.generatedCode": "كود OpenSCAD المُولّد",
    "designTool.rerender": "إعادة العرض",
    "designTool.upload": "رفع صورة",
    "designTool.uploadDesc": "اسحب وأفلت صورة أو انقر للتصفح",
    "designTool.preview": "معاينة ثلاثية الأبعاد",
    "designTool.download": "تحميل STL",
    "designTool.editor.title": "تعديل الأجزاء",
    "designTool.editor.hint": "انقر على جزء في العرض ثلاثي الأبعاد لتعديل أبعاده",
    "designTool.editor.updating": "جاري تحديث النموذج...",
    "designTool.editor.empty": "اختر جزءًا أعلاه أو في العرض ثلاثي الأبعاد لتعديل أبعاده.",
    "designTool.editor.selected": "المحدد",
    "designTool.editor.noParams": "لا توجد أبعاد قابلة للتعديل لهذا الجزء.",
    "designTool.tips.title": "نصائح للحصول على أفضل النتائج",
    "designTool.tips.1": "كن محددًا بشأن الأبعاد والنسب",
    "designTool.tips.2": "اذكر الاستخدام المقصود لتحسين أفضل",
    "designTool.tips.3": "أضف تفاصيل عن ملمس السطح إذا لزم الأمر",
    
    // About Page
    "aboutPage.title": "عن بي جرين",
    "aboutPage.mission.title": "مهمتنا",
    "aboutPage.mission.desc": "نحن ملتزمون بثورة الطباعة ثلاثية الأبعاد من خلال الجمع بين الذكاء الاصطناعي والمواد المستدامة. هدفنا جعل التصميم ثلاثي الأبعاد الاحترافي متاحًا للجميع.",
    "aboutPage.values.title": "قيمنا",
    "aboutPage.values.innovation": "الابتكار أولاً",
    "aboutPage.values.innovation.desc": "دفع حدود الممكن مع تقنية الذكاء الاصطناعي والطباعة ثلاثية الأبعاد.",
    "aboutPage.values.sustainability": "مستقبل مستدام",
    "aboutPage.values.sustainability.desc": "ملتزمون بالمواد الصديقة للبيئة وممارسات التصنيع المسؤولة.",
    "aboutPage.values.community": "مدفوعون بالمجتمع",
    "aboutPage.values.community.desc": "بناء مجتمع عالمي من الصناع والفنانين والمبتكرين.",
    "aboutPage.values.quality": "جودة مضمونة",
    "aboutPage.values.quality.desc": "كل منتج وخدمة تلبي أعلى معايير التميز.",
    "aboutPage.team.title": "فريقنا",
    "aboutPage.team.member1.name": "سارة جونسون",
    "aboutPage.team.member1.role": "الرئيس التنفيذي والمؤسس",
    "aboutPage.team.member2.name": "أحمد حسن",
    "aboutPage.team.member2.role": "المدير التقني",
    "aboutPage.team.member3.name": "ماريا غارسيا",
    "aboutPage.team.member3.role": "رئيس التصميم",
    "aboutPage.team.member4.name": "جيمس تشن",
    "aboutPage.team.member4.role": "كبير المهندسين",
    
    // Footer
    "footer.desc": "أدوات تصميم ثلاثية الأبعاد بالذكاء الاصطناعي وخيوط مخصصة للصناع.",
    "footer.product": "المنتج",
    "footer.company": "الشركة",
    "footer.support": "الدعم",
    "footer.legal": "قانوني",
    "footer.features": "المميزات",
    "footer.pricing": "الأسعار",
    "footer.about": "من نحن",
    "footer.careers": "الوظائف",
    "footer.help": "مركز المساعدة",
    "footer.contact": "اتصل بنا",
    "footer.privacy": "الخصوصية",
    "footer.terms": "الشروط",
    "footer.rights": "جميع الحقوق محفوظة.",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "en" || saved === "ar")) {
      setLanguageState(saved)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
    localStorage.setItem("language", language)
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  const dir = language === "ar" ? "rtl" : "ltr"

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
