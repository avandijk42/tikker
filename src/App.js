import React, { Component } from 'react';
import colors from './colorscheme.json';
import Ticker from "./Ticker";
import './Ticker.css';
import { withCookies } from 'react-cookie';


class App extends Component {
  constructor(props){
    super(props);
    const {cookies} = props
    this.state = {
      stocks: cookies.get('stocks') || ["AAPL"],
      coins: cookies.get('coins') || ["BTC"],
      showHeader: true
    }
  }

  minMaxHeader(){
    this.setState((oldState,props) => ({
      showHeader: !oldState.showHeader
    }))
  }

  render() {
    return (
      <div>
        <div style={styles.header}>
          <div style={styles.navBar(this.state.showHeader)}>
            <h1 style={styles.title(this.state.showHeader)}> tikker </h1>
          </div>
          <button id="plus-button" onClick={() => this.minMaxHeader()}>
            <div style={styles.buttonSymbolContainer(this.state.showHeader)} >
              {this.state.showHeader ? "\u2227" : "\u2228"}
            </div>
          </button>
        </div>
        <Ticker
          title="Stocks"
          items={this.state.stocks}
          query={(items) => `https://api.iextrading.com/1.0/stock/market/batch?symbols=${items.join(',')}&types=quote`}
          rate={150}
          save={(symbols) => this.props.cookies.set('stocks', symbols)}
        />
        <Ticker
          title="Coins"
          items={this.state.coins}
          query={(_) => `https://api.iextrading.com/1.0/stock/market/crypto`}
          isCoin
          rate={170}
          save={(symbols) => this.props.cookies.set('coins', symbols)}
        />
      </div>
    );
  }
}

export default withCookies(App);

const styles = {
  header:{
    marginBottom: 100
  },
  navBar: (open) => ({
    backgroundColor:colors.lightGreen,
    width:"100%",
    boxShadow: "0px 3px 7px #888",
    marginTop: open ? 0 : -60,
    transition: "margin-top 0.33s ease-in"
  }),
  title: (open) => ({
    fontSize:40,
    fontFamily: "Merriweather",
    fontStyle: "italic",
    fontWeight:500,
    verticalAlign:"middle",
    padding:"25px 0px 25px 38px",
    margin:"0px",
    width:200,
    color: open ?" #143b29" : "#0000",
    transition: "color 0.33s ease-in"
  }),
  buttonSymbolContainer: (open) => ({
    margin: 0,
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: `translate(-50%, -${open ? 60 : 50}%)`,
    fontSize:30,
    fontFamily:"Merriweather",
    color:"#666",
  })
}
