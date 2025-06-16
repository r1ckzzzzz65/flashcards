import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/Navbar';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const CreateQuizPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createQuiz, updateQuiz, quizzes } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      question: '',
      type: 'multiple-choice', // 'multiple-choice' or 'written'
      options: ['', '', '', ''],
      correctAnswer: 0, // Index for multiple-choice, or string for written
      writtenAnswer: ''
    }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      const quizToEdit = quizzes.find(q => q.id === editId);
      if (quizToEdit) {
        setTitle(quizToEdit.title);
        setDescription(quizToEdit.description || '');
        setCategory(quizToEdit.category);
        setQuestions(quizToEdit.questions.map(q => ({ 
          ...q, 
          id: q.id || Date.now() + Math.random(),
          type: q.type || 'multiple-choice',
          options: q.options || ['', '', '', ''],
          correctAnswer: q.correctAnswer === undefined ? (q.type === 'written' ? '' : 0) : q.correctAnswer,
          writtenAnswer: q.writtenAnswer || ''
        })));
        setIsEditing(true);
        setEditingId(editId);
      } else {
        toast({
          title: "Erro",
          description: "Quiz não encontrado para edição.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [location.search, quizzes, navigate]);


  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      writtenAnswer: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    } else {
       toast({
        title: "Atenção",
        description: "Deve haver pelo menos uma pergunta.",
        variant: "default",
      });
    }
  };

  const updateQuestionField = (id, field, value) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };
  
  const updateQuestionType = (id, type) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, type, correctAnswer: type === 'written' ? '' : 0, writtenAnswer: type === 'written' ? q.writtenAnswer : '' } : q
    ));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const setCorrectOptionAnswer = (questionId, optionIndex) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, correctAnswer: optionIndex } : q
    ));
  };

  const setWrittenAnswer = (questionId, answer) => {
    setQuestions(questions.map(q =>
      q.id === questionId ? { ...q, correctAnswer: answer, writtenAnswer: answer } : q
    ));
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Erro", description: "O título é obrigatório.", variant: "destructive" });
      return;
    }
    if (!category.trim()) {
      toast({ title: "Erro", description: "A categoria é obrigatória.", variant: "destructive" });
      return;
    }

    const validQuestions = questions.filter(q => {
      const hasQuestionText = q.question.trim();
      if (q.type === 'multiple-choice') {
        const hasAllOptions = q.options.every(opt => opt.trim());
        return hasQuestionText && hasAllOptions;
      } else if (q.type === 'written') {
        return hasQuestionText && q.correctAnswer.trim();
      }
      return false;
    });
    
    if (validQuestions.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos uma pergunta válida (com texto, opções preenchidas para múltipla escolha, ou resposta para escrita).",
        variant: "destructive",
      });
      return;
    }

    const quizData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      questions: validQuestions.map(q => ({
        id: q.id,
        question: q.question,
        type: q.type,
        options: q.type === 'multiple-choice' ? q.options : [],
        correctAnswer: q.correctAnswer,
        writtenAnswer: q.type === 'written' ? q.writtenAnswer : '',
      }))
    };

    if (isEditing && editingId) {
      updateQuiz(editingId, quizData);
      toast({ title: "Sucesso!", description: `Quiz "${title}" atualizado com ${validQuestions.length} perguntas.` });
    } else {
      createQuiz(quizData);
      toast({ title: "Sucesso!", description: `Quiz "${title}" criado com ${validQuestions.length} perguntas.` });
    }
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center mb-8">
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{isEditing ? 'Editar Quiz' : 'Criar Quiz'}</h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modifique seu quiz' : 'Monte seu quiz personalizado'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input id="title" placeholder="Ex: Quiz de História do Brasil" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input id="category" placeholder="Ex: História, Ciências" value={category} onChange={(e) => setCategory(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" placeholder="Descreva o quiz..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Perguntas ({questions.length})</CardTitle>
                <Button type="button" onClick={addQuestion} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Pergunta
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((question, index) => (
                  <motion.div key={question.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Pergunta {index + 1}</h4>
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`question-text-${question.id}`}>Texto da Pergunta</Label>
                      <Textarea id={`question-text-${question.id}`} placeholder="Digite sua pergunta aqui..." value={question.question} onChange={(e) => updateQuestionField(question.id, 'question', e.target.value)} rows={2} />
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Pergunta</Label>
                        <Tabs value={question.type} onValueChange={(type) => updateQuestionType(question.id, type)} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="multiple-choice">Múltipla Escolha</TabsTrigger>
                                <TabsTrigger value="written">Escrita</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div className="space-y-3">
                        <Label>Opções de Resposta (Múltipla Escolha)</Label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input type="radio" name={`correct-${question.id}`} checked={question.correctAnswer === optionIndex} onChange={() => setCorrectOptionAnswer(question.id, optionIndex)} className="w-4 h-4 text-primary focus:ring-primary border-gray-300" />
                            <Input placeholder={`Opção ${optionIndex + 1}`} value={option} onChange={(e) => updateOption(question.id, optionIndex, e.target.value)} className="flex-1" />
                            <span className="text-sm text-muted-foreground w-16">
                              {question.correctAnswer === optionIndex ? 'Correta' : ''}
                            </span>
                          </div>
                        ))}
                        <p className="text-xs text-muted-foreground">Clique no círculo para marcar a resposta correta.</p>
                      </div>
                    )}

                    {question.type === 'written' && (
                        <div className="space-y-2">
                            <Label htmlFor={`written-answer-${question.id}`}>Resposta Correta (Escrita)</Label>
                            <Textarea id={`written-answer-${question.id}`} placeholder="Digite a resposta correta aqui..." value={question.correctAnswer} onChange={(e) => setWrittenAnswer(question.id, e.target.value)} rows={2} />
                        </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancelar</Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" /> {isEditing ? 'Atualizar Quiz' : 'Salvar Quiz'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateQuizPage;