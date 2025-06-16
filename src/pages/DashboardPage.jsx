import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  BookOpen, 
  Brain, 
  Play, 
  Edit, 
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DashboardPage = () => {
  const { user } = useAuth();
  const { flashcards, quizzes, deleteFlashcardSet, deleteQuiz, searchContent } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchContent(query);
      setSearchResults(results);
    } else {
      setSearchResults(null);
    }
  };

  const handleDeleteFlashcard = (id, title) => {
    deleteFlashcardSet(id);
    toast({
      title: "Conjunto excluído",
      description: `O conjunto de flashcards "${title}" foi removido com sucesso.`,
    });
  };

  const handleDeleteQuiz = (id, title) => {
    deleteQuiz(id);
    toast({
      title: "Quiz excluído",
      description: `O quiz "${title}" foi removido com sucesso.`,
    });
  };

  const handleEditFlashcard = (id) => {
    navigate(`/create-flashcards?edit=${id}`);
  };

  const handleEditQuiz = (id) => {
    navigate(`/create-quiz?edit=${id}`);
  };

  const displayFlashcards = searchResults ? searchResults.flashcards : flashcards;
  const displayQuizzes = searchResults ? searchResults.quizzes : quizzes;

  const stats = {
    totalFlashcards: flashcards.length,
    totalQuizzes: quizzes.length,
    totalCards: flashcards.reduce((acc, set) => acc + set.cards.length, 0),
    totalQuestions: quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo de volta, {user?.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Continue seus estudos ou crie novos conteúdos
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conjuntos de Flashcards</p>
                  <p className="text-2xl font-bold">{stats.totalFlashcards}</p>
                </div>
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Cards</p>
                  <p className="text-2xl font-bold">{stats.totalCards}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quizzes</p>
                  <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
                </div>
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Perguntas</p>
                  <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <Link to="/create-flashcards">
            <Card className="card-hover cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Criar Flashcards</h3>
                <p className="text-muted-foreground">
                  Crie um novo conjunto de flashcards para seus estudos
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/create-quiz">
            <Card className="card-hover cursor-pointer h-full">
              <CardContent className="p-6 text-center">
                <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Criar Quiz</h3>
                <p className="text-muted-foreground">
                  Monte um quiz personalizado para testar seus conhecimentos
                </p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar flashcards e quizzes..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Tabs defaultValue="flashcards" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="flashcards">
                Meus Flashcards ({displayFlashcards.length})
              </TabsTrigger>
              <TabsTrigger value="quizzes">
                Meus Quizzes ({displayQuizzes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flashcards" className="mt-6">
              {displayFlashcards.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'Nenhum flashcard encontrado' : 'Nenhum flashcard criado ainda'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? 'Tente pesquisar com outros termos'
                        : 'Comece criando seu primeiro conjunto de flashcards'
                      }
                    </p>
                    {!searchQuery && (
                      <Link to="/create-flashcards">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Flashcards
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayFlashcards.map((flashcardSet) => (
                    <Card key={flashcardSet.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg">{flashcardSet.title}</CardTitle>
                        <CardDescription>
                          {flashcardSet.cards.length} cards • {flashcardSet.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden text-ellipsis">
                          {flashcardSet.description || "Sem descrição"}
                        </p>
                        <div className="flex space-x-2">
                          <Link to={`/study/flashcards/${flashcardSet.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              Estudar
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditFlashcard(flashcardSet.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o conjunto de flashcards "{flashcardSet.title}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteFlashcard(flashcardSet.id, flashcardSet.title)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="quizzes" className="mt-6">
              {displayQuizzes.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {searchQuery ? 'Nenhum quiz encontrado' : 'Nenhum quiz criado ainda'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery 
                        ? 'Tente pesquisar com outros termos'
                        : 'Comece criando seu primeiro quiz'
                      }
                    </p>
                    {!searchQuery && (
                      <Link to="/create-quiz">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Criar Quiz
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayQuizzes.map((quiz) => (
                    <Card key={quiz.id} className="card-hover">
                      <CardHeader>
                        <CardTitle className="text-lg">{quiz.title}</CardTitle>
                        <CardDescription>
                          {quiz.questions.length} perguntas • {quiz.category}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden text-ellipsis">
                          {quiz.description || "Sem descrição"}
                        </p>
                        <div className="flex space-x-2">
                          <Link to={`/study/quiz/${quiz.id}`} className="flex-1">
                            <Button size="sm" className="w-full">
                              <Play className="h-4 w-4 mr-2" />
                              Responder
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditQuiz(quiz.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o quiz "{quiz.title}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;