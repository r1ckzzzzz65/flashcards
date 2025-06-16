import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle,
  Trophy,
  RefreshCw,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Navbar from '@/components/Navbar';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const StudyPage = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { flashcards, quizzes } = useData();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null); 
  const [writtenInput, setWrittenInput] = useState(''); 
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const content = type === 'flashcards' 
    ? flashcards.find(set => set.id === id)
    : quizzes.find(quiz => quiz.id === id);

  const items = type === 'flashcards' ? content?.cards : content?.questions;
  const totalItems = items?.length || 0;
  const progress = totalItems > 0 ? ((isCompleted ? totalItems : currentIndex +1) / totalItems) * 100 : 0;


  useEffect(() => {
    if (!content) {
      toast({
        title: "Conteúdo não encontrado",
        description: "O conteúdo solicitado não existe ou foi removido.",
        variant: "destructive",
      });
      navigate('/dashboard');
    }
  }, [content, navigate]);
  
  useEffect(() => {
    setIsFlipped(false);
    setSelectedAnswer(null);
    setWrittenInput('');
    setShowResult(false);
  }, [currentIndex]);


  const handleNext = () => {
    if (currentIndex < totalItems - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsCompleted(true);
      if (type === 'flashcards') {
         toast({
            title: "Sessão de Flashcards Concluída!",
            description: "Você revisou todos os cards.",
        });
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsCompleted(false); 
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const checkAnswer = (currentQuestion, userAnswer) => {
    let isCorrect = false;
    if (currentQuestion.type === 'multiple-choice') {
      isCorrect = userAnswer === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'written') {
      isCorrect = userAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();
    }
    return isCorrect;
  };

  const handleSubmitAnswer = () => {
    if (showResult) return; 

    const currentQuestion = items[currentIndex];
    let userAnswer;
    let isCorrect = false;

    if (currentQuestion.type === 'multiple-choice') {
      if (selectedAnswer === null) {
        toast({ title: "Atenção", description: "Por favor, selecione uma opção.", variant: "default" });
        return;
      }
      userAnswer = selectedAnswer;
      isCorrect = checkAnswer(currentQuestion, userAnswer);
    } else if (currentQuestion.type === 'written') {
      if (!writtenInput.trim()) {
         toast({ title: "Atenção", description: "Por favor, digite sua resposta.", variant: "default" });
        return;
      }
      userAnswer = writtenInput;
      isCorrect = checkAnswer(currentQuestion, userAnswer);
    }
    
    setShowResult(true);
    
    const newAnswerRecord = {
      questionId: currentQuestion.id, 
      userAnswer: userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect
    };
    
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id);
    if (existingAnswerIndex > -1) {
        const updatedAnswers = [...answers];
        if (!updatedAnswers[existingAnswerIndex].isCorrect && isCorrect) {
            setScore(prevScore => prevScore + 1);
        } else if (updatedAnswers[existingAnswerIndex].isCorrect && !isCorrect) {
            setScore(prevScore => prevScore - 1);
        }
        updatedAnswers[existingAnswerIndex] = newAnswerRecord;
        setAnswers(updatedAnswers);
    } else {
        setAnswers([...answers, newAnswerRecord]);
        if (isCorrect) {
            setScore(prevScore => prevScore + 1);
        }
    }
  };


  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setIsCompleted(false);
  };

  if (!content || !items || items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-xl text-muted-foreground">Carregando conteúdo ou conteúdo não encontrado...</p>
            <Button onClick={() => navigate('/dashboard')} className="mt-4">Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }
  
  const currentItem = items[currentIndex];

  if (isCompleted && type === 'quiz') {
    const percentage = totalItems > 0 ? Math.round((score / totalItems) * 100) : 0;
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="text-center">
            <Card className="p-8">
              <CardContent className="space-y-6">
                <Trophy className="h-16 w-16 text-primary mx-auto" />
                <h1 className="text-3xl font-bold">Quiz Concluído!</h1>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold">Sua pontuação: {score}/{totalItems}</p>
                  <p className="text-lg text-muted-foreground">{percentage}% de acertos</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Resumo das Respostas:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                  {items.map((question, questionGlobalIndex) => {
                      const answer = answers.find(a => a.questionId === question.id);
                      if (!answer) return null;
                      return (
                        <div key={question.id} className={`p-3 rounded-lg border ${answer.isCorrect ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'}`}>
                            <div className="flex items-center space-x-2">
                            {answer.isCorrect ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                            <span className="text-sm font-medium text-left">
                                Pergunta {questionGlobalIndex + 1}: {question.question.substring(0,50)}{question.question.length > 50 ? "..." : ""} - {answer.isCorrect ? 'Correta' : 'Incorreta'}
                            </span>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="flex space-x-4 justify-center">
                  <Button onClick={handleRestart}><RefreshCw className="h-4 w-4 mr-2" />Tentar Novamente</Button>
                  <Button variant="outline" onClick={() => navigate('/dashboard')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar ao Dashboard</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
              <div>
                <h1 className="text-2xl font-bold">{content.title}</h1>
                <p className="text-muted-foreground">{type === 'flashcards' ? 'Estudando flashcards' : 'Respondendo quiz'}</p>
              </div>
            </div>
            {type === 'quiz' && (<div className="text-right"><p className="text-sm text-muted-foreground">Pontuação</p><p className="text-lg font-semibold">{score}/{totalItems}</p></div>)}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">{isCompleted ? totalItems : currentIndex + 1} de {totalItems}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mb-8 min-h-[300px] flex items-center justify-center">
            {type === 'flashcards' ? (
              <div className="flip-card h-96 w-full" onClick={handleFlip}>
                <motion.div 
                  className="flip-card-inner w-full h-full"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flip-card-front w-full h-full">
                    <Card className="h-full cursor-pointer card-hover"><CardContent className="h-full flex items-center justify-center p-8 text-center"><p className="text-2xl">{currentItem?.front}</p></CardContent></Card>
                  </div>
                  <div className="flip-card-back w-full h-full">
                    <Card className="h-full cursor-pointer card-hover bg-primary/5"><CardContent className="h-full flex items-center justify-center p-8 text-center"><p className="text-2xl">{currentItem?.back}</p></CardContent></Card>
                  </div>
                </motion.div>
              </div>
            ) : (
              <Card className="w-full">
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold mb-6">{currentItem?.question}</h2>
                  {currentItem?.type === 'multiple-choice' ? (
                    <div className="space-y-3">
                      {currentItem?.options.map((option, index) => {
                        let buttonClass = "w-full text-left p-4 border rounded-lg transition-colors text-foreground";
                        if (showResult) {
                          if (index === currentItem.correctAnswer) buttonClass += " bg-green-100 border-green-300 text-green-800 dark:bg-green-950 dark:border-green-700 dark:text-green-200";
                          else if (index === selectedAnswer) buttonClass += " bg-red-100 border-red-300 text-red-800 dark:bg-red-950 dark:border-red-700 dark:text-red-200";
                          else buttonClass += " bg-muted";
                        } else {
                          buttonClass += selectedAnswer === index ? " bg-accent ring-2 ring-primary" : " hover:bg-accent";
                        }
                        return (
                          <motion.button key={index} className={buttonClass} onClick={() => !showResult && setSelectedAnswer(index)} disabled={showResult} whileHover={{ scale: showResult ? 1 : 1.02 }} whileTap={{ scale: showResult ? 1 : 0.98 }}>
                            <div className="flex items-center space-x-3">
                              <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${selectedAnswer === index && !showResult ? 'border-primary text-primary' : 'border-muted-foreground'}`}>{String.fromCharCode(65 + index)}</span>
                              <span>{option}</span>
                              {showResult && index === currentItem.correctAnswer && (<CheckCircle className="h-5 w-5 text-green-600 ml-auto" />)}
                              {showResult && index === selectedAnswer && index !== currentItem.correctAnswer && (<XCircle className="h-5 w-5 text-red-600 ml-auto" />)}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  ) : ( 
                    <div className="space-y-4">
                      <Textarea placeholder="Digite sua resposta aqui..." value={writtenInput} onChange={(e) => setWrittenInput(e.target.value)} disabled={showResult} rows={3} />
                      {showResult && (
                        <div className={`p-3 rounded-lg border ${checkAnswer(currentItem, writtenInput) ? 'bg-green-100 border-green-300 dark:bg-green-950 dark:border-green-700' : 'bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-700'}`}>
                          <p className={`text-sm font-medium ${checkAnswer(currentItem, writtenInput) ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                            {checkAnswer(currentItem, writtenInput) ? 'Resposta Correta!' : 'Resposta Incorreta.'}
                          </p>
                          {!checkAnswer(currentItem, writtenInput) && <p className="text-sm text-muted-foreground">Resposta correta: {currentItem.correctAnswer}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  {type === 'quiz' && !showResult && !isCompleted && (
                    <Button onClick={handleSubmitAnswer} className="mt-6 w-full sm:w-auto">
                        <Send className="h-4 w-4 mr-2" />
                        Verificar Resposta
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}><ChevronLeft className="h-4 w-4 mr-2" />Anterior</Button>
            {type === 'flashcards' && (<Button variant="outline" onClick={handleFlip} disabled={isCompleted}><RotateCcw className="h-4 w-4 mr-2" />Virar Card</Button>)}
            
            {isCompleted ? (
                 <Button onClick={() => navigate('/dashboard')}>
                    <Trophy className="h-4 w-4 mr-2" />
                    Finalizar Sessão
                </Button>
            ) : (
                <Button onClick={handleNext} disabled={type === 'quiz' && !showResult && !isCompleted}>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyPage;
