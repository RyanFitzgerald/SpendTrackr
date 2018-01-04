import React from 'react';
import { StyleSheet, Alert, ScrollView, View, Text, AsyncStorage, ToastAndroid, StatusBar } from 'react-native';
import { Header, Button, Card } from 'react-native-elements';
import Swipeout from 'react-native-swipeout';
import {VictoryPie, VictoryLegend, VictoryLabel} from 'victory-native';
import moment from 'moment';

const pieColours = ['#3498db', '#2ecc71', '#9b59b6', '#e67e22', '#f1c40f', '#e74c3c', '#16a085', '#bdc3c7', '#2980b9', '#7f8c8d'];

const compareDates = (a, b) => {
  if (moment(a.date).isBefore(b.date))
    return 1;
  if (moment(a.date).isAfter(b.date))
    return -1;
  return 0;
};

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
      total: 1,
      expenses: [],
      monthExpenses: [],
      categories: [],
      chartData: [],
      chartLegend: []
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
    // Loop over expenses and find current month
    const monthExpenses = expenses.filter(expense => {
      const expenseMonth = moment(expense.date).format('MMMM');
      const currentMonth = moment().format('MMMM');
      return expenseMonth === currentMonth;
    });

    // Sort expenses
    monthExpenses.sort(compareDates);

    // Update month state and get the new total
    this.setState({ monthExpenses }, () => {
      this.getTotal();
    });
  }

  getTotal() {
    let total = 0;

    // Iterate over monthly expenses and sum the total
    this.state.monthExpenses.forEach(expense => {
      total += expense.cost;
    });

    // Update total and get chart data
    this.setState({ total }, () => {
      this.getChartData();
    });
  }

  getChartData() {
    let chartData = [];
    let chartLegend = [];

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

      // Loop over each monthly expense and see if in current category
      this.state.monthExpenses.forEach(expense => {
        if (expense.category === category) {
          categoryTotal.total += expense.cost;
        }
      });

      // Only push if the total is above zero
      if (categoryTotal.total > 0) {
        categoryTotals.push(categoryTotal);
      }
    });

    // Form data
    categoryTotals.forEach((categoryTotal, key) => {
      let percent = (categoryTotal.total/this.state.total)*100;
      let dataEntry = {'x': `${percent.toFixed(1)}%`, 'y': percent};
      let legendEntry = {'name': `${categoryTotal.category} ($${(categoryTotal.total/100).toFixed(2)})`, 'symbol': {'fill': pieColours[key], 'type': 'square'}};
      chartData.push(dataEntry);
      chartLegend.push(legendEntry);
    });

    // Return chartdata
    this.setState({chartData, chartLegend});
  }

  handleDelete(id) {
    // Create new array with old expense deleted
    const newExpenses = this.state.expenses.filter(el => el.id !== id);

    // Push toast
    ToastAndroid.showWithGravityAndOffset('Successfully deleted expense',ToastAndroid.LONG, ToastAndroid.BOTTOM, 0, 50);

    // Update expenses
    this.setState({ expenses: newExpenses }, () => {
      this.updateExpenses();
    });
  }

  renderList(item, key) {
    const { navigate } = this.props.navigation;
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
        onPress: () => navigate('EditExpense', {item})
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
     <View style={{flex: 1, backgroundColor: '#fff'}}>
        <StatusBar
          backgroundColor="#2c709d"
          barStyle="light-content"
          translucent={false}
        />
        <Header
          leftComponent={{ icon: 'menu', color: '#fff', onPress: () => navigate('DrawerToggle') }}
          centerComponent={{ text: 'Home', style: { color: '#fff' } }}
          rightComponent={{ icon: 'add', color: '#fff', onPress: () => navigate('AddExpense') }}
          backgroundColor="#3498db"
          outerContainerStyles={{height: 55}}
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
            {this.state.chartData.length > 0 ? (
              <View>
                <VictoryPie 
                  colorScale={pieColours}
                  style={{ labels: { display: '#000' }, chart: {margin: 100} }}
                  animate={false}
                  labelRadius={100}
                  data={this.state.chartData}
                />
                <VictoryLegend x={50} y={0}
                  centerTitle
                  orientation="vertical"
                  style={{labels: {marginBottom: 0 } }}
                  gutter={20}
                  itemsPerRow={5}
                  height={170}
                  labelComponent={<VictoryLabel dy={-25}/>}
                  data={this.state.chartLegend}
                />
              </View>
            ) : (
              <View>
                <Text>No data to display. Start by adding a new expense.</Text>
              </View>
            )}
          </Card>
          <Card title="Expenses" containerStyle={{marginBottom: 20}}>
            {this.state.monthExpenses.map((expense, key) => this.renderList(expense, key))}   
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
    color: '#4a5058',
    marginTop: 10,
    marginBottom: 0,
    paddingBottom: 0,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 30,
    color: '#4a5058',
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

