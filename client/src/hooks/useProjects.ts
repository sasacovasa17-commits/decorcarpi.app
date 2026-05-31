import { useState, useEffect, useCallback } from "react";

export interface Project {
  id: string;
  type: "Stucchi" | "Vernice" | "Antimuffa" | "apartment";
  title: string;
  data: Record<string, any>;
  totalMin: number;
  totalMax: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "decor-carpi-projects";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Carica progetti da localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProjects(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error("Errore nel caricamento progetti:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Salva progetti in localStorage
  const saveProjects = useCallback((updatedProjects: Project[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
      setProjects(updatedProjects);
    } catch (error) {
      console.error("Errore nel salvataggio progetti:", error);
    }
  }, []);

  // Aggiungi nuovo progetto
  const addProject = useCallback((
    type: Project["type"],
    title: string,
    data: Record<string, any>,
    totalMin: number,
    totalMax: number
  ) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      type,
      title,
      data,
      totalMin,
      totalMax,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [...projects, newProject];
    saveProjects(updated);
    return newProject;
  }, [projects, saveProjects]);

  // Aggiorna progetto
  const updateProject = useCallback((
    id: string,
    updates: Partial<Omit<Project, "id" | "createdAt">>
  ) => {
    const updated = projects.map(p =>
      p.id === id
        ? {
            ...p,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : p
    );
    saveProjects(updated);
  }, [projects, saveProjects]);

  // Rimuovi progetto
  const deleteProject = useCallback((id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
  }, [projects, saveProjects]);

  // Ottieni progetto per ID
  const getProject = useCallback((id: string) => {
    return projects.find(p => p.id === id);
  }, [projects]);

  // Ottieni progetti per tipo
  const getProjectsByType = useCallback((type: Project["type"]) => {
    return projects.filter(p => p.type === type);
  }, [projects]);

  return {
    projects,
    loading,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    getProjectsByType,
  };
}
