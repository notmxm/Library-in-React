import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'

 /*
  è un data store in memoria ram, salva il risultato delle fetch
  usando la queryKey come identificativo univoco.

  Gestisce il garbage collector con un timer interno (gcTime).

  gestisce le race condition e la deduplicazione,
  quindi se due componenti chiedono la stessa query, il queryclient
  fa una sola query e distribuisce i risultati a entrambi i componenti
  
 */
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>

    {/*
        queryclientprovider sfrutta la context api di react
        facendo dependency injection.

        Evita il prop drilling, 
    */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
