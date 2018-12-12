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
      this.state[item] = "?"
    })
  }

  componentDidMount() {
    console.log(Object.keys(this.state));
    this.makeApiCall(Object.keys(this.state))
  }

  makeApiCall(symbols){
    // const req = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol='+symbol+'&apikey=64QGWFNZRACW300X'
    const req = [
      'https://api.iextrading.com/1.0/stock/market/',
      this.props.isCoin ? "crypto/" : "",
      'batch?symbols=',
      symbols.join(','),
      "&types=quote"
    ].join('')
    console.log(req)
    fetch(req)
      .then(res => res.json())
      .then(
        (result) => {
          var newState = {}
          for (var item in result){
            newState[item] = {
              change:result[item].quote.change,
              price:result[item].quote.latestPrice,
              companyName:result[item].quote.companyName
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
  }

  render() {
    // console.log(this.props);
    const newItems = this.props.items.filter(item => !(item in this.state))
    console.log(newItems);
    if (newItems.length > 0){
      this.makeApiCall(newItems);
    }

    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{this.props.title} </h2>
        <div style={styles.screen}>
          <Malarquee>
            {this.props.items.map(item => (
              <span>
                <span style={styles.symbol}>{item}</span>
                <span style={styles.price}>{item in this.state ? this.state[item].change : "..."} </span>
              </span>
            ))}
          </Malarquee>
        </div>
      </div>
    );
  }
}
//
// const Stock = styled.div`
//   @keyframes scroll-left{
//     from{
//       left: ${props => props.xPosition};
//     }
//     to {
//       left: calc(-200px);
//     }
//   }
//   animation: scroll-left 15s infinite linear;
//   animationDelay: ${props => props.delay};
//   /* left: ${props => props.xPosition}; */
//   height: 100%;
//   width: 200px;
//   position: relative;
//   fontSize: 30;
//   color: black;
//   background: #8588;
//   border: 1px solid black;
// `
//

export default Ticker;

const styles = {
  container:{
    margin:"100px 0px 20px 0px"
  },
  screen: {
    width:"100%",
    height:80,
    backgroundColor:"darkgrey",
    overflowX:"hidden"
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
    margin:"10px 5px 10px 5px",
  },
  price:{
    margin:"10px 10px 10px 5px",
  }
}
