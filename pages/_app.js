"use client";

import { Provider } from "react-redux";
// import { store, persistor } from "@/store/store";
// import { PersistGate } from "redux-persist/integration/react";
import { ThemeProvider } from "@mui/material";
import style from "@/utils/style";
import ThemeRegistry from "@/utils/style";
import store from "@/redux/store";
// import Layout from "@/components/Layout";

 import "../src/globals.css";
// import { CalendarProvider } from "./xyz/context/CalendarContext";
// import store from "@/redux/store";

export default function App({ Component, pageProps }) {
  return (
   
       <Provider store={store}> 
      
        <ThemeRegistry>
          {/* <PersistGate loading={null} persistor={persistor}> */}
            {/* <Layout> */}
            <Component {...pageProps} />
            {/* </Layout> */}
          {/* </PersistGate> */}
        </ThemeRegistry>
        </Provider>
      
    
  );
}
