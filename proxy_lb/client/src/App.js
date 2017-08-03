import React, {Component} from 'react';
// import logo from './logo.svg';
import {Button} from 'react-bootstrap';
import './App.css';
const utils = require('./Utils.js');

class App extends Component {
    constructor() {
        super();
        this.store = {
            endpointsList: []
        }
    }

    render() {
        let {endpointsList} = this.store;
        const list = endpointsList.map(el => <div key={el.url}>
            <span>{el.url}</span> <span>{el.types}</span>
        </div>);
        return (
            <div className="App">
                <div className="App-header">
                    {/*<i className="fa fa-sun-o App-logo" alt="logo"/>*/}
                    <h2>Weather check proxy settings</h2>
                </div>
                <div>
                    <div>
                        <Button bsStyle="primary" onClick={(e) => {
                            utils.getEndpoints().then(j=>{
                                console.log(j);

                                this.setStore({endpointsList:[]})
                            })
                        }}>Get endpoints</Button>
                        {list}
                    </div>
                    <input type="text" style={{width: 50}}/>
                    <select>
                        <option>getWeather</option>
                        <option>randomNumber</option>
                    </select><Button>add endpoint</Button>
                </div>

            </div>
        );
    }
}

export default App;
