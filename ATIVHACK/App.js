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

const API_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

const BookDetailScreen = ({ selectedBook, setSelectedBook }) => {
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

const SearchScreen = ({ searchTerm, setSearchTerm, searchBooks, books, isLoading, error, setSelectedBook }) => {
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
        placeholderTextColor="#8D6E63"
        value={searchTerm}
        onChangeText={setSearchTerm}
        onSubmitEditing={() => searchBooks(searchTerm)}
      />
      <TouchableOpacity style={styles.searchButton} onPress={() => searchBooks(searchTerm)}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>

      {error ? (
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
      {isLoading && <ActivityIndicator style={styles.absoluteLoader} size="large" color="#4A332C" />}
    </View>
  );
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        searchBooks(searchTerm);
      } else {
        setBooks([]);
        setError('');
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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

  return selectedBook ? (
    <BookDetailScreen selectedBook={selectedBook} setSelectedBook={setSelectedBook} />
  ) : (
    <SearchScreen
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      searchBooks={searchBooks}
      books={books}
      isLoading={isLoading}
      error={error}
      setSelectedBook={setSelectedBook}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4E3',
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 34,
    fontWeight: '900',
    color: '#4A332C',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'serif',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  searchInput: {
    height: 55,
    backgroundColor: '#FFFAF0',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#D7CCC8',
    marginBottom: 15,
    color: '#4A332C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchButton: {
    backgroundColor: '#A0522D',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  absoluteLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  errorText: {
    textAlign: 'center',
    color: '#D32F2F',
    marginTop: 20,
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#8D6E63',
    fontSize: 16,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#A0522D',
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 15,
  },
  bookTextContainer: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A332C',
  },
  bookAuthors: {
    fontSize: 14,
    color: '#8D6E63',
    marginTop: 5,
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#F8F4E3',
  },
  scrollView: {
    padding: 20,
  },
  backButton: {
    padding: 15,
    backgroundColor: '#F8F4E3',
    borderBottomWidth: 1,
    borderBottomColor: '#D7CCC8',
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A332C',
    fontWeight: 'bold',
  },
  detailImage: {
    width: '100%',
    height: 400,
    borderRadius: 15,
    marginBottom: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  detailTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#4A332C',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  detailAuthors: {
    fontSize: 20,
    color: '#8D6E63',
    marginBottom: 15,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#4A332C',
  },
  detailDescriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    color: '#4A332C',
  },
  detailDescription: {
    fontSize: 16,
    color: '#6D4C41',
    lineHeight: 24,
  },
});
