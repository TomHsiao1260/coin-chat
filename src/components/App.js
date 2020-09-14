import React, { Component } from 'react';
import io from "socket.io-client";
import Scene from './Scene';
import CalcApp from './CalcApp';
import Input from './Input';
import List from './List';
import styles from './App.module.scss';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newMessage: '',
      newPrice: '',
      items: [],
      // items: [
      //   {id: 2, price: 20, message: 'dinner',    date: "2020/09/10"},
      //   {id: 1, price: 10, message: 'breakfast', date: "2020/09/10"},
      // ],
    }
    // connect the socket.io
    this.socket = io();
  }

  // add some socket event
  componentDidMount() {
    // get initial data
    this.socket.on("init", data => {
      this.setState({ items: data.reverse() });
    });

    // get updated data 
    this.socket.on('output', data => {
      const item = {
        id: data.id, 
        price: data.price, 
        message: data.message, 
        date: data.date
      }
      let items = this.state.items;
      items.unshift(item);
      this.setState({ items });
    })

    // informed certain data has been removed
    this.socket.on("id cleared", (id) => {
      this.setState( state => ({
        items: state.items.filter( item => item.id !== Number(id))
      }));
      console.log(`id ${id} cleared`)
    });
  }

  // close the socket
  componentWillUnmount() {
    this.socket.close()
  }

  // update the calculation Price
  handlePrice(newPrice){
    this.setState({ newPrice });
  }

  // update input text
  handleChange(e){
    this.setState({ newMessage: e.target.value });
  }

  // update id, price, message, date
  handleSubmit(){
    let items = this.state.items;
    let newId;
    let newPrice = this.state.newPrice;
    let newMessage = this.state.newMessage;
    let newDate = new Date();

    if(!Number(newPrice) && !newMessage){return;}

    // get id
    if(items[0]){
      newId = items[0].id + 1;
    }else{
      newId =  0;
    }  
    
    // get date
    newDate = `${newDate.getMonth() + 1}/${newDate.getDate()}/${newDate.getFullYear()}`;

    const newItem = {
      id: newId,
      message: newMessage, 
      price: newPrice,
      date: newDate,
    }
    
    // send new data to the server
    this.socket.emit("input", newItem)

    // update items and clear the message, price
    items.unshift(newItem)

    this.setState({
      items,
      newMessage: '',
      newPrice: '',
    })
  }

  // remove selected item
  handleRemove(id){
    this.setState( state => ({
      items: state.items.filter( item => item.id !== Number(id))
    }));
    this.socket.emit("clear id", id);
  }

  render() {
    return (
      <div className={styles.container}>
        <Scene />
        <Input newMessage={this.state.newMessage}
               change={this.handleChange.bind(this)}
               submit={this.handleSubmit.bind(this)}
        />
        <CalcApp newPrice={this.state.newPrice} 
                 price={this.handlePrice.bind(this)} 
        />
        <List items={this.state.items} 
              removeItem={this.handleRemove.bind(this)} 
        />
      </div>
    )
  }
}

export default App;
