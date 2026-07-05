import { createContext, useState, useContext } from 'react';
import ScaleLoader from "react-spinners/ScaleLoader";

export const LoadingContext = createContext("");

export const LoadingProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    let [color] = useState("#ffffff");

    return (
        <LoadingContext.Provider value={{ loading, setLoading }}>
            {
                loading ? (
                <ScaleLoader
                    color={color}
                    loading={loading}
                    size={250}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                    className="my_spanner"
                />
                ) : (
                ""
                )
            }
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    return useContext(LoadingContext);
};