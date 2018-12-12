import React, { Component } from 'react';
import logo from './logo.svg';
import colors from './colorscheme.json';
import Ticker from "./Ticker";
import './Ticker.css';

const key = "64QGWFNZRACW300X"
const stockFunctionBlock = "GLOBAL_QUOTE&symbol="
const stockSuffix = ""
const coinFunctionBlock = "CURRENCY_EXCHANGE_RATE&from_currency="
const coinSuffix = "&to_currency=USD"

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      stocks: ["AAPL","GOOG","GE","WFC","NBR"],
      coins: ["BTC", "ETH"]
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
            <h1 style={styles.title}> > tikker </h1>
          </div>
          <button id="plus-button" onClick={() => this.addDummyStock()}>
            <div style={styles.buttonSymbolContainer} >
              +
            </div>
          </button>
        </div>
        <Ticker title="stocks" items={this.state.stocks} />
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
  button:{
    borderRadius:"50%",
    width:70,
    height:70,
    backgroundColor:"#f8f8f8",
    right:50,
    margin:"-35px 0px 0px 0px",
    float:"right",
    position:"relative",
    boxShadow: "0px 4px 5px #888",
    verticalAlign:"middle",
    textAlign:"center",
    outline:"none",
    transition:"background-color 1s linear"
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
