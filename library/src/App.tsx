/* 
  Tutto parte da index.html che ha un div vuoto con id "root" e script che punta a main.tsx.

  main.tsx è il punto di ingresso dell app React, dove viene montato il componente App dentro il div "root".

  App.tsx è il componente principale dell app, dove viene definita la struttura generale e le rotte.
  RouterProvider va a leggere la configurazione delle rotte da router/index.tsx e renderizza il componente corrispondente alla rotta attiva.

*/


import { RouterProvider } from 'react-router-dom';
import { router } from './router';

export default function App() {
  return <RouterProvider router={router} />;
}