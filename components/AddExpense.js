import React, { Component } from 'react';
import { StyleSheet, Alert, View, ScrollView, Text, TextInput, Picker, AsyncStorage, ToastAndroid, StatusBar } from 'react-native';
import { Card, Button, Header } from 'react-native-elements'
import moment from 'moment';
import uuidv1 from 'uuid/v1';

import DatePicker from './DatePicker';

class AddExpense extends Component {
  constructor() {
    super();

    // Bind functions
    this.getExpenses = this.getExpenses.bind(this);
    this.updateExpenses = this.updateExpenses.bind(this);
    this.getRegulars = this.getRegulars.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.checkInput = this.checkInput.bind(this);
    this.checkCost = this.checkCost.bind(this);
    this.setDate = this.setDate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleQuickSubmit = this.handleQuickSubmit.bind(this);

    // Set state
    this.state = {
      expenseName: false,
      cost: false,
      categoryName: 'Other',
      date: moment(),
      expenses: [],
      regulars: [],
      categories: []
    };
  }

  componentDidMount() {
    this.getExpenses();
    this.getRegulars();
    this.getCategories();
  }

  // Add expense
  async getExpenses() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:expenses');
      if (value !== null) {
        this.setState({ expenses: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  // Add expense
  async updateExpenses() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:expenses', JSON.stringify(this.state.expenses));
    } catch (error) {
      // Error saving data
      console.log(error);
    }
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

  // Set date from datepicker
  setDate(date) {
    this.setState({ date });
  }

  // Handle submit
  handleSubmit() {
    const { navigate } = this.props.navigation;

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
    const date = this.state.date;

    // Add new category
    const newExpenses = [...this.state.expenses, { id: uuidv1(), 'name': expenseName, 'category': categoryName, cost, date }];
    ToastAndroid.showWithGravityAndOffset('Successfully added expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({expenses: newExpenses }, () => {
      this.updateExpenses();
      navigate('Home');
    });
  }

  // Handle quick submit
  handleQuickSubmit(item) {
    const { navigate } = this.props.navigation;

    const newExpenses = [...this.state.expenses, { id: uuidv1(), 'name': item.name, 'category': item.category, 'cost': item.cost, 'date': moment()}];
    ToastAndroid.showWithGravityAndOffset('Successfully added expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({expenses: newExpenses }, () => {
      this.updateExpenses();
      navigate('Home');
    });
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
          centerComponent={{ text: 'Add New Expense', style: { color: '#fff' } }}
          rightComponent={{ icon: 'home', color: '#fff', onPress: () => navigate('Home') }}
          backgroundColor="#3498db"
          outerContainerStyles={{height: 55}}
        />
        <ScrollView>
          <Card title="Add Expense" containerStyle={styles.card}>
            <Text style={styles.label}>Expense Name</Text>
            <TextInput
              style={styles.textInput}
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. Coffee"
              onChangeText={expenseName => this.setState({expenseName})}
            />
            <Text style={styles.label}>Cost ($)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              underlineColorAndroid="rgba(0,0,0,0)"
              placeholder="E.g. 3.20"
              onChangeText={cost => this.checkCost(cost)}
            />
            <Text style={styles.label}>Date</Text>
            <DatePicker setDate={this.setDate}/>
            <Text style={styles.label}>Category</Text>
            <Picker
              style={styles.picker}
              selectedValue={this.state.categoryName}
              onValueChange={categoryName => this.setState({categoryName})}
            >
              {this.state.categories.map((category, key) => 
                <Picker.Item label={category.name} value={category.name} key={key} />
              )} 
              <Picker.Item label="Other" value="Other" />
            </Picker>
            <Button title="Add Expense" backgroundColor="#3498db" onPress={this.handleSubmit}/>
          </Card>
          <Text style={styles.separate}>OR</Text>
          <Card title="Choose Regular Expense" containerStyle={styles.card}>
            {this.state.regulars.map((regular, key) => 
              <Button buttonStyle={styles.regular} backgroundColor="#3498db" title={regular.name} onPress={() => this.handleQuickSubmit(regular)} key={key}/>
            )}
          </Card>
        </ScrollView>
      </View> 
    );
  }
}

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
  }
});

export default AddExpense;
