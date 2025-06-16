import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

const CreateFlashcardsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { createFlashcardSet, updateFlashcardSet, flashcards } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [cards, setCards] = useState([
    { id: Date.now(), front: '', back: '' }
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');
    if (editId) {
      const flashcardSetToEdit = flashcards.find(set => set.id === editId);
      if (flashcardSetToEdit) {
        setTitle(flashcardSetToEdit.title);
        setDescription(flashcardSetToEdit.description || '');
        setCategory(flashcardSetToEdit.category);
        setCards(flashcardSetToEdit.cards.map(card => ({ ...card, id: card.id || Date.now() + Math.random() })));
        setIsEditing(true);
        setEditingId(editId);
      } else {
        toast({
          title: "Erro",
          description: "Conjunto de flashcards não encontrado para edição.",
          variant: "destructive",
        });
        navigate('/dashboard');
      }
    }
  }, [location.search, flashcards, navigate]);


  const addCard = () => {
    const newCard = {
      id: Date.now(),
      front: '',
      back: ''
    };
    setCards([...cards, newCard]);
  };

  const removeCard = (id) => {
    if (cards.length > 1) {
      setCards(cards.filter(card => card.id !== id));
    } else {
      toast({
        title: "Atenção",
        description: "Deve haver pelo menos um card.",
        variant: "default",
      });
    }
  };

  const updateCard = (id, field, value) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Erro",
        description: "O título é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    if (!category.trim()) {
      toast({
        title: "Erro",
        description: "A categoria é obrigatória.",
        variant: "destructive",
      });
      return;
    }

    const validCards = cards.filter(card => card.front.trim() && card.back.trim());
    
    if (validCards.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um card com frente e verso preenchidos.",
        variant: "destructive",
      });
      return;
    }

    const flashcardSetData = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      cards: validCards.map(c => ({ front: c.front, back: c.back, id: c.id }))
    };

    if (isEditing && editingId) {
      updateFlashcardSet(editingId, flashcardSetData);
      toast({
        title: "Sucesso!",
        description: `Conjunto "${title}" atualizado com ${validCards.length} cards.`,
      });
    } else {
      createFlashcardSet(flashcardSetData);
      toast({
        title: "Sucesso!",
        description: `Conjunto "${title}" criado com ${validCards.length} cards.`,
      });
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
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{isEditing ? 'Editar Flashcards' : 'Criar Flashcards'}</h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modifique seu conjunto de flashcards' : 'Monte seu conjunto personalizado de flashcards'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      placeholder="Ex: Vocabulário de Inglês"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria *</Label>
                    <Input
                      id="category"
                      placeholder="Ex: Idiomas, Matemática, História"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva brevemente o conteúdo deste conjunto..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Cards ({cards.length})</CardTitle>
                <Button type="button" onClick={addCard} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Card
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Card {index + 1}</h4>
                      {cards.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCard(card.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`card-front-${card.id}`}>Frente do Card</Label>
                        <Textarea
                          id={`card-front-${card.id}`}
                          placeholder="Ex: What is your name?"
                          value={card.front}
                          onChange={(e) => updateCard(card.id, 'front', e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`card-back-${card.id}`}>Verso do Card</Label>
                        <Textarea
                          id={`card-back-${card.id}`}
                          placeholder="Ex: Qual é o seu nome?"
                          value={card.back}
                          onChange={(e) => updateCard(card.id, 'back', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
              >
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Atualizar Flashcards' : 'Salvar Flashcards'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateFlashcardsPage;