import React, { Component } from 'react';
import styled from 'styled-components';
import Malarquee from 'react-malarquee';
import './Ticker.css';

const delay = 2000

const stockData = (symbol) => {

}

// const Ticker = (props) => (
//   <div style={styles.container}>
//     <h2 style={styles.title}>{props.title} </h2>
//     <div style={styles.screen}>
//       <Malarquee>
//         {props.items.map(item => (<span> {item} </span>))}
//       </Malarquee>
//     </div>
//   </div>
// )
class Ticker extends Component{
  constructor(props){
    super(props);
    this.state = {}
    this.props.items.forEach( item => {
      this.state[item] = "..."
    })
  }

  componentDidMount() {
    // console.log(Object.keys(this.state));
    this.makeApiCall()
  }

  makeApiCall(){
    // alert(this.state)
    const symbols = Object.keys(this.state)
    const isCoin = this.props.isCoin
    console.log(this.props.query(symbols))
    fetch(this.props.query(symbols))
      .then(res => res.json())
      .then(
        (result) => {
          var newState = {}
          for (var item in result){
            const symbol = isCoin ? result[item].symbol : item
            const displaySymbol = isCoin ? symbol.split('USDT')[0] : item
            const data = isCoin ? result[item] : result[symbol].quote

            newState[displaySymbol] = {
              change:data.change,
              price:data.latestPrice,
              companyName:data.companyName
            }
          }

          this.setState(newState)
        },
        (error) => {
          this.setState({
            ["symbol"]: "ERR"
          })
        }
      )
      setTimeout(
        () => this.makeApiCall(),
        5000
      )
  }

  stockStyle(item){
    return(
      item in this.state && this.state[item].change > 0 ?
        styles.up :
        this.state[item].change === 0 ?
          styles.even :
          styles.down
    )
  }

  render() {
    // const newItems = this.props.items.filter(item => !(item in this.state))
    // console.log(newItems);
    // if (newItems.length > 0){
    //
    // }

    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{this.props.title} </h2>
        <div style={styles.screen}>
          <Malarquee rate={this.props.rate ? this.props.rate : 100}>
            {Object.keys(this.state).map(item => (
              <span style={this.stockStyle(item)}>
                <span style={styles.symbol}>{item}</span>
                <span style={styles.price}>
                  {item in this.state ?
                    this.state[item].change > 0 ?
                      "^"+this.state[item].change :
                      "v"+(-1*this.state[item].change) :
                    "..."}
                </span>

                <span style={styles.symbol}>{item}</span>
                <span style={styles.price}>
                  {item in this.state ? this.state[item].price : "..."}
                </span>
              </span>
            ))}
          </Malarquee>
        </div>
      </div>
    );
  }
}

export default Ticker;

const styles = {
  container:{
    margin:"100px 0px 20px 0px"
  },
  screen: {
    width:"100%",
    height:80,
    backgroundColor:"darkgrey",
    overflowX:"hidden",
    top:20,
  },
  stock:{
    animation: "scroll-left 15s infinite linear",
    // background:"red",
    height:"100%",
    width:200,
    position:"absolute",
    fontSize:30,
    color:"black"
  },
  symbol:{
    margin:"10px 15px 10px 15px",
    fontSize:30
  },
  price:{
    width: 150,
    display:"inline-block",
    // margin:"10px 30px 10px 1px",
    padding:"0px 20px 0px 0px",
    fontSize:30
  },
  up:{
    color: "green"
  },
  down:{
    color: "red"
  },
  even: {
    color: "yellow"
  }
}
