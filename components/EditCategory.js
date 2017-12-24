import React, { Component } from 'react';
import { StyleSheet, Alert, View, ScrollView, Text, TextInput, AsyncStorage, ToastAndroid } from 'react-native';
import { Card, Button, Header } from 'react-native-elements'
import Swipeout from 'react-native-swipeout';
import uuidv1 from 'uuid/v1';

class EditCategory extends Component {
  constructor() {
    super();

    // Bind functions
    this.getCategories = this.getCategories.bind(this);
    this.updateCategories = this.updateCategories.bind(this);
    this.renderList = this.renderList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    // Set state
    this.state = {
      categoryName: false,
      categories: []
    };
  }

  componentDidMount() {
    this.getCategories();
  }

  // Get categories
  async getCategories() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:categories');
      if (value !== null) {
        this.setState({ categories: JSON.parse(value) })
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  // Add category
  async updateCategories() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:categories', JSON.stringify(this.state.categories));
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  }

  // Handle submit
  handleSubmit() {
    if (!this.state.categoryName || this.state.categoryName.length === 0) {
      Alert.alert('You must enter a category name.');
      return;
    }

    // Store category name and id
    const categoryName = this.state.categoryName;

    // Add new category
    const newCategories = [...this.state.categories, { id: uuidv1(), 'name': categoryName }];
    ToastAndroid.showWithGravityAndOffset('Successfully added category',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({categories: newCategories }, () => {
      this.updateCategories();
    });

    // Clear form
    this.categoryInput.clear();    
  }

  // Handle delete
  handleDelete(id) {
    const newCategories = this.state.categories.filter(el => el.id !== id);
    ToastAndroid.showWithGravityAndOffset('Successfully deleted category',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({ categories: newCategories }, () => {
      this.updateCategories();
    });
  }

  // Handle rendering of list items
  renderList(item, key) {
    const swipeSettings = {
      autoClose: true,
      right: [{ 
        text: 'Delete',
        backgroundColor: '#e74c3c',
        onPress: () => this.handleDelete(item.id)
      }]
    };

    return (
      <Swipeout {...swipeSettings} style={styles.item} key={key}>
        <View style={styles.itemWrapper}>
          <Text style={styles.itemName}>{item.name}</Text>
        </View>
      </Swipeout>
    );
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={{flex: 1}}>
        <Header
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => navigate('DrawerToggle') }}
          centerComponent={{ text: 'Edit Categories', style: { color: '#fff' } }}
          rightComponent={{ icon: 'home', color: '#fff', onPress: () => navigate('Home') }}
          backgroundColor="#3498db"
        />
        <ScrollView style={{paddingBottom: 20}}>
          <Card title="Add New Category" containerStyle={styles.card}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. Food"
              onChangeText={categoryName => this.setState({categoryName})}
              ref={input => this.categoryInput = input}
            />
            <Button title="Add Category" backgroundColor="#3498db" onPress={this.handleSubmit}/>
          </Card>
          <Card title="Current Categories" containerStyle={{marginBottom: 20}}>
            {this.state.categories.map((category, key) => this.renderList(category, key))}
          </Card>
        </ScrollView>
      </View> 
    );
  }
}

// Define styles
const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 15,
  },
  textInput: {
    fontSize: 15,
    height: 50,
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  card: {
    marginBottom: 20
  },
  item: {
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#d6d7da',
  },
  itemWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15
  },
  itemName:{
    fontSize: 20
  }
});

export default EditCategory;