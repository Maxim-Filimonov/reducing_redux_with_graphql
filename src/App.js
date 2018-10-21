import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ApolloProvider, Query, Mutation } from "react-apollo";
import ApolloClient from "apollo-boost";
import gql from "graphql-tag";

const client = new ApolloClient({
  uri: "https://api.github.com/graphql",
  headers: {
    Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`,
  },
});

const GET_ISSUES_AVATARS = gql`
  query {
    repository(owner: "reactbris", name: "meetup") {
      nameWithOwner
      issues(last: 20, states: CLOSED) {
        edges {
          node {
            id
            title
            url
            reactions {
              viewerHasReacted
            }
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
`;

const ADD_REACTION_TO_ISSUE = gql`
  mutation AddReactionToIssue($id: ID!) {
    addReaction(input: { subjectId: $id, content: HOORAY }) {
      subject {
        id
        reactions {
          viewerHasReacted
        }
      }
    }
  }
`;

const REMOVE_REACTION_FROM_ISSUE = gql`
  mutation RemoveReactionToIssue($id: ID!) {
    removeReaction(input: { subjectId: $id, content: HOORAY }) {
      subject {
        reactions {
          viewerHasReacted
        }
        id
      }
    }
  }
`;

class App extends Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <Query query={GET_ISSUES_AVATARS}>
          {({ loading, error, data }) => {
            if (loading) return <p>Loading...</p>;
            if (error) return <p>Error: ${error}</p>;
            console.log(data);
            return (
              <div className="App">
                <header className="App-header">
                  <h1>{data.repository.nameWithOwner}</h1>
                  <ul>{data.repository.issues.edges.map(this.renderIssue)}</ul>
                </header>
              </div>
            );
          }}
        </Query>
      </ApolloProvider>
    );
  }

  renderIssue = issue => {
    return (
      <li style={{ listStyle: "none" }}>
        <span> {issue.node.title} </span>
        {issue.node.participants.edges.map(x => (
          <img
            style={{ borderRadius: 100, margin: 5 }}
            width="100"
            src={x.node.avatarUrl}
          />
        ))}
        {this.renderThumbsUpOrDown(
          issue.node.id,
          issue.node.reactions.viewerHasReacted,
        )}
      </li>
    );
  };
  renderThumbsUpOrDown = (id, reacted) => {
    if (reacted) {
      return (
        <Mutation mutation={REMOVE_REACTION_FROM_ISSUE} variables={{ id }}>
          {removeReaction => (
            <button
              onClick={() =>
                removeReaction({
                  optimisticResponse: {
                    removeReaction: {
                      subject: {
                        reactions: {
                          viewerHasReacted: false,
                          __typename: "ReactionConnection",
                        },
                        id: id,
                        __typename: "Issue",
                      },
                      __typename: "RemoveReactionPayload",
                    },
                  },
                })
              }
            >
              👎
            </button>
          )}
        </Mutation>
      );
    } else {
      return (
        <Mutation mutation={ADD_REACTION_TO_ISSUE} variables={{ id }}>
          {addReaction => (
            <button
              onClick={() =>
                addReaction({
                  optimisticResponse: {
                    addReaction: {
                      subject: {
                        reactions: {
                          viewerHasReacted: true,
                          __typename: "ReactionConnection",
                        },
                        id: id,
                        __typename: "Issue",
                      },
                      __typename: "RemoveReactionPayload",
                    },
                  },
                })
              }
            >
              👍
            </button>
          )}
        </Mutation>
      );
    }
  };
}

export default App;
