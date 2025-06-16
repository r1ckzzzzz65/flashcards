import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setFlashcards([]);
      setQuizzes([]);
    }
  }, [user]);

  const loadUserData = () => {
    const userFlashcards = JSON.parse(localStorage.getItem(`flashcards_${user.id}`) || '[]');
    const userQuizzes = JSON.parse(localStorage.getItem(`quizzes_${user.id}`) || '[]');
    setFlashcards(userFlashcards);
    setQuizzes(userQuizzes);
  };

  const saveFlashcards = (newFlashcards) => {
    setFlashcards(newFlashcards);
    localStorage.setItem(`flashcards_${user.id}`, JSON.stringify(newFlashcards));
  };

  const saveQuizzes = (newQuizzes) => {
    setQuizzes(newQuizzes);
    localStorage.setItem(`quizzes_${user.id}`, JSON.stringify(newQuizzes));
  };

  const createFlashcardSet = (flashcardSet) => {
    const newSet = {
      ...flashcardSet,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedFlashcards = [...flashcards, newSet];
    saveFlashcards(updatedFlashcards);
    return newSet;
  };

  const updateFlashcardSet = (id, updatedSet) => {
    const updatedFlashcards = flashcards.map(set => 
      set.id === id ? { ...set, ...updatedSet, updatedAt: new Date().toISOString() } : set
    );
    saveFlashcards(updatedFlashcards);
  };

  const deleteFlashcardSet = (id) => {
    const updatedFlashcards = flashcards.filter(set => set.id !== id);
    saveFlashcards(updatedFlashcards);
  };

  const createQuiz = (quiz) => {
    const newQuiz = {
      ...quiz,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedQuizzes = [...quizzes, newQuiz];
    saveQuizzes(updatedQuizzes);
    return newQuiz;
  };

  const updateQuiz = (id, updatedQuiz) => {
    const updatedQuizzes = quizzes.map(quiz => 
      quiz.id === id ? { ...quiz, ...updatedQuiz, updatedAt: new Date().toISOString() } : quiz
    );
    saveQuizzes(updatedQuizzes);
  };

  const deleteQuiz = (id) => {
    const updatedQuizzes = quizzes.filter(quiz => quiz.id !== id);
    saveQuizzes(updatedQuizzes);
  };

  const searchContent = (query) => {
    const lowerQuery = query.toLowerCase();
    
    const filteredFlashcards = flashcards.filter(set => 
      set.title.toLowerCase().includes(lowerQuery) ||
      set.description?.toLowerCase().includes(lowerQuery) ||
      set.cards.some(card => 
        card.front.toLowerCase().includes(lowerQuery) ||
        card.back.toLowerCase().includes(lowerQuery)
      )
    );
    
    const filteredQuizzes = quizzes.filter(quiz => 
      quiz.title.toLowerCase().includes(lowerQuery) ||
      quiz.description?.toLowerCase().includes(lowerQuery) ||
      quiz.questions.some(q => 
        q.question.toLowerCase().includes(lowerQuery) ||
        q.options.some(opt => opt.toLowerCase().includes(lowerQuery))
      )
    );
    
    return { flashcards: filteredFlashcards, quizzes: filteredQuizzes };
  };

  return (
    <DataContext.Provider value={{
      flashcards,
      quizzes,
      createFlashcardSet,
      updateFlashcardSet,
      deleteFlashcardSet,
      createQuiz,
      updateQuiz,
      deleteQuiz,
      searchContent
    }}>
      {children}
    </DataContext.Provider>
  );
};