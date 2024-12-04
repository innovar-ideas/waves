import { Suspense } from "react";
import AuthPage from "./_components/auth-component";


const Page = () => {

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthPage />
    </Suspense>
  );
};

export default Page;
