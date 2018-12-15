import React, { Component } from 'react';
import Malarquee from 'react-malarquee';
import colors from './colorscheme.json'
import './Ticker.css';


const upColor = "#1a5a31"
const downColor = "#ca0c0c"
const fontSize = 23
const editButtonDimension = 30
const editButtonPassiveColor = "#f4f4f4"
const editButtonActiveColor = "#B7C2BD"
const epsilon = 0.00000001

class Ticker extends Component{
  constructor(props){
    super(props);
    var tempState = {
      drawerOpen: true,
      incorrect:false,
      symbols:{}
    }
    this.props.items.forEach( item => {
      tempState.symbols[item] = "..."
    })
    this.state = tempState
  }

  componentDidMount() {
    this.makeApiCall()
  }

  makeApiCall(){
    // alert(this.state)
    const symbols = Object.keys(this.state.symbols)
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
            if (isCoin && !(Object.keys(this.state.symbols).includes(displaySymbol))){
              continue
            }
            const data = isCoin ? result[item] : result[symbol].quote
            if (data.change === 0) console.log(data);
            newState[displaySymbol] = {
              change:data.change != null ? (data.change + epsilon).toFixed(2): (epsilon).toFixed(2),
              price:data.latestPrice,
              companyName:data.companyName
            }
          }

