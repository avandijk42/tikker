import React, { Component } from 'react';
import colors from './colorscheme.json';
import Ticker from "./Ticker";
import './Ticker.css';


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      stocks: ["AAPL","GOOG","GE","WFC","NBR","VZ"],
      coins: ["BTC", "ETH", "EOS"]
    }
  }

  addDummyStock(){
    this.setState((oldState,props) => ({
      stocks:[...oldState.stocks, "MSFT"]
    }))
  }

  render() {
    return (
      <div>
        <div style={styles.header}>
          <div style={styles.navBar}>
            <h1 style={styles.title}> tikker </h1>
          </div>
          <button id="plus-button" onClick={() => this.addDummyStock()}>
            <div style={styles.buttonSymbolContainer} >
              +
            </div>
          </button>
        </div>
        <Ticker
          title="Stocks"
          items={this.state.stocks}
          query={(items) => `https://api.iextrading.com/1.0/stock/market/batch?symbols=${items.join(',')}&types=quote`}
          rate={150}
        />
        <Ticker
          title="Coins"
          items={this.state.coins}
          query={(_) => `https://api.iextrading.com/1.0/stock/market/crypto`}
          isCoin
          rate={170}
        />
      </div>
    );
  }
}

// <Ticker title="coins" items={this.state.coins} isCoin/>
export default App;

const styles = {
  header:{

  },
  navBar:{
    backgroundColor:colors.lightGreen,
    width:"100%",
    boxShadow: "0px 3px 7px #888",
  },
  title:{
    fontSize:50,
    fontFamily: "Merriweather",
    fontStyle: "italic",
    fontWeight:500,
    verticalAlign:"middle",
    padding:"25px 0px 25px 38px",
    margin:"0px",
    width:200,
  },
  buttonSymbolContainer:{
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize:"40px",
    fontFamily:"Merriweather",
    color:"#666",
  }
}
