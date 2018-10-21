import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
  },
});

client
  .query({
    query: gql`
      query {
        repository(owner: "reactbris", name: "meetup") {
          issues(last: 20, states: CLOSED) {
            edges {
              node {
                title
                url
                participants(first: 100) {
                  edges {
                    node {
                      avatarUrl
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  })
  .then(console.log.bind(console));

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

export default App;
