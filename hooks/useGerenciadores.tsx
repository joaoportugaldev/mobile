import ContextoGerenciador from "@/contexts/ContextoGerenciador";
import { useContext } from "react";

const useGerenciadores = () => useContext(ContextoGerenciador);
export default useGerenciadores;
