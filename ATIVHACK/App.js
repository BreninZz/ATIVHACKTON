import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from 'react-native';

// URL base da API do Google Books
const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Use useEffect para fazer a busca automaticamente quando o searchTerm mudar
  useEffect(() => {
    // Implementação de "debounce" para evitar chamadas excessivas
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchBooks(searchTerm);
      } else {
        setBooks([]);
        setError('');
      }
    }, 500); // Atraso de 500ms para a busca

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Função para buscar os livros na API
  const searchBooks = async (query) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Erro na busca. Tente novamente.');
      }
      const data = await response.json();
      if (data.items) {
        setBooks(data.items);
      } else {
        setBooks([]);
        setError('Nenhum livro encontrado para o termo.');
      }
    } catch (e) {
      setError('Falha na conexão. Verifique sua rede.');
      console.error(e);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Componente para a tela de detalhes do livro
  const BookDetailScreen = () => {
    if (!selectedBook) return null;

    const { volumeInfo } = selectedBook;
    const authors = volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor(es) Desconhecido(s)';
    const description = volumeInfo.description || 'Nenhuma sinopse disponível.';
    const publishedDate = volumeInfo.publishedDate || 'Data de publicação desconhecida.';
    const publisher = volumeInfo.publisher || 'Editora desconhecida.';
    const thumbnail = volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x193.png?text=Sem+Capa';

    return (
      <SafeAreaView style={styles.detailContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedBook(null)}>
          <Text style={styles.backButtonText}>{'< Voltar'}</Text>
        </TouchableOpacity>
        <ScrollView style={styles.scrollView}>
          <Image
            source={{ uri: thumbnail }}
            style={styles.detailImage}
            resizeMode="contain"
          />
          <Text style={styles.detailTitle}>{volumeInfo.title || 'Título Desconhecido'}</Text>
          <Text style={styles.detailAuthors}>{authors}</Text>
          <Text style={styles.detailText}>**Publicado em:** {publishedDate}</Text>
          <Text style={styles.detailText}>**Editora:** {publisher}</Text>
          <Text style={styles.detailDescriptionTitle}>**Sinopse:**</Text>
          <Text style={styles.detailDescription}>{description}</Text>
        </ScrollView>
      </SafeAreaView>
    );
  };

  // Componente para a tela de busca
  const SearchScreen = () => {
    const renderBookItem = ({ item }) => {
      const title = item.volumeInfo.title || 'Título Desconhecido';
      const authors = item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor(es) Desconhecido(s)';
      const thumbnail = item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/64x96.png?text=Sem+Capa';

      return (
        <TouchableOpacity style={styles.bookItem} onPress={() => setSelectedBook(item)}>
          <Image source={{ uri: thumbnail }} style={styles.bookImage} resizeMode="contain" />
          <View style={styles.bookTextContainer}>
            <Text style={styles.bookTitle}>{title}</Text>
            <Text style={styles.bookAuthors}>{authors}</Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Livros em Foco</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, autor ou assunto..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={() => searchBooks(searchTerm)} // Mantém o onSubmitEditing como uma alternativa
        />
        <TouchableOpacity style={styles.searchButton} onPress={() => searchBooks(searchTerm)}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} size="large" color="#4285F4" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <FlatList
            data={books}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.placeholderText}>
                Pesquise por seu livro favorito para começar!
              </Text>
            )}
          />
        )}
      </View>
    );
  };

  // Renderização principal com navegação simples
  return selectedBook ? <BookDetailScreen /> : <SearchScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchInput: {
    height: 50,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
    fontSize: 16,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  bookImage: {
    width: 64,
    height: 96,
    borderRadius: 5,
    marginRight: 15,
  },
  bookTextContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  bookAuthors: {
    fontSize: 14,
    color: '#666',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  scrollView: {
    padding: 20,
  },
  backButton: {
    padding: 15,
    backgroundColor: '#F7F7F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: 'bold',
  },
  detailImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'center',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  detailAuthors: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  detailDescriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  detailDescription: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
});