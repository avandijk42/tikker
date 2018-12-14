import React, { Component } from 'react';
import Malarquee from 'react-malarquee';
import colors from './colorscheme.json'
import './Ticker.css';

const upColor = "#1a5a31"
const downColor = "#ca0c0c"

class Ticker extends Component{
  constructor(props){
    super(props);
    var tempState = {}
    this.props.items.forEach( item => {
      tempState[item] = "..."
    })
    this.state = tempState
  }

  componentDidMount() {
    this.makeApiCall()
  }

  makeApiCall(){
    // alert(this.state)
    const symbols = this.props.items
    const isCoin = this.props.isCoin
    // console.log(this.props.query(symbols))
    fetch(this.props.query(symbols))
      .then(res => res.json())
      .then(
        (result) => {
          var newState = {}
          for (var item in result){
            const symbol = isCoin ? result[item].symbol : item
            const displaySymbol = isCoin ? symbol.split('USDT')[0] : item
            if (isCoin && !(this.props.items.some(x => x === displaySymbol))){
              console.log(this.props.items)
              console.log(`NOT FOUND: ${displaySymbol}`)
              continue
            }
            const data = isCoin ? result[item] : result[symbol].quote
            if (data.change === 0) console.log(data);
            newState[displaySymbol] = {
              change:data.change != null ?
                (data.change + 0.00000001).toFixed(2):
                (0.000000001).toFixed(2),
              price:data.latestPrice,
              companyName:data.companyName
            }
          }

          this.setState(newState)
        },
        (error) => {
          this.setState({
            ERR:"ERR"
          })
        }
      )
      setTimeout(
        () => this.makeApiCall(),
        2500
      )
  }

  changeStyle = (item) => {
    if (item in this.state){
      const change = this.state[item].change
      const style = {
        fontSize:30,
        fontWeight:500,
      }
      style.color = change > 0 ? upColor : downColor
      return style
    }
    return {}
  }


  arrow(change){
    const arrowStyle = {
      display: "inline-block",
      width:0,
      height:0,
      borderLeft: 8 + "px solid transparent",
      borderRight: 8 + "px solid transparent",
      transform: "translate(0,-4px)",
      margin:"0px 5px 0px 0px",
    }
    if (change > 0){
      arrowStyle.borderBottom = "14px solid " + upColor
    } else {
      arrowStyle.borderTop = "14px solid " + downColor
    }

    return (<div style={arrowStyle} />)
  }

  /* eslint eqeqeq: 0 */
  stock(item){
    if (item in this.state){
      const change = this.state[item].change
      return(
        <div style={styles.stockBox}>
          <span style={styles.symbol}>{item}</span>
          <span style={styles.price}> {this.state[item].price} </span>
          {change != 0?
            <span style={this.changeStyle(item)}>
              {this.arrow(change)}
              {Math.abs(change)}
            </span> :
            <span/>
          }
        </div>
      )
    }
    return (
      <span>ERR</span>
    )
  }

  render() {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{this.props.title} </h2>
        <div style={styles.screen}>
          <Malarquee rate={this.props.rate ? this.props.rate : 100}>
            {Object.keys(this.state).map(item => (
              this.stock(item)
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
    margin:"100px 0px 20px 0px",
  },
  stockBox:{
    display:"inline-block",
    width:350,
    margin: "25px 10px",
    padding:"12px 18px",
    border: "2px solid #444",
    borderRadius: 40,
    backgroundColor: "#ddd",
    boxShadow: "-1px 2px 4px #0008"
  },
  screen: {
    width:"100%",
    height:120,
    backgroundColor:"#ccc",
    overflowX:"hidden",
    boxShadow: "0px 5px 10px #888",
    borderTop: "2px solid #4448",
  },
  title:{
    marginBottom:0,
    padding:"15px 0px 15px 40px",
    borderTop: "2px solid #8888",
    backgroundColor: "#f4f4f4",
    fontFamily: "Merriweather",
    fontSize: 28,
  },
  symbol:{
    margin:"10px 20px 0px 0px",
    fontWeight:600,
    fontSize:30,
    color: "#282828",
    fontFamily: "Montserrat"
  },
  price:{
    display:"inline-block",
    padding:"0px 15px 0px 0px",
    fontSize:30,
    margin:0,
    color: "#222",
  }
}