          this.setState({
            symbols:newState
          })
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
    if (item in this.state.symbols){
      const change = this.state.symbols[item].change
      const style = {
        fontSize:fontSize,
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
    if (item in this.state.symbols){
      const change = this.state.symbols[item].change
      return(
        <div style={styles.stockBox}>
          <span style={styles.symbol}>{item}</span>
          <span style={styles.price}> {this.state.symbols[item].price} </span>
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

  openEditDrawer() {
    this.setState((oldState,props) => ({
      drawerOpen: !oldState.drawerOpen
    }))
  }

  updateSearchText(e){
    this.setState({
      searchBuild: e.target.value
    })
  }

  detectSubmit(e){
    if (e.key === 'Enter'){
      e.preventDefault()
      const search = this.state.searchBuild
      if (Object.keys(this.state.symbols).includes(search)){
        this.refs.searchBar.value = ''
        return
      }
      if (!this.props.isCoin){
        fetch(`https://api.iextrading.com/1.0/stock/${search}/quote`)
          .then(res => res.json())
          .then(
            (result) => {
              this.setState((old,props) => ({
                symbols:{
                  ...old.symbols,
                  [old.searchBuild]:{}
                },
                searchBuild:"",
                incorrect:false
              }))
            },
            (error) => {
              this.setState({
                incorrect: true
              })
              setTimeout(
                () => this.setState({incorrect:false}),
                3000
              )
            }
          )
      } else {
        fetch(`https://api.iextrading.com/1.0/stock/market/crypto`)
          .then(res => res.json())
          .then(
            (result) => {
              console.log(result.map(x => x.symbol.split('USDT')[0]))
              if (result.map(x => x.symbol.split('USDT')[0]).includes(search)){
                this.setState((old,props) => ({
                  symbols:{
                    ...old.symbols,
                    [old.searchBuild]:{}
                  },
                  searchBuild:"",
                  incorrect:false,
                }))
              } else {
                this.setState({
                  incorrect: true
                })
                setTimeout(
                  () => this.setState({incorrect:false}),
                  3000
                )
              }
            }
          )
      }
      this.refs.searchBar.value = ''
    }
  }

  removeItem(item){
    const {[item]:{},...newSymbols} = this.state.symbols
    this.setState({
      symbols:newSymbols
    })
  }

  render() {
    const isOpen = this.state.drawerOpen
    if (this.state.incorrect) console.log("INCORRECT")
    return (
      <div style={styles.container}>
        <div style={{width:"100%"}}>
        <h2 style={styles.title}>
          <span>{this.props.title}</span>
          <span style={{float:"right"}}>
            <button style={styles.editButton(isOpen)} onClick={() => this.openEditDrawer()}>
              <img src={require('./edit.png')} className="edit" style={styles.editImage(isOpen)} />
            </button>
          </span>
          <div style={styles.drawer(isOpen)}>
            <form>
              <input
                type="text"
                placeholder={`ex. ${this.props.isCoin ? 'BTC' : 'GOOG'}`}
                onChange={(e) => this.updateSearchText(e)}
                onKeyPress={(e) => this.detectSubmit(e)}
                style={styles.input}
                ref="searchBar"
              />
              <p style={styles.incorrect(this.state.incorrect)}>
                {`${this.props.isCoin ? 'Coin' : 'Stock'} not found.`}
              </p>
            </form>
            <div style={styles.listContainer}>
              {Object.keys(this.state.symbols).map(item => (
                <div style={styles.listItem}>
                  {Object.keys(this.state.symbols).length > 1 ?
                    <button onClick={() => this.removeItem(item)} style={styles.remove}>
                      X
                    </button> :
                    <div style={styles.remove} />
                  }
                  <div style={{flex:1}}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </h2>

        </div>
        <div style={styles.screen}>
          <Malarquee rate={this.props.rate ? this.props.rate : 100}>
            {Object.keys(this.state.symbols).map(item => (
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
    margin:"50px 0px 50px 0px",
  },
  stockBox:{
    display:"inline-block",
    width:300,
    margin: "15px 10px",
    padding:"12px 18px",
    border: "2px solid #444",
    borderRadius: 40,
    backgroundColor: "#ddd",
    boxShadow: "-1px 2px 4px #0008"
  },
  screen: {
    width:"100%",
    height:90,
    backgroundColor:"#EEE3D3",
    overflowX:"hidden",
    boxShadow: "0px 5px 10px #888",
    borderTop: "2px solid #4448",
  },
  title:{
    marginBottom:0,
    padding:"10px 0px 0px 40px",
    borderTop: "2px solid #8888",
    backgroundColor: "#f4f4f4",
    fontFamily: "Merriweather",
    fontSize: 26,
    overflowY:"hidden",
  },
  symbol:{
    margin:"10px 20px 0px 0px",
    fontWeight:600,
    fontSize:fontSize,
    color: "#282828",
    fontFamily: "Montserrat"
  },
  price:{
    display:"inline-block",
    padding:"0px 15px 0px 0px",
    fontSize:fontSize,
    margin:0,
    color: "#222",
  },
  editButton: (isOpen) => ({
    border:"none",
    outline:"none",
    width:editButtonDimension,
    height:editButtonDimension,
    marginRight: 65 - editButtonDimension/2,
    backgroundColor: isOpen ? editButtonActiveColor : editButtonPassiveColor,
    borderRadius: "10%",
    padding: 0,
    transition: "background-color 0.1s ease-in"
  }),
  editImage: (isOpen) => ({
    filter:`brightness(${isOpen ? '4' : '7'}0%)`
  }),
  drawer: (isOpen) => ({
    width:"calc(100%+40px)",
    height:isOpen ? 128 : 0,
    transition:"height 0.33s ease-in, background-color 0.33s ease-in, margin-top 0.33s ease-in",
    backgroundColor: isOpen ? "#E0E3E2" : editButtonPassiveColor,
    padding:"8px 0px",
    marginTop: isOpen ? 8 : 0,
    marginLeft: -40,
  }),
  input:{
    margin: "10px 0px 10px 38px",
    height:40,
    width:300,
    borderRadius:10,
    border: "1px solid #0004",
    outline: "none",
    paddingLeft:10,
  },
  incorrect: (show) => ({
    width:300,
    height:32,
    display:"inline-block",
    margin: "10px 0px -12px 10px",
    fontSize:18,
    color: show ? downColor : downColor + "00",
    transition: "color 0.5s linear",
  }),
  listItem:{
    width:150,
    height:48,
    backgroundColor:editButtonActiveColor,
    borderRadius:5,
    display: "inline-flex",
    alignItems:"center",
    margin:"7px 20px 0px 0px",
    fontFamily: "Montserrat",
    fontWeight:"400",
    fontSize:24,
  },
  remove:{
    backgroundColor:"#0000",
    border:"none",
    outline:"none",
    flex:0,
    padding: "0px 17px",
    fontSize:17,
    color: "#444"
  },
  listContainer:{
    width:"100%",
    height:68,
    margin:"0px 0px 0px 38px",
    overflowX: "scroll"
  }
}
