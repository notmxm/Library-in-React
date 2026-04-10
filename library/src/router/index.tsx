import { createBrowserRouter, Navigate} from 'react-router-dom';
import { BooksListPage } from '../pages/books/BooksListPage';
import { Layout } from '../components/layout/Layout';
import { NotFoundPage } from '../pages/NotFoundPage';
import { BookDetailPage } from '../pages/books/BookDetailPage';
import { BookCreatePage } from '../pages/books/BookCreatePage';
import { BookEditPage } from '../pages/books/BookEditPage';
import { AuthorListPage } from '../pages/authors/AuthorListPage';
import { AuthorDetailPage } from '../pages/authors/AuthorDetailPage';
import { AuthorEditPage } from '../pages/authors/AuthorEditPage';
import { AuthorCreatePage } from '../pages/authors/AuthorCreatePage';


// https://reactrouter.com/start/framework/routing
// https://reactrouter.com/6.30.3/start/concepts#index-routes
// https://reactrouter.com/6.30.3/components/navigate
// https://reactrouter.com/api/components/NavLink

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children : [
      { index: true, element: <Navigate to="/books" replace /> },
      { path: 'books', element: <BooksListPage /> },
      { path: 'books/new', element: <BookCreatePage /> },
      { path: `books/:id`, element: <BookDetailPage/>},
      { path: 'books/:id/edit', element: <BookEditPage /> },

      {path: `authors`, element: <AuthorListPage />},
      {path: `authors/:id`, element: <AuthorDetailPage />},
      {path: `authors/:id/edit`, element: <AuthorEditPage />},
      {path: `authors/new`, element: <AuthorCreatePage />},

      { path: '*', element: <NotFoundPage /> }
    ]
  }
  
]);