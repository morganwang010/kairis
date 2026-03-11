import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 导入翻译资源
import zhTranslation from './locales/zh.json'
import enTranslation from './locales/en.json'
// import idTranslation from './locales/id.json'

// 初始化i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      zh: {
        translation: zhTranslation
      },
      en: {
        translation: enTranslation
      },
      // id: {
      //   translation: idTranslation
      // }
    },
    lng: 'en', // 默认语言
    fallbackLng: 'zh', // 回退语言
    interpolation: {
      escapeValue: false // React已经安全地转义了
    },
    detection: {
      // 尝试从本地存储获取语言
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n