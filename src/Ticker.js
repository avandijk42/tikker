import React, { Component } from 'react';
import Malarquee from 'react-malarquee';
import './Ticker.css';


const upColor = "#1a5a31"
const downColor = "#ca0c0c"
const fontSize = 23
const editButtonDimension = 30
const editButtonPassiveColor = "#f4f4f4"
const editButtonActiveColor = "#B7C2BD"
const epsilon = 0.00000001
var apiLoop

class Ticker extends Component{
  constructor(props){
    super(props);
    var tempState = {
      drawerOpen: false,
      incorrect: false,
      symbols:{},
    }
    this.props.items.forEach( item => {
      tempState.symbols[item] = "..."
    })
    this.state = tempState
  }

  componentDidMount() {
    this.makeApiCall()
    this.updateWindow()
    window.addEventListener("resize", () => this.updateWindow())
  }

  componentWillUnmount() {
    clearTimeout(apiLoop)
    window.removeEventListener("resize", () => this.updateWindow())
  }

  makeApiCall(){
    const symbols = Object.keys(this.state.symbols)
    if (symbols.length == 0){
      return
    }
    const isCoin = this.props.isCoin
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
              change:data.change ? (data.change + epsilon).toFixed(2): (epsilon).toFixed(2),
              price:data.latestPrice,
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
      apiLoop = setTimeout(
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

  switchDrawerOpen(e) {
    e.stopPropagation()
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
      if (search === undefined || search === ''){
        return
      }
      if (!this.props.isCoin){
        fetch(`https://api.iextrading.com/1.0/stock/${search}/quote`)
          .then(res => res.json())
          .then(
            (result) => {
              this.props.save([...Object.keys(this.state.symbols), search.toUpperCase()])
              this.setState((old,props) => ({
                symbols:{
                  ...old.symbols,
                  [search.toUpperCase()]:{
                    change:result.change ? (result.change + epsilon).toFixed(2): (epsilon).toFixed(2),
                    price:result.latestPrice,
                  }
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
              if (result.map(x => x.symbol.split('USDT')[0]).includes(search.toUpperCase())){
                const data = result.filter(x => search.toUpperCase() === x.symbol.split('USDT')[0])[0]
                this.props.save([...Object.keys(this.state.symbols), search.toUpperCase()])
                this.setState((old,props) => ({
                  symbols:{
                    ...old.symbols,
                    [search.toUpperCase()]:{
                      change:data.change ? (data.change + epsilon).toFixed(2): (epsilon).toFixed(2),
                      price:data.latestPrice,
                    }
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
    this.props.save(Object.keys(newSymbols))
    this.setState({
      symbols:newSymbols
    })
  }

  updateWindow(){
    this.setState({
      windowWidth: window.innerWidth
    })
  }

  render() {
    const isOpen = this.state.drawerOpen
    const symbols = Object.keys(this.state.symbols)
    const isCoin = this.props.isCoin
    return (
      <div style={styles.container}>
        <div style={{width:"100%"}}>
        <h2 style={styles.title}>
          <div style={styles.clickCatcher} onClick={(e) => this.switchDrawerOpen(e)}/>
          <span>{this.props.title}</span>
          <span style={{float:"right"}}>
            <button style={styles.editButton(isOpen)} onClick={(e) => this.switchDrawerOpen(e)}>
              <img src={require('./edit.png')} className="edit" style={styles.editImage(isOpen)} />
            </button>
          </span>
          <div style={styles.drawer(isOpen,symbols.length,this.state.windowWidth)} onClick={() => {}}>
            <form>
              <input
                type="text"
                placeholder={`ex. ${isCoin ? 'BTC' : 'GOOG'}`}
                onChange={(e) => this.updateSearchText(e)}
                onKeyPress={(e) => this.detectSubmit(e)}
                style={styles.input}
                ref="searchBar"
              />
              <div style={styles.incorrect(this.state.incorrect)}>
                {`${isCoin ? 'Coin' : 'Stock'} not found.`}
              </div>
            </form>
            <div style={styles.listContainer}>
              {symbols.map(item => (
                <div style={styles.listItem}>
                  <button onClick={() => this.removeItem(item)} style={styles.remove}>
                    X
                  </button>
                  <div style={{flex:1}}>{item}</div>
                </div>
              ))}
            </div>
          </div>
        </h2>

        </div>
        <div style={styles.screen}>
          {Object.keys(this.state.symbols).length > 0 ?
            <Malarquee rate={this.props.rate ? this.props.rate : 100}>
              {symbols.map(item => (
                this.stock(item)
              ))}
            </Malarquee> :
            <div style={styles.nothing(window.innerWidth)}>
              {`Add some ${isCoin ? 'coin' : 'stock'} symbols by clicking the edit icon to the right`}
            </div>
          }
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
    overflowX:"hidden",
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
  drawer: (isOpen,count,width) => ({
    width:"calc(100%+40px)",
    height:isOpen ? 70 + (count === 0 ? 0 : (
      Math.ceil(count / Math.floor((width-40) / 170)) * 62
    )) : 0,
    transition:"height 0.33s ease-in, background-color 0.33s ease-in, margin-top 0.33s ease-in",
    backgroundColor: isOpen ? "#E0E3E2" : editButtonPassiveColor,
    padding:"8px 0px",
    marginTop: isOpen ? 8 : 0,
    marginLeft: -40,
  }),
  input:{
    margin: "10px 0px 10px 38px",
    height:40,
    width:230,
    borderRadius:10,
    border: "1px solid #0004",
    outline: "none",
    paddingLeft:10,
  },
  incorrect: (show) => ({
    width: 150,
    height: show ? 32 : 0,
    display: "inline-block",
    margin: "10px 0px -12px 10px",
    fontSize:18,
    color: show ? downColor : downColor + "00",
    transition: "height 0.5s linear, color 0.5s linear",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace:"no-wrap",
  }),
  listItem:{
    width:150,
    height:48,
    backgroundColor:editButtonActiveColor,
    borderRadius:5,
    display: "inline-flex",
    alignItems:"center",
    margin:"7px 20px 7px 0px",
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
    bottom:10,
    margin:"0px 0px 0px 38px",
    overflowX: "scroll"
  },
  clickCatcher:{
    position:"absolute",
    width:"90%",
    height:36,
    backgroundColor:"#0000",
  },
  nothing:(screenWidth) => ({
    verticalAlign:"middle",
    textAlign:"center",
    height:"100%",
    lineHeight:"90px",
    backgroundColor:"#0001",
    color:"#0004",
    fontFamily:"Merriweather",
    fontWeight:"600",
    fontSize:screenWidth < 600 ? 14 : 20,
    textShadow:"1px 1px 0px #fff8",
  })
}
