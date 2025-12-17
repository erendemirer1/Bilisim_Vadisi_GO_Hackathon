import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type SnackbarType = "success" | "error" | "info";

interface SnackbarContextType {
  showSnackbar: (message: string, type?: SnackbarType) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined
);

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<SnackbarType>("info");

  const showSnackbar = useCallback(
    (msg: string, type: SnackbarType = "info") => {
      setMessage(msg);
      setType(type);
      setIsOpen(true);

      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    },
    []
  );

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      {isOpen && (
        <div
          className={`fixed bottom-5 right-5 z-[9999] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            type === "success"
              ? "bg-green-600 text-white"
              : type === "error"
              ? "bg-red-600 text-white"
              : "bg-blue-600 text-white"
          }`}
        >
          <div className="text-2xl">
            {type === "success" && "🎉"}
            {type === "error" && "⚠️"}
            {type === "info" && "ℹ️"}
          </div>

          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider opacity-90">
              {type === "success"
                ? "Başarılı"
                : type === "error"
                ? "Hata"
                : "Bilgi"}
            </h4>
            <p className="text-sm font-medium">{message}</p>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="ml-4 opacity-70 hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      )}
    </SnackbarContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
