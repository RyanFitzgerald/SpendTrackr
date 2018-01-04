import React, { Component } from 'react';
import { StyleSheet, Alert, View, ScrollView, Text, TextInput, Picker, AsyncStorage, ToastAndroid, StatusBar } from 'react-native';
import { Card, Button, Header } from 'react-native-elements'
import Swipeout from 'react-native-swipeout';
import uuidv1 from 'uuid/v1';

class AddRegular extends Component {
  constructor() {
    super();

    // Bind functions
    this.checkInput = this.checkInput.bind(this);
    this.getRegulars = this.getRegulars.bind(this);
    this.updateRegulars = this.updateRegulars.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.checkCost = this.checkCost.bind(this);
    this.renderList = this.renderList.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    // Set state
    this.state = {
      expenseName: false,
      cost: false,
      categoryName: 'Other',
      regulars: [],
      categories: []
    };
  }

  componentDidMount() {
    this.getRegulars();
    this.getCategories();
  }

  // Get regulars
  async getRegulars() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:regulars');
      if (value !== null) {
        this.setState({ regulars: JSON.parse(value) })
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  // Add regular
  async updateRegulars() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:regulars', JSON.stringify(this.state.regulars));
    } catch (error) {
      // Error saving data
      console.log(error);
    }
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

  // Check Input
  checkInput() {
    return (
      !this.state.expenseName || this.state.expenseName.length === 0 ||
      !this.state.cost || this.state.cost.length === 0 ||
      !this.state.categoryName || this.state.categoryName.length === 0
    );
  }

  // Check cost
  checkCost(cost) {
    if (cost.includes(',') || cost.includes(' ') || cost.includes('-')) {
      Alert.alert('Invalid character, only use digits and decimals.');
      return;
    }

    this.setState({ cost });
  }

  // Handle submit
  async handleSubmit() {
    // Check all inputs
    if (this.checkInput()) {
      Alert.alert('All fields must be filled.');
      return;
    }

    // Check if cost is proper format
    if (!this.state.cost.match(/^\d+(\.\d{2})?$/)) {
      Alert.alert('Invalid Cost Format, please include only numbers and at most 1 decimal (EX: 12.19).');
      return;
    }

    // Store category name and id
    const expenseName = this.state.expenseName;
    const cost = this.state.cost*100;
    const categoryName = this.state.categoryName;

    // Add new regular expense
    const newRegulars = [...this.state.regulars, { id: uuidv1(), 'name': expenseName, 'category': categoryName, cost }];
    ToastAndroid.showWithGravityAndOffset('Successfully added regular expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({regulars: newRegulars }, () => {
      this.updateRegulars();
    });

    // Clear form
    this.expenseName.clear();
    this.expenseCost.clear();
  }

  // Handle delete
  handleDelete(id) {
    const newRegulars = this.state.regulars.filter(el => el.id !== id);
    ToastAndroid.showWithGravityAndOffset('Successfully deleted regular expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({ regulars: newRegulars }, () => {
      this.updateRegulars();
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
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemCategory}>{item.category}</Text>
          </View>
          <View>
            <Text style={styles.itemName}>${(item.cost/100).toFixed(2)}</Text>
          </View>
        </View>
      </Swipeout>
    );
  }

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={{flex: 1, backgroundColor: '#fff'}}>
        <StatusBar
          backgroundColor="#2c709d"
          barStyle="light-content"
          translucent={false}
        />
        <Header
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => navigate('DrawerToggle') }}
          centerComponent={{ text: 'New Regular Expense', style: { color: '#fff' } }}
          rightComponent={{ icon: 'home', color: '#fff', onPress: () => navigate('Home') }}
          backgroundColor="#3498db"
          outerContainerStyles={{height: 55}}
        />
        <ScrollView style={{paddingBottom: 20}}>
          <Card title="Add Regular Expense" containerStyle={styles.card}>
            <Text style={styles.label}>Expense Name</Text>
            <TextInput
              style={styles.textInput}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. Coffee"
              onChangeText={expenseName => this.setState({expenseName})}
              ref={input => this.expenseName = input}
            />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. 3.20"
              onChangeText={cost => this.checkCost(cost)}
              ref={input => this.expenseCost = input}              
            />
            <Text style={styles.label}>Category</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.categoryName}
              onValueChange={categoryName => this.setState({categoryName})}
            >
              {this.state.categories.map((category, key) => 
                <Picker.Item label={category.name} value={category.name} key={key} />)
              } 
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <Button title="Add Regular Expense" backgroundColor="#3498db" onPress={this.handleSubmit}/>
          </Card>
          <Card title="Current Regular Expenses" containerStyle={{marginBottom: 20}}>
            {this.state.regulars.map((regular, key) => this.renderList(regular, key))}            
          </Card>
        </ScrollView>
      </View> 
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    margin: 25,
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
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
  picker: {
    height: 50,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 30,
  },
  separate: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  card: {
    marginBottom: 20
  },
  regular: {
    marginBottom: 5
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
  },
  itemCategory:{
    fontSize: 10
  }
});

export default AddRegular;
