import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const ApplicationContext = createContext();

export const ApplicationProvider = ({ children }) => {
  const [basket, setBasket] = useState([]);

  const addToBasket = (item) => {
    setBasket((prev) => [...prev, item]);
  };

  return (
    <ApplicationContext.Provider value={{ basket, addToBasket }}>
      {children}
    </ApplicationContext.Provider>
  );
};

ApplicationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
