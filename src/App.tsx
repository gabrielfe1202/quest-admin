import { useEffect, useState } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import ECommerce from './pages/Dashboard/ECommerce';
import DefaultLayout from './layout/DefaultLayout';
import Level from './pages/Level/Index';
import LevelEdit from './pages/Level/LevelEdit';
import LevelPublish from './pages/Level/LevelPublish';

type RequiredAuthenticationProps = {
  isAllowed: boolean;
  children: React.ReactNode
}

function RequiredAuthentication({ isAllowed = false, children }: RequiredAuthenticationProps) {
  if (!isAllowed) return <Navigate to="/admin/auth/signin" replace />;

  return children;
}

function checkUserAuthentication(): boolean {
  const adminUserId = localStorage.getItem("adminUserId")

  return adminUserId !== null;
}

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    window.scrollTo(0, 0);

    setTimeout(() => setLoading(false), 1000);
  }, [pathname]);

  return loading ? (
    <Loader />
  ) : (
  <>
    <Routes>
      <Route 
       path='/admin/auth/signin'
       element={<SignIn />}
      />
    </Routes>
    <RequiredAuthentication isAllowed={checkUserAuthentication()}>
      <DefaultLayout>
        <Routes>
          <Route
            path='/admin'
            element={
              <>
                <PageTitle title="eCommerce Dashboard | TailAdmin - Tailwind CSS Admin Dashboard Template" />
                <ECommerce />
              </>
            }
          />
          <Route
            path="/admin/Level"
            element={
              <>
                <PageTitle title="Level" />
                <Level />
              </>
            }
          />
          <Route
            path="/admin/Level/edit/:id"
            element={
              <>
                <PageTitle title="Edit level" />
                <LevelEdit />
              </>
            }
          />
          <Route
            path="/admin/Level/Publish/:id"
            element={
              <>
                <PageTitle title="Publish level" />
                <LevelPublish />
              </>
            }
          />
        </Routes>
      </DefaultLayout>
    </RequiredAuthentication>
    </>
  );
}

export default App;
