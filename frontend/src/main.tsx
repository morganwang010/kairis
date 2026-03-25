import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
// import { BrowserRouter } from 'react-router-dom'
// import { ConfigProvider } from 'antd'
// import zhCN from 'antd/locale/zh_CN'
import { store } from './stores'
import './locales'
import './index.css'
import App from './App.tsx'
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Your i18n setup file

createRoot(document.getElementById('root')!).render(
  <I18nextProvider i18n={i18n}>

 <StrictMode>
    <Provider store={store}>
    <App />
    </Provider>

  </StrictMode>,
  </I18nextProvider>
 
)

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <Provider store={store}>
//       <BrowserRouter>
//         <ConfigProvider locale={zhCN}>
//           <App />
//         </ConfigProvider>
//       </BrowserRouter>
//     </Provider>
//   </StrictMode>,
// )
