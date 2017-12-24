import React from 'react';
import { StyleSheet, Alert, ScrollView, View, Text, AsyncStorage, ToastAndroid } from 'react-native';
import { Header, Button, Card } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';
import {VictoryPie} from 'victory-native';
import moment from 'moment';

const pieColours = ['#1abc9c', '#3498db', '#9b59b6', '#1abc9c', '#34495e', '##e67e22', '#d35400', '#c0392b'];

class HomeScreen extends React.Component {
  constructor() {
    super();

    // Bind functions
    this.renderList = this.renderList.bind(this);
    this.getExpenses = this.getExpenses.bind(this);
    this.updateExpenses = this.updateExpenses.bind(this);
    this.getCategories = this.getCategories.bind(this);
    this.getCurrentMonth = this.getCurrentMonth.bind(this);
    this.getTotal = this.getTotal.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.handleDelete = this.handleDelete.bind(this);

    // Set state
    this.state = {
      month: moment().format('MMMM'),
      total: 0,
      expenses: [],
      monthExpenses: [],
      categories: []
    };
  }

  componentDidMount() {
    this.getExpenses();
    this.getCategories();
  }

  async getExpenses() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:expenses');
      if (value !== null) {
        this.setState({ expenses: JSON.parse(value) }, () => {
          this.getCurrentMonth(JSON.parse(value));
        });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  async updateExpenses() {
    try {
      await AsyncStorage.setItem('@SpendTrackr:expenses', JSON.stringify(this.state.expenses));
      this.getCurrentMonth(this.state.expenses);
    } catch (error) {
      // Error saving data
      console.log(error);
    }
  }


  async getCategories() {
    try {
      const value = await AsyncStorage.getItem('@SpendTrackr:categories');
      if (value !== null) {
        this.setState({ categories: JSON.parse(value) });
      }
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
  }

  getCurrentMonth(expenses) {
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = moment(expense.date).format('MMMM');
      const currentMonth = moment().format('MMMM');
      return expenseMonth === currentMonth;
    });

    this.setState({ monthExpenses }, () => {
      this.getTotal();
    });
  }

  getTotal() {
    let total = 0;
    this.state.expenses.forEach(expense => {
      total += expense.cost;
    });

    this.setState({ total });
  }

  getChartData() {
    let chartData = [];

    // Get categories
    let categories = [];  
    this.state.monthExpenses.forEach(expense => {
      if (!categories.includes(expense.category)) {
        categories.push(expense.category);
      }
    });

    // Get category totals
    let categoryTotals = [];
    categories.forEach(category => {
      let categoryTotal = { category, 'total': 0 };
      this.state.monthExpenses.forEach(expense => {
        if (expense.category === category) {
          categoryTotal.total += expense.cost;
        }
      });

      if (categoryTotal.total > 0) {
        categoryTotals.push(categoryTotal);
      }
    });

    // Form data
    categoryTotals.forEach(categoryTotal => {
      let percent = (categoryTotal.total/this.state.total)*100;
      let dataEntry = {'x': `${categoryTotal.category} (${percent.toFixed(1)}%)`, 'y': percent};
      chartData.push(dataEntry);
    });

    // Return chartdata
    return chartData;
  }

  // Handle delete
  handleDelete(id) {
    const newExpenses = this.state.expenses.filter(el => el.id !== id);
    ToastAndroid.showWithGravityAndOffset('Successfully deleted expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);
    this.setState({ expenses: newExpenses }, () => {
      this.updateExpenses();
    });
  }

  renderList(item, key) {
    const swipeSettings = {
      autoClose: true,
      right: [{ 
        text: 'Delete',
        backgroundColor: '#e74c3c',
        onPress: () => this.handleDelete(item.id)
      }],
      left: [{
        text: 'Edit',
        backgroundColor: '#2ecc71',
        onPress: () => Alert.alert(item.name)
      }]
    };

    return (
      <Swipeout {...swipeSettings} style={styles.item} key={key}>
        <View style={styles.itemWrapper}>
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDate}>{item.category} | {moment(item.date).format('YYYY-MM-DD')}</Text>
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
     <View style={{flex: 1}}>
        <Header
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => navigate('DrawerToggle') }}
          centerComponent={{ text: 'Home', style: { color: '#fff' } }}
          rightComponent={{ icon: 'add', color: '#fff', onPress: () => navigate('AddExpense') }}
          backgroundColor="#3498db"
        />
        <ScrollView style={{paddingBottom: 20}}>
          <Text style={styles.title}>{this.state.month}</Text>
          <Text style={styles.subtitle}>${(this.state.total/100).toFixed(2)}</Text>
          <Button
            onPress={() => navigate('AddExpense')}
            backgroundColor="#3498db"
            title="Add New Expense"
            style={{marginBottom: 30}}
          />
          <Card containerStyle={styles.chart} pointerEvents="none">
            <VictoryPie 
              colorScale={pieColours}
              labelRadius={80}
              style={{ labels: { fill: '#fff' } }}
              data={this.getChartData()}
              animate={{duration: 1000}}
            />
          </Card>
          <Card title="Expenses" containerStyle={{marginBottom: 20}}>
            {this.state.expenses.map((expense, key) => this.renderList(expense, key))}
          </Card>
        </ScrollView>
     </View> 
    );
  }
};

const styles = StyleSheet.create({
  chart: {
    marginBottom: 20,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    marginTop: -10,
    marginBottom: 10,
    textAlign: 'center',
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
  itemDate:{
    fontSize: 10
  }
});

export default HomeScreen;

