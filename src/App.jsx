import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import ProductInfo from "./components/ProductInfo";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import CartList from "./components/CartList";
import ScrollToTop from "./components/ScrollToTop";
import { ApplicationProvider } from "./components/Layout";
import "@fortawesome/fontawesome-free/css/all.min.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function App() {
  if (!clerkPubKey) {
    throw new Error("Missing Publishable Key");
  }

  return (
    <div className="bg-black">
       <ClerkProvider publishableKey={clerkPubKey}>
      <ApplicationProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart/" element={<CartList />} />
            <Route path="/product-info/:id" element={<ProductInfo />} />
            <Route
              path="/sign-in/*"
              element={<SignIn routing="path" path="/sign-in" />}
            />
            <Route
              path="/sign-up/*"
              element={<SignUp routing="path" path="/sign-up" />}
            />
          </Routes>
        </BrowserRouter>
      </ApplicationProvider>
    </ClerkProvider>
    </div>
  );
}

export default App;
